// ============================================
// STATIC HERO SLIDER CONFIGURATION
// ============================================
// Edit these slide configs to change durations and CTA links
// Duration is in seconds: 24h=86400, 48h=172800, 72h=259200
// Timer starts when page first loads and persists via localStorage

const SLIDES_CONFIG = [
  {
    id: 1,
    headline: "Flash Sale — Anime Drops",
    subtext: "Get your favorite gear before it's gone. Exclusive items available for a limited time.",
    buttonText: "Shop Now",
    ctaHref: "https://example.com/flash-sale",
    badge: "UP TO 50% OFF",
    image: "/images/anime_action_battle_scene_for_flash_sale.png",
    themeColor: "#8b5cf6",
    durationSeconds: 24 * 60 * 60, // 24 hours ← EDIT THIS VALUE
  },
  {
    id: 2,
    headline: "Collector Bundle — Limited Stock",
    subtext: "Premium figurines and art books. Only 500 units available worldwide.",
    buttonText: "buy now",
    ctaHref: "https://example.com/bundles",
    badge: "LIMITED EDITION",
    image: "/images/anime_collector_shelf_for_limited_bundle.png",
    themeColor: "#f97316",
    durationSeconds: 48 * 60 * 60, // 48 hours ← EDIT THIS VALUE
  },
  {
    id: 3,
    headline: "New Release — Intro Discount",
    subtext: "Be the first to own the latest chapter. Pre-order bonus included.",
    buttonText: "Preorder",
    ctaHref: "https://example.com/preorder",
    badge: "EARLY BIRD -20%",
    image: "/images/anime_character_reveal_for_new_release.png",
    themeColor: "#ec4899",
    durationSeconds: 72 * 60 * 60, // 72 hours ← EDIT THIS VALUE
  },
];

// ============================================
// HERO SLIDER IMPLEMENTATION
// ============================================

class HeroSlider {
  constructor(containerId, config) {
    this.container = document.getElementById(containerId);
    this.slides = config;
    this.currentIndex = 0;
    this.isPaused = false;
    this.expiredSlides = new Set();
    this.timerIntervals = new Map();

    this.AUTOPLAY_DELAY = 5000;

    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
    this.loadExpiredStates();
    this.startAutoplay();
    this.startTimers();
  }

  loadExpiredStates() {
    // Check localStorage for any expired slides on page load
    this.slides.forEach((slide) => {
      const isExpired = localStorage.getItem(`timer_expired_${slide.id}`) === 'true';
      if (isExpired) {
        this.expiredSlides.add(slide.id);
      }
    });

    // Update UI for any expired slides loaded from localStorage
    this.expiredSlides.forEach((slideId) => {
      this.updateExpiredState(slideId);
    });
  }

  render() {
    const slidesHTML = this.slides
      .map((slide, index) => this.renderSlide(slide, index === this.currentIndex))
      .join("");

    this.container.innerHTML = slidesHTML + this.renderControls();
  }

  renderSlide(slide, isActive) {
    const slideClass = isActive ? "slide active" : "slide";
    return `
      <div class="${slideClass}" data-slide-id="${slide.id}">
        <div class="slide-bg">
          <img src="${slide.image}" alt="${slide.headline}" loading="lazy" decoding="async" />
        </div>
        <div class="slide-overlay"></div>
        <div class="slide-overlay-side"></div>

        <div class="slide-content">
          <div class="slide-inner">
            <!-- Badge & Timer -->
            <div class="slide-badge-timer">
              <span class="slide-badge" style="background-color: ${slide.themeColor}">
                <svg class="badge-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2h-2v2h2V2zm0 18h-2v2h2v-2zm6-4h2v-2h-2v2zM3 10h2v2H3v-2zm15.5-5.5l-1.4 1.4 1.4 1.4 1.4-1.4-1.4-1.4zm-11 11l-1.4 1.4 1.4 1.4 1.4-1.4-1.4-1.4zm11 0l-1.4 1.4 1.4 1.4 1.4-1.4-1.4-1.4zm-11-11l-1.4 1.4 1.4 1.4 1.4-1.4-1.4-1.4z"/>
                </svg>
                ${slide.badge}
              </span>
              <div class="slide-timer slide-timer-desktop" data-slide-id="${slide.id}" style="background-color: ${slide.themeColor}20; border-color: ${slide.themeColor}60; color: ${slide.themeColor}">
                <svg class="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span class="timer-display">00:00:00</span>
                <span class="timer-label">Limited Time</span>
              </div>
            </div>

            <!-- Headline -->
            <h1 class="slide-headline">
              ${slide.headline
                .split(" ")
                .map((word, i) => {
                  if (i === 1) {
                    return `<span class="headline-gradient" style="--theme-color: ${slide.themeColor}">${word}</span>`;
                  }
                  return word;
                })
                .join(" ")}
            </h1>

            <!-- Subtext -->
            <p class="slide-subtext">${slide.subtext}</p>

            <!-- Mobile Timer -->
            <div class="slide-timer slide-timer-mobile" data-slide-id="${slide.id}" style="background-color: ${slide.themeColor}20; border-color: ${slide.themeColor}60; color: ${slide.themeColor}">
              <svg class="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="timer-display">00:00:00</span>
              <span class="timer-label">Limited Time</span>
            </div>

            <!-- CTA Button -->
            <div class="slide-cta-wrapper">
              ${
                this.expiredSlides.has(slide.id)
                  ? `<button class="slide-cta expired" disabled aria-label="Offer ended">
                       <span>
                         <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                           <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                           <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                         </svg>
                         Notify Me
                       </span>
                     </button>`
                  : `<a href="${slide.ctaHref}" target="_blank" rel="noopener noreferrer" class="slide-cta-link" aria-label="${slide.buttonText}: ${slide.headline}">
                       <button class="slide-cta" type="button">
                         <span>
                           <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                             <circle cx="9" cy="21" r="1"></circle>
                             <circle cx="20" cy="21" r="1"></circle>
                             <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                           </svg>
                           ${slide.buttonText}
                         </span>
                       </button>
                     </a>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderControls() {
    return `
      <div class="slider-controls">
        <div class="slider-indicators">
          ${this.slides
            .map(
              (_, idx) =>
                `<button class="indicator ${idx === this.currentIndex ? "active" : ""}" aria-label="Go to slide ${idx + 1}" data-slide-index="${idx}"></button>`
            )
            .join("")}
        </div>
        <div class="slider-nav-buttons">
          <button class="nav-button" aria-label="Previous slide" id="prev-btn">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button class="nav-button" aria-label="Next slide" id="next-btn">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div class="slider-overlay-top"></div>
      <div class="slider-overlay-bottom"></div>
    `;
  }

  setupEventListeners() {
    // Navigation buttons
    document.getElementById("prev-btn")?.addEventListener("click", () => this.prev());
    document.getElementById("next-btn")?.addEventListener("click", () => this.next());

    // Indicators
    document.querySelectorAll(".indicator").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-slide-index"));
        this.goToSlide(idx);
      });
    });

    // Pause on hover/focus
    this.container.addEventListener("mouseenter", () => this.pause());
    this.container.addEventListener("mouseleave", () => this.resume());
    this.container.addEventListener("focus", () => this.pause(), true);
    this.container.addEventListener("blur", () => this.resume(), true);

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.prev();
      if (e.key === "ArrowRight") this.next();
    });

    // Swipe support
    let touchStartX = 0;
    this.container.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    });
    this.container.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchStartX - touchEndX > 50) this.next();
      if (touchEndX - touchStartX > 50) this.prev();
    });
  }

  next() {
    this.goToSlide((this.currentIndex + 1) % this.slides.length);
  }

  prev() {
    this.goToSlide((this.currentIndex - 1 + this.slides.length) % this.slides.length);
  }

  goToSlide(idx) {
    this.currentIndex = idx;
    this.updateSlides();
  }

  updateSlides() {
    const slides = document.querySelectorAll(".slide");
    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === this.currentIndex);
    });

    const indicators = document.querySelectorAll(".indicator");
    indicators.forEach((ind, idx) => {
      ind.classList.toggle("active", idx === this.currentIndex);
    });
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  startAutoplay() {
    setInterval(() => {
      if (!this.isPaused) this.next();
    }, this.AUTOPLAY_DELAY);
  }

  startTimers() {
    this.slides.forEach((slide) => {
      const timerUpdate = () => {
        const timerElements = document.querySelectorAll(`[data-slide-id="${slide.id}"]`);
        const storageKey = `timer_start_${slide.id}`;
        
        let startTime = localStorage.getItem(storageKey);
        
        // First time seeing this slide - store start time now
        if (!startTime) {
          const now = Date.now();
          localStorage.setItem(storageKey, now.toString());
          startTime = now.toString();
        }
        
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - parseInt(startTime)) / 1000);
        const remainingSeconds = Math.max(0, slide.durationSeconds - elapsedSeconds);

        timerElements.forEach((timerEl) => {
          if (remainingSeconds <= 0) {
            if (!this.expiredSlides.has(slide.id)) {
              this.expiredSlides.add(slide.id);
              this.updateExpiredState(slide.id);
            }
            localStorage.setItem(`timer_expired_${slide.id}`, 'true');
            timerEl.classList.add("expired");
            timerEl.querySelector(".timer-display").textContent = "00:00:00";
            timerEl.querySelector(".timer-icon").classList.add("expired");
          } else {
            localStorage.setItem(`timer_expired_${slide.id}`, 'false');
            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            const seconds = remainingSeconds % 60;
            timerEl.querySelector(".timer-display").textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
          }
        });
      };

      timerUpdate();
      this.timerIntervals.set(slide.id, setInterval(timerUpdate, 1000));
    });
  }

  updateExpiredState(slideId) {
    const slideEl = document.querySelector(`[data-slide-id="${slideId}"]`);
    if (!slideEl) return;

    // Update CTA
    const ctaWrapper = slideEl.querySelector(".slide-cta-wrapper");
    if (ctaWrapper) {
      ctaWrapper.innerHTML = `<button class="slide-cta expired" disabled aria-label="Offer ended">
        <span>
          <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          Notify Me
        </span>
      </button>`;
    }

    // De-emphasize headline
    slideEl.querySelector(".slide-headline")?.classList.add("expired");
  }

  destroy() {
    this.timerIntervals.forEach((interval) => clearInterval(interval));
    this.timerIntervals.clear();
  }
}

// Initialize slider
document.addEventListener("DOMContentLoaded", () => {
  new HeroSlider("hero-slider", SLIDES_CONFIG);
});


document.querySelectorAll('.slide-cta').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    this.appendChild(ripple);

    const rect = this.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  });
});
