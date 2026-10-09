// Digital Vault - Customer Dashboard (Orders, Downloads, Invoices, Profile, Support)

import { store } from './store.js';
import { getIcon } from './icons.js';
import { showToast } from './app.js';
import { openInvoiceModal } from './checkout.js';

export function initCustomerDashboard() {
  const container = document.getElementById('customerDashboardContainer');
  if (!container) return;

  // Nav tab buttons
  const navTabs = container.querySelectorAll('.dashboard-nav-item');
  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabTarget = e.currentTarget.getAttribute('data-tab');
      switchDashboardTab(tabTarget);
    });
  });

  // Re-render when downloads or user changes
  store.subscribe('downloads_updated', () => {
    if (container.classList.contains('active')) {
      renderDashboardDownloads();
    }
  });

  store.subscribe('user_updated', () => {
    if (container.classList.contains('active')) {
      renderDashboardProfile();
    }
  });
}

export function switchDashboardTab(tabName = 'downloads') {
  const container = document.getElementById('customerDashboardContainer');
  if (!container) return;

  // update sidebar active class
  container.querySelectorAll('.dashboard-nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
  });

  // render matching tab panel
  const panel = document.getElementById('customerDashboardPanel');
  if (!panel) return;

  switch (tabName) {
    case 'profile':
      renderDashboardProfile();
      break;
    case 'orders':
      renderDashboardOrders();
      break;
    case 'downloads':
      renderDashboardDownloads();
      break;
    case 'wishlist':
      renderDashboardWishlist();
      break;
    case 'invoices':
      renderDashboardInvoices();
      break;
    case 'support':
      renderDashboardSupport();
      break;
    default:
      renderDashboardDownloads();
  }
}

// 1. Profile Tab
function renderDashboardProfile() {
  const panel = document.getElementById('customerDashboardPanel');
  const user = store.user;

  panel.innerHTML = `
    <h3 class="panel-section-title">
      <span>${getIcon('user')} My Profile & Account Settings</span>
      <span class="status-badge status-completed">Active Member</span>
    </h3>

    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--color-accent) 0%, #3B82F6 100%); color: #FFF; font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; justify-content: center;">
          ${(user.name || 'A')[0]}
        </div>
        <div>
          <h4 style="font-size: 1.125rem; font-weight: 700;">${user.name}</h4>
          <p style="font-size: 0.8125rem; color: #64748B;">Member since ${user.memberSince || '2026'}</p>
        </div>
      </div>

      <div class="checkout-form-grid">
        <div>
          <label class="form-label">Full Name</label>
          <input type="text" class="form-input" id="dashProfileName" value="${user.name}" />
        </div>
        <div>
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" id="dashProfileEmail" value="${user.email}" />
        </div>
      </div>

      <button class="btn btn-primary" id="saveProfileBtn" style="margin-top: 10px;">
        Save Changes
      </button>
    </div>

    <div style="border-top: 1px solid #E4E4E7; padding-top: 20px;">
      <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 8px;">License Verification</h4>
      <p style="font-size: 0.8125rem; color: var(--color-text-muted);">
        All your purchases are automatically tied to <strong>${user.email}</strong> with active commercial usage certificates.
      </p>
    </div>
  `;

  const saveBtn = document.getElementById('saveProfileBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const newName = document.getElementById('dashProfileName').value.trim();
      const newEmail = document.getElementById('dashProfileEmail').value.trim();
      if (newName && newEmail) {
        store.user.name = newName;
        store.user.email = newEmail;
        store.saveUser();
        showToast('Profile Updated', 'Your profile details have been saved.', 'success');
      }
    });
  }
}

// 2. Orders Tab
function renderDashboardOrders() {
  const panel = document.getElementById('customerDashboardPanel');
  const orders = store.getOrders();

  panel.innerHTML = `
    <h3 class="panel-section-title">
      <span>${getIcon('shopping-bag')} My Orders & Receipts</span>
      <span style="font-size: 0.875rem; color: #64748B; font-weight: 500;">${orders.length} Total Orders</span>
    </h3>

    ${orders.length === 0 ? `
      <p style="color: var(--color-text-muted); padding: 40px 0; text-align: center;">No orders found.</p>
    ` : `
      <div class="data-table-wrapper">
        <table class="vault-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td><strong style="font-family: var(--font-mono); color: var(--color-accent);">${order.id}</strong></td>
                <td>${order.date}</td>
                <td>${(order.items || []).map(i => i.title).join(', ')}</td>
                <td><strong>₹${Number(order.total).toFixed(2)}</strong></td>
                <td><span class="status-badge status-completed">${order.status}</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm" data-action="view-order-inv" data-id="${order.id}">
                    ${getIcon('file-text')} Invoice
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}
  `;

  panel.querySelectorAll('[data-action="view-order-inv"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.currentTarget.getAttribute('data-id');
      const order = orders.find(o => o.id === orderId);
      if (order) openInvoiceModal(order);
    });
  });
}

// 3. Downloads Tab (The core digital fulfillment hub)
function renderDashboardDownloads() {
  const panel = document.getElementById('customerDashboardPanel');
  const user = store.user;
  const downloads = user.downloads || [];

  panel.innerHTML = `
    <h3 class="panel-section-title">
      <span>${getIcon('download')} My Digital Downloads & Files</span>
      <span class="section-tag" style="background: #ECFDF5; color: #059669; border-color: #A7F3D0; margin: 0;">
        ${downloads.length} Assets Ready
      </span>
    </h3>
    <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 24px;">
      Direct lifetime access to your templates, swipe files, Notion databases and guides.
    </p>

    ${downloads.length === 0 ? `
      <div style="text-align: center; padding: 50px 20px; background: #F8FAFC; border-radius: var(--radius-lg); border: 1px dashed #CBD5E1;">
        <div style="font-size: 2.5rem; color: #94A3B8; margin-bottom: 12px;">${getIcon('download')}</div>
        <h4 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 6px;">No downloads in your account yet</h4>
        <p style="color: var(--color-text-muted); margin-bottom: 20px; font-size: 0.875rem;">
          Once you purchase any product or grab a freebie, it will appear here permanently.
        </p>
        <button class="btn btn-primary" onclick="window.digitalVaultApp.switchView('store')">
          Explore Products
        </button>
      </div>
    ` : `
      <div class="downloads-list">
        ${downloads.map(d => `
          <div class="download-card-item">
            <div class="download-info-col">
              <h4 class="download-item-title">${d.title}</h4>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                <span class="download-license-badge">License: ${d.licenseKey || 'DV-COMMERCIAL-UNLIMITED'}</span>
                <span style="font-size: 0.75rem; color: #64748B;">• Purchased on ${d.purchaseDate || '2026-09-29'}</span>
                <span style="font-size: 0.75rem; color: #10B981; font-weight: 600;">• Lifetime Updates Active</span>
              </div>
            </div>

            <div class="download-actions-col">
              <button class="btn btn-secondary btn-sm" data-action="open-canva-sim" data-title="${d.title}">
                ${getIcon('external-link')} Open Template
              </button>
              <button class="btn btn-primary btn-sm" data-action="download-direct-pkg" data-id="${d.id}" data-filename="${d.downloadFilename || 'DigitalVault_Asset.zip'}" data-license="${d.licenseKey}">
                ${getIcon('download')} Download Files
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  // Attach direct download triggers
  panel.querySelectorAll('[data-action="download-direct-pkg"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const filename = e.currentTarget.getAttribute('data-filename');
      const license = e.currentTarget.getAttribute('data-license');
      downloadRealDigitalProductPackage(id, filename, license);
    });
  });

  // Attach template link simulation
  panel.querySelectorAll('[data-action="open-canva-sim"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = e.currentTarget.getAttribute('data-title');
      showToast('Opening Template Link', `Opening ${title} direct workspace...`, 'success');
      window.open('https://canva.com', '_blank');
    });
  });
}

// 4. Wishlist Tab
function renderDashboardWishlist() {
  const panel = document.getElementById('customerDashboardPanel');
  const wishlistIds = store.wishlist;
  const products = wishlistIds.map(id => store.getProductById(id) || store.getBundleById(id)).filter(Boolean);

  panel.innerHTML = `
    <h3 class="panel-section-title">
      <span>${getIcon('heart')} My Saved Wishlist</span>
      <span style="font-size: 0.875rem; color: #64748B; font-weight: 500;">${products.length} Saved</span>
    </h3>

    ${products.length === 0 ? `
      <p style="color: var(--color-text-muted); padding: 40px 0; text-align: center;">Your wishlist is currently empty.</p>
    ` : `
      <div class="downloads-list">
        ${products.map(p => `
          <div class="download-card-item">
            <div>
              <h4 class="download-item-title">${p.title}</h4>
              <p style="font-size: 0.8125rem; color: #64748B;">${p.shortDescription || ''}</p>
            </div>
            <div class="download-actions-col">
              <span style="font-weight: 800; font-size: 1.125rem; color: var(--color-primary); margin-right: 8px;">
                ${p.free ? 'FREE' : `₹${p.salePrice}`}
              </span>
              <button class="btn btn-primary btn-sm" data-action="dash-wish-to-cart" data-id="${p.id}">
                ${getIcon('shopping-bag')} Add to Cart
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  panel.querySelectorAll('[data-action="dash-wish-to-cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const prod = store.getProductById(id) || store.getBundleById(id);
      if (prod) {
        store.addToCart(prod, prod.isBundle);
        showToast('Added to Cart', `${prod.title} added to cart!`, 'success');
      }
    });
  });
}

// 5. Invoices Tab
function renderDashboardInvoices() {
  renderDashboardOrders(); // Re-uses the order receipts view
}

// 6. Support Tab
function renderDashboardSupport() {
  const panel = document.getElementById('customerDashboardPanel');

  panel.innerHTML = `
    <h3 class="panel-section-title">
      <span>${getIcon('award')} Priority Creator Support</span>
      <span style="font-size: 0.75rem; color: #10B981; font-weight: 700;">Average Response Time: &lt; 2 Hours</span>
    </h3>
    <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 24px;">
      Need help accessing a Canva link, custom fonts, or extracting your downloads? We're here for you.
    </p>

    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 24px;">
      <form id="supportTicketForm">
        <div class="checkout-form-grid">
          <div>
            <label class="form-label">Subject</label>
            <input type="text" class="form-input" id="supportSubject" placeholder="e.g. Canva link access inquiry" required />
          </div>
          <div>
            <label class="form-label">Priority</label>
            <select class="form-input" id="supportPriority">
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent (Client Deadline)</option>
              <option value="General">General Question</option>
            </select>
          </div>
          <div class="checkout-form-col-full">
            <label class="form-label">Describe your question or issue</label>
            <textarea class="form-input" id="supportMessage" rows="4" placeholder="Provide details about your order or product..." required></textarea>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="margin-top: 12px;">
          Send Support Ticket
        </button>
      </form>
    </div>
  `;

  const form = document.getElementById('supportTicketForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = document.getElementById('supportSubject').value;
      showToast('Ticket Submitted', `Ticket "${subject}" has been received. Our team will email you shortly!`, 'success');
      form.reset();
    });
  }
}

// Real File Download Generator
// Generates a real readable downloadable digital package file for the user right inside their browser!
export function downloadRealDigitalProductPackage(productId, filename = 'DigitalVault_Asset.zip', licenseKey = 'DV-COMMERCIAL-UNLIMITED') {
  const product = store.getProductById(productId) || store.getBundleById(productId) || {
    title: 'Digital Vault Premium Resource',
    templateCount: '500+ Items',
    formats: ['Canva', 'Notion', 'PDF']
  };

  const packageContent = `========================================================================
DIGITAL VAULT - PREMIUM DIGITAL RESOURCE PACKAGE
========================================================================

PRODUCT NAME:
${product.title}

OFFICIAL LICENSE KEY:
${licenseKey || 'DV-LIC-' + Math.random().toString(36).substring(2, 9).toUpperCase()}

COMMERCIAL LICENSE TERMS:
Granted to: Registered Buyer (${store.user.email})
Status: Perpetual Commercial Use Authorized
Permitted: Unlimited personal & client deliverables, commercial ad campaigns, client social channels.
Restrictions: Reselling or redistributing raw template files is strictly prohibited.

------------------------------------------------------------------------
INSTANT 1-CLICK ACCESS LINKS:
------------------------------------------------------------------------
1. CANVA DIRECT EDITABLE ACCESS:
   https://www.canva.com/brand/templates/digital-vault-${product.id || 'master'}

2. NOTION WORKSPACE DUPLICATE LINK:
   https://digitalvault.notion.site/access-${product.id || 'hub'}

3. GOOGLE SHEETS / DRIVE ASSETS FOLDER:
   https://drive.google.com/drive/folders/digital-vault-${product.id || 'assets'}

------------------------------------------------------------------------
QUICK START INSTRUCTIONS:
------------------------------------------------------------------------
Step 1: Click the Canva link above and click "Use Template as New Design".
Step 2: Replace fonts, logos, colors, and imagery with your brand palette.
Step 3: Export in high-res PNG / MP4 / PDF format and publish!

SUPPORT & ASSISTANCE:
Email: support@digitalvault.io
Dashboard: https://digitalvault.io/my-downloads

Thank you for choosing Digital Vault!
© 2026 Digital Vault. All rights reserved.
========================================================================`;

  const blob = new Blob([packageContent], { type: 'text/plain;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename.replace(/\.zip$/i, '') + '_Package_License.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  showToast('Download Started', `Saved ${a.download} with your direct template links!`, 'success');
}
