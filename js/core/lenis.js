// js/core/lenis.js

class ScrollManager {
  constructor() {
    // Lenis is expected to be loaded via CDN
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis is not defined. Make sure it is loaded.');
      return;
    }

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    this.init();
  }

  init() {
    // Setup requestAnimationFrame loop
    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Integrate with GSAP ScrollTrigger if available
    if (typeof ScrollTrigger !== 'undefined') {
      this.lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }

    // Scroll Progress bar
    this.progressBar = document.querySelector('.scroll-progress');
    if (this.progressBar) {
      this.lenis.on('scroll', (e) => {
        const progress = e.progress * 100;
        this.progressBar.style.width = `${progress}%`;
      });
    }
  }

  scrollTo(target) {
    this.lenis.scrollTo(target);
  }
}

window.scrollManager = new ScrollManager();
