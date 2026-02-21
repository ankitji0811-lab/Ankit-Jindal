/**
 * Custom Banner with Text - Carousel Functionality
 * Supports touch/swipe gestures, autoplay, and keyboard navigation
 */

class CustomBannerCarousel {
  constructor(sectionElement) {
    this.section = sectionElement;
    this.carousel = this.section.querySelector(".custom-banner-carousel");

    if (!this.carousel) return;

    this.track = this.carousel.querySelector("[data-banner-track]");
    this.slides = Array.from(
      this.track.querySelectorAll(".custom-banner-slide")
    );
    this.prevBtn = this.carousel.querySelector("[data-banner-prev]");
    this.nextBtn = this.carousel.querySelector("[data-banner-next]");
    this.pagination = this.carousel.querySelector("[data-banner-pagination]");
    this.dots = this.pagination
      ? Array.from(this.pagination.querySelectorAll(".pagination-dot"))
      : [];

    // State
    this.currentIndex = 0;
    this.slideCount = this.slides.length;
    this.isAnimating = false;
    this.autoplayInterval = null;

    // Settings from section
    this.autoplay = this.section.dataset.autoplay === "true";
    this.autoplaySpeed = parseInt(this.section.dataset.autoplaySpeed) || 5000;

    // Touch/Swipe variables
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.dragThreshold = 50;

    this.init();
  }

  init() {
    if (this.slideCount <= 1) return;

    this.bindEvents();
    this.setSlideAttributes();
    this.updateSlide();

    if (this.autoplay) {
      this.startAutoplay();
    }
  }

  bindEvents() {
    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.prev());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.next());
    }

    // Pagination dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goToSlide(index));
    });

    // Touch events
    this.carousel.addEventListener(
      "touchstart",
      (e) => this.handleTouchStart(e),
      { passive: true }
    );
    this.carousel.addEventListener(
      "touchmove",
      (e) => this.handleTouchMove(e),
      { passive: false }
    );
    this.carousel.addEventListener("touchend", (e) => this.handleTouchEnd(e));

    // Mouse events for desktop drag
    this.carousel.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.carousel.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.carousel.addEventListener("mouseup", (e) => this.handleMouseUp(e));
    this.carousel.addEventListener("mouseleave", (e) => this.handleMouseUp(e));

    // Keyboard navigation
    this.carousel.setAttribute("tabindex", "0");
    this.carousel.addEventListener("keydown", (e) => this.handleKeydown(e));

    // Pause autoplay on hover/focus
    this.carousel.addEventListener("mouseenter", () => this.pauseAutoplay());
    this.carousel.addEventListener("mouseleave", () => this.resumeAutoplay());
    this.carousel.addEventListener("focusin", () => this.pauseAutoplay());
    this.carousel.addEventListener("focusout", () => this.resumeAutoplay());

    // Handle visibility change
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pauseAutoplay();
      } else {
        this.resumeAutoplay();
      }
    });

    // Handle resize
    window.addEventListener(
      "resize",
      this.debounce(() => {
        this.updateSlide(false);
      }, 200)
    );
  }

  setSlideAttributes() {
    this.slides.forEach((slide, index) => {
      const block = slide;
      const textPosition =
        block.querySelector(".custom-banner-content")?.dataset?.textPosition ||
        "left";
      const textAlignment =
        block.querySelector(".custom-banner-content")?.dataset?.textAlignment ||
        "left";

      slide.setAttribute("data-text-position", textPosition);
      slide.setAttribute("data-text-alignment", textAlignment);
      slide.setAttribute("aria-hidden", index !== 0);
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute(
        "aria-label",
        `Slide ${index + 1} of ${this.slideCount}`
      );
    });
  }

  prev() {
    if (this.isAnimating) return;
    const newIndex =
      this.currentIndex === 0 ? this.slideCount - 1 : this.currentIndex - 1;
    this.goToSlide(newIndex);
  }

  next() {
    if (this.isAnimating) return;
    const newIndex =
      this.currentIndex === this.slideCount - 1 ? 0 : this.currentIndex + 1;
    this.goToSlide(newIndex);
  }

  goToSlide(index, animate = true) {
    if (this.isAnimating || index === this.currentIndex) return;

    this.isAnimating = true;
    this.currentIndex = index;
    this.updateSlide(animate);

    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  updateSlide(animate = true) {
    const offset = -this.currentIndex * 100;

    if (!animate) {
      this.track.style.transition = "none";
    } else {
      this.track.style.transition =
        "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    }

    this.track.style.transform = `translateX(${offset}%)`;

    // Update pagination
    this.dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.currentIndex);
      dot.setAttribute(
        "aria-current",
        index === this.currentIndex ? "true" : "false"
      );
    });

    // Update slides accessibility
    this.slides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", index !== this.currentIndex);
      slide.classList.toggle("active", index === this.currentIndex);
    });

    // Reset transition after no-animation update
    if (!animate) {
      requestAnimationFrame(() => {
        this.track.style.transition =
          "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      });
    }
  }

  // Touch handling
  handleTouchStart(e) {
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
    this.currentX = this.startX;
    this.track.classList.add("is-dragging");
    this.pauseAutoplay();
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.touches[0].clientX;

    const diff = this.currentX - this.startX;
    const offset = -this.currentIndex * 100;
    const dragOffset = (diff / this.carousel.offsetWidth) * 100;

    this.track.style.transform = `translateX(${offset + dragOffset}%)`;
  }

  handleTouchEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.track.classList.remove("is-dragging");

    const diff = this.currentX - this.startX;

    if (Math.abs(diff) > this.dragThreshold) {
      if (diff > 0) {
        this.prev();
      } else {
        this.next();
      }
    } else {
      this.updateSlide();
    }

    this.resumeAutoplay();
  }

  // Mouse handling for desktop
  handleMouseDown(e) {
    if (e.target.closest("a, button")) return;

    this.isDragging = true;
    this.startX = e.clientX;
    this.currentX = this.startX;
    this.track.classList.add("is-dragging");
    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.clientX;

    const diff = this.currentX - this.startX;
    const offset = -this.currentIndex * 100;
    const dragOffset = (diff / this.carousel.offsetWidth) * 100;

    this.track.style.transform = `translateX(${offset + dragOffset}%)`;
  }

  handleMouseUp() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.track.classList.remove("is-dragging");

    const diff = this.currentX - this.startX;

    if (Math.abs(diff) > this.dragThreshold) {
      if (diff > 0) {
        this.prev();
      } else {
        this.next();
      }
    } else {
      this.updateSlide();
    }
  }

  // Keyboard navigation
  handleKeydown(e) {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        this.prev();
        break;
      case "ArrowRight":
        e.preventDefault();
        this.next();
        break;
    }
  }

  // Autoplay
  startAutoplay() {
    if (!this.autoplay || this.slideCount <= 1) return;

    this.autoplayInterval = setInterval(() => {
      this.next();
    }, this.autoplaySpeed);
  }

  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  resumeAutoplay() {
    if (this.autoplay && !this.autoplayInterval) {
      this.startAutoplay();
    }
  }

  // Utility
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Initialize all banner carousels
function initCustomBannerCarousels() {
  const sections = document.querySelectorAll(".custom-banner-section");

  sections.forEach((section) => {
    // Get settings from section
    const sectionId = section.id;
    const sectionElement = document.getElementById(sectionId);

    if (sectionElement) {
      // Read settings from data attributes or Shopify section settings
      const settingsScript = document.querySelector(
        `[data-section-id="${sectionId}"]`
      );

      // Default settings
      section.dataset.autoplay = "true";
      section.dataset.autoplaySpeed = "5000";

      new CustomBannerCarousel(section);
    }
  });
}

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCustomBannerCarousels);
} else {
  initCustomBannerCarousels();
}

// Re-initialize on Shopify section load (for theme editor)
document.addEventListener("shopify:section:load", (e) => {
  const section = e.target.querySelector(".custom-banner-section");
  if (section) {
    section.dataset.autoplay = "true";
    section.dataset.autoplaySpeed = "5000";
    new CustomBannerCarousel(section);
  }
});
