// js/modules/image-seq.js
// Cinematic canvas sequence controller for 112 pre-rendered frames

class HeroSequence {
  constructor() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.section = document.querySelector('.hero-sequence');
    this.beats = [
      document.getElementById('seq-beat-0'),
      document.getElementById('seq-beat-1'),
      document.getElementById('seq-beat-2'),
      document.getElementById('seq-beat-3'),
    ];
    this.FRAMES = 112; // Adjusted to match the 112 frames provided
    this.images = [];
    this.loadedFrames = 0;
    this.sequenceLoaded = false;
    this.currentFrame = -1;
    this.dpr = window.devicePixelRatio || 1;
    this.atmoBlue = document.querySelector('.atmo-blue');
    this.atmoPink = document.querySelector('.atmo-pink');

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  // Called by main.js to initiate loading and report progress
  loadSequence(onProgress, onComplete) {
    for (let i = 1; i <= this.FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(5, '0');
      img.src = `assets/sequences/${frameNum}.png`;
      
      img.onload = () => {
        this.loadedFrames++;
        onProgress(this.loadedFrames / this.FRAMES);
        
        if (this.loadedFrames === this.FRAMES) {
          this.sequenceLoaded = true;
          this.setup();
          this.draw(0);
          onComplete();
        }
      };
      
      img.onerror = () => {
        // Fallback for missing frames
        this.loadedFrames++;
        onProgress(this.loadedFrames / this.FRAMES);
        if (this.loadedFrames === this.FRAMES) {
          this.sequenceLoaded = true;
          this.setup();
          this.draw(0);
          onComplete();
        }
      };
      
      this.images.push(img);
    }
  }

  resize() {
    if (!this.canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.style.width  = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.width  = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    if (this.currentFrame >= 0) this.draw(this.currentFrame);
  }

  // Draw one frame from the pre-rendered sequence
  draw(frame) {
    if (!this.sequenceLoaded || !this.images[frame] || !this.images[frame].complete) return;
    this.currentFrame = frame;
    const ctx = this.ctx;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const img = this.images[frame];
    const t = frame / (this.FRAMES - 1); // 0 → 1

    ctx.clearRect(0, 0, W, H);

    // Draw atmospheric background gradient (adds a dynamic feel to the sequence)
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.7);
    grad.addColorStop(0, `rgba(20,30,60,${0.5 + t * 0.3})`);
    grad.addColorStop(1, 'rgba(6,8,16,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Draw frame (Cover/Contain Logic)
    if (img.naturalWidth > 0) {
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const ratio = imgH / imgW;

      // Make sure the sequence fits beautifully centered on screen
      let dw = W;
      let dh = dw * ratio;
      
      if (dh < H) {
        // If it's too short, scale by height instead to cover the background cleanly,
        // or contain it depending on the aspect ratio. We'll use 'contain' but maximize size.
        dh = H;
        dw = dh / ratio;
      }
      
      // Keep it centered
      const cx = (W - dw) / 2;
      const cy = (H - dh) / 2;

      ctx.drawImage(img, cx, cy, dw, dh);
    }
  }

  setup() {
    if (typeof gsap === 'undefined' || !this.section) return;

    // Scroll → frame mapping
    const obj = { f: 0 };
    gsap.to(obj, {
      f: this.FRAMES - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: this.section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5, // Smooth scrubbing
        onUpdate: (self) => {
          const f = Math.round(obj.f);
          requestAnimationFrame(() => this.draw(f));
          this.updateAtmo(self.progress);
          this.updateBeats(self.progress);
        }
      }
    });

    // Animate the first beat text on load
    gsap.set(this.beats[0], { opacity: 0, y: 30 });
    gsap.to(this.beats[0], { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out', delay: 0.5 });
  }

  updateAtmo(p) {
    if (this.atmoBlue) this.atmoBlue.style.opacity = p < 0.5 ? Math.min(p * 2, 0.6) : (1-p) * 1.2;
    if (this.atmoPink) this.atmoPink.style.opacity = p > 0.4 ? Math.min((p-0.4)*2, 0.6) : 0;
  }

  // Fade beats in/out precisely synced with scroll positions
  updateBeats(p) {
    const ranges = [
      [0, 0.18],    // beat 0 (Intro)
      [0.22, 0.48], // beat 1 (First movement)
      [0.52, 0.78], // beat 2 (Climax)
      [0.82, 1],    // beat 3 (Resolve)
    ];
    this.beats.forEach((el, i) => {
      if (!el) return;
      const [s, e] = ranges[i];
      if (p >= s && p <= e) {
        const local = (p - s) / (e - s);
        let op;
        if (local < 0.15) op = local / 0.15;
        else if (local > 0.85) op = (1 - local) / 0.15;
        else op = 1;
        
        el.style.opacity = op;
        el.style.transform = `translateY(${(1-op)*20}px)`;
        el.classList.add('active');
      } else {
        el.style.opacity = 0;
        el.classList.remove('active');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.heroSeq = new HeroSequence();
});
