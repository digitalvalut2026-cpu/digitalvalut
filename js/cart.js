// Digital Vault - Shopping Cart & Wishlist Drawer Logic

import { store } from './store.js';
import { getIcon } from './icons.js';
import { getProductMockupSvg } from './mockups.js';
import { showToast } from './app.js';
import { openCheckoutModal } from './checkout.js';

export function initCartAndWishlist() {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const openCartBtn = document.getElementById('openCartBtn');
  const proceedCheckoutBtn = document.getElementById('proceedCheckoutBtn');

  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const wishlistBackdrop = document.getElementById('wishlistBackdrop');
  const wishlistCloseBtn = document.getElementById('wishlistCloseBtn');
  const openWishlistBtn = document.getElementById('openWishlistBtn');

  // Open/Close Cart
  if (openCartBtn) {
    openCartBtn.addEventListener('click', () => openCart());
  }
  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => closeCart());
  }
  if (cartBackdrop) {
    cartBackdrop.addEventListener('click', () => closeCart());
  }

  // Open/Close Wishlist
  if (openWishlistBtn) {
    openWishlistBtn.addEventListener('click', () => openWishlist());
  }
  if (wishlistCloseBtn) {
    wishlistCloseBtn.addEventListener('click', () => closeWishlist());
  }
  if (wishlistBackdrop) {
    wishlistBackdrop.addEventListener('click', () => closeWishlist());
  }

  // Checkout trigger from Cart Drawer
  if (proceedCheckoutBtn) {
    proceedCheckoutBtn.addEventListener('click', () => {
      const summary = store.getCartSummary();
      if (summary.items.length === 0) {
        showToast('Cart is empty', 'Add at least one product before proceeding.', 'info');
        return;
      }
      closeCart();
      openCheckoutModal();
    });
  }

  // Coupon apply
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const couponInput = document.getElementById('cartCouponInput');
  if (applyCouponBtn && couponInput) {
    applyCouponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim();
      if (!code) return;
      const res = store.applyCoupon(code);
      if (res.success) {
        showToast('Coupon Applied', res.message, 'success');
        couponInput.value = '';
      } else {
        showToast('Coupon Error', res.message, 'warning');
      }
    });
  }

  // Subscribe to updates
  store.subscribe('cart_updated', () => {
    updateCartUI();
  });

  store.subscribe('wishlist_updated', () => {
    updateWishlistUI();
  });

  // Initial render
  updateCartUI();
  updateWishlistUI();
}

export function openCart() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (drawer && backdrop) {
    backdrop.classList.add('active');
    drawer.classList.add('active');
    updateCartUI();
  }
}

export function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
  }
}

export function openWishlist() {
  const drawer = document.getElementById('wishlistDrawer');
  const backdrop = document.getElementById('wishlistBackdrop');
  if (drawer && backdrop) {
    backdrop.classList.add('active');
    drawer.classList.add('active');
    updateWishlistUI();
  }
}

export function closeWishlist() {
  const drawer = document.getElementById('wishlistDrawer');
  const backdrop = document.getElementById('wishlistBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
  }
}

export function updateCartUI() {
  const summary = store.getCartSummary();
  const cartBadge = document.getElementById('cartBadgeCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotalEl = document.getElementById('cartSubtotalAmount');
  const cartDiscountRow = document.getElementById('cartDiscountRow');
  const cartDiscountAmount = document.getElementById('cartDiscountAmount');
  const cartTotalEl = document.getElementById('cartTotalAmount');
  const couponContainer = document.getElementById('activeCouponContainer');

  // Update badge count
  if (cartBadge) {
    cartBadge.textContent = summary.itemCount;
    cartBadge.style.display = summary.itemCount > 0 ? 'flex' : 'none';
  }

  // Update totals
  if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${summary.subtotal}`;
  if (cartTotalEl) cartTotalEl.textContent = `₹${summary.total}`;

  if (summary.discount > 0 && cartDiscountRow && cartDiscountAmount) {
    cartDiscountRow.style.display = 'flex';
    cartDiscountAmount.textContent = `-₹${summary.discount}`;
  } else if (cartDiscountRow) {
    cartDiscountRow.style.display = 'none';
  }

  // Active coupon badge
  if (couponContainer) {
    if (summary.coupon) {
      couponContainer.innerHTML = `
        <div class="coupon-active-badge">
          <span>${getIcon('tag')} Code <strong>${summary.coupon.code}</strong> applied (${summary.coupon.discount}${summary.coupon.type === 'percent' ? '%' : '₹'} OFF)</span>
          <button id="removeCouponBtn" style="color: #EF4444; font-weight: bold; cursor: pointer;">Remove</button>
        </div>
      `;
      const removeBtn = document.getElementById('removeCouponBtn');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          store.removeCoupon();
          showToast('Coupon Removed', 'Coupon code was removed.', 'info');
        });
      }
    } else {
      couponContainer.innerHTML = '';
    }
  }

  // Render items
  if (!cartItemsList) return;

  if (summary.items.length === 0) {
    cartItemsList.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--color-text-muted);">
        <div style="font-size: 2rem; color: #CBD5E1; margin-bottom: 10px;">${getIcon('shopping-bag')}</div>
        <p style="font-weight: 700; margin-bottom: 6px; color: var(--color-text-main);">Your cart is empty</p>
        <p style="font-size: 0.8125rem;">Explore our digital products and add resources to get started.</p>
      </div>
    `;
    return;
  }

  cartItemsList.innerHTML = summary.items.map(item => `
    <div class="cart-item-row" data-id="${item.id}">
      <div class="cart-item-preview">
        ${getProductMockupSvg(item.imageType, item.title, item.categoryName)}
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.title}</h4>
        <span class="cart-item-price">₹${item.price}</span>
      </div>
      <div class="cart-quantity-stepper">
        <button class="cart-step-btn" data-action="cart-minus" data-id="${item.id}">-</button>
        <span class="cart-qty-num">${item.quantity}</span>
        <button class="cart-step-btn" data-action="cart-plus" data-id="${item.id}">+</button>
      </div>
      <button class="cart-item-remove-btn" data-action="cart-remove" data-id="${item.id}" title="Remove">
        ${getIcon('x')}
      </button>
    </div>
  `).join('');

  // Add click handlers for stepper & remove
  cartItemsList.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.currentTarget.getAttribute('data-action');
      const id = e.currentTarget.getAttribute('data-id');

      if (action === 'cart-plus') {
        store.updateCartQuantity(id, 1);
      } else if (action === 'cart-minus') {
        store.updateCartQuantity(id, -1);
      } else if (action === 'cart-remove') {
        store.removeFromCart(id);
        showToast('Item removed', 'Product removed from your cart.', 'info');
      }
    });
  });
}

export function updateWishlistUI() {
  const wishlistBadge = document.getElementById('wishlistBadgeCount');
  const wishlistItemsList = document.getElementById('wishlistItemsList');
  const allWishlistIds = store.wishlist;

  if (wishlistBadge) {
    wishlistBadge.textContent = allWishlistIds.length;
    wishlistBadge.style.display = allWishlistIds.length > 0 ? 'flex' : 'none';
  }

  if (!wishlistItemsList) return;

  const products = allWishlistIds
    .map(id => store.getProductById(id) || store.getBundleById(id))
    .filter(Boolean);

  if (products.length === 0) {
    wishlistItemsList.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--color-text-muted);">
        <div style="font-size: 2rem; color: #CBD5E1; margin-bottom: 10px;">${getIcon('heart')}</div>
        <p style="font-weight: 700; margin-bottom: 6px; color: var(--color-text-main);">Your wishlist is empty</p>
        <p style="font-size: 0.8125rem;">Save your favorite templates and tools to revisit anytime.</p>
      </div>
    `;
    return;
  }

  wishlistItemsList.innerHTML = products.map(p => `
    <div class="cart-item-row" data-id="${p.id}">
      <div class="cart-item-preview">
        ${getProductMockupSvg(p.imageType, p.title, p.categoryName)}
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-title">${p.title}</h4>
        <span class="cart-item-price">${p.free ? 'FREE' : `₹${p.salePrice}`}</span>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="btn btn-primary btn-sm" data-action="wishlist-to-cart" data-id="${p.id}">
          ${getIcon('shopping-bag')} Add
        </button>
        <button class="cart-item-remove-btn" data-action="wishlist-remove" data-id="${p.id}" title="Remove">
          ${getIcon('x')}
        </button>
      </div>
    </div>
  `).join('');

  wishlistItemsList.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.currentTarget.getAttribute('data-action');
      const id = e.currentTarget.getAttribute('data-id');

      if (action === 'wishlist-to-cart') {
        const prod = store.getProductById(id) || store.getBundleById(id);
        if (prod) {
          store.addToCart(prod, prod.isBundle);
          store.toggleWishlist(id);
          showToast('Added to Cart', `${prod.title} was moved to your cart!`, 'success');
        }
      } else if (action === 'wishlist-remove') {
        store.toggleWishlist(id);
        showToast('Removed from Wishlist', 'Item was removed.', 'info');
      }
    });
  });
}
