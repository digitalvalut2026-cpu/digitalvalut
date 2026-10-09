// Digital Vault - Comprehensive Admin Portal & Content Management System
// Includes Enterprise Safety Authentication, Bundles Management, Payment Gateways & UPI Verification, Orders & Invoices, Customer Directory, and Security Audit Logs.

import { store } from './store.js';
import { getIcon } from './icons.js';
import { showToast, switchView } from './app.js';
import { openInvoiceModal } from './checkout.js';

let activeAdminTab = 'overview';
let editingProductId = null;
let orderSearchFilter = '';
let orderStatusFilter = 'all';
let customerSearchFilter = '';
let pendingTargetTab = 'overview';
let inactivityTimer = null;

export function initAdminPortal() {
  const container = document.getElementById('adminPortalContainer');
  if (!container) return;

  // Sidebar navigation
  container.querySelectorAll('[data-admin-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-admin-tab');
      switchAdminTab(tab);
    });
  });

  // Reset database button
  const resetBtn = document.getElementById('adminResetDatabaseBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all products, orders, and stats back to default sample data?')) {
        store.resetDatabase();
        showToast('Database Reset', 'Store has been reset to initial seed data.', 'info');
        renderActiveAdminView();
      }
    });
  }

  // Back to Store button
  const backToStoreBtn = document.getElementById('adminBackToStoreBtn');
  if (backToStoreBtn) {
    backToStoreBtn.addEventListener('click', () => {
      switchView('store');
    });
  }

  // Lock & Logout button
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Lock admin session and log out safely?')) {
        store.logoutAdmin();
        showToast('Session Locked', 'You have been logged out safely.', 'info');
        switchView('store');
      }
    });
  }

  // Safety Login Form setup
  initSafetyLoginForm();

  // Inactivity auto-lock listener
  setupInactivityLock();

  // Pub/Sub change listeners
  store.subscribe('products_changed', () => {
    if (activeAdminTab === 'products' || activeAdminTab === 'overview') renderActiveAdminView();
  });

  store.subscribe('bundles_changed', () => {
    if (activeAdminTab === 'bundles' || activeAdminTab === 'overview') renderActiveAdminView();
  });

  store.subscribe('orders_changed', () => {
    if (['orders', 'payments', 'customers', 'overview'].includes(activeAdminTab)) renderActiveAdminView();
  });

  store.subscribe('customers_changed', () => {
    if (activeAdminTab === 'customers') renderActiveAdminView();
  });

  store.subscribe('testimonials_changed', () => {
    if (activeAdminTab === 'testimonials') renderActiveAdminView();
  });

  store.subscribe('faqs_changed', () => {
    if (activeAdminTab === 'faqs') renderActiveAdminView();
  });

  store.subscribe('trust_stats_changed', () => {
    if (activeAdminTab === 'trust-stats') renderActiveAdminView();
  });

  store.subscribe('admin_security_changed', () => {
    if (activeAdminTab === 'security') renderActiveAdminView();
  });
}

// --- ADMIN SAFETY ACCESS GATE ---

function initSafetyLoginForm() {
  const form = document.getElementById('adminSafetyLoginForm');
  const cancelBtn = document.getElementById('cancelAdminLoginBtn');
  const toggleEye = document.getElementById('adminPasswordToggleBtn');
  const passInput = document.getElementById('adminSafetyPasswordInput');

  if (toggleEye && passInput) {
    toggleEye.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      toggleEye.textContent = isPass ? '🙈' : '👁️';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeAdminLoginGate();
      switchView('store');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = passInput.value.trim();
      if (!entered) return;

      const result = store.loginAdmin(entered);
      if (result.success) {
        passInput.value = '';
        closeAdminLoginGate();
        showToast('Access Granted 🔓', 'Welcome to Digital Vault Administration', 'success');
        const adminView = document.getElementById('adminPortalContainer');
        if (adminView) {
          adminView.classList.add('active');
          switchAdminTab(pendingTargetTab || 'overview');
        }
      } else {
        const banner = document.getElementById('adminLockoutBanner');
        if (banner) {
          banner.style.display = 'block';
          banner.textContent = result.message;
        }
        showToast('Access Denied 🔒', result.message, 'error');
        passInput.select();
      }
    });
  }
}

export function openAdminLoginGate(targetTab = 'overview') {
  pendingTargetTab = targetTab;
  const overlay = document.getElementById('adminSafetyModalOverlay');
  const input = document.getElementById('adminSafetyPasswordInput');
  const banner = document.getElementById('adminLockoutBanner');

  if (banner) {
    const sec = store.getAdminSecurity();
    const now = Date.now();
    if (sec.lockoutUntil && sec.lockoutUntil > now) {
      const wait = Math.ceil((sec.lockoutUntil - now) / 1000);
      banner.style.display = 'block';
      banner.textContent = `Security lockout active for ${wait} more seconds.`;
    } else {
      banner.style.display = 'none';
    }
  }

  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => {
      if (input) input.focus();
    }, 100);
  }
}

export function closeAdminLoginGate() {
  const overlay = document.getElementById('adminSafetyModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

function setupInactivityLock() {
  const resetTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (store.isAdminAuthenticated()) {
      const timeoutMin = store.getAdminSecurity().sessionTimeoutMinutes || 30;
      inactivityTimer = setTimeout(() => {
        if (store.isAdminAuthenticated()) {
          store.logoutAdmin();
          showToast('Session Expired', 'Admin portal locked due to inactivity.', 'info');
          const adminView = document.getElementById('adminPortalContainer');
          if (adminView && adminView.classList.contains('active')) {
            switchView('store');
          }
        }
      }, timeoutMin * 60 * 1000);
    }
  };

  ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => {
    window.addEventListener(evt, resetTimer, { passive: true });
  });
}

// --- TAB SWITCHING & RENDERING ---

export function switchAdminTab(tabName = 'overview') {
  activeAdminTab = tabName;
  const container = document.getElementById('adminPortalContainer');
  if (!container) return;

  container.querySelectorAll('[data-admin-tab]').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-admin-tab') === tabName);
  });

  renderActiveAdminView();
}

export function renderActiveAdminView() {
  const panel = document.getElementById('adminContentPanel');
  if (!panel) return;

  switch (activeAdminTab) {
    case 'overview':
      renderAdminOverview(panel);
      break;
    case 'bundles':
      renderAdminBundles(panel);
      break;
    case 'payments':
      renderAdminPayments(panel);
      break;
    case 'orders':
      renderAdminOrders(panel);
      break;
    case 'customers':
      renderAdminCustomers(panel);
      break;
    case 'products':
      renderAdminBundles(panel);
      break;
    case 'coupons':
      renderAdminCoupons(panel);
      break;
    case 'testimonials':
      renderAdminTestimonials(panel);
      break;
    case 'faqs':
      renderAdminFaqs(panel);
      break;
    case 'trust-stats':
      renderAdminTrustStats(panel);
      break;
    case 'subscribers':
      renderAdminSubscribers(panel);
      break;
    case 'security':
      renderAdminSecurity(panel);
      break;
    case 'settings':
      renderAdminSettings(panel);
      break;
    default:
      renderAdminOverview(panel);
  }
}

// ========================================================
// 1. OVERVIEW & SALES
// ========================================================
function renderAdminOverview(panel) {
  const products = store.getProducts();
  const bundles = store.getBundles();
  const orders = store.getOrders();
  const customers = store.getCustomers();
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const upiOrders = orders.filter(o => (o.gateway || '').toLowerCase().includes('upi')).length;

  panel.innerHTML = `
    <div class="admin-stats-grid">
      <div class="admin-stat-card">
        <div class="stat-card-left">
          <span class="stat-card-label">Total Revenue</span>
          <span class="stat-card-val">₹${totalRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div class="stat-card-icon">${getIcon('dollar-sign')}</div>
      </div>
      <div class="admin-stat-card">
        <div class="stat-card-left">
          <span class="stat-card-label">Total Orders</span>
          <span class="stat-card-val">${orders.length}</span>
        </div>
        <div class="stat-card-icon">${getIcon('shopping-bag')}</div>
      </div>
      <div class="admin-stat-card">
        <div class="stat-card-left">
          <span class="stat-card-label">Active Bundles</span>
          <span class="stat-card-val">${bundles.length}</span>
        </div>
        <div class="stat-card-icon">${getIcon('package')}</div>
      </div>
      <div class="admin-stat-card">
        <div class="stat-card-left">
          <span class="stat-card-label">Verified Buyers</span>
          <span class="stat-card-val">${customers.length}</span>
        </div>
        <div class="stat-card-icon">${getIcon('user')}</div>
      </div>
    </div>

    <!-- Quick Shortcuts Banner -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 28px;">
      <button class="btn btn-primary" onclick="window.digitalVaultAdmin.switchAdminTab('bundles')" style="padding: 12px 16px; font-weight: 700; text-align: left; display: flex; align-items: center; gap: 8px;">
        <span>🎁 Manage Bundles</span>
      </button>
      <button class="btn btn-secondary" onclick="window.digitalVaultAdmin.switchAdminTab('payments')" style="padding: 12px 16px; font-weight: 700; text-align: left; display: flex; align-items: center; gap: 8px;">
        <span>💳 Gateways & UPI</span>
      </button>
      <button class="btn btn-secondary" onclick="window.digitalVaultAdmin.switchAdminTab('orders')" style="padding: 12px 16px; font-weight: 700; text-align: left; display: flex; align-items: center; gap: 8px;">
        <span>🧾 Orders & Invoices</span>
      </button>
      <button class="btn btn-secondary" onclick="window.digitalVaultAdmin.switchAdminTab('customers')" style="padding: 12px 16px; font-weight: 700; text-align: left; display: flex; align-items: center; gap: 8px;">
        <span>👥 Customer Directory</span>
      </button>
      <button class="btn btn-secondary" onclick="window.digitalVaultAdmin.switchAdminTab('security')" style="padding: 12px 16px; font-weight: 700; text-align: left; display: flex; align-items: center; gap: 8px;">
        <span>🛡️ Safety Settings</span>
      </button>
    </div>

    <div class="panel-section-title">
      <span>Recent Orders & Transactions</span>
      <button class="btn btn-secondary btn-sm" onclick="window.digitalVaultAdmin.switchAdminTab('orders')">
        View All Orders →
      </button>
    </div>

    <div class="data-table-wrapper">
      <table class="vault-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Gateway</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${orders.slice(0, 5).map(o => `
            <tr>
              <td><strong style="font-family: var(--font-mono); color: var(--color-accent);">${o.id}</strong></td>
              <td><strong>${o.customerName}</strong><br><span style="font-size: 0.75rem; color: #64748B;">${o.customerEmail}</span></td>
              <td>${(o.items || []).map(i => i.title).join(', ')}</td>
              <td><strong>₹${Number(o.total).toFixed(2)}</strong></td>
              <td><span style="font-size: 0.8125rem; font-weight: 600;">${o.gateway || 'UPI'}</span></td>
              <td><span class="status-badge ${o.status === 'Completed' ? 'status-completed' : o.status === 'Refunded' ? 'status-refunded' : 'status-pending'}">${o.status}</span></td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="window.digitalVaultAdmin.viewOrderDetails('${o.id}')">
                  Details
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ========================================================
// 2. BUNDLES MANAGER (Full CRUD & System Configuration)
// ========================================================
function renderAdminBundles(panel) {
  const bundles = store.getBundles();

  panel.innerHTML = `
    <div class="admin-toolbar-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <div>
        <h3 style="font-size: 1.35rem; font-weight: 800; margin: 0; color: #0F172A;">Bundles Manager</h3>
        <p style="font-size: 0.85rem; color: #64748B; margin: 4px 0 0 0;">Easily manage your digital bundles (Name, Description, Price, and Download Link).</p>
      </div>
      <button class="btn btn-primary" id="openAddBundleModalBtn" style="padding: 10px 18px; font-weight: 700; border-radius: 8px;">
        + Add New Bundle
      </button>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
      ${bundles.length === 0 ? `
        <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: #FFFFFF; border: 2px dashed #CBD5E1; border-radius: 14px;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🎁</div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: #1E293B; margin-bottom: 6px;">No bundles found</h4>
          <p style="color: #64748B; font-size: 0.875rem; margin-bottom: 16px;">Add your first bundle with Name, Description, Price, Thumbnail, and Link.</p>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('openAddBundleModalBtn').click()">+ Create Bundle</button>
        </div>
      ` : bundles.map(b => {
        const title = b.title || b.name || 'Untitled Bundle';
        const desc = b.description || b.tagline || 'No description provided';
        const price = b.salePrice !== undefined ? b.salePrice : (b.price !== undefined ? b.price : 999);
        const link = b.bundleLink || b.downloadFilename || '';
        const thumb = b.thumbnail || b.image || '';
        const discountVal = b.discount || b.discountPercent || 51;
        return `
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <!-- Visual Thumbnail Header matching User Side -->
              <div style="height: 160px; width: 100%; position: relative; overflow: hidden; background: #0F0C20;">
                ${thumb ? `
                  <img src="${thumb}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" />
                ` : `
                  <div style="height: 100%; width: 100%; background: linear-gradient(135deg, #130D2B 0%, #201348 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                    <div style="width: 60px; height: 85px; background: #2E1B69; border-radius: 6px; transform: rotate(-8deg); box-shadow: 0 8px 16px rgba(0,0,0,0.4);"></div>
                    <div style="width: 70px; height: 95px; background: #7C3AED; border-radius: 8px; margin-left: -18px; z-index: 2; box-shadow: 0 12px 24px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #FFF; font-weight: 800; font-size: 0.7rem;">${(title || 'CANVA').slice(0, 10).toUpperCase()}</div>
                    <div style="width: 60px; height: 85px; background: #A78BFA; border-radius: 6px; margin-left: -18px; transform: rotate(8deg); box-shadow: 0 8px 16px rgba(0,0,0,0.4);"></div>
                  </div>
                `}
                <div style="position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 4px; z-index: 3;">
                  <span style="background: #7C3AED; color: #FFFFFF; font-weight: 800; font-size: 0.65rem; padding: 3px 8px; border-radius: 999px; letter-spacing: 0.04em; width: fit-content;">BEST SELLER</span>
                  <span style="background: #EF4444; color: #FFFFFF; font-weight: 800; font-size: 0.65rem; padding: 3px 8px; border-radius: 999px; letter-spacing: 0.04em; width: fit-content;">${discountVal}% OFF</span>
                </div>
              </div>

              <div style="padding: 18px 20px 10px 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
                  <h4 style="font-size: 1.1rem; font-weight: 800; color: #0F172A; margin: 0; line-height: 1.3;">${title}</h4>
                  <span style="background: #DCFCE7; color: #15803D; font-weight: 800; font-size: 1.05rem; padding: 4px 10px; border-radius: 6px; white-space: nowrap;">
                    ₹${price}
                  </span>
                </div>
                <p style="font-size: 0.85rem; color: #475569; line-height: 1.45; margin-bottom: 12px; min-height: 38px;">
                  ${desc}
                </p>
                
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; margin-bottom: 12px;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase; display: block; margin-bottom: 3px;">Bundle Download Link:</span>
                  ${link ? `
                    <a href="${link}" target="_blank" rel="noopener noreferrer" style="font-size: 0.8rem; color: #2563EB; font-weight: 600; text-decoration: none; word-break: break-all; display: inline-flex; align-items: center; gap: 4px;">
                      🔗 ${link}
                    </a>
                  ` : `
                    <span style="font-size: 0.8rem; color: #94A3B8; font-style: italic;">No link added yet</span>
                  `}
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 8px; border-top: 1px solid #F1F5F9; padding: 12px 20px 16px 20px; background: #FAFAFA;">
              <button class="btn btn-secondary btn-sm" style="flex: 1; font-weight: 600;" data-action="admin-edit-bundle" data-id="${b.id}">
                ✏️ Edit
              </button>
              <button class="btn btn-secondary btn-sm" style="flex: 1; font-weight: 600; color: #EF4444;" data-action="admin-delete-bundle" data-id="${b.id}">
                🗑️ Delete
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Bundle Modal Container -->
    <div id="bundleEditModalContainer"></div>
  `;

  // Attach handlers
  document.getElementById('openAddBundleModalBtn').addEventListener('click', () => {
    openBundleFormModal(null);
  });

  panel.querySelectorAll('[data-action="admin-edit-bundle"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const bundle = store.getBundleById(id);
      if (bundle) openBundleFormModal(bundle);
    });
  });

  panel.querySelectorAll('[data-action="admin-delete-bundle"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const bundle = store.getBundleById(id);
      const title = bundle ? (bundle.title || bundle.name) : 'this bundle';
      if (bundle && confirm(`Are you sure you want to delete "${title}"?`)) {
        store.deleteBundle(id);
        showToast('Bundle Deleted', `Removed "${title}".`, 'info');
        renderAdminBundles(panel);
      }
    });
  });
}

function openBundleFormModal(existing = null) {
  const isEdit = !!existing;
  const currName = existing ? (existing.title || existing.name || '') : '';
  const currDesc = existing ? (existing.description || existing.tagline || '') : '';
  const currPrice = existing ? (existing.salePrice !== undefined ? existing.salePrice : (existing.price !== undefined ? existing.price : 999)) : 999;
  const currLink = existing ? (existing.bundleLink || existing.downloadFilename || '') : '';
  let currThumb = existing ? (existing.thumbnail || existing.image || '') : '';

  const modalHtml = `
    <div class="modal-overlay active" id="adminBundleModalOverlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.78); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
      <div class="modal-card" style="background: #0F172A; border: 1.5px solid rgba(139, 92, 246, 0.35); border-radius: 18px; max-width: 580px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 28px; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.95); color: #FFFFFF;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(148, 163, 184, 0.15); padding-bottom: 14px;">
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 800; color: #FFFFFF; margin: 0;">
              ${isEdit ? '✏️ Edit Bundle' : '✨ Add New Bundle'}
            </h3>
            <p style="font-size: 0.8125rem; color: #94A3B8; margin: 4px 0 0 0;">Fill in details, upload thumbnail, and set download link</p>
          </div>
          <button type="button" class="modal-close-btn" id="closeAdminBundleModalBtn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94A3B8; padding: 4px 8px;">&times;</button>
        </div>

        <form id="adminBundleForm" style="display: flex; flex-direction: column; gap: 16px;">
          <!-- 1. Name -->
          <div>
            <label style="display: block; font-size: 0.8125rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">
              Bundle Name *
            </label>
            <input type="text" id="bundleTitleInput" class="form-input" style="width: 100%; padding: 11px 14px; background: #1E293B; border: 1.5px solid #334155; color: #FFFFFF; border-radius: 10px; font-size: 0.95rem;" placeholder="e.g. Canva Templates Masterpack" value="${currName}" required />
          </div>

          <!-- 2. Description -->
          <div>
            <label style="display: block; font-size: 0.8125rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">
              Description *
            </label>
            <textarea id="bundleDescInput" class="form-input" rows="3" style="width: 100%; padding: 11px 14px; background: #1E293B; border: 1.5px solid #334155; color: #FFFFFF; border-radius: 10px; font-size: 0.95rem; resize: vertical;" placeholder="Short details of what is included in this bundle..." required>${currDesc}</textarea>
          </div>

          <!-- 3. Price -->
          <div>
            <label style="display: block; font-size: 0.8125rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">
              Price (₹) *
            </label>
            <input type="number" id="bundleSalePriceInput" class="form-input" style="width: 100%; padding: 11px 14px; background: #1E293B; border: 1.5px solid #334155; color: #FFFFFF; border-radius: 10px; font-size: 0.95rem;" placeholder="999" value="${currPrice}" min="1" required />
          </div>

          <!-- 4. Thumbnail Image (URL or Computer File Upload + Live User-Side Preview) -->
          <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 14px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-size: 0.8125rem; font-weight: 700; color: #CBD5E1; margin: 0;">
                🖼️ Thumbnail Image (User Side Display)
              </label>
              <input type="file" id="bundleThumbnailFileInput" accept="image/*" style="display: none;" />
              <button type="button" class="btn btn-secondary btn-sm" id="bundleUploadBtn" style="padding: 4px 12px; font-size: 0.75rem; background: #334155; color: #FFFFFF; border-color: #475569; cursor: pointer;">
                📁 Upload from PC
              </button>
            </div>

            <input type="text" id="bundleThumbnailInput" class="form-input" style="width: 100%; padding: 10px 14px; background: #0F172A; border: 1.5px solid #334155; color: #FFFFFF; border-radius: 10px; font-size: 0.875rem;" placeholder="Paste Image URL or click 'Upload from PC' above" value="${currThumb}" />
            <span style="font-size: 0.72rem; color: #94A3B8; margin-top: 4px; display: block;">Supports Image URL or any image uploaded from your computer.</span>

            <!-- Live User Side Preview Container (Matches User View exactly) -->
            <div style="margin-top: 12px;">
              <span style="font-size: 0.72rem; color: #A78BFA; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">
                👁️ User Side Preview (વેબસાઇટ પર ગ્રાહકને આવું દેખાશે):
              </span>
              <div id="modalCardPreviewBox" style="height: 180px; width: 100%; border-radius: 12px; overflow: hidden; position: relative; background: #0B0819; box-shadow: 0 10px 25px rgba(0,0,0,0.6); border: 1px solid rgba(139, 92, 246, 0.3);">
                <!-- User Uploaded Image -->
                <img id="modalPreviewImgEl" src="${currThumb}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; display: ${currThumb ? 'block' : 'none'};" />
                
                <!-- Default Graphic if no image (Exact 2nd image 3D card stack) -->
                <div id="modalPreviewGraphicEl" style="height: 100%; width: 100%; background: linear-gradient(135deg, #130D2B 0%, #201348 100%); display: ${currThumb ? 'none' : 'flex'}; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                  <div style="width: 72px; height: 100px; background: #2E1B69; border-radius: 6px; transform: rotate(-8deg); box-shadow: 0 8px 16px rgba(0,0,0,0.4);"></div>
                  <div id="modalPreviewGraphicLabel" style="width: 80px; height: 110px; background: #7C3AED; border-radius: 8px; margin-left: -20px; z-index: 2; box-shadow: 0 12px 24px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #FFF; font-weight: 800; font-size: 0.75rem;">${(currName || 'CANVA').slice(0, 10).toUpperCase()}</div>
                  <div style="width: 72px; height: 100px; background: #A78BFA; border-radius: 6px; margin-left: -20px; transform: rotate(8deg); box-shadow: 0 8px 16px rgba(0,0,0,0.4);"></div>
                </div>

                <!-- Badges matching 2nd image -->
                <div style="position: absolute; top: 12px; left: 12px; display: flex; flex-direction: column; gap: 6px; z-index: 4;">
                  <span style="background: #7C3AED; color: #FFFFFF; font-weight: 800; font-size: 0.6875rem; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.04em; width: fit-content;">BEST SELLER</span>
                  <span style="background: #EF4444; color: #FFFFFF; font-weight: 800; font-size: 0.6875rem; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.04em; width: fit-content;">51% OFF</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Bundle Link -->
          <div>
            <label style="display: block; font-size: 0.8125rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">
              Bundle Link (Google Drive / Mega / Dropbox / File Link) *
            </label>
            <input type="url" id="bundleLinkInput" class="form-input" style="width: 100%; padding: 11px 14px; background: #1E293B; border: 1.5px solid #334155; color: #FFFFFF; border-radius: 10px; font-size: 0.95rem;" placeholder="https://drive.google.com/... or download URL" value="${currLink}" required />
            <small style="display: block; color: #94A3B8; font-size: 0.75rem; margin-top: 4px;">ગ્રાહક ખરીદી કરશે ત્યારે તેને સીધી આ લિંક મળી જશે.</small>
          </div>

          <!-- Actions -->
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; border-top: 1px solid rgba(148, 163, 184, 0.15); padding-top: 16px;">
            <button type="button" class="btn btn-secondary" id="cancelAdminBundleModalBtn" style="padding: 10px 18px; border-radius: 10px; background: #1E293B; color: #CBD5E1; border-color: #334155;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="padding: 10px 24px; border-radius: 10px; font-weight: 700;">
              ${isEdit ? 'Save Changes ✓' : 'Add Bundle 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const container = document.getElementById('bundleEditModalContainer');
  container.innerHTML = modalHtml;

  const close = () => { container.innerHTML = ''; };
  document.getElementById('closeAdminBundleModalBtn').addEventListener('click', close);
  document.getElementById('cancelAdminBundleModalBtn').addEventListener('click', close);

  // Live Thumbnail Sync & File Upload
  const thumbInput = document.getElementById('bundleThumbnailInput');
  const fileInput = document.getElementById('bundleThumbnailFileInput');
  const uploadBtn = document.getElementById('bundleUploadBtn');
  const previewImg = document.getElementById('modalPreviewImgEl');
  const previewGraphic = document.getElementById('modalPreviewGraphicEl');
  const titleInput = document.getElementById('bundleTitleInput');
  const graphicLabel = document.getElementById('modalPreviewGraphicLabel');

  function updatePreview(val) {
    if (val && val.trim()) {
      previewImg.src = val.trim();
      previewImg.style.display = 'block';
      previewGraphic.style.display = 'none';
    } else {
      previewImg.style.display = 'none';
      previewGraphic.style.display = 'flex';
    }
  }

  thumbInput.addEventListener('input', () => {
    updatePreview(thumbInput.value);
  });

  titleInput.addEventListener('input', () => {
    if (graphicLabel) {
      graphicLabel.textContent = (titleInput.value.trim() || 'CANVA').slice(0, 10).toUpperCase();
    }
  });

  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        thumbInput.value = dataUrl;
        updatePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  });

  // Submit
  document.getElementById('adminBundleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('bundleTitleInput').value.trim();
    const description = document.getElementById('bundleDescInput').value.trim();
    const salePrice = Number(document.getElementById('bundleSalePriceInput').value);
    const thumbnail = document.getElementById('bundleThumbnailInput').value.trim();
    const bundleLink = document.getElementById('bundleLinkInput').value.trim();

    const data = {
      title,
      name: title,
      tagline: description,
      description,
      salePrice,
      price: salePrice,
      regularPrice: Math.round(salePrice * 3),
      thumbnail,
      image: thumbnail,
      bundleLink,
      downloadFilename: bundleLink,
      active: true
    };

    if (isEdit) {
      store.updateBundle(existing.id, data);
      showToast('Bundle Saved', `Updated "${title}" successfully.`, 'success');
    } else {
      store.addBundle(data);
      showToast('Bundle Created', `Added "${title}" to your bundles!`, 'success');
    }

    close();
    renderAdminBundles(document.getElementById('adminContentPanel'));
  });
}


// ========================================================
// 3. PAYMENTS & GATEWAYS MANAGEMENT
// ========================================================
function renderAdminPayments(panel) {
  const settings = store.getSettings();
  const orders = store.getOrders();
  const totalReceived = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const upiTotal = orders.filter(o => o.status === 'Completed' && (o.gateway || '').toLowerCase().includes('upi')).reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const cardTotal = totalReceived - upiTotal;
  const pendingOrders = orders.filter(o => o.status === 'Pending Verification' || o.status === 'Pending');

  panel.innerHTML = `
    <div class="admin-toolbar-row">
      <div>
        <h3 style="font-size: 1.375rem; font-weight: 800;">Payment Gateways & UPI Controls</h3>
        <p style="font-size: 0.8125rem; color: #64748B;">Configure UPI IDs, dynamic QR codes, Razorpay, Stripe, and verify customer transactions.</p>
      </div>
    </div>

    <!-- Payment Stats -->
    <div class="admin-stats-grid" style="margin-bottom: 24px;">
      <div class="admin-stat-card">
        <div class="stat-card-left">
          <span class="stat-card-label">Total Verified Revenue</span>
          <span class="stat-card-val">₹${totalReceived.toLocaleString('en-IN')}</span>
        </div>
        <div class="stat-card-icon">${getIcon('dollar-sign')}</div>
      </div>
      <div class="admin-stat-card">
        <div class="stat-card-left">
          <span class="stat-card-label">UPI Collections</span>
          <span class="stat-card-val" style="color: #10B981;">₹${upiTotal.toLocaleString('en-IN')}</span>
        </div>
        <div class="stat-card-icon" style="background: #ECFDF5; color: #10B981;">⚡</div>
      </div>
      <div class="admin-stat-card">
        <div class="stat-card-left">
          <span class="stat-card-label">Card / Gateway</span>
          <span class="stat-card-val">₹${cardTotal.toLocaleString('en-IN')}</span>
        </div>
        <div class="stat-card-icon">${getIcon('credit-card')}</div>
      </div>
      <div class="admin-stat-card">
        <div class="stat-card-left">
          <span class="stat-card-label">Pending Verification</span>
          <span class="stat-card-val" style="color: #F59E0B;">${pendingOrders.length}</span>
        </div>
        <div class="stat-card-icon" style="background: #FEF3C7; color: #B45309;">⚠️</div>
      </div>
    </div>

    <!-- 1. UPI Direct Gateway Configuration -->
    <div class="gateway-config-card">
      <div class="gateway-config-header">
        <div class="gateway-title-group">
          <div class="gateway-icon-badge" style="background: #EDE9FE; color: #7C3AED;">UPI</div>
          <div>
            <h4 style="font-size: 1.0625rem; font-weight: 800; margin: 0;">Direct UPI & Instant QR Setup</h4>
            <span style="font-size: 0.75rem; color: #64748B;">Google Pay, PhonePe, Paytm, BHIM instant settlement</span>
          </div>
        </div>
        <span class="status-badge status-completed">Active Gateway</span>
      </div>

      <form id="adminUpiSettingsForm" class="checkout-form-grid">
        <div>
          <label class="form-label">Merchant UPI ID (VPA) *</label>
          <input type="text" class="form-input" id="settingUpiId" value="${settings.merchantUpiId || 'digitalvault@okhdfcbank'}" placeholder="e.g. yourname@okaxis" required />
        </div>
        <div>
          <label class="form-label">Payee Business Name *</label>
          <input type="text" class="form-input" id="settingUpiName" value="${settings.merchantPayeeName || 'Digital Vault Media'}" required />
        </div>
        <div class="checkout-form-col-full">
          <div style="background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
            <div>
              <strong style="font-size: 0.875rem;">Sample Customer UPI QR String:</strong>
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #64748B; margin-top: 4px;">
                upi://pay?pa=${settings.merchantUpiId || 'digitalvault@okhdfcbank'}&pn=${encodeURIComponent(settings.merchantPayeeName || 'Digital Vault')}&cu=INR
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-sm">Save UPI Configuration</button>
          </div>
        </div>
      </form>
    </div>

    <!-- 2. Commercial Gateways (Razorpay & Stripe) -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
      <!-- Razorpay Card -->
      <div class="gateway-config-card">
        <div class="gateway-config-header">
          <div class="gateway-title-group">
            <div class="gateway-icon-badge" style="background: #E0F2FE; color: #0284C7;">RP</div>
            <div>
              <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">Razorpay Gateway</h4>
              <span style="font-size: 0.75rem; color: #64748B;">Credit/Debit Cards & Netbanking</span>
            </div>
          </div>
        </div>
        <form id="adminRazorpaySettingsForm">
          <div style="margin-bottom: 12px;">
            <label class="form-label">Razorpay Key ID</label>
            <input type="text" class="form-input" id="settingRazorpayKeyId" value="${settings.razorpayKeyId || ''}" placeholder="rzp_test_..." />
          </div>
          <div style="margin-bottom: 16px;">
            <label class="form-label">Razorpay Key Secret</label>
            <input type="password" class="form-input" id="settingRazorpaySecret" value="${settings.razorpaySecret || ''}" placeholder="Secret key..." />
          </div>
          <button type="submit" class="btn btn-secondary btn-sm" style="width: 100%;">Save Razorpay Keys</button>
        </form>
      </div>

      <!-- Stripe Card -->
      <div class="gateway-config-card">
        <div class="gateway-config-header">
          <div class="gateway-title-group">
            <div class="gateway-icon-badge" style="background: #EEF2FF; color: #4F46E5;">ST</div>
            <div>
              <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">Stripe Gateway</h4>
              <span style="font-size: 0.75rem; color: #64748B;">International Card Payments</span>
            </div>
          </div>
        </div>
        <form id="adminStripeSettingsForm">
          <div style="margin-bottom: 12px;">
            <label class="form-label">Stripe Publishable Key</label>
            <input type="text" class="form-input" id="settingStripePub" value="${settings.stripePublishableKey || ''}" placeholder="pk_test_..." />
          </div>
          <div style="margin-bottom: 16px;">
            <label class="form-label">Stripe Secret Key</label>
            <input type="password" class="form-input" id="settingStripeSec" value="${settings.stripeSecretKey || ''}" placeholder="sk_test_..." />
          </div>
          <button type="submit" class="btn btn-secondary btn-sm" style="width: 100%;">Save Stripe Keys</button>
        </form>
      </div>
    </div>

    <!-- 3. Transaction Verification Ledger -->
    <div class="panel-section-title">
      <span>Payment Transactions Ledger</span>
      <span style="font-size: 0.8125rem; color: #64748B;">1-click approve pending payments & release downloads</span>
    </div>

    <div class="data-table-wrapper">
      <table class="vault-table">
        <thead>
          <tr>
            <th>Order / Trans ID</th>
            <th>Customer</th>
            <th>Gateway</th>
            <th>Amount</th>
            <th>Ref / UTR</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td><strong style="font-family: var(--font-mono); color: var(--color-accent);">${o.id}</strong></td>
              <td><strong>${o.customerName}</strong><br><span style="font-size: 0.75rem; color: #64748B;">${o.customerEmail}</span></td>
              <td><span style="font-weight: 600;">${o.gateway || 'UPI'}</span></td>
              <td><strong style="color: #10B981;">₹${Number(o.total).toFixed(2)}</strong></td>
              <td><code style="font-size: 0.75rem;">${o.utrNumber || 'N/A'}</code></td>
              <td>
                <span class="status-badge ${o.status === 'Completed' ? 'status-completed' : o.status === 'Refunded' ? 'status-refunded' : 'status-pending'}">
                  ${o.status}
                </span>
              </td>
              <td>
                <div style="display: flex; gap: 6px;">
                  ${o.status !== 'Completed' ? `
                    <button class="btn btn-primary btn-sm" data-action="admin-verify-pay" data-id="${o.id}" title="Verify payment and unlock downloads">
                      ✓ Verify
                    </button>
                  ` : ''}
                  ${o.status !== 'Refunded' ? `
                    <button class="btn btn-secondary btn-sm" data-action="admin-refund-pay" data-id="${o.id}" title="Mark as Refunded">
                      Refund
                    </button>
                  ` : ''}
                  <button class="btn btn-secondary btn-sm" data-action="admin-inv-btn" data-id="${o.id}" title="View Invoice">
                    Invoice
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Forms
  document.getElementById('adminUpiSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    store.updateSettings({
      merchantUpiId: document.getElementById('settingUpiId').value.trim(),
      merchantPayeeName: document.getElementById('settingUpiName').value.trim()
    });
    showToast('UPI Saved', 'Merchant UPI ID and Payee Name updated.', 'success');
  });

  document.getElementById('adminRazorpaySettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    store.updateSettings({
      razorpayKeyId: document.getElementById('settingRazorpayKeyId').value.trim(),
      razorpaySecret: document.getElementById('settingRazorpaySecret').value.trim()
    });
    showToast('Razorpay Saved', 'Razorpay credentials saved securely.', 'success');
  });

  document.getElementById('adminStripeSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    store.updateSettings({
      stripePublishableKey: document.getElementById('settingStripePub').value.trim(),
      stripeSecretKey: document.getElementById('settingStripeSec').value.trim()
    });
    showToast('Stripe Saved', 'Stripe keys updated successfully.', 'success');
  });

  // Action listeners
  panel.querySelectorAll('[data-action="admin-verify-pay"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const utr = prompt(`Enter customer UTR / Bank Reference Number for order ${id}:`, 'UPI-' + Math.floor(100000000000 + Math.random() * 900000000000));
      if (utr !== null) {
        store.verifyPayment(id, utr, 'Admin Verified');
        showToast('Payment Verified', `Order ${id} is marked Completed. Downloads released!`, 'success');
        renderAdminPayments(panel);
      }
    });
  });

  panel.querySelectorAll('[data-action="admin-refund-pay"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm(`Mark order ${id} as Refunded?`)) {
        store.updateOrderStatus(id, 'Refunded', 'Customer refunded');
        showToast('Order Refunded', `Order ${id} marked Refunded.`, 'info');
        renderAdminPayments(panel);
      }
    });
  });

  panel.querySelectorAll('[data-action="admin-inv-btn"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const order = orders.find(o => o.id === id);
      if (order) openInvoiceModal(order);
    });
  });
}

// ========================================================
// 4. ORDERS & FULFILLMENT
// ========================================================
function renderAdminOrders(panel) {
  const allOrders = store.getOrders();
  const search = (orderSearchFilter || '').toLowerCase().trim();

  const filtered = allOrders.filter(o => {
    const matchesSearch = !search ||
      (o.id || '').toLowerCase().includes(search) ||
      (o.customerName || '').toLowerCase().includes(search) ||
      (o.customerEmail || '').toLowerCase().includes(search) ||
      (o.customerPhone || '').toLowerCase().includes(search);

    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  panel.innerHTML = `
    <div class="admin-toolbar-row">
      <div>
        <h3 style="font-size: 1.375rem; font-weight: 800;">Customer Orders & Fulfillment</h3>
        <p style="font-size: 0.8125rem; color: #64748B;">Track transactions, generate invoices, resend instant access links, and manage fulfillment.</p>
      </div>
      <button class="btn btn-primary" id="exportOrdersCsvBtn">
        ${getIcon('download')} Export Orders CSV
      </button>
    </div>

    <!-- Filter and Search Toolbar -->
    <div class="admin-filter-bar">
      <input type="text" class="admin-search-input" id="orderSearchInput" placeholder="🔍 Search Order ID, Name, Email, Phone..." value="${orderSearchFilter}" />
      
      <div style="display: flex; gap: 10px; align-items: center;">
        <span style="font-size: 0.8125rem; font-weight: 600; color: #64748B;">Filter Status:</span>
        <select class="form-input" id="orderStatusFilterSelect" style="width: auto; padding: 8px 12px; font-size: 0.8125rem;">
          <option value="all" ${orderStatusFilter === 'all' ? 'selected' : ''}>All Orders (${allOrders.length})</option>
          <option value="Completed" ${orderStatusFilter === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Pending Verification" ${orderStatusFilter === 'Pending Verification' ? 'selected' : ''}>Pending Verification</option>
          <option value="Refunded" ${orderStatusFilter === 'Refunded' ? 'selected' : ''}>Refunded</option>
        </select>
      </div>
    </div>

    <div class="data-table-wrapper">
      <table class="vault-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Customer Details</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Gateway</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? `
            <tr>
              <td colspan="8" style="text-align: center; padding: 36px; color: #64748B;">
                No orders match your filter criteria.
              </td>
            </tr>
          ` : filtered.map(o => `
            <tr>
              <td><strong style="font-family: var(--font-mono); color: var(--color-accent);">${o.id}</strong></td>
              <td><span style="font-size: 0.8125rem;">${o.date}</span></td>
              <td>
                <strong>${o.customerName}</strong><br>
                <span style="font-size: 0.75rem; color: #64748B;">${o.customerEmail}</span>
                ${o.customerPhone ? `<br><span style="font-size: 0.75rem; color: #10B981;">📞 ${o.customerPhone}</span>` : ''}
              </td>
              <td><span style="font-size: 0.8125rem;">${(o.items || []).map(i => i.title).join(', ')}</span></td>
              <td><strong>₹${Number(o.total).toFixed(2)}</strong></td>
              <td><span style="font-size: 0.8125rem; font-weight: 600;">${o.gateway || 'UPI'}</span></td>
              <td>
                <span class="status-badge ${o.status === 'Completed' ? 'status-completed' : o.status === 'Refunded' ? 'status-refunded' : 'status-pending'}">
                  ${o.status}
                </span>
              </td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-secondary btn-sm" onclick="window.digitalVaultAdmin.viewOrderDetails('${o.id}')" title="Full Order Details">
                    Details
                  </button>
                  <button class="btn btn-secondary btn-sm" data-action="admin-inv-btn" data-id="${o.id}" title="View Invoice">
                    ${getIcon('file-text')}
                  </button>
                  <button class="btn btn-secondary btn-sm" style="color: #EF4444;" data-action="admin-del-order" data-id="${o.id}" title="Delete Test Order">
                    ✕
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Order Details Modal Container -->
    <div id="orderDetailsModalContainer"></div>
  `;

  // Search and Filter Events
  const searchInput = document.getElementById('orderSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      orderSearchFilter = e.target.value;
      renderAdminOrders(panel);
    });
  }

  const filterSelect = document.getElementById('orderStatusFilterSelect');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      orderStatusFilter = e.target.value;
      renderAdminOrders(panel);
    });
  }

  // Export CSV
  document.getElementById('exportOrdersCsvBtn').addEventListener('click', () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Order ID,Date,Customer Name,Customer Email,Phone,City,State,Items,Total,Gateway,Status,License Key\n' +
      allOrders.map(o => `"${o.id}","${o.date}","${o.customerName}","${o.customerEmail}","${o.customerPhone || ''}","${o.customerCity || ''}","${o.customerState || ''}","${(o.items || []).map(i => i.title).join('; ')}","${o.total}","${o.gateway}","${o.status}","${o.licenseKey || ''}"`).join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `DigitalVault_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders Exported', `Downloaded ${allOrders.length} orders in CSV format.`, 'success');
  });

  // Action listeners
  panel.querySelectorAll('[data-action="admin-inv-btn"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const order = allOrders.find(o => o.id === id);
      if (order) openInvoiceModal(order);
    });
  });

  panel.querySelectorAll('[data-action="admin-del-order"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm(`Permanently remove order ${id}?`)) {
        store.deleteOrder(id);
        showToast('Order Deleted', `Removed order ${id}.`, 'info');
        renderAdminOrders(panel);
      }
    });
  });
}

function viewOrderDetails(orderId) {
  const order = store.getOrderById(orderId);
  if (!order) return;

  const modalHtml = `
    <div class="modal-overlay active" id="adminOrderDetailOverlay">
      <div class="modal-card" style="max-width: 640px; padding: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800; margin: 0;">Order #${order.id}</h3>
            <span style="font-size: 0.75rem; color: #64748B;">Placed on ${order.date} via ${order.gateway || 'UPI'}</span>
          </div>
          <button class="modal-close-btn" id="closeAdminOrderModalBtn">${getIcon('x')}</button>
        </div>

        <!-- Customer Summary -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <h4 style="font-size: 0.875rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 10px;">Buyer Information</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.875rem;">
            <div><strong>Name:</strong> ${order.customerName}</div>
            <div><strong>Email:</strong> <a href="mailto:${order.customerEmail}">${order.customerEmail}</a></div>
            <div><strong>Phone:</strong> ${order.customerPhone ? `<a href="https://wa.me/91${order.customerPhone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #10B981; font-weight: 700;">📞 ${order.customerPhone} (WhatsApp)</a>` : 'Not provided'}</div>
            <div><strong>City/State:</strong> ${order.customerCity || 'Ahmedabad'}, ${order.customerState || 'Gujarat'}</div>
            <div style="grid-column: span 2;"><strong>Commercial License:</strong> <code style="color: var(--color-accent); font-family: var(--font-mono);">${order.licenseKey || 'DV-COMM-ACTIVE'}</code></div>
          </div>
        </div>

        <!-- Items Breakdown -->
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.875rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 10px;">Purchased Deliverables</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${(order.items || []).map(it => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px;">
                <div>
                  <strong>${it.title}</strong>
                  <div style="font-size: 0.75rem; color: #64748B;">Download: ${it.downloadFilename || 'package.zip'}</div>
                </div>
                <strong>₹${it.price || it.salePrice || order.total}</strong>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Status Changer -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 16px; background: #EEF2FF; border-radius: 12px; flex-wrap: gap; gap: 12px;">
          <div>
            <strong style="font-size: 0.875rem; color: #3730A3;">Fulfillment Status:</strong>
            <div style="font-size: 0.75rem; color: #4F46E5;">Change the state of this order live:</div>
          </div>
          <select id="modalOrderStatusSelect" class="form-input" style="width: auto; padding: 8px 14px; font-weight: 700;">
            <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed (Paid)</option>
            <option value="Pending Verification" ${order.status === 'Pending Verification' ? 'selected' : ''}>Pending Verification</option>
            <option value="Refunded" ${order.status === 'Refunded' ? 'selected' : ''}>Refunded</option>
          </select>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn btn-secondary btn-sm" id="modalViewInvoiceBtn">View Tax Invoice</button>
          <button class="btn btn-primary btn-sm" id="modalSaveOrderBtn">Save Status</button>
        </div>
      </div>
    </div>
  `;

  const container = document.getElementById('orderDetailsModalContainer');
  container.innerHTML = modalHtml;

  const close = () => { container.innerHTML = ''; };
  document.getElementById('closeAdminOrderModalBtn').addEventListener('click', close);

  document.getElementById('modalViewInvoiceBtn').addEventListener('click', () => {
    close();
    openInvoiceModal(order);
  });

  document.getElementById('modalSaveOrderBtn').addEventListener('click', () => {
    const newStatus = document.getElementById('modalOrderStatusSelect').value;
    store.updateOrderStatus(order.id, newStatus);
    showToast('Order Updated', `Order ${order.id} marked ${newStatus}.`, 'success');
    close();
    renderAdminOrders(document.getElementById('adminContentPanel'));
  });
}

// ========================================================
// 5. CUSTOMER DIRECTORY & CLIENT PROFILES
// ========================================================
function renderAdminCustomers(panel) {
  const customers = store.getCustomers();
  const search = (customerSearchFilter || '').toLowerCase().trim();

  const filtered = customers.filter(c => {
    return !search ||
      (c.name || '').toLowerCase().includes(search) ||
      (c.email || '').toLowerCase().includes(search) ||
      (c.phone || '').toLowerCase().includes(search);
  });

  panel.innerHTML = `
    <div class="admin-toolbar-row">
      <div>
        <h3 style="font-size: 1.375rem; font-weight: 800;">Registered Buyers & Client Directory</h3>
        <p style="font-size: 0.8125rem; color: #64748B;">${customers.length} Verified Buyers. Manage commercial license holders, client notes, and lifetime value.</p>
      </div>
      <button class="btn btn-primary" id="exportCustomersCsvBtn">
        ${getIcon('download')} Export Customers CSV
      </button>
    </div>

    <!-- Search Bar -->
    <div class="admin-filter-bar">
      <input type="text" class="admin-search-input" id="customerSearchInput" placeholder="🔍 Search Customer Name, Email, or Phone..." value="${customerSearchFilter}" />
    </div>

    <div class="data-table-wrapper">
      <table class="vault-table">
        <thead>
          <tr>
            <th>Buyer Name</th>
            <th>Contact Details</th>
            <th>Location</th>
            <th>Orders</th>
            <th>Lifetime Spend</th>
            <th>Client Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? `
            <tr>
              <td colspan="7" style="text-align: center; padding: 36px; color: #64748B;">
                No customer found matching your search.
              </td>
            </tr>
          ` : filtered.map(c => `
            <tr>
              <td>
                <strong style="color: var(--color-primary);">${c.name}</strong><br>
                <span class="status-badge status-completed" style="font-size: 0.625rem;">Commercial License</span>
              </td>
              <td>
                <a href="mailto:${c.email}" style="font-size: 0.8125rem; color: var(--color-accent); font-weight: 600;">${c.email}</a>
                ${c.phone ? `<br><a href="https://wa.me/91${c.phone.replace(/[^0-9]/g, '')}" target="_blank" style="font-size: 0.75rem; color: #10B981; font-weight: 700;">📞 ${c.phone} (WhatsApp)</a>` : ''}
              </td>
              <td><span style="font-size: 0.8125rem;">${c.city || 'Ahmedabad'}, ${c.state || 'Gujarat'}</span></td>
              <td><strong>${c.ordersCount}</strong></td>
              <td><strong style="color: #10B981; font-size: 1rem;">₹${Number(c.totalSpent).toFixed(2)}</strong></td>
              <td>
                <span style="font-size: 0.8125rem; color: #64748B;">${c.notes || '<em>No notes</em>'}</span>
              </td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-secondary btn-sm" data-action="admin-cust-note" data-email="${c.email}">
                    📝 Note
                  </button>
                  ${c.phone ? `
                    <a href="https://wa.me/91${c.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-secondary btn-sm" style="color: #10B981;" title="Chat on WhatsApp">
                      Chat
                    </a>
                  ` : ''}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Search input
  const custSearch = document.getElementById('customerSearchInput');
  if (custSearch) {
    custSearch.addEventListener('input', (e) => {
      customerSearchFilter = e.target.value;
      renderAdminCustomers(panel);
    });
  }

  // Export CSV
  document.getElementById('exportCustomersCsvBtn').addEventListener('click', () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Name,Email,Phone,City,State,Orders Count,Lifetime Spend,Notes\n' +
      customers.map(c => `"${c.name}","${c.email}","${c.phone || ''}","${c.city || ''}","${c.state || ''}","${c.ordersCount}","${c.totalSpent}","${c.notes || ''}"`).join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `DigitalVault_Customers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customers Exported', `Downloaded ${customers.length} customer records in CSV format.`, 'success');
  });

  // Note handler
  panel.querySelectorAll('[data-action="admin-cust-note"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const email = e.currentTarget.getAttribute('data-email');
      const cust = customers.find(c => c.email === email);
      const note = prompt(`Enter private admin note for ${cust ? cust.name : email}:`, cust ? cust.notes : '');
      if (note !== null) {
        store.updateCustomerNote(email, note);
        showToast('Note Saved', `Updated note for ${email}.`, 'success');
        renderAdminCustomers(panel);
      }
    });
  });
}

// ========================================================
// 6. SAFETY & SECURITY SETTINGS
// ========================================================
function renderAdminSecurity(panel) {
  const sec = store.getAdminSecurity();
  const auditLogs = store.getAuditLogs();

  panel.innerHTML = `
    <div class="admin-toolbar-row">
      <div>
        <h3 style="font-size: 1.375rem; font-weight: 800;">Admin Safety &amp; Access Controls</h3>
        <p style="font-size: 0.8125rem; color: #64748B;">Protect store configuration, change master password & PIN, set auto-lock timeouts, and view audit trails.</p>
      </div>
      <button class="btn btn-secondary btn-sm" id="securityLockNowBtn" style="color: #DC2626; border-color: #FECACA; background: #FEF2F2;">
        🔒 Lock Admin Portal Now
      </button>
    </div>

    <!-- Security Status Card -->
    <div style="background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%); border-radius: var(--radius-lg); padding: 24px; color: #FFFFFF; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="width: 52px; height: 52px; border-radius: 14px; background: rgba(139, 92, 246, 0.25); border: 1px solid rgba(167, 139, 250, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.75rem;">
          🛡️
        </div>
        <div>
          <h4 style="font-size: 1.125rem; font-weight: 800; margin: 0;">Enterprise Safety Guard is Active</h4>
          <p style="font-size: 0.8125rem; color: #94A3B8; margin-top: 4px;">Brute-force lockout enabled (5 attempts maximum) • Session storage encrypted</p>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <span class="status-badge status-completed" style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.2); color: #34D399; border: 1px solid rgba(52, 211, 153, 0.3);">
          ✓ Guard Protected
        </span>
      </div>
    </div>

    <!-- Credentials Manager Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 28px;">
      <!-- Change Master Password -->
      <div class="admin-form-box" style="margin-bottom: 0;">
        <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 14px;">Change Master Password</h4>
        <form id="changePasswordForm">
          <div style="margin-bottom: 12px;">
            <label class="form-label">Current Master Password *</label>
            <input type="password" class="form-input" id="currentPassInput" placeholder="Enter current password..." required />
          </div>
          <div style="margin-bottom: 12px;">
            <label class="form-label">New Master Password *</label>
            <input type="password" class="form-input" id="newPassInput" placeholder="Minimum 6 characters..." required />
          </div>
          <div style="margin-bottom: 16px;">
            <label class="form-label">Confirm New Password *</label>
            <input type="password" class="form-input" id="confirmPassInput" placeholder="Repeat new password..." required />
          </div>
          <button type="submit" class="btn btn-primary btn-sm" style="width: 100%;">Update Master Password</button>
        </form>
      </div>

      <!-- Quick PIN & Session Settings -->
      <div class="admin-form-box" style="margin-bottom: 0;">
        <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 14px;">Quick PIN &amp; Timeout Setting</h4>
        <form id="securitySettingsForm">
          <div style="margin-bottom: 12px;">
            <label class="form-label">4-Digit Fast Security PIN</label>
            <input type="text" class="form-input" id="newPinInput" value="${sec.pin || '7890'}" maxlength="6" style="letter-spacing: 4px; font-weight: 800;" />
          </div>
          <div style="margin-bottom: 16px;">
            <label class="form-label">Inactivity Auto-Lock Timeout</label>
            <select class="form-input" id="sessionTimeoutSelect">
              <option value="15" ${sec.sessionTimeoutMinutes === 15 ? 'selected' : ''}>15 Minutes</option>
              <option value="30" ${sec.sessionTimeoutMinutes === 30 || !sec.sessionTimeoutMinutes ? 'selected' : ''}>30 Minutes (Recommended)</option>
              <option value="60" ${sec.sessionTimeoutMinutes === 60 ? 'selected' : ''}>1 Hour</option>
              <option value="240" ${sec.sessionTimeoutMinutes === 240 ? 'selected' : ''}>4 Hours</option>
            </select>
          </div>
          <button type="submit" class="btn btn-secondary btn-sm" style="width: 100%;">Save Security Parameters</button>
        </form>
      </div>
    </div>

    <!-- Security Audit Log Trail -->
    <div class="panel-section-title">
      <span>Security Audit Log Trail</span>
      <span style="font-size: 0.75rem; color: #64748B;">Records every administrative modification</span>
    </div>

    <div class="data-table-wrapper">
      <table class="vault-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action Performed</th>
            <th>Details &amp; Parameters</th>
          </tr>
        </thead>
        <tbody>
          ${auditLogs.slice(0, 15).map(l => `
            <tr>
              <td><span style="font-size: 0.75rem; color: #64748B;">${new Date(l.timestamp).toLocaleString('en-IN')}</span></td>
              <td><span class="audit-log-badge">${l.action}</span></td>
              <td><span style="font-size: 0.8125rem;">${l.details}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Change password form
  document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const curr = document.getElementById('currentPassInput').value.trim();
    const newP = document.getElementById('newPassInput').value.trim();
    const conf = document.getElementById('confirmPassInput').value.trim();

    if (curr !== sec.password) {
      alert('Current password does not match.');
      return;
    }
    if (newP.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }
    if (newP !== conf) {
      alert('New passwords do not match.');
      return;
    }

    store.updateAdminSecurity({ newPassword: newP });
    showToast('Password Updated', 'Master password changed successfully. Keep it safe!', 'success');
    document.getElementById('changePasswordForm').reset();
    renderAdminSecurity(panel);
  });

  // Security parameters form
  document.getElementById('securitySettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = document.getElementById('newPinInput').value.trim();
    const timeout = Number(document.getElementById('sessionTimeoutSelect').value);
    store.updateAdminSecurity({ newPin: pin, sessionTimeoutMinutes: timeout });
    showToast('Security Saved', 'Quick PIN and timeout updated.', 'success');
  });

  // Lock now button
  document.getElementById('securityLockNowBtn').addEventListener('click', () => {
    store.logoutAdmin();
    showToast('Admin Locked', 'Session locked safely.', 'info');
    switchView('store');
  });
}

// ========================================================
// 7. PRODUCTS (CRUD)
// ========================================================
function renderAdminProducts(panel) {
  const products = store.getProducts();

  panel.innerHTML = `
    <div class="admin-toolbar-row">
      <div>
        <h3 style="font-size: 1.375rem; font-weight: 800;">Manage Individual Digital Products</h3>
        <p style="font-size: 0.8125rem; color: #64748B;">Add, edit prices, toggle discounts, and configure download packages.</p>
      </div>
      <button class="btn btn-primary" id="openAddProductModalBtn">
        ${getIcon('zap')} + Add New Product
      </button>
    </div>

    <div class="data-table-wrapper">
      <table class="vault-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Sale Price</th>
            <th>Reg Price</th>
            <th>Templates</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td>
                <div style="font-weight: 700; color: var(--color-primary);">${p.title}</div>
                <div style="font-size: 0.75rem; color: #64748B;">${p.slug}</div>
              </td>
              <td><span class="product-category-tag">${p.categoryName}</span></td>
              <td><strong style="color: #10B981;">${p.free ? 'FREE' : `₹${p.salePrice}`}</strong></td>
              <td>${p.regularPrice > 0 ? `₹${p.regularPrice}` : '-'}</td>
              <td>${p.templateCount || '10+'}</td>
              <td>
                ${p.featured ? `<span class="badge-pill badge-bestseller" style="font-size: 0.625rem;">Featured</span>` : ''}
                ${p.free ? `<span class="badge-pill badge-free" style="font-size: 0.625rem;">Freebie</span>` : ''}
              </td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-secondary btn-sm" data-action="admin-edit-prod" data-id="${p.id}" title="Edit">
                    Edit
                  </button>
                  <button class="btn btn-secondary btn-sm" style="color: #EF4444;" data-action="admin-delete-prod" data-id="${p.id}" title="Delete">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div id="productEditModalContainer"></div>
  `;

  document.getElementById('openAddProductModalBtn').addEventListener('click', () => {
    openProductFormModal(null);
  });

  panel.querySelectorAll('[data-action="admin-edit-prod"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const prod = store.getProductById(id);
      if (prod) openProductFormModal(prod);
    });
  });

  panel.querySelectorAll('[data-action="admin-delete-prod"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const prod = store.getProductById(id);
      if (prod && confirm(`Delete "${prod.title}"?`)) {
        store.deleteProduct(id);
        showToast('Product Deleted', `Removed "${prod.title}" from catalog.`, 'info');
      }
    });
  });
}

function openProductFormModal(existingProduct = null) {
  const isEdit = !!existingProduct;
  const categories = store.getCategories();

  const modalHtml = `
    <div class="modal-overlay active" id="adminProductModalOverlay">
      <div class="modal-card" style="max-width: 640px; padding: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 1.25rem; font-weight: 800;">${isEdit ? 'Edit Product' : 'Add New Digital Product'}</h3>
          <button class="modal-close-btn" id="closeAdminProdModalBtn">${getIcon('x')}</button>
        </div>

        <form id="adminProductForm">
          <div class="checkout-form-grid">
            <div class="checkout-form-col-full">
              <label class="form-label">Product Title *</label>
              <input type="text" class="form-input" id="adminProdTitle" value="${existingProduct ? existingProduct.title : ''}" required />
            </div>

            <div>
              <label class="form-label">Category *</label>
              <select class="form-input" id="adminProdCat" required>
                ${categories.map(c => `
                  <option value="${c.slug}" ${existingProduct && existingProduct.category === c.slug ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="form-label">Template / Asset Count</label>
              <input type="text" class="form-input" id="adminProdCount" value="${existingProduct ? existingProduct.templateCount : '50+ Templates'}" />
            </div>

            <div>
              <label class="form-label">Sale Price (₹)</label>
              <input type="number" step="1" class="form-input" id="adminProdSalePrice" value="${existingProduct ? existingProduct.salePrice : 499}" required />
            </div>

            <div>
              <label class="form-label">Regular Price (₹)</label>
              <input type="number" step="1" class="form-input" id="adminProdRegPrice" value="${existingProduct ? existingProduct.regularPrice : 999}" />
            </div>

            <div>
              <label class="form-label">Mockup Visual Type</label>
              <select class="form-input" id="adminProdImageType">
                <option value="canva-pack" ${existingProduct && existingProduct.imageType === 'canva-pack' ? 'selected' : ''}>Canva Pack</option>
                <option value="ad-copy" ${existingProduct && existingProduct.imageType === 'ad-copy' ? 'selected' : ''}>Ad Copy Swipe</option>
                <option value="calendar" ${existingProduct && existingProduct.imageType === 'calendar' ? 'selected' : ''}>Content Calendar</option>
                <option value="instagram-kit" ${existingProduct && existingProduct.imageType === 'instagram-kit' ? 'selected' : ''}>Instagram Kit</option>
                <option value="marketing-bundle" ${existingProduct && existingProduct.imageType === 'marketing-bundle' ? 'selected' : ''}>Marketing Suite</option>
                <option value="content-ideas" ${existingProduct && existingProduct.imageType === 'content-ideas' ? 'selected' : ''}>Content Ideas</option>
                <option value="freelance-kit" ${existingProduct && existingProduct.imageType === 'freelance-kit' ? 'selected' : ''}>Freelancer Proposals</option>
                <option value="ai-prompts" ${existingProduct && existingProduct.imageType === 'ai-prompts' ? 'selected' : ''}>AI Prompts Hub</option>
                <option value="brand-system" ${existingProduct && existingProduct.imageType === 'brand-system' ? 'selected' : ''}>Brand Identity Guidelines</option>
              </select>
            </div>

            <div>
              <label class="form-label">Badges & Options</label>
              <div style="display: flex; gap: 14px; margin-top: 10px;">
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.8125rem;">
                  <input type="checkbox" id="adminProdFeatured" ${existingProduct && existingProduct.featured ? 'checked' : ''} /> Featured
                </label>
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.8125rem;">
                  <input type="checkbox" id="adminProdFree" ${existingProduct && existingProduct.free ? 'checked' : ''} /> Freebie
                </label>
              </div>
            </div>

            <div class="checkout-form-col-full">
              <label class="form-label">Short Description</label>
              <textarea class="form-input" id="adminProdDesc" rows="3">${existingProduct ? existingProduct.shortDescription : ''}</textarea>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
            <button type="button" class="btn btn-secondary" id="cancelAdminProdModalBtn">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Product'}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const container = document.getElementById('productEditModalContainer');
  container.innerHTML = modalHtml;

  const close = () => { container.innerHTML = ''; };
  document.getElementById('closeAdminProdModalBtn').addEventListener('click', close);
  document.getElementById('cancelAdminProdModalBtn').addEventListener('click', close);

  document.getElementById('adminProductForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('adminProdTitle').value.trim();
    const catSlug = document.getElementById('adminProdCat').value;
    const catObj = categories.find(c => c.slug === catSlug) || { name: 'Digital Resource' };
    const salePrice = Number(document.getElementById('adminProdSalePrice').value);
    const regPrice = Number(document.getElementById('adminProdRegPrice').value);
    const templateCount = document.getElementById('adminProdCount').value.trim();
    const imageType = document.getElementById('adminProdImageType').value;
    const featured = document.getElementById('adminProdFeatured').checked;
    const free = document.getElementById('adminProdFree').checked;
    const shortDescription = document.getElementById('adminProdDesc').value.trim();
    const discount = regPrice > salePrice ? Math.round(((regPrice - salePrice) / regPrice) * 100) : 0;

    const data = {
      title,
      category: catSlug,
      categoryName: catObj.name,
      salePrice: free ? 0 : salePrice,
      regularPrice: regPrice,
      discount,
      templateCount,
      imageType,
      featured,
      free,
      shortDescription
    };

    if (isEdit) {
      store.updateProduct(existingProduct.id, data);
      showToast('Product Updated', `Updated "${title}" successfully.`, 'success');
    } else {
      store.addProduct(data);
      showToast('Product Created', `Added "${title}" to your store!`, 'success');
    }

    close();
  });
}

// ========================================================
// 8. COUPONS MANAGEMENT
// ========================================================
function renderAdminCoupons(panel) {
  const coupons = store.getCoupons();

  panel.innerHTML = `
    <div class="admin-toolbar-row">
      <div>
        <h3 style="font-size: 1.375rem; font-weight: 800;">Promotional Coupons & Discounts</h3>
        <p style="font-size: 0.8125rem; color: #64748B;">Manage discount codes redeemable in cart and checkout.</p>
      </div>
    </div>

    <div class="admin-form-box">
      <h4 style="font-size: 0.9375rem; font-weight: 700; margin-bottom: 14px;">Create New Coupon</h4>
      <form id="adminCouponForm" class="form-grid-3">
        <div>
          <label class="form-label">Coupon Code *</label>
          <input type="text" class="form-input" id="newCouponCode" placeholder="e.g. VIP30" required style="text-transform: uppercase;" />
        </div>
        <div>
          <label class="form-label">Discount Value (%) *</label>
          <input type="number" class="form-input" id="newCouponDiscount" placeholder="30" required />
        </div>
        <div>
          <label class="form-label">Min Spend (₹)</label>
          <input type="number" class="form-input" id="newCouponMin" placeholder="0" />
        </div>
        <div style="grid-column: span 3;">
          <button type="submit" class="btn btn-primary btn-sm">Create Coupon Code</button>
        </div>
      </form>
    </div>

    <div class="data-table-wrapper">
      <table class="vault-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount</th>
            <th>Type</th>
            <th>Min Spend</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${coupons.map(c => `
            <tr>
              <td><strong style="font-family: var(--font-mono); color: var(--color-accent);">${c.code}</strong></td>
              <td><strong>${c.discount}${c.type === 'percent' ? '%' : '₹'}</strong></td>
              <td>${c.type}</td>
              <td>₹${c.minSpend || 0}</td>
              <td>${c.description || '-'}</td>
              <td>
                <button class="btn btn-secondary btn-sm" style="color: #EF4444;" data-action="delete-coupon" data-code="${c.code}">
                  Delete
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('adminCouponForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('newCouponCode').value.trim();
    const discount = Number(document.getElementById('newCouponDiscount').value);
    const minSpend = Number(document.getElementById('newCouponMin').value) || 0;
    if (code && discount) {
      store.addCoupon({
        code,
        discount,
        type: 'percent',
        minSpend,
        description: `${discount}% off all orders`
      });
      showToast('Coupon Created', `Code ${code} is now active.`, 'success');
      renderAdminCoupons(panel);
    }
  });

  panel.querySelectorAll('[data-action="delete-coupon"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const code = e.currentTarget.getAttribute('data-code');
      if (confirm(`Delete coupon ${code}?`)) {
        store.deleteCoupon(code);
        showToast('Coupon Deleted', `Removed ${code}.`, 'info');
        renderAdminCoupons(panel);
      }
    });
  });
}

// ========================================================
// 9. REVIEWS & TESTIMONIALS
// ========================================================
function renderAdminTestimonials(panel) {
  const testimonials = store.getTestimonials();

  panel.innerHTML = `
    <div class="panel-section-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin: 0;">Manage Testimonials & Reviews</h3>
        <p style="font-size: 0.8125rem; color: #64748B; margin: 4px 0 0;">Add and customize customer reviews shown on the storefront.</p>
      </div>
      <button class="btn btn-primary btn-sm" id="openAddTestBtn" style="padding: 8px 16px; font-weight: 700;">
        + Add New Review
      </button>
    </div>

    <!-- Quick Add / Edit Box -->
    <div class="admin-form-box" id="adminTestBox" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px; color: #1E293B;" id="testFormTitle">Add New Customer Review</h4>
      <form id="addTestimonialForm">
        <input type="hidden" id="editTestId" value="" />
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-weight: 700; color: #334155; font-size: 0.8125rem; display: block; margin-bottom: 4px;">Reviewer Name (ગ્રાહકનું નામ) *</label>
            <input type="text" class="form-input" id="newTestName" placeholder="e.g. Priya Sharma" required style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;" />
          </div>
          <div>
            <label class="form-label" style="font-weight: 700; color: #334155; font-size: 0.8125rem; display: block; margin-bottom: 4px;">Role / Title (હોદ્દો / વ્યવસાય) *</label>
            <input type="text" class="form-input" id="newTestRole" placeholder="e.g. Agency Founder or Freelance Designer" required style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;" />
          </div>
        </div>
        <div style="margin-bottom: 14px;">
          <label class="form-label" style="font-weight: 700; color: #334155; font-size: 0.8125rem; display: block; margin-bottom: 4px;">Review Text (પ્રતિસાદ / સમીક્ષા) *</label>
          <textarea class="form-input" id="newTestText" rows="3" placeholder="e.g. The Canva templates cut our client social delivery time in half. Flawless quality!" required style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px; resize: vertical;"></textarea>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="submit" class="btn btn-primary btn-sm" id="testSubmitBtn" style="padding: 8px 18px; font-weight: 700;">Save Review</button>
          <button type="button" class="btn btn-secondary btn-sm" id="testCancelEditBtn" style="display: none; padding: 8px 16px;">Cancel</button>
        </div>
      </form>
    </div>

    <div style="display: flex; flex-direction: column; gap: 14px;">
      ${testimonials.length === 0 ? `
        <div style="padding: 40px; text-align: center; background: #FFFFFF; border: 2px dashed #CBD5E1; border-radius: 12px;">
          <p style="color: #64748B; font-weight: 600;">No reviews found. Click "+ Add New Review" above to publish one.</p>
        </div>
      ` : testimonials.map(t => `
        <div style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; background: #FFFFFF; display: flex; justify-content: space-between; align-items: start; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <strong style="font-size: 1rem; color: #0F172A;">${t.name}</strong>
              <span style="font-size: 0.8125rem; color: #8B5CF6; font-weight: 600;">${t.role}</span>
              <span style="color: #F59E0B; font-size: 0.9rem;">★★★★★</span>
            </div>
            <p style="font-size: 0.875rem; color: #475569; margin: 0; line-height: 1.5; font-style: italic;">"${t.text}"</p>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button class="btn btn-secondary btn-sm" data-action="edit-test" data-id="${t.id}" style="padding: 6px 12px; font-weight: 600;">
              ✏️ Edit
            </button>
            <button class="btn btn-secondary btn-sm" style="color: #EF4444; padding: 6px 12px; font-weight: 600;" data-action="delete-test" data-id="${t.id}">
              🗑️ Delete
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Focus add button
  const openAddBtn = document.getElementById('openAddTestBtn');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('editTestId').value = '';
      document.getElementById('newTestName').value = '';
      document.getElementById('newTestRole').value = '';
      document.getElementById('newTestText').value = '';
      document.getElementById('testFormTitle').textContent = 'Add New Customer Review';
      document.getElementById('testSubmitBtn').textContent = 'Add Review Item';
      document.getElementById('testCancelEditBtn').style.display = 'none';
      document.getElementById('newTestName').focus();
    });
  }

  // Edit Testimonial
  panel.querySelectorAll('[data-action="edit-test"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const item = testimonials.find(t => t.id === id);
      if (item) {
        document.getElementById('editTestId').value = item.id;
        document.getElementById('newTestName').value = item.name || '';
        document.getElementById('newTestRole').value = item.role || '';
        document.getElementById('newTestText').value = item.text || '';
        document.getElementById('testFormTitle').textContent = 'Edit Review: ' + (item.name || '');
        document.getElementById('testSubmitBtn').textContent = 'Save Changes ✓';
        document.getElementById('testCancelEditBtn').style.display = 'inline-block';
        document.getElementById('adminTestBox').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('newTestName').focus();
      }
    });
  });

  const cancelEditBtn = document.getElementById('testCancelEditBtn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      document.getElementById('editTestId').value = '';
      document.getElementById('newTestName').value = '';
      document.getElementById('newTestRole').value = '';
      document.getElementById('newTestText').value = '';
      document.getElementById('testFormTitle').textContent = 'Add New Customer Review';
      document.getElementById('testSubmitBtn').textContent = 'Save Review';
      cancelEditBtn.style.display = 'none';
    });
  }

  // Submit
  document.getElementById('addTestimonialForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('editTestId').value;
    const name = document.getElementById('newTestName').value.trim();
    const role = document.getElementById('newTestRole').value.trim();
    const text = document.getElementById('newTestText').value.trim();
    if (name && text) {
      if (editId) {
        store.updateTestimonial(editId, { name, role, text });
        showToast('Review Updated 💬', 'Testimonial updated successfully.', 'success');
      } else {
        store.addTestimonial({
          name,
          role,
          text,
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
        });
        showToast('Review Added 💬', 'New testimonial published.', 'success');
      }
      renderAdminTestimonials(panel);
    }
  });

  // Delete
  panel.querySelectorAll('[data-action="delete-test"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Delete this review?')) {
        store.deleteTestimonial(id);
        showToast('Review Deleted 🗑️', 'Removed testimonial.', 'info');
        renderAdminTestimonials(panel);
      }
    });
  });
}

// ========================================================
// 10. FAQS EDITOR
// ========================================================
// 10. FAQS EDITOR
// ========================================================
function renderAdminFaqs(panel) {
  const faqs = store.getFaqs();

  panel.innerHTML = `
    <div class="panel-section-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin: 0;">Manage FAQs & Help Center</h3>
        <p style="font-size: 0.8125rem; color: #64748B; margin: 4px 0 0;">Add and edit customer support questions shown on the storefront.</p>
      </div>
      <button class="btn btn-primary btn-sm" id="openAddFaqBtn" style="padding: 8px 16px; font-weight: 700;">
        + Add New FAQ
      </button>
    </div>

    <!-- Quick Add Box (collapsible / direct) -->
    <div class="admin-form-box" id="adminFaqBox" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px; color: #1E293B;" id="faqFormTitle">Add New FAQ</h4>
      <form id="addFaqForm">
        <input type="hidden" id="editFaqId" value="" />
        <div style="margin-bottom: 12px;">
          <label class="form-label" style="font-weight: 700; color: #334155; font-size: 0.8125rem; display: block; margin-bottom: 4px;">Question (પ્રશ્ન) *</label>
          <input type="text" class="form-input" id="newFaqQ" placeholder="e.g. How do digital downloads work?" required style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;" />
        </div>
        <div style="margin-bottom: 14px;">
          <label class="form-label" style="font-weight: 700; color: #334155; font-size: 0.8125rem; display: block; margin-bottom: 4px;">Answer (જવાબ) *</label>
          <textarea class="form-input" id="newFaqA" rows="3" placeholder="e.g. Immediately upon checkout confirmation, download links will be displayed on screen..." required style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px; resize: vertical;"></textarea>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="submit" class="btn btn-primary btn-sm" id="faqSubmitBtn" style="padding: 8px 18px; font-weight: 700;">Save FAQ</button>
          <button type="button" class="btn btn-secondary btn-sm" id="faqCancelEditBtn" style="display: none; padding: 8px 16px;">Cancel</button>
        </div>
      </form>
    </div>

    <div style="display: flex; flex-direction: column; gap: 14px;">
      ${faqs.length === 0 ? `
        <div style="padding: 40px; text-align: center; background: #FFFFFF; border: 2px dashed #CBD5E1; border-radius: 12px;">
          <p style="color: #64748B; font-weight: 600;">No FAQs found. Use the form above to add your first question.</p>
        </div>
      ` : faqs.map((f, idx) => `
        <div style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; background: #FFFFFF; display: flex; justify-content: space-between; align-items: start; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="background: #F1F5F9; color: #64748B; font-weight: 800; font-size: 0.75rem; padding: 2px 8px; border-radius: 6px;">Q${idx + 1}</span>
              <h4 style="font-weight: 700; font-size: 1rem; color: #0F172A; margin: 0;">${f.question}</h4>
            </div>
            <p style="font-size: 0.875rem; color: #475569; margin: 0; line-height: 1.5;">${f.answer}</p>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button class="btn btn-secondary btn-sm" data-action="edit-faq" data-id="${f.id}" style="padding: 6px 12px; font-weight: 600;">
              ✏️ Edit
            </button>
            <button class="btn btn-secondary btn-sm" style="color: #EF4444; padding: 6px 12px; font-weight: 600;" data-action="delete-faq" data-id="${f.id}">
              🗑️ Delete
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Focus add
  const openAddBtn = document.getElementById('openAddFaqBtn');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('editFaqId').value = '';
      document.getElementById('newFaqQ').value = '';
      document.getElementById('newFaqA').value = '';
      document.getElementById('faqFormTitle').textContent = 'Add New FAQ';
      document.getElementById('faqSubmitBtn').textContent = 'Add FAQ Item';
      document.getElementById('faqCancelEditBtn').style.display = 'none';
      document.getElementById('newFaqQ').focus();
    });
  }

  // Edit FAQ
  panel.querySelectorAll('[data-action="edit-faq"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const faq = faqs.find(f => f.id === id);
      if (faq) {
        document.getElementById('editFaqId').value = faq.id;
        document.getElementById('newFaqQ').value = faq.question;
        document.getElementById('newFaqA').value = faq.answer;
        document.getElementById('faqFormTitle').textContent = 'Edit FAQ: ' + faq.question;
        document.getElementById('faqSubmitBtn').textContent = 'Save Changes ✓';
        document.getElementById('faqCancelEditBtn').style.display = 'inline-block';
        document.getElementById('adminFaqBox').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('newFaqQ').focus();
      }
    });
  });

  const cancelEditBtn = document.getElementById('faqCancelEditBtn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      document.getElementById('editFaqId').value = '';
      document.getElementById('newFaqQ').value = '';
      document.getElementById('newFaqA').value = '';
      document.getElementById('faqFormTitle').textContent = 'Add New FAQ';
      document.getElementById('faqSubmitBtn').textContent = 'Save FAQ';
      cancelEditBtn.style.display = 'none';
    });
  }

  // Submit FAQ
  document.getElementById('addFaqForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('editFaqId').value;
    const question = document.getElementById('newFaqQ').value.trim();
    const answer = document.getElementById('newFaqA').value.trim();
    if (question && answer) {
      if (editId) {
        store.updateFaq(editId, { question, answer });
        showToast('FAQ Updated', 'Question updated successfully.', 'success');
      } else {
        store.addFaq({ question, answer });
        showToast('FAQ Added', 'New question added to FAQ section.', 'success');
      }
      renderAdminFaqs(panel);
    }
  });

  // Delete FAQ
  panel.querySelectorAll('[data-action="delete-faq"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const faq = faqs.find(f => f.id === id);
      const qTitle = faq ? faq.question : 'this question';
      if (confirm(`Delete FAQ: "${qTitle}"?`)) {
        store.deleteFaq(id);
        showToast('FAQ Deleted', 'Question removed.', 'info');
        renderAdminFaqs(panel);
      }
    });
  });
}

// ========================================================
// 11. TRUST STATS STRIP
// ========================================================
function renderAdminTrustStats(panel) {
  const stats = store.getTrustStats();

  panel.innerHTML = `
    <div class="panel-section-title">
      <span>Edit Value / Trust Metrics Strip</span>
      <span style="font-size: 0.8125rem; color: #64748B;">Updates display live on store header</span>
    </div>

    <form id="trustStatsEditForm" style="display: flex; flex-direction: column; gap: 16px;">
      ${stats.map((s, idx) => `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 16px; display: grid; grid-template-columns: 1fr 2fr; gap: 14px;">
          <div>
            <label class="form-label">Metric Number / Title</label>
            <input type="text" class="form-input" data-stat-idx="${idx}" data-field="number" value="${s.number}" required />
          </div>
          <div>
            <label class="form-label">Description Label</label>
            <input type="text" class="form-input" data-stat-idx="${idx}" data-field="label" value="${s.label}" required />
          </div>
        </div>
      `).join('')}

      <div>
        <button type="submit" class="btn btn-primary">
          Save Trust Strip Values
        </button>
      </div>
    </form>
  `;

  document.getElementById('trustStatsEditForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = panel.querySelectorAll('input[data-stat-idx]');
    const newStats = JSON.parse(JSON.stringify(stats));

    inputs.forEach(input => {
      const idx = Number(input.getAttribute('data-stat-idx'));
      const field = input.getAttribute('data-field');
      newStats[idx][field] = input.value.trim();
    });

    store.updateTrustStats(newStats);
    showToast('Trust Stats Saved', 'Store trust banner updated successfully!', 'success');
  });
}

// ========================================================
// 12. EMAIL SUBSCRIBERS
// ========================================================
function renderAdminSubscribers(panel) {
  const list = store.getSubscribers();

  panel.innerHTML = `
    <div class="admin-toolbar-row">
      <div>
        <h3 style="font-size: 1.375rem; font-weight: 800;">Newsletter & Freebie Leads</h3>
        <p style="font-size: 0.8125rem; color: #64748B;">${list.length} Email leads captured from weekly newsletter & free resource gates.</p>
      </div>
      <button class="btn btn-primary" id="exportSubscribersCsvBtn">
        ${getIcon('download')} Export Leads to CSV
      </button>
    </div>

    <div class="data-table-wrapper">
      <table class="vault-table">
        <thead>
          <tr>
            <th>Email Address</th>
            <th>Date Captured</th>
            <th>Lead Source</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(s => `
            <tr>
              <td><strong>${s.email}</strong></td>
              <td>${s.date}</td>
              <td><span class="product-category-tag">${s.source || 'Newsletter'}</span></td>
              <td><span class="status-badge status-completed">Subscribed</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('exportSubscribersCsvBtn').addEventListener('click', () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Email,Date,Source\n' +
      list.map(s => `"${s.email}","${s.date}","${s.source || 'Newsletter'}"`).join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `DigitalVault_Subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Exported', `Downloaded ${list.length} subscribers in CSV format.`, 'success');
  });
}

// ========================================================
// 13. STORE SETTINGS
// ========================================================
function renderAdminSettings(panel) {
  const settings = store.getSettings();
  const sec = store.getAdminSecurity();
  const currentLogo = settings.logo || '';

  panel.innerHTML = `
    <div class="panel-section-title" style="margin-bottom: 20px;">
      <h3 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin: 0;">Store Identity, Logo & Security Settings</h3>
      <p style="font-size: 0.8125rem; color: #64748B; margin: 4px 0 0;">Manage your store brand name, logo, customer contact info, and admin master password.</p>
    </div>

    <form id="adminSettingsForm" style="display: flex; flex-direction: column; gap: 20px;">
      <!-- 1. Brand & Logo -->
      <div class="admin-form-box" style="margin-bottom: 0;">
        <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 14px; color: #1E293B;">🏷️ Store Brand & Logo</h4>
        
        <!-- Logo Uploader & Preview -->
        <div style="background: #F1F5F9; border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <label class="form-label" style="font-weight: 700; color: #334155; margin-bottom: 8px; display: block;">Store Logo (વેબસાઇટ અને એડમિન માટેનો લોગો)</label>
          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 12px;">
            <div style="width: 64px; height: 64px; border-radius: 12px; background: #FFFFFF; border: 1px solid #CBD5E1; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
              <img id="js_logo_preview" src="${currentLogo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; display: ${currentLogo ? 'block' : 'none'};" onerror="this.style.display='none'; document.getElementById('js_logo_fallback').style.display='flex';" />
              <div id="js_logo_fallback" style="font-size: 1.75rem; display: ${currentLogo ? 'none' : 'flex'};">⚡</div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <input type="file" id="js_logo_file" accept="image/*" style="display: none;" />
              <button type="button" class="btn btn-primary btn-sm" id="js_upload_logo_btn" style="padding: 6px 14px; font-weight: 600;">
                📁 Upload from PC
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="js_remove_logo_btn" style="color: #EF4444; padding: 6px 12px;">
                ✕ Reset
              </button>
            </div>
          </div>
          <input type="text" class="form-input" id="settingLogoUrl" value="${currentLogo}" placeholder="Paste Image URL or upload from PC above..." style="width: 100%;" />
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
          <div>
            <label class="form-label" style="font-weight: 700; color: #334155;">Store Brand Name *</label>
            <input type="text" class="form-input" id="settingStoreName" value="${settings.storeName || 'Digital Vault'}" required style="width: 100%;" />
          </div>
          <div>
            <label class="form-label" style="font-weight: 700; color: #334155;">Store Tagline</label>
            <input type="text" class="form-input" id="settingTagline" value="${settings.tagline || ''}" placeholder="e.g. Premium Digital Resources" style="width: 100%;" />
          </div>
        </div>
      </div>

      <!-- 2. Contact & Currency -->
      <div class="admin-form-box" style="margin-bottom: 0;">
        <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 14px; color: #1E293B;">📞 Contact & Currency</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <div>
            <label class="form-label" style="font-weight: 700; color: #334155;">Support Email *</label>
            <input type="email" class="form-input" id="settingEmail" value="${settings.supportEmail || ''}" required style="width: 100%;" />
          </div>
          <div>
            <label class="form-label" style="font-weight: 700; color: #334155;">Support Phone / WhatsApp</label>
            <input type="text" class="form-input" id="settingPhone" value="${settings.supportPhone || '+91 98765 43210'}" placeholder="+91 98765 43210" style="width: 100%;" />
          </div>
          <div>
            <label class="form-label" style="font-weight: 700; color: #334155;">Store Currency</label>
            <select class="form-input" id="settingCurrency" style="width: 100%;">
              <option value="INR" ${settings.currency === 'INR' || !settings.currency ? 'selected' : ''}>INR (₹ - Indian Rupee)</option>
              <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($ - Dollar)</option>
              <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR (€ - Euro)</option>
              <option value="GBP" ${settings.currency === 'GBP' ? 'selected' : ''}>GBP (£ - Pound)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 3. Password & PIN -->
      <div class="admin-form-box" style="margin-bottom: 0; border: 1.5px solid #DDD6FE;">
        <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 6px; color: #4C1D95;">🛡️ Admin Password & PIN Reset</h4>
        <p style="font-size: 0.8125rem; color: #6D28D9; margin: 0 0 14px;">તમારો એડમિન લોગિન પાસવર્ડ અને PIN અહીંથી બદલી શકો છો.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <div>
            <label class="form-label" style="font-weight: 700; color: #334155;">Master Password (નવો પાસવર્ડ) *</label>
            <input type="text" class="form-input" id="settingPass" value="${sec.password || 'admin123'}" required style="width: 100%;" />
          </div>
          <div>
            <label class="form-label" style="font-weight: 700; color: #334155;">Security PIN (4-અંકનો પિન) *</label>
            <input type="text" class="form-input" id="settingPin" value="${sec.pin || '7890'}" maxlength="6" required style="width: 100%;" />
          </div>
        </div>
      </div>

      <div>
        <button type="submit" class="btn btn-primary" style="padding: 12px 28px; font-weight: 800; font-size: 0.95rem;">
          💾 Save Store Configuration & Password ✓
        </button>
      </div>
    </form>
  `;

  // Wire up logo upload button
  const fileInput = document.getElementById('js_logo_file');
  const uploadBtn = document.getElementById('js_upload_logo_btn');
  const removeBtn = document.getElementById('js_remove_logo_btn');
  const logoUrlInput = document.getElementById('settingLogoUrl');
  const previewImg = document.getElementById('js_logo_preview');
  const fallbackIcon = document.getElementById('js_logo_fallback');

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          if (logoUrlInput) logoUrlInput.value = dataUrl;
          if (previewImg) { previewImg.src = dataUrl; previewImg.style.display = 'block'; }
          if (fallbackIcon) fallbackIcon.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (logoUrlInput) logoUrlInput.value = '';
      if (fileInput) fileInput.value = '';
      if (previewImg) previewImg.style.display = 'none';
      if (fallbackIcon) fallbackIcon.style.display = 'flex';
    });
  }

  if (logoUrlInput) {
    logoUrlInput.addEventListener('input', () => {
      const val = logoUrlInput.value.trim();
      if (val) {
        if (previewImg) { previewImg.src = val; previewImg.style.display = 'block'; }
        if (fallbackIcon) fallbackIcon.style.display = 'none';
      } else {
        if (previewImg) previewImg.style.display = 'none';
        if (fallbackIcon) fallbackIcon.style.display = 'flex';
      }
    });
  }

  document.getElementById('adminSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newStoreName = document.getElementById('settingStoreName').value.trim();
    const newTagline = document.getElementById('settingTagline').value.trim();
    const newEmail = document.getElementById('settingEmail').value.trim();
    const newPhone = document.getElementById('settingPhone').value.trim();
    const newCurrency = document.getElementById('settingCurrency').value;
    const newLogo = document.getElementById('settingLogoUrl').value.trim();
    const newPass = document.getElementById('settingPass').value.trim();
    const newPin = document.getElementById('settingPin').value.trim();

    store.updateSettings({
      storeName: newStoreName,
      tagline: newTagline,
      supportEmail: newEmail,
      supportPhone: newPhone,
      currency: newCurrency,
      currencySymbol: newCurrency === 'INR' ? '₹' : (newCurrency === 'USD' ? '$' : (newCurrency === 'EUR' ? '€' : '£')),
      logo: newLogo
    });

    if (newPass || newPin) {
      store.updateAdminSecurity({
        newPassword: newPass,
        newPin: newPin
      });
    }

    showToast('Settings & Credentials Saved', 'Store details, logo & passwords updated.', 'success');
  });
}

// Window namespace for inline buttons
window.digitalVaultAdmin = {
  switchAdminTab,
  viewOrderDetails
};
