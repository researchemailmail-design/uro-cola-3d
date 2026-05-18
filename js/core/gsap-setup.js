// js/core/gsap-setup.js

class GsapSetup {
  constructor() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger is not defined. Make sure they are loaded.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    
    // Global MatchMedia for responsive animations
    this.mm = gsap.matchMedia();

    // Default configuration
    ScrollTrigger.defaults({
      markers: false, // Set to true for debugging
      // scrub: 1, // Smooth scrubbing
    });
  }
}

window.gsapSetup = new GsapSetup();
