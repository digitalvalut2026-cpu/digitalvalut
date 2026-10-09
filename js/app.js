// Digital Vault - Main Application Entrypoint & Event Orchestration

import { store } from './store.js';
import { getIcon } from './icons.js';
import {
  renderTrustStrip,
  renderCategoriesGrid,
  renderProductsCatalog,
  renderFreebiesSection,
  renderTestimonials,
  renderFaqs,
  openProductDetailModal
} from './ui.js';
import { initCartAndWishlist, openCart } from './cart.js';
import { initCheckoutModal, openCheckoutModal } from './checkout.js';
import { initCustomerDashboard, switchDashboardTab, downloadRealDigitalProductPackage } from './dashboard.js';

let pendingFreebieProduct = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}

export function initApp() {
  // 1. Initial Render of Marketplace Sections
  renderTrustStrip();
  renderCategoriesGrid();
  renderProductsCatalog();
  renderFreebiesSection();
  renderTestimonials();
  renderFaqs();

  // 2. Initialize Subsystems
  initCartAndWishlist();
  initCheckoutModal();
  initCustomerDashboard();
  initSearchAndFilters();
  initModals();
  initNavigationEvents();

  // 3. Global Click Delegate for Product Cards & Actions
  document.body.addEventListener('click', handleGlobalClicks);

  // 4. Keyboard & Click Search Triggers
  const searchBtn = document.getElementById('openSearchShortcutBtn');
  const focusSearchInput = () => {
    switchView('store');
    const searchField = document.getElementById('catalogSearchInput');
    if (searchField) {
      searchField.focus();
      searchField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (searchBtn) {
    searchBtn.addEventListener('click', focusSearchInput);
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      focusSearchInput();
    }
  });

  // 5. Scroll listener for sticky navbar effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }
  });

  // 6. Listen for store updates that require re-rendering catalog
  store.subscribe('products_changed', () => {
    renderProductsCatalog();
    renderFreebiesSection();
  });

  store.subscribe('bundles_changed', () => {
    renderProductsCatalog();
  });

  store.subscribe('filter_changed', (filtered) => {
    renderProductsCatalog(filtered);
  });

  store.subscribe('trust_stats_changed', () => {
    renderTrustStrip();
  });

  store.subscribe('faqs_changed', () => {
    renderFaqs();
  });
}

// Route & View Switching (Store, Customer Dashboard, Admin Portal)
export function switchView(viewName = 'store', subTab = null) {
  const storeView = document.getElementById('storeMainView');
  const dashboardView = document.getElementById('customerDashboardContainer');
  const adminView = document.getElementById('adminPortalContainer');

  // Hide all
  if (storeView) storeView.style.display = 'none';
  if (dashboardView) dashboardView.classList.remove('active');
  if (adminView) adminView.classList.remove('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewName === 'dashboard') {
    if (dashboardView) {
      dashboardView.classList.add('active');
      switchDashboardTab(subTab || 'downloads');
    }
  } else if (viewName === 'admin') {
    window.location.href = 'admin.html';
    return;
  } else {
    // Default store
    if (storeView) storeView.style.display = 'block';
  }
}

// Navigation & Header Event Handlers
function initNavigationEvents() {
  // Keyboard shortcut for discrete Admin access: Ctrl + Shift + A
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });

  // Logo click -> go to store home
  const logoBtn = document.getElementById('brandLogoLink');
  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('store');
    });
  }

  // Nav Links
  document.querySelectorAll('[data-nav-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-nav-target');

      if (target === 'home') {
        switchView('store');
      } else if (target === 'dashboard' || target === 'downloads') {
        switchView('dashboard', 'downloads');
      } else if (target === 'admin') {
        switchView('admin', 'overview');
      } else {
        switchView('store');
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // User Profile Dropdown / Login
  const userProfileMenu = document.getElementById('userProfileMenu');
  const userDropdown = document.getElementById('userProfileDropdown');
  if (userProfileMenu && userDropdown) {
    userProfileMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = window.getComputedStyle(userDropdown).display === 'none';
      userDropdown.style.display = isHidden ? 'block' : 'none';
      userDropdown.classList.toggle('active', isHidden);
    });

    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target) && !userProfileMenu.contains(e.target)) {
        userDropdown.style.display = 'none';
        userDropdown.classList.remove('active');
      }
    });
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileMenuDrawer = document.getElementById('mobileNavDrawer');
  const mobileMenuClose = document.getElementById('mobileNavClose');
  if (mobileToggle && mobileMenuDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileMenuDrawer.style.display = 'flex';
      mobileMenuDrawer.classList.add('active');
    });
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', () => {
        mobileMenuDrawer.style.display = 'none';
        mobileMenuDrawer.classList.remove('active');
      });
    }
    mobileMenuDrawer.addEventListener('click', (e) => {
      if (e.target === mobileMenuDrawer) {
        mobileMenuDrawer.style.display = 'none';
        mobileMenuDrawer.classList.remove('active');
      }
    });
    mobileMenuDrawer.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        mobileMenuDrawer.style.display = 'none';
        mobileMenuDrawer.classList.remove('active');
      });
    });
  }
}

export function resolveProductOrFallback(id, target = null) {
  let product = null;
  if (id) {
    product = store.getProductById(id) || store.getBundleById(id);
  }
  if (!product) {
    const card = (target && target.closest) ? (target.closest('.product-card') || target.closest('.bundle-card')) : document.querySelector(`[data-id="${id}"]`);
    if (card) {
      const titleEl = card.querySelector('.product-card-title, .bundle-card-title, h3');
      const priceEl = card.querySelector('.product-sale-price, .bundle-sale-price');
      const title = titleEl ? titleEl.textContent.trim() : 'Digital Resource Masterpack';
      const priceStr = priceEl ? priceEl.textContent.replace(/[^\d]/g, '') : '499';
      const price = parseInt(priceStr, 10) || 499;
      product = {
        id: id || 'dv-prod-1',
        title: title,
        salePrice: price,
        regularPrice: price * 2,
        downloadFilename: `${title.replace(/\s+/g, '_')}.zip`,
        formats: ['Masterpack Bundle', 'Commercial License']
      };
    }
  }
  if (!product) {
    product = {
      id: id || 'dv-prod-1',
      title: '500+ Canva Social Media Templates Masterpack',
      salePrice: 499,
      regularPrice: 999,
      downloadFilename: 'DigitalVault_500_Canva_Masterpack.zip',
      formats: ['Canva Templates', 'Commercial License']
    };
  }
  return product;
}

// Global Click Handlers
function handleGlobalClicks(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.getAttribute('data-action');
  const id = target.getAttribute('data-id');

  switch (action) {
    case 'view-product': {
      if (id) openProductDetailModal(id);
      break;
    }

    case 'add-cart':
    case 'buy-now': {
      const product = resolveProductOrFallback(id, target);
      const detailModal = document.getElementById('productDetailModal');
      if (detailModal) detailModal.classList.remove('active');
      openCheckoutModal(product);
      break;
    }

    case 'add-bundle':
    case 'buy-now-bundle': {
      const bundle = resolveProductOrFallback(id, target);
      openCheckoutModal(bundle);
      break;
    }

    case 'toggle-wishlist': {
      const added = store.toggleWishlist(id);
      const prod = store.getProductById(id) || store.getBundleById(id);
      const name = prod ? prod.title : 'Item';
      if (added) {
        showToast('Saved to Wishlist', `${name} saved to your favorites.`, 'success');
        target.classList.add('active');
        target.innerHTML = getIcon('heart-filled');
      } else {
        showToast('Removed from Wishlist', `${name} removed from favorites.`, 'info');
        target.classList.remove('active');
        target.innerHTML = getIcon('heart');
      }
      break;
    }

    case 'download-free': {
      const freeProduct = store.getProductById(id);
      if (freeProduct) {
        openFreebieEmailModal(freeProduct);
      }
      break;
    }
  }
}

// Search & Filter Toolbar
function initSearchAndFilters() {
  const searchInput = document.getElementById('catalogSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const sortSelect = document.getElementById('catalogSortSelect');
  const priceSelect = document.getElementById('catalogPriceSelect');
  const typeSelect = document.getElementById('catalogTypeSelect');
  const pillsContainer = document.getElementById('categoryFilterPills');

  // Search input with live filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.style.display = val.length > 0 ? 'block' : 'none';
      }
      store.setFilter('search', val);
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      store.setFilter('search', '');
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      store.setFilter('sort', e.target.value);
    });
  }

  if (priceSelect) {
    priceSelect.addEventListener('change', (e) => {
      store.setFilter('price', e.target.value);
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      store.setFilter('type', e.target.value);
    });
  }

  // Filter Pills (All + Categories)
  if (pillsContainer) {
    const categories = store.getCategories();
    pillsContainer.innerHTML = `
      <button class="filter-pill active" data-cat="all">All Resources</button>
      ${categories.map(c => `
        <button class="filter-pill" data-cat="${c.slug}">${c.name}</button>
      `).join('')}
    `;

    pillsContainer.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        pillsContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-cat');
        store.setFilter('category', cat);
      });
    });
  }
}

// Modals Setup (Detail modal, Freebie Email Gate, etc.)
function initModals() {
  // Product Detail Modal close
  const detailModal = document.getElementById('productDetailModal');
  const detailCloseBtn = document.getElementById('productDetailCloseBtn');
  if (detailCloseBtn && detailModal) {
    detailCloseBtn.addEventListener('click', () => {
      detailModal.classList.remove('active');
    });
  }

  // Close modals on overlay backdrop click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Freebie Email Gate Modal
  const freebieModal = document.getElementById('freebieEmailGateModal');
  const freebieCloseBtn = document.getElementById('freebieGateCloseBtn');
  const freebieForm = document.getElementById('freebieGateForm');

  if (freebieCloseBtn && freebieModal) {
    freebieCloseBtn.addEventListener('click', () => {
      freebieModal.classList.remove('active');
    });
  }

  if (freebieForm) {
    freebieForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('freebieEmailInput').value.trim();
      const name = document.getElementById('freebieNameInput').value.trim() || 'Creator';

      if (!email || !email.includes('@')) {
        showToast('Invalid Email', 'Please enter a valid email address.', 'warning');
        return;
      }

      // Add to store subscribers list
      store.addSubscriber(email, pendingFreebieProduct ? pendingFreebieProduct.title : 'Free Resource');

      // Trigger automatic file download
      if (pendingFreebieProduct) {
        downloadRealDigitalProductPackage(
          pendingFreebieProduct.id,
          pendingFreebieProduct.downloadFilename || 'DigitalVault_Free_Resource.zip',
          'DV-FREE-LICENSE-PERPETUAL'
        );

        // Add to customer downloads
        store.addDownloadItem(pendingFreebieProduct, 'DV-FREE-GIFT', 'DV-FREE-LICENSE');
      }

      freebieModal.classList.remove('active');
      showToast('Freebie Unlocked!', `Direct download started for ${name}. Check your downloads folder!`, 'success');
    });
  }

  // Footer Newsletter form
  const footerNewsletterForm = document.getElementById('footerNewsletterForm');
  if (footerNewsletterForm) {
    footerNewsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('footerNewsletterInput');
      if (input && input.value) {
        store.addSubscriber(input.value, 'Footer Newsletter');
        showToast('Welcome!', 'You are subscribed to Digital Vault updates.', 'success');
        input.value = '';
      }
    });
  }
}

export function openFreebieEmailModal(product) {
  pendingFreebieProduct = product;
  const modal = document.getElementById('freebieEmailGateModal');
  const titleEl = document.getElementById('freebieGateTitle');
  if (titleEl && product) {
    titleEl.textContent = `Unlock "${product.title}" for Free`;
  }
  if (modal) {
    modal.classList.add('active');
  }
}

// Toast Notifications System
export function showToast(title, message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  const icon = type === 'success' ? getIcon('check') : type === 'warning' ? getIcon('lock') : getIcon('zap');

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

// Expose global app for inline links
window.digitalVaultApp = {
  switchView,
  showToast
};

const existingDirectBuy = window.digitalVaultDirectBuy;
window.digitalVaultDirectBuy = function(productId, btnEl = null) {
  if (typeof existingDirectBuy === 'function') {
    existingDirectBuy(productId, btnEl);
    return;
  }
  const prod = resolveProductOrFallback(productId, btnEl || document.querySelector(`[data-id="${productId}"]`));
  const detailModal = document.getElementById('productDetailModal');
  if (detailModal) detailModal.classList.remove('active');
  openCheckoutModal(prod);
};
window.digitalVaultOpenCheckout = window.digitalVaultDirectBuy;
