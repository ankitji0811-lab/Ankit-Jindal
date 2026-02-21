/**
 * Custom Header - Mobile Menu Functionality
 * Handles hamburger/X toggle and dropdown animation
 */
document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".custom-header");
  const menuToggle = document.querySelector(".custom-header__menu-toggle");
  const overlay = document.querySelector(".custom-header__mobile-overlay");

  if (!header || !menuToggle) return;

  /**
   * Toggle menu open/close
   */
  function toggleMenu() {
    const isOpen = header.classList.contains("is-menu-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /**
   * Open the mobile menu
   */
  function openMenu() {
    header.classList.add("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "true");

    if (overlay) {
      overlay.classList.add("is-active");
    }

    document.body.style.overflow = "hidden";
  }

  /**
   * Close the mobile menu
   */
  function closeMenu() {
    header.classList.remove("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");

    if (overlay) {
      overlay.classList.remove("is-active");
    }

    document.body.style.overflow = "";
  }

  // Toggle menu on button click
  menuToggle.addEventListener("click", function (e) {
    e.preventDefault();
    toggleMenu();
  });

  // Close on overlay click
  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  // Close on escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("is-menu-open")) {
      closeMenu();
    }
  });

  // Close on window resize to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && header.classList.contains("is-menu-open")) {
      closeMenu();
    }
  });

  // Close when clicking mobile CTA
  const mobileCta = document.querySelector(".custom-header__mobile-cta");
  if (mobileCta) {
    mobileCta.addEventListener("click", closeMenu);
  }
});