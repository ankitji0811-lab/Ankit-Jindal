// const button = document.querySelector(".custom-feature-products__icon-btn");
// console.log(button.dataset.productHandle);

// fetch(`/products/${button.dataset.productHandle}.js`)
//   .then((data) => data.text())
//   .then((data) => console.log(data));

//   (
//   /**
//    * Custom Feature Products Grid - JavaScript
//    * Handles Quick View Modal, Variant Selection, and Add to Cart
//    * Cart integration based on Dawn theme's product-form.js
//    */
//   function () {
//     "use strict";

//     // State
//     let currentProduct = null;
//     let selectedOptions = {};
//     let variants = [];

//     // DOM Elements
//     const modal = document.getElementById(
//       "custom-feature-product-quick-view-modal"
//     );
//     const modalImage = document.getElementById(
//       "custom-feature-product-modal-image"
//     );
//     const modalTitle = document.getElementById(
//       "custom-feature-product-modal-title"
//     );
//     const modalPrice = document.getElementById(
//       "custom-feature-product-modal-price"
//     );
//     const modalDescription = document.getElementById(
//       "custom-feature-product-modal-description"
//     );
//     const modalOptions = document.getElementById(
//       "custom-feature-product-modal-options"
//     );
//     const modalForm = document.getElementById(
//       "custom-feature-product-modal-form"
//     );
//     const modalVariantId = document.getElementById(
//       "custom-feature-product-modal-variant-id"
//     );
//     const modalAddBtn = document.getElementById(
//       "custom-feature-product-modal-add-btn"
//     );
//     const modalError = document.getElementById(
//       "custom-feature-product-modal-error"
//     );

//     /**
//      * Initialize when DOM is ready
//      */
//     document.addEventListener("DOMContentLoaded", function () {
//       if (!modal) return;

//       initIconButtons();
//       initModalClose();
//       initFormSubmit();
//     });

//     /**
//      * Initialize plus icon button clicks
//      */
//     function initIconButtons() {
//       const iconBtns = document.querySelectorAll(
//         ".custom-feature-products__icon-btn[data-product-handle]"
//       );

//       iconBtns.forEach(function (btn) {
//         btn.addEventListener("click", function (e) {
//           e.preventDefault();
//           e.stopPropagation();

//           openModal(this);
//         });
//       });
//     }

//     /**
//      * Open the Quick View modal
//      */
//     function openModal(btn) {
//       // Get product data from button attributes
//       currentProduct = {
//         handle: btn.dataset.productHandle,
//         id: btn.dataset.productId,
//         url: btn.dataset.productUrl,
//         title: btn.dataset.productTitle,
//         price: btn.dataset.productPrice,
//         description: btn.dataset.productDescription,
//         image: btn.dataset.productImage,
//       };

//       // Parse JSON data
//       try {
//         variants = JSON.parse(btn.dataset.productVariants || "[]");
//         currentProduct.options = JSON.parse(btn.dataset.productOptions || "[]");
//       } catch (e) {
//         console.error("Error parsing product data:", e);
//         variants = [];
//         currentProduct.options = [];
//       }

//       // Reset selected options
//       selectedOptions = {};

//       // Populate modal content
//       populateModal();

//       // Show modal
//       modal.setAttribute("aria-hidden", "false");
//       document.body.style.overflow = "hidden";
//     }

//     /**
//      * Close the modal
//      */
//     function closeModal() {
//       modal.setAttribute("aria-hidden", "true");
//       document.body.style.overflow = "";

//       // Reset state
//       currentProduct = null;
//       selectedOptions = {};
//       hideError();
//     }

//     /**
//      * Initialize modal close handlers
//      */
//     function initModalClose() {
//       // Close button
//       const closeBtn = modal.querySelector(
//         ".custom-feature-product-modal__close"
//       );
//       if (closeBtn) {
//         closeBtn.addEventListener("click", closeModal);
//       }

//       // Overlay click
//       const overlay = modal.querySelector(
//         ".custom-feature-product-modal__overlay"
//       );
//       if (overlay) {
//         overlay.addEventListener("click", closeModal);
//       }

//       // ESC key
//       document.addEventListener("keydown", function (e) {
//         if (
//           e.key === "Escape" &&
//           modal.getAttribute("aria-hidden") === "false"
//         ) {
//           closeModal();
//         }
//       });
//     }

//     /**
//      * Populate modal with product data
//      */
//     function populateModal() {
//       if (!currentProduct) return;

//       // Set image
//       if (modalImage && currentProduct.image) {
//         modalImage.src = currentProduct.image;
//         modalImage.alt = currentProduct.title;
//       }

//       // Set title, price, description
//       if (modalTitle) modalTitle.textContent = currentProduct.title;
//       if (modalPrice) modalPrice.textContent = currentProduct.price;
//       if (modalDescription)
//         modalDescription.textContent = currentProduct.description;

//       // Build variant options
//       buildVariantOptions();

//       // Set initial variant
//       updateSelectedVariant();
//     }

//     /**
//      * Build variant option selectors
//      */
//     function buildVariantOptions() {
//       if (!modalOptions || !currentProduct.options) return;

//       modalOptions.innerHTML = "";

//       // Sort options so Color comes first
//       const sortedOptions = [...currentProduct.options].sort(function (a, b) {
//         const aName = a.name.toLowerCase();
//         const bName = b.name.toLowerCase();
//         if (aName === "color" || aName === "colour") return -1;
//         if (bName === "color" || bName === "colour") return 1;
//         return 0;
//       });

//       sortedOptions.forEach(function (option, index) {
//         const optionName = option.name.toLowerCase();
//         const optionGroup = document.createElement("div");
//         optionGroup.className = "custom-feature-product-modal__option-group";
//         optionGroup.dataset.optionIndex = index;

//         // Label
//         const label = document.createElement("label");
//         label.className = "custom-feature-product-modal__option-label";
//         label.textContent = option.name;
//         optionGroup.appendChild(label);

//         // Check if this is a color option
//         if (optionName === "color" || optionName === "colour") {
//           // Color buttons
//           const colorContainer = document.createElement("div");
//           colorContainer.className =
//             "custom-feature-product-modal__color-options";

//           option.values.forEach(function (value, valueIndex) {
//             const colorBtn = document.createElement("button");
//             colorBtn.type = "button";
//             colorBtn.className = "custom-feature-product-modal__color-btn";
//             colorBtn.dataset.optionName = option.name;
//             colorBtn.dataset.optionValue = value;
//             colorBtn.dataset.optionPosition = option.position;

//             // Create color tint element
//             const colorTint = document.createElement("span");
//             colorTint.className = "feature-product-modal__color-tint";
//             // Map color name to actual color value
//             const colorMap = {
//               white: "#ffffff",
//               black: "#000000",
//               red: "#e53935",
//               blue: "#1e88e5",
//               green: "#43a047",
//               yellow: "#fdd835",
//               orange: "#fb8c00",
//               pink: "#ec407a",
//               purple: "#8e24aa",
//               grey: "#757575",
//               gray: "#757575",
//               brown: "#6d4c41",
//               navy: "#1a237e",
//               beige: "#d7ccc8",
//               cream: "#fffdd0",
//             };
//             const colorValue = value.toLowerCase();
//             colorTint.style.backgroundColor =
//               colorMap[colorValue] || colorValue;
//             colorBtn.appendChild(colorTint);

//             // Create text span
//             const textSpan = document.createElement("span");
//             textSpan.className = "feature-product-modal__color-text";
//             textSpan.textContent = value;
//             colorBtn.appendChild(textSpan);

//             // Don't select by default - user must choose

//             colorBtn.addEventListener("click", function () {
//               selectColorOption(this, colorContainer);
//             });

//             colorContainer.appendChild(colorBtn);
//           });

//           optionGroup.appendChild(colorContainer);
//         } else {
//           // Size or other options - Custom dropdown with scrollable menu
//           const sizeWrapper = document.createElement("div");
//           sizeWrapper.className =
//             "custom-feature-product-modal__size-select-wrapper";

//           // Trigger button - Show "Choose your size" as default
//           const trigger = document.createElement("button");
//           trigger.type = "button";
//           trigger.className = "custom-feature-product-modal__size-trigger";
//           trigger.dataset.optionName = option.name;
//           trigger.dataset.hasSelection = "false";

//           // Trigger text
//           const triggerText = document.createElement("span");
//           triggerText.className = "feature-product-modal__size-trigger-text";
//           triggerText.textContent = "Choose your " + option.name.toLowerCase();
//           trigger.appendChild(triggerText);

//           // Arrow wrapper with partition line
//           const arrowWrapper = document.createElement("span");
//           arrowWrapper.className = "feature-product-modal__size-arrow-wrapper";

//           // Chevron SVG icon
//           const arrow = document.createElement("span");
//           arrow.className = "custom-feature-product-modal__size-arrow";
//           arrow.innerHTML =
//             '<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
//           arrowWrapper.appendChild(arrow);
//           trigger.appendChild(arrowWrapper);

//           // Dropdown menu (scrollable)
//           const dropdown = document.createElement("div");
//           dropdown.className = "custom-feature-product-modal__size-dropdown";

//           option.values.forEach(function (value, valueIndex) {
//             const optionItem = document.createElement("div");
//             optionItem.className = "custom-feature-product-modal__size-option";
//             optionItem.textContent = value;
//             optionItem.dataset.optionName = option.name;
//             optionItem.dataset.optionValue = value;
//             optionItem.dataset.optionPosition = option.position;

//             // Don't select by default - user must choose
//             // Remove the auto-selection of first value

//             optionItem.addEventListener("click", function () {
//               selectSizeOption(this, sizeWrapper, trigger, dropdown);
//             });

//             dropdown.appendChild(optionItem);
//           });

//           trigger.addEventListener("click", function (e) {
//             e.stopPropagation();
//             toggleSizeDropdown(sizeWrapper);
//           });

//           sizeWrapper.appendChild(trigger);
//           sizeWrapper.appendChild(dropdown);
//           optionGroup.appendChild(sizeWrapper);
//         }

//         modalOptions.appendChild(optionGroup);
//       });

//       // Close dropdowns when clicking outside
//       document.addEventListener("click", closeAllDropdowns);
//     }

//     /**
//      * Select a color option
//      */
//     function selectColorOption(btn, container) {
//       // Remove selection from all
//       container
//         .querySelectorAll(".custom-feature-product-modal__color-btn")
//         .forEach(function (b) {
//           b.classList.remove("is-selected");
//         });

//       // Add selection to clicked
//       btn.classList.add("is-selected");

//       // Update selected options
//       selectedOptions[btn.dataset.optionName] = btn.dataset.optionValue;

//       // Update variant
//       updateSelectedVariant();
//     }

//     /**
//      * Toggle size dropdown open/close
//      */
//     function toggleSizeDropdown(wrapper) {
//       const isOpen = wrapper.classList.contains("is-open");

//       // Close all dropdowns first
//       closeAllDropdowns();

//       if (!isOpen) {
//         wrapper.classList.add("is-open");
//       }
//     }

//     /**
//      * Close all dropdowns
//      */
//     function closeAllDropdowns() {
//       document
//         .querySelectorAll(
//           ".custom-feature-product-modal__size-select-wrapper.is-open"
//         )
//         .forEach(function (d) {
//           d.classList.remove("is-open");
//         });
//     }

//     /**
//      * Select a size option
//      */
//     function selectSizeOption(optionItem, wrapper, trigger, dropdown) {
//       const optionName = optionItem.dataset.optionName;
//       const optionValue = optionItem.dataset.optionValue;

//       // Update trigger text (only the text span, not the whole trigger)
//       const triggerText = trigger.querySelector(
//         ".feature-product-modal__size-trigger-text"
//       );
//       if (triggerText) {
//         triggerText.textContent = optionValue;
//       } else {
//         trigger.textContent = optionValue;
//       }

//       // Update selection state
//       dropdown
//         .querySelectorAll(".custom-feature-product-modal__size-option")
//         .forEach(function (opt) {
//           opt.classList.remove("is-selected");
//         });
//       optionItem.classList.add("is-selected");

//       // Close dropdown
//       wrapper.classList.remove("is-open");

//       // Update selected options
//       selectedOptions[optionName] = optionValue;

//       // Update variant
//       updateSelectedVariant();
//     }

//     /**
//      * Find and update the selected variant based on options
//      */
//     function updateSelectedVariant() {
//       if (!variants || variants.length === 0) return;

//       // Check if all options have been selected
//       const allOptionsSelected = currentProduct.options.every(function (
//         option
//       ) {
//         return selectedOptions[option.name] !== undefined;
//       });

//       if (!allOptionsSelected) {
//         // Not all options selected yet - keep button enabled but no variant set
//         modalVariantId.value = "";
//         modalAddBtn.disabled = false;
//         modalAddBtn.querySelector(
//           ".custom-feature-product-modal__add-btn-text"
//         ).textContent = "ADD TO CART";
//         return;
//       }

//       // Find matching variant
//       const matchingVariant = variants.find(function (variant) {
//         return currentProduct.options.every(function (option, index) {
//           const selectedValue = selectedOptions[option.name];
//           // variant options are option1, option2, option3
//           return variant["option" + (index + 1)] === selectedValue;
//         });
//       });

//       if (matchingVariant) {
//         modalVariantId.value = matchingVariant.id;

//         // Update price if available
//         // if (modalPrice && matchingVariant.price) {
//         //   const formattedPrice = formatMoney(matchingVariant.price);
//         //   modalPrice.textContent = formattedPrice;
//         // }

//         // Enable/disable button based on availability
//         if (matchingVariant.available) {
//           modalAddBtn.disabled = false;
//           modalAddBtn.querySelector(
//             ".custom-feature-product-modal__add-btn-text"
//           ).textContent = "ADD TO CART";
//         } else {
//           modalAddBtn.disabled = true;
//           modalAddBtn.querySelector(
//             ".custom-feature-product-modal__add-btn-text"
//           ).textContent = "SOLD OUT";
//         }
//       } else {
//         modalVariantId.value = "";
//         modalAddBtn.disabled = true;
//       }
//     }

//     /**
//      * Format money (basic implementation)
//      */
//     function formatMoney(cents) {
//       if (typeof Shopify !== "undefined" && Shopify.formatMoney) {
//         return Shopify.formatMoney(cents);
//       }
//       // Basic fallback - format as currency
//       const amount = (cents / 100).toFixed(2);
//       return amount.replace(".", ",") + "€";
//     }

//     /**
//      * Initialize form submission
//      */
//     function initFormSubmit() {
//       if (!modalForm) return;

//       modalForm.addEventListener("submit", function (e) {
//         e.preventDefault();
//         addToCart();
//       });
//     }

//     /**
//      * Add to cart functionality - Based on Dawn theme's product-form.js
//      */
//     function addToCart() {
//       const variantId = modalVariantId.value;

//       if (!variantId) {
//         showError("Please select color and size");
//         return;
//       }

//       // Disable button and show loading
//       modalAddBtn.disabled = true;
//       modalAddBtn.classList.add("loading");
//       const spinner = modalAddBtn.querySelector(
//         ".custom-feature-product-modal__spinner"
//       );
//       if (spinner) spinner.classList.remove("hidden");

//       hideError();

//       // Get cart drawer/notification element (same as Dawn)
//       const cart =
//         document.querySelector("cart-notification") ||
//         document.querySelector("cart-drawer");

//       // Create config similar to fetchConfig('javascript')
//       const config = {
//         method: "POST",
//         headers: {
//           "X-Requested-With": "XMLHttpRequest",
//           Accept: "application/json",
//         },
//       };

//       // Prepare form data
//       const formData = new FormData();
//       formData.append("id", variantId);
//       formData.append("quantity", 1);

//       // Add sections for cart drawer update (same as Dawn)
//       if (cart && typeof cart.getSectionsToRender === "function") {
//         formData.append(
//           "sections",
//           cart.getSectionsToRender().map(function (section) {
//             return section.id;
//           })
//         );
//         formData.append("sections_url", window.location.pathname);

//         // Set active element for focus management
//         if (typeof cart.setActiveElement === "function") {
//           cart.setActiveElement(document.activeElement);
//         }
//       }

//       config.body = formData;

//       // Get cart add URL
//       const cartAddUrl =
//         (window.routes && window.routes.cart_add_url) || "/cart/add.js";

//       // Check if variant has Black color AND Medium size - for bundle feature
//       const shouldAddBundledProduct = checkForBlackMediumVariant();
//       const softWinterJacketVariantId = "43093836300331";

//       // Add to cart request
//       fetch(cartAddUrl, config)
//         .then(function (response) {
//           return response.json();
//         })
//         .then(function (response) {
//           if (response.status) {
//             // Error response - same as Dawn
//             if (
//               typeof publish === "function" &&
//               typeof PUB_SUB_EVENTS !== "undefined"
//             ) {
//               publish(PUB_SUB_EVENTS.cartError, {
//                 source: "feature-products-modal",
//                 productVariantId: variantId,
//                 errors: response.errors || response.description,
//                 message: response.message,
//               });
//             }
//             showError(response.description || "Could not add to cart");
//             return Promise.reject("Cart error");
//           }

//           // If Black + Medium was selected, also add Soft Winter Jacket
//           if (shouldAddBundledProduct) {
//             return addBundledProductToCart(
//               softWinterJacketVariantId,
//               cart
//             ).then(function (bundleResponse) {
//               // Return the bundle response since it will have the updated cart sections
//               return bundleResponse || response;
//             });
//           }

//           return response;
//         })
//         .then(function (response) {
//           if (!response) return;

//           // Success!
//           if (!cart) {
//             // No cart drawer/notification - redirect to cart page
//             window.location = window.routes ? window.routes.cart_url : "/cart";
//             return;
//           }

//           // Publish cart update event (same as Dawn)
//           if (
//             typeof publish === "function" &&
//             typeof PUB_SUB_EVENTS !== "undefined"
//           ) {
//             publish(PUB_SUB_EVENTS.cartUpdate, {
//               source: "feature-products-modal",
//               productVariantId: variantId,
//               cartData: response,
//             });
//           }

//           // Close modal first, then render cart (same pattern as Dawn's quick-add-modal)
//           closeModal();

//           // Render cart contents with response sections
//           if (typeof cart.renderContents === "function") {
//             cart.renderContents(response);
//           }

//           // Remove is-empty class if present
//           if (cart.classList.contains("is-empty")) {
//             cart.classList.remove("is-empty");
//           }
//         })
//         .catch(function (error) {
//           if (error !== "Cart error") {
//             console.error("Add to cart error:", error);
//             showError("Something went wrong. Please try again.");
//           }
//         })
//         .finally(function () {
//           // Re-enable button
//           modalAddBtn.disabled = false;
//           modalAddBtn.classList.remove("loading");
//           const spinner = modalAddBtn.querySelector(
//             ".custom-feature-product-modal__spinner"
//           );
//           if (spinner) spinner.classList.add("hidden");
//         });
//     }

//     /**
//      * Check if the selected variant has Black color AND Medium size
//      */
//     function checkForBlackMediumVariant() {
//       let hasBlack = false;
//       let hasMedium = false;

//       // Check all selected options
//       for (const optionName in selectedOptions) {
//         const value = selectedOptions[optionName].toLowerCase();

//         // Check for Black color
//         if (
//           optionName.toLowerCase() === "color" ||
//           optionName.toLowerCase() === "colour"
//         ) {
//           if (value === "black") {
//             hasBlack = true;
//           }
//         }

//         // Check for Medium size
//         if (optionName.toLowerCase() === "size") {
//           if (value === "medium" || value === "m") {
//             hasMedium = true;
//           }
//         }
//       }

//       return hasBlack && hasMedium;
//     }

//     /**
//      * Add bundled product (Soft Winter Jacket) to cart
//      */
//     function addBundledProductToCart(bundleVariantId, cart) {
//       const formData = new FormData();
//       formData.append("id", bundleVariantId);
//       formData.append("quantity", 1);

//       // Add sections for cart drawer update
//       if (cart && typeof cart.getSectionsToRender === "function") {
//         formData.append(
//           "sections",
//           cart.getSectionsToRender().map(function (section) {
//             return section.id;
//           })
//         );
//         formData.append("sections_url", window.location.pathname);
//       }

//       const config = {
//         method: "POST",
//         headers: {
//           "X-Requested-With": "XMLHttpRequest",
//           Accept: "application/json",
//         },
//         body: formData,
//       };

//       const cartAddUrl =
//         (window.routes && window.routes.cart_add_url) || "/cart/add.js";

//       return fetch(cartAddUrl, config)
//         .then(function (response) {
//           return response.json();
//         })
//         .then(function (response) {
//           if (response.status) {
//             // Error adding bundled product - log but don't show to user
//             console.warn(
//               "Could not add bundled product:",
//               response.description
//             );
//             return null;
//           }
//           console.log(
//             "Bundled product (Soft Winter Jacket) added to cart automatically"
//           );
//           return response;
//         })
//         .catch(function (error) {
//           console.warn("Error adding bundled product:", error);
//           return null;
//         });
//     }

//     /**
//      * Show error message
//      */
//     function showError(message) {
//       if (modalError) {
//         modalError.textContent = message;
//         modalError.classList.remove("hidden");
//       }
//     }

//     /**
//      * Hide error message
//      */
//     function hideError() {
//       if (modalError) {
//         modalError.classList.add("hidden");
//       }
//     }
//   }
// )();

class FeatureQuickView extends HTMLElement {
  constructor() {
    super();

    this.modalImage = this.querySelector("#custom-feature-product-modal-image");
    this.modalTitle = this.querySelector("#custom-feature-product-modal-title");
    this.modalPrice = this.querySelector("#custom-feature-product-modal-price");
    this.modalDescription = this.querySelector(
      "#custom-feature-product-modal-description"
    );
    this.modalOptions = this.querySelector(
      "#custom-feature-product-modal-options"
    );
    this.modalVariantId = this.querySelector(
      "#custom-feature-product-modal-variant-id"
    );
    this.modalAddBtn = this.querySelector(
      "#custom-feature-product-modal-add-btn"
    );

    this.modalAddBtnSpinner = this.querySelector('.custom-feature-product-modal__spinner')
    this.modalError = this.querySelector("#custom-feature-product-modal-error");

    this.currentProduct = null;
    this.selectedOptions = {};
  }

  connectedCallback() {
    this.initTriggers();
    this.initClose();
    this.initForm();
  }

  /* -------------------------
     OPEN MODAL
  ------------------------- */

  async open(handle, customImage = null) {
    try {
      const response = await fetch(`/products/${handle}.js`);
      const product = await response.json();

      this.currentProduct = product;
      this.selectedOptions = {};

      this.populate(product, customImage);

      this.modalError.classList.add("hidden");
      this.modalError.textContent = "";

      this.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    } catch (error) {
      console.error("Product fetch error:", error);
    }
  }

  initTriggers() {
    document
      .querySelectorAll(".custom-feature-products__icon-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          this.open(btn.dataset.productHandle, btn.dataset.customImage);
        });
      });
  }

  populate(product, customImage) {
    this.modalTitle.textContent = product.title;
    this.modalDescription.innerHTML = product.description;
    this.modalPrice.textContent = this.formatMoney(product.price);

    const imageSrc = customImage || product.featured_image;
    this.modalImage.src = imageSrc;
    this.modalImage.alt = product.title;

    this.buildOptions(product);
  }

  /* -------------------------
     BUILD OPTIONS
  ------------------------- */

  buildOptions(product) {
    this.modalOptions.innerHTML = "";

    const sortedOptions = [...product.options].sort((a, b) => {
      if (a.name.toLowerCase() === "color") return -1;
      if (b.name.toLowerCase() === "color") return 1;
      return 0;
    });

    sortedOptions.forEach((option) => {
      const optionGroup = document.createElement("div");
      optionGroup.className = "custom-feature-product-modal__option-group";

      const label = document.createElement("label");
      label.className = "custom-feature-product-modal__option-label";
      label.textContent = option.name;
      optionGroup.appendChild(label);

      const lower = option.name.toLowerCase();

      /* COLOR */
      if (lower === "color") {
        const container = document.createElement("div");
        container.className =
          "custom-feature-product-modal__color-options";

        option.values.forEach((value) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "custom-feature-product-modal__color-btn";

          const tint = document.createElement("span");
          tint.className = "feature-product-modal__color-tint";
          tint.style.backgroundColor = value.toLowerCase();
          btn.appendChild(tint);

          const text = document.createElement("span");
          text.textContent = value;
          btn.appendChild(text);

          btn.addEventListener("click", () => {
            container
              .querySelectorAll(".custom-feature-product-modal__color-btn")
              .forEach((b) => b.classList.remove("is-selected"));

            btn.classList.add("is-selected");
            this.selectedOptions[option.name] = value;
            this.updateVariant();
          });

          container.appendChild(btn);
        });

        optionGroup.appendChild(container);
      }

      /* SIZE DROPDOWN */
      else {
        const wrapper = document.createElement("div");
        wrapper.className =
          "custom-feature-product-modal__size-select-wrapper";

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className =
          "custom-feature-product-modal__size-trigger";

        const triggerText = document.createElement("span");
        triggerText.className =
          "feature-product-modal__size-trigger-text";
        triggerText.textContent =
          "Choose your " + option.name.toLowerCase();

        const arrow = document.createElement("span");
        arrow.className =
          "custom-feature-product-modal__size-arrow";
        arrow.innerHTML = `
          <svg width="12" height="8" viewBox="0 0 12 8">
            <path d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"/>
          </svg>
        `;

        trigger.appendChild(triggerText);
        trigger.appendChild(arrow);

        const dropdown = document.createElement("div");
        dropdown.className =
          "custom-feature-product-modal__size-dropdown";

        option.values.forEach((value) => {
          const item = document.createElement("div");
          item.className =
            "custom-feature-product-modal__size-option";
          item.textContent = value;

          item.addEventListener("click", () => {
            triggerText.textContent = value;
            wrapper.classList.remove("is-open");

            this.selectedOptions[option.name] = value;
            this.updateVariant();
          });

          dropdown.appendChild(item);
        });

        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          wrapper.classList.toggle("is-open");
        });

        wrapper.appendChild(trigger);
        wrapper.appendChild(dropdown);
        optionGroup.appendChild(wrapper);
      }

      this.modalOptions.appendChild(optionGroup);
    });
  }

  updateVariant() {
    const variant = this.currentProduct.variants.find((v) => {
      return this.currentProduct.options.every((option, index) => {
        return v[`option${index + 1}`] ===
          this.selectedOptions[option.name];
      });
    });

    if (!variant) return;

    this.modalVariantId.value = variant.id;
    this.modalPrice.textContent = this.formatMoney(variant.price);
    this.modalAddBtn.disabled = !variant.available;

    // ✅ HIDE ERROR ON VALID SELECTION
  this.modalError.classList.add("hidden");
  this.modalError.textContent = "";
  }

  /* -------------------------
     BUNDLE CHECK
  ------------------------- */

  shouldAddBundle() {
    if (!this.currentProduct) return false;
  
    const requiredOptions = ["color", "colour", "size"];
    const optionNames = this.currentProduct.options.map(o => o.name.toLowerCase());
  
    // If product doesn't even have both color and size, don't bundle
    if (
      !optionNames.includes("color") &&
      !optionNames.includes("colour")
    ) return false;
  
    if (!optionNames.includes("size")) return false;
  
    let hasBlack = false;
    let hasMedium = false;
  
    for (const key in this.selectedOptions) {
      const value = this.selectedOptions[key]?.toLowerCase();
      const name = key.toLowerCase();
  
      if ((name === "color" || name === "colour") && value === "black") {
        hasBlack = true;
      }
  
      if (name === "size" && (value === "m" || value === "medium")) {
        hasMedium = true;
      }
    }
  
    return hasBlack && hasMedium;
  }

  /* -------------------------
     ADD TO CART (ATOMIC FIX)
  ------------------------- */

  initForm() {
    const form = this.querySelector("form");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      if (!this.modalVariantId.value) {
        this.showError("Please select options");
        return;
      }
  
      this.modalAddBtn.disabled = true;
      this.modalAddBtn.classList.add("loading");
      this.modalAddBtnSpinner.classList.remove("hidden");
  
      const cart =
        document.querySelector("cart-drawer") ||
        document.querySelector("cart-notification");
  
      const formData = new FormData();
  
      /* -------------------------
         ADD MAIN PRODUCT
      ------------------------- */
      formData.append("items[0][id]", this.modalVariantId.value);
      formData.append("items[0][quantity]", 1);
  
      /* -------------------------
         ADD BUNDLE IF NEEDED
      ------------------------- */
      if (this.shouldAddBundle()) {
        formData.append("items[1][id]", 43093836300331); // bundle ID
        formData.append("items[1][quantity]", 1);
      }
  
      /* -------------------------
         🔥 IMPORTANT: SECTIONS
      ------------------------- */
      if (cart && typeof cart.getSectionsToRender === "function") {
        formData.append(
          "sections",
          cart.getSectionsToRender().map((section) => section.id)
        );
        formData.append("sections_url", window.location.pathname);
  
        if (typeof cart.setActiveElement === "function") {
          cart.setActiveElement(document.activeElement);
        }
      }
  
      try {
        const response = await fetch(
          window.routes?.cart_add_url || "/cart/add.js",
          {
            method: "POST",
            headers: {
              "X-Requested-With": "XMLHttpRequest",
              Accept: "application/json",
            },
            body: formData,
          }
        );
  
        const data = await response.json();
  
        if (data.status) {
          this.showError(data.description || "Error adding to cart");
          return;
        }
  
        if (!cart) {
          window.location.href =
            window.routes?.cart_url || "/cart";
          return;
        }
  
        this.close();
  
        /* -------------------------
           RENDER CART DRAWER
        ------------------------- */
        if (typeof cart.renderContents === "function") {
          cart.renderContents(data);
        }
  
        if (cart.classList.contains("is-empty")) {
          cart.classList.remove("is-empty");
        }
  
      } catch (error) {
        console.error("Add to cart error:", error);
        this.showError("Something went wrong");
      } finally {
        this.modalAddBtn.disabled = false;
        this.modalAddBtn.classList.remove("loading");
        this.modalAddBtnSpinner.classList.add("hidden");
      }
    });
  }

  /* -------------------------
     CLOSE
  ------------------------- */

  initClose() {
    this.querySelector(
      ".custom-feature-product-modal__close"
    ).addEventListener("click", () => this.close());

    this.querySelector(
      ".custom-feature-product-modal__overlay"
    ).addEventListener("click", () => this.close());
  }

  close() {
    this.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    this.selectedOptions = {};
    this.modalVariantId.value = "";
  }

  formatMoney(cents) {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: Shopify.currency.active || "USD",
    }).format(cents / 100);
  }

  showError(msg) {
    this.modalError.textContent = msg;
    this.modalError.classList.remove("hidden");
  }
}

customElements.define("feature-quick-view", FeatureQuickView);