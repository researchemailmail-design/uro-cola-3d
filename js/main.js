// js/main.js — URO Cola Master Orchestrator

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Preloader linked to Sequence Loader ─── */
  const preloader = document.getElementById('preloader');
  const bar       = document.getElementById('preloader-bar');
  const pct       = document.getElementById('preloader-percent');
  
  function hidePreloader() {
    gsap.to(preloader, {
      yPercent: -100, duration: 1.2, ease: 'power4.inOut',
      onComplete: () => { preloader.style.display = 'none'; initSite(); }
    });
  }

  if (window.heroSeq) {
    // Let the image sequence drive the preloader
    window.heroSeq.loadSequence(
      (progress) => {
        // progress is 0 to 1
        const percent = Math.min(100, Math.round(progress * 100));
        if (bar) bar.style.width = percent + '%';
        if (pct) pct.textContent = percent + '%';
      },
      () => {
        // Complete
        setTimeout(hidePreloader, 400); // small delay so user sees 100%
      }
    );
  } else {
    // Fallback if sequence object missing
    setTimeout(hidePreloader, 1000);
  }

  /* ─── Custom cursor with premium tilted trailing hearts ─── */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let lastHeartTime = 0;
  
  if (cursor) {
    gsap.set(cursor, { rotation: -15, transformOrigin: 'center center' });
    document.addEventListener('mousemove', e => {
      gsap.to(cursor,   { x: e.clientX, y: e.clientY, duration: 0.08 });
      gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.4, ease: 'power2.out' });
      
      const now = Date.now();
      if (now - lastHeartTime > 45) { // more trails
        lastHeartTime = now;
        const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        heart.setAttribute('viewBox', '0 0 24 24');
        heart.classList.add('cursor-heart');
        heart.style.left = e.clientX + 'px';
        heart.style.top = e.clientY + 'px';
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z');
        heart.appendChild(path);
        document.body.appendChild(heart);
        
        // Premium trail animation
        const randomX = (Math.random() - 0.5) * 60;
        const randomRot = (Math.random() - 0.5) * 60 - 15;
        gsap.set(heart, { rotation: -15, transformOrigin: 'center center' });
        gsap.to(heart, {
          y: '+=80',
          x: '+=' + randomX,
          rotation: randomRot,
          opacity: 0,
          scale: 0.2,
          duration: 1.5,
          ease: 'power2.out',
          onComplete: () => heart.remove()
        });
      }
    });
    document.querySelectorAll('a,button,.product-card,.social-card,.qr-card').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('is-hovering'); follower.classList.add('is-hovering'); });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('is-hovering'); follower.classList.remove('is-hovering'); });
    });
  }

  /* ─── Nav scroll effect ─── */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ─── Scroll progress ─── */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (window.scrollY / total * 100) + '%';
    }, { passive: true });
  }

  function initSite() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Lenis smooth scroll - made slightly slower/softer for premium feel
    if (typeof Lenis !== 'undefined') {
      const lenis = new Lenis({ duration: 1.5, easing: t => Math.min(1, 1.001 - Math.pow(2, -12*t)) });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    const mm = gsap.matchMedia();

    // Desktop and Landscape Tablet animations (>= 1025px)
    mm.add("(min-width: 1025px)", () => {
      /* ── Story Horizontal Scroll ── */
      const track = document.getElementById('story-track');
      if (track) {
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: '.story-section',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            invalidateOnRefresh: true,
          }
        });
      }

      /* ── Social track auto-scroll ── */
      const socialTrack = document.getElementById('social-track');
      if (socialTrack) {
        gsap.to(socialTrack, {
          x: () => -(socialTrack.scrollWidth - window.innerWidth + 96),
          ease: 'none',
          scrollTrigger: {
            trigger: '.social-section',
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1.5,
            invalidateOnRefresh: true,
          }
        });
      }
    });

    /* ── Flavor Sticky Section ── */
    const flavorItems = document.querySelectorAll('.flavor-item');
    const flavorGlow  = document.getElementById('flavor-glow');
    const flavorCan   = document.getElementById('flavor-can');
    const flavorSect  = document.querySelector('.flavor-section');

    if (flavorItems.length && flavorSect) {
      // Use CSS position: sticky for the pinning behavior to prevent massive black void
      
      // Step each flavor in based on scroll progress
      flavorItems.forEach((item, i) => {
        const total = flavorItems.length;
        const segStart = i / total;
        const segEnd   = (i + 1) / total;

        ScrollTrigger.create({
          trigger: flavorSect,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
          onUpdate: (self) => {
            const p = self.progress;
            const active = Math.min(Math.floor(p * 0.99 * total), total - 1); // ensure no out of bounds
            flavorItems.forEach((el, j) => el.classList.toggle('active', j === active));

            // Change glow color
            const colors = [
              'rgba(168,216,234,0.6)',
              'rgba(255,170,181,0.6)',
              'rgba(212,168,67,0.6)',
              'rgba(100,220,180,0.5)',
            ];
            const bgs = ['#0A0F1E','#0F0A1A','#0F0E08','#08100F'];
            if (flavorGlow) flavorGlow.style.background = colors[active] || colors[0];
            document.body.style.backgroundColor = bgs[active] || bgs[0];

            // Smooth crossfade and scale swap without lag
            if (flavorCan) {
              const flavorImgs = ['assets/product/1.png', 'assets/product/2.png', 'assets/product/3.png', 'assets/product/4.png'];
              if (flavorCan.dataset.activeIdx !== String(active)) {
                flavorCan.dataset.activeIdx = String(active);
                gsap.killTweensOf(flavorCan);
                gsap.to(flavorCan, {
                  opacity: 0, scale: 0.9, y: 30, duration: 0.2, ease: 'power2.in', onComplete: () => {
                    flavorCan.src = flavorImgs[active];
                    gsap.fromTo(flavorCan, {opacity: 0, scale: 1.1, y: -30}, {opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out'});
                  }
                });
              }
            }
          }
        });
      });

      // reset bg color after flavor section
      ScrollTrigger.create({
        trigger: '.qr-section',
        start: 'top 80%',
        onEnter: () => { document.body.style.backgroundColor = ''; },
      });
    }

    /* ── QR Card 3D tilt ── */
    const qrCard = document.getElementById('qr-card');
    if (qrCard) {
      qrCard.addEventListener('mousemove', e => {
        const r = qrCard.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        gsap.to(qrCard, { rotateY: x*18, rotateX: -y*18, transformPerspective: 800, duration: 0.3 });
      });
      qrCard.addEventListener('mouseleave', () => {
        gsap.to(qrCard, { rotateY: 0, rotateX: 0, duration: 0.6 });
      });
    }

    /* ── Reveal on scroll ── */
    document.querySelectorAll('.reveal-up').forEach(el => {
      gsap.fromTo(el, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });
    document.querySelectorAll('.reveal-fade').forEach(el => {
      gsap.fromTo(el, { opacity: 0 }, {
        opacity: 1, duration: 1.4, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    /* ── Product card parallax & 3D Tilt Hover ── */
    document.querySelectorAll('.product-card').forEach((card, i) => {
      gsap.fromTo(card, { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: { trigger: card, start: 'top 88%', once: true }
      });
      
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;
        gsap.to(card, { rotateX, rotateY, scale: 1.05, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
        
        const img = card.querySelector('.product-img-wrap img');
        if(img) gsap.to(img, { x: rotateY * -1, y: rotateX * 1, scale: 1.15, duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'power2.out' });
        const img = card.querySelector('.product-img-wrap img');
        if(img) gsap.to(img, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' });
      });
    });

    /* ── Flavor Can 3D Hover & Float ── */
    const flavorCanWrap = document.querySelector('.flavor-can-wrap');
    if (flavorCanWrap) {
      // Independent fluid float (eliminates scroll lag)
      gsap.to(flavorCanWrap, { y: -15, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      flavorCanWrap.addEventListener('mousemove', e => {
        const rect = flavorCanWrap.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        // Reduced rotation angles to prevent 2D paper-flattening effect
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        
        // Dynamic drop shadow to enhance 3D volume
        const shadowX = rotateY * -3;
        const shadowY = rotateX * 3;
        
        gsap.to(flavorCanWrap, { 
          rotateX, 
          rotateY, 
          scale: 1.05, 
          filter: `drop-shadow(${shadowX}px ${shadowY}px 25px rgba(0,0,0,0.6))`,
          duration: 0.3, 
          ease: 'power2.out', 
          transformPerspective: 1200 
        });
      });
      flavorCanWrap.addEventListener('mouseleave', () => {
        gsap.to(flavorCanWrap, { 
          rotateX: 0, 
          rotateY: 0, 
          scale: 1, 
          filter: `drop-shadow(0px 0px 0px rgba(0,0,0,0))`,
          duration: 0.6, 
          ease: 'power2.out' 
        });
      });
    }

  }
});
