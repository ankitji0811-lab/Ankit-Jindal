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

    this.modalAddBtnSpinner = this.querySelector(
      ".custom-feature-product-modal__spinner"
    );
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
        container.className = "custom-feature-product-modal__color-options";

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
      } else {
        /* SIZE DROPDOWN */
        const wrapper = document.createElement("div");
        wrapper.className = "custom-feature-product-modal__size-select-wrapper";

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "custom-feature-product-modal__size-trigger";

        const triggerText = document.createElement("span");
        triggerText.className = "feature-product-modal__size-trigger-text";
        triggerText.textContent = "Choose your " + option.name.toLowerCase();

        const arrow = document.createElement("span");
        arrow.className = "custom-feature-product-modal__size-arrow";
        arrow.innerHTML = `
        <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.06055 1.06067L7.06055 7.06067L13.0605 1.06067" stroke="black" stroke-width="1.5" stroke-linecap="square"/>
        </svg>
        `;

        trigger.appendChild(triggerText);
        trigger.appendChild(arrow);

        const dropdown = document.createElement("div");
        dropdown.className = "custom-feature-product-modal__size-dropdown";

        option.values.forEach((value) => {
          const item = document.createElement("div");
          item.className = "custom-feature-product-modal__size-option";
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
        return v[`option${index + 1}`] === this.selectedOptions[option.name];
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
    const optionNames = this.currentProduct.options.map((o) =>
      o.name.toLowerCase()
    );

    // If product doesn't even have both color and size, don't bundle
    if (!optionNames.includes("color") && !optionNames.includes("colour"))
      return false;

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
     ADD TO CART
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
          window.location.href = window.routes?.cart_url || "/cart";
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
    this.querySelector(".custom-feature-product-modal__close").addEventListener(
      "click",
      () => this.close()
    );

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