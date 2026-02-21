/**
 * Custom Feature Products Grid - JavaScript
 * Handles Quick View Modal, Variant Selection, and Add to Cart
 * Cart integration based on Dawn theme's product-form.js
 */
(function () {
  "use strict";

  // State
  let currentProduct = null;
  let selectedOptions = {};
  let variants = [];

  // DOM Elements
  const modal = document.getElementById("fp-quick-view-modal");
  const modalImage = document.getElementById("fp-modal-image");
  const modalTitle = document.getElementById("fp-modal-title");
  const modalPrice = document.getElementById("fp-modal-price");
  const modalDescription = document.getElementById("fp-modal-description");
  const modalOptions = document.getElementById("fp-modal-options");
  const modalForm = document.getElementById("fp-modal-form");
  const modalVariantId = document.getElementById("fp-modal-variant-id");
  const modalAddBtn = document.getElementById("fp-modal-add-btn");
  const modalError = document.getElementById("fp-modal-error");

  /**
   * Initialize when DOM is ready
   */
  document.addEventListener("DOMContentLoaded", function () {
    if (!modal) return;

    initIconButtons();
    initModalClose();
    initFormSubmit();
  });

  /**
   * Initialize plus icon button clicks
   */
  function initIconButtons() {
    const iconBtns = document.querySelectorAll(
      ".custom-feature-products__icon-btn[data-product-handle]"
    );

    iconBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        openModal(this);
      });
    });
  }

  /**
   * Open the Quick View modal
   */
  function openModal(btn) {
    // Get product data from button attributes
    currentProduct = {
      handle: btn.dataset.productHandle,
      id: btn.dataset.productId,
      url: btn.dataset.productUrl,
      title: btn.dataset.productTitle,
      price: btn.dataset.productPrice,
      description: btn.dataset.productDescription,
      image: btn.dataset.productImage,
    };

    // Parse JSON data
    try {
      variants = JSON.parse(btn.dataset.productVariants || "[]");
      currentProduct.options = JSON.parse(btn.dataset.productOptions || "[]");
    } catch (e) {
      console.error("Error parsing product data:", e);
      variants = [];
      currentProduct.options = [];
    }

    // Reset selected options
    selectedOptions = {};

    // Populate modal content
    populateModal();

    // Show modal
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  /**
   * Close the modal
   */
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Reset state
    currentProduct = null;
    selectedOptions = {};
    hideError();
  }

  /**
   * Initialize modal close handlers
   */
  function initModalClose() {
    // Close button
    const closeBtn = modal.querySelector(".fp-modal__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    // Overlay click
    const overlay = modal.querySelector(".fp-modal__overlay");
    if (overlay) {
      overlay.addEventListener("click", closeModal);
    }

    // ESC key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
        closeModal();
      }
    });
  }

  /**
   * Populate modal with product data
   */
  function populateModal() {
    if (!currentProduct) return;

    // Set image
    if (modalImage && currentProduct.image) {
      modalImage.src = currentProduct.image;
      modalImage.alt = currentProduct.title;
    }

    // Set title, price, description
    if (modalTitle) modalTitle.textContent = currentProduct.title;
    if (modalPrice) modalPrice.textContent = currentProduct.price;
    if (modalDescription)
      modalDescription.textContent = currentProduct.description;

    // Build variant options
    buildVariantOptions();

    // Set initial variant
    updateSelectedVariant();
  }

  /**
   * Build variant option selectors
   */
  function buildVariantOptions() {
    if (!modalOptions || !currentProduct.options) return;

    modalOptions.innerHTML = "";

    // Sort options so Color comes first
    const sortedOptions = [...currentProduct.options].sort(function (a, b) {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      if (aName === "color" || aName === "colour") return -1;
      if (bName === "color" || bName === "colour") return 1;
      return 0;
    });

    sortedOptions.forEach(function (option, index) {
      const optionName = option.name.toLowerCase();
      const optionGroup = document.createElement("div");
      optionGroup.className = "fp-modal__option-group";
      optionGroup.dataset.optionIndex = index;

      // Label
      const label = document.createElement("label");
      label.className = "fp-modal__option-label";
      label.textContent = option.name;
      optionGroup.appendChild(label);

      // Check if this is a color option
      if (optionName === "color" || optionName === "colour") {
        // Color buttons
        const colorContainer = document.createElement("div");
        colorContainer.className = "fp-modal__color-options";

        option.values.forEach(function (value, valueIndex) {
          const colorBtn = document.createElement("button");
          colorBtn.type = "button";
          colorBtn.className = "fp-modal__color-btn";
          colorBtn.textContent = value;
          colorBtn.dataset.optionName = option.name;
          colorBtn.dataset.optionValue = value;
          colorBtn.dataset.optionPosition = option.position;

          // Don't select by default - user must choose

          colorBtn.addEventListener("click", function () {
            selectColorOption(this, colorContainer);
          });

          colorContainer.appendChild(colorBtn);
        });

        optionGroup.appendChild(colorContainer);
      } else {
        // Size or other options - Custom dropdown with scrollable menu
        const sizeWrapper = document.createElement("div");
        sizeWrapper.className = "fp-modal__size-select-wrapper";

        // Trigger button - Show "Choose your size" as default
        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "fp-modal__size-trigger";
        trigger.textContent = "Choose your " + option.name.toLowerCase();
        trigger.dataset.optionName = option.name;
        trigger.dataset.hasSelection = "false";

        // Arrow
        const arrow = document.createElement("span");
        arrow.className = "fp-modal__size-arrow";
        arrow.innerHTML = "&#9660;"; // Down arrow
        sizeWrapper.appendChild(arrow);

        // Dropdown menu (scrollable)
        const dropdown = document.createElement("div");
        dropdown.className = "fp-modal__size-dropdown";

        option.values.forEach(function (value, valueIndex) {
          const optionItem = document.createElement("div");
          optionItem.className = "fp-modal__size-option";
          optionItem.textContent = value;
          optionItem.dataset.optionName = option.name;
          optionItem.dataset.optionValue = value;
          optionItem.dataset.optionPosition = option.position;

          // Don't select by default - user must choose
          // Remove the auto-selection of first value

          optionItem.addEventListener("click", function () {
            selectSizeOption(this, sizeWrapper, trigger, dropdown);
          });

          dropdown.appendChild(optionItem);
        });

        trigger.addEventListener("click", function (e) {
          e.stopPropagation();
          toggleSizeDropdown(sizeWrapper);
        });

        sizeWrapper.appendChild(trigger);
        sizeWrapper.appendChild(dropdown);
        optionGroup.appendChild(sizeWrapper);
      }

      modalOptions.appendChild(optionGroup);
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", closeAllDropdowns);
  }

  /**
   * Select a color option
   */
  function selectColorOption(btn, container) {
    // Remove selection from all
    container.querySelectorAll(".fp-modal__color-btn").forEach(function (b) {
      b.classList.remove("is-selected");
    });

    // Add selection to clicked
    btn.classList.add("is-selected");

    // Update selected options
    selectedOptions[btn.dataset.optionName] = btn.dataset.optionValue;

    // Update variant
    updateSelectedVariant();
  }

  /**
   * Toggle size dropdown open/close
   */
  function toggleSizeDropdown(wrapper) {
    const isOpen = wrapper.classList.contains("is-open");

    // Close all dropdowns first
    closeAllDropdowns();

    if (!isOpen) {
      wrapper.classList.add("is-open");
    }
  }

  /**
   * Close all dropdowns
   */
  function closeAllDropdowns() {
    document
      .querySelectorAll(".fp-modal__size-select-wrapper.is-open")
      .forEach(function (d) {
        d.classList.remove("is-open");
      });
  }

  /**
   * Select a size option
   */
  function selectSizeOption(optionItem, wrapper, trigger, dropdown) {
    const optionName = optionItem.dataset.optionName;
    const optionValue = optionItem.dataset.optionValue;

    // Update trigger text
    trigger.textContent = optionValue;

    // Update selection state
    dropdown.querySelectorAll(".fp-modal__size-option").forEach(function (opt) {
      opt.classList.remove("is-selected");
    });
    optionItem.classList.add("is-selected");

    // Close dropdown
    wrapper.classList.remove("is-open");

    // Update selected options
    selectedOptions[optionName] = optionValue;

    // Update variant
    updateSelectedVariant();
  }

  /**
   * Find and update the selected variant based on options
   */
  function updateSelectedVariant() {
    if (!variants || variants.length === 0) return;

    // Check if all options have been selected
    const allOptionsSelected = currentProduct.options.every(function (option) {
      return selectedOptions[option.name] !== undefined;
    });

    if (!allOptionsSelected) {
      // Not all options selected yet - keep button enabled but no variant set
      modalVariantId.value = "";
      modalAddBtn.disabled = false;
      modalAddBtn.querySelector(".fp-modal__add-btn-text").textContent =
        "ADD TO CART";
      return;
    }

    // Find matching variant
    const matchingVariant = variants.find(function (variant) {
      return currentProduct.options.every(function (option, index) {
        const selectedValue = selectedOptions[option.name];
        // variant options are option1, option2, option3
        return variant["option" + (index + 1)] === selectedValue;
      });
    });

    if (matchingVariant) {
      modalVariantId.value = matchingVariant.id;

      // Update price if available
      // if (modalPrice && matchingVariant.price) {
      //   const formattedPrice = formatMoney(matchingVariant.price);
      //   modalPrice.textContent = formattedPrice;
      // }

      // Enable/disable button based on availability
      if (matchingVariant.available) {
        modalAddBtn.disabled = false;
        modalAddBtn.querySelector(".fp-modal__add-btn-text").textContent =
          "ADD TO CART";
      } else {
        modalAddBtn.disabled = true;
        modalAddBtn.querySelector(".fp-modal__add-btn-text").textContent =
          "SOLD OUT";
      }
    } else {
      modalVariantId.value = "";
      modalAddBtn.disabled = true;
    }
  }

  /**
   * Format money (basic implementation)
   */
  function formatMoney(cents) {
    if (typeof Shopify !== "undefined" && Shopify.formatMoney) {
      return Shopify.formatMoney(cents);
    }
    // Basic fallback - format as currency
    const amount = (cents / 100).toFixed(2);
    return amount.replace(".", ",") + "€";
  }

  /**
   * Initialize form submission
   */
  function initFormSubmit() {
    if (!modalForm) return;

    modalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      addToCart();
    });
  }

  /**
   * Add to cart functionality - Based on Dawn theme's product-form.js
   */
  function addToCart() {
    const variantId = modalVariantId.value;

    if (!variantId) {
      showError("Please select color and size");
      return;
    }

    // Disable button and show loading
    modalAddBtn.disabled = true;
    modalAddBtn.classList.add("loading");
    const spinner = modalAddBtn.querySelector(".fp-modal__spinner");
    if (spinner) spinner.classList.remove("hidden");

    hideError();

    // Get cart drawer/notification element (same as Dawn)
    const cart =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");

    // Create config similar to fetchConfig('javascript')
    const config = {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
      },
    };

    // Prepare form data
    const formData = new FormData();
    formData.append("id", variantId);
    formData.append("quantity", 1);

    // Add sections for cart drawer update (same as Dawn)
    if (cart && typeof cart.getSectionsToRender === "function") {
      formData.append(
        "sections",
        cart.getSectionsToRender().map(function (section) {
          return section.id;
        })
      );
      formData.append("sections_url", window.location.pathname);

      // Set active element for focus management
      if (typeof cart.setActiveElement === "function") {
        cart.setActiveElement(document.activeElement);
      }
    }

    config.body = formData;

    // Get cart add URL
    const cartAddUrl =
      (window.routes && window.routes.cart_add_url) || "/cart/add.js";

    // Check if variant has Black color AND Medium size - for bundle feature
    const shouldAddBundledProduct = checkForBlackMediumVariant();
    const softWinterJacketVariantId = "51902258381079";

    // Add to cart request
    fetch(cartAddUrl, config)
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.status) {
          // Error response - same as Dawn
          if (
            typeof publish === "function" &&
            typeof PUB_SUB_EVENTS !== "undefined"
          ) {
            publish(PUB_SUB_EVENTS.cartError, {
              source: "feature-products-modal",
              productVariantId: variantId,
              errors: response.errors || response.description,
              message: response.message,
            });
          }
          showError(response.description || "Could not add to cart");
          return Promise.reject("Cart error");
        }

        // If Black + Medium was selected, also add Soft Winter Jacket
        if (shouldAddBundledProduct) {
          return addBundledProductToCart(softWinterJacketVariantId, cart).then(
            function (bundleResponse) {
              // Return the bundle response since it will have the updated cart sections
              return bundleResponse || response;
            }
          );
        }

        return response;
      })
      .then(function (response) {
        if (!response) return;

        // Success!
        if (!cart) {
          // No cart drawer/notification - redirect to cart page
          window.location = window.routes ? window.routes.cart_url : "/cart";
          return;
        }

        // Publish cart update event (same as Dawn)
        if (
          typeof publish === "function" &&
          typeof PUB_SUB_EVENTS !== "undefined"
        ) {
          publish(PUB_SUB_EVENTS.cartUpdate, {
            source: "feature-products-modal",
            productVariantId: variantId,
            cartData: response,
          });
        }

        // Close modal first, then render cart (same pattern as Dawn's quick-add-modal)
        closeModal();

        // Render cart contents with response sections
        if (typeof cart.renderContents === "function") {
          cart.renderContents(response);
        }

        // Remove is-empty class if present
        if (cart.classList.contains("is-empty")) {
          cart.classList.remove("is-empty");
        }
      })
      .catch(function (error) {
        if (error !== "Cart error") {
          console.error("Add to cart error:", error);
          showError("Something went wrong. Please try again.");
        }
      })
      .finally(function () {
        // Re-enable button
        modalAddBtn.disabled = false;
        modalAddBtn.classList.remove("loading");
        const spinner = modalAddBtn.querySelector(".fp-modal__spinner");
        if (spinner) spinner.classList.add("hidden");
      });
  }

  /**
   * Check if the selected variant has Black color AND Medium size
   */
  function checkForBlackMediumVariant() {
    let hasBlack = false;
    let hasMedium = false;

    // Check all selected options
    for (const optionName in selectedOptions) {
      const value = selectedOptions[optionName].toLowerCase();

      // Check for Black color
      if (
        optionName.toLowerCase() === "color" ||
        optionName.toLowerCase() === "colour"
      ) {
        if (value === "black") {
          hasBlack = true;
        }
      }

      // Check for Medium size
      if (optionName.toLowerCase() === "size") {
        if (value === "medium" || value === "m") {
          hasMedium = true;
        }
      }
    }

    return hasBlack && hasMedium;
  }

  /**
   * Add bundled product (Soft Winter Jacket) to cart
   */
  function addBundledProductToCart(bundleVariantId, cart) {
    const formData = new FormData();
    formData.append("id", bundleVariantId);
    formData.append("quantity", 1);

    // Add sections for cart drawer update
    if (cart && typeof cart.getSectionsToRender === "function") {
      formData.append(
        "sections",
        cart.getSectionsToRender().map(function (section) {
          return section.id;
        })
      );
      formData.append("sections_url", window.location.pathname);
    }

    const config = {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
      },
      body: formData,
    };

    const cartAddUrl =
      (window.routes && window.routes.cart_add_url) || "/cart/add.js";

    return fetch(cartAddUrl, config)
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.status) {
          // Error adding bundled product - log but don't show to user
          console.warn("Could not add bundled product:", response.description);
          return null;
        }
        console.log(
          "Bundled product (Soft Winter Jacket) added to cart automatically"
        );
        return response;
      })
      .catch(function (error) {
        console.warn("Error adding bundled product:", error);
        return null;
      });
  }

  /**
   * Show error message
   */
  function showError(message) {
    if (modalError) {
      modalError.textContent = message;
      modalError.classList.remove("hidden");
    }
  }

  /**
   * Hide error message
   */
  function hideError() {
    if (modalError) {
      modalError.classList.add("hidden");
    }
  }
})();
