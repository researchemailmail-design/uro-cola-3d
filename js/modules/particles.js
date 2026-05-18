// js/modules/particles.js
// Ambient floating particle system for URO Cola

class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.count = 60;
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
    this.create();
    this.loop();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.style.width  = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.canvas.width  = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  create() {
    const colors = [
      'rgba(168,216,234,',
      'rgba(255,170,181,',
      'rgba(212,168,67,',
      'rgba(255,255,255,',
    ];
    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        r: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.5 - 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.1,
        alphaDir: (Math.random() - 0.5) * 0.005,
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha += p.alphaDir;
      if (p.alpha < 0.05) p.alphaDir = Math.abs(p.alphaDir);
      if (p.alpha > 0.6)  p.alphaDir = -Math.abs(p.alphaDir);
      if (p.y < -10) p.y = this.H + 10;
      if (p.x < -10) p.x = this.W + 10;
      if (p.x > this.W + 10) p.x = -10;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + p.alpha + ')';
      this.ctx.fill();
    });
    requestAnimationFrame(() => this.loop());
  }
}

document.addEventListener('DOMContentLoaded', () => { new ParticleSystem(); });
