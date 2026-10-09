// Digital Vault - UI Component Rendering Engine

import { store } from './store.js';
import { getIcon } from './icons.js';
import { getProductMockupSvg } from './mockups.js';

export function renderTrustStrip() {
  const container = document.getElementById('trustStripGrid');
  if (!container) return;
  const stats = store.getTrustStats();
  container.innerHTML = stats.map(stat => `
    <div class="trust-item">
      <div class="trust-icon-box">
        ${getIcon(stat.icon || 'shield-check')}
      </div>
      <div class="trust-text">
        <span class="trust-number">${stat.number}</span>
        <span class="trust-label">${stat.label}</span>
      </div>
    </div>
  `).join('');
}

export function renderCategoriesGrid() {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;
  const categories = store.getCategories();
  container.innerHTML = categories.map(cat => `
    <div class="category-card" data-slug="${cat.slug}">
      <div class="category-icon-wrap">
        ${getIcon(cat.icon || 'palette')}
      </div>
      <h3 class="category-name">${cat.name}</h3>
      <p class="category-desc">${cat.description}</p>
      <div class="category-footer">
        <span>Explore Collection</span>
        <span class="category-count">${cat.productCount}+ items</span>
      </div>
    </div>
  `).join('');

  // Add click handlers to category cards to filter products
  container.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const slug = card.getAttribute('data-slug');
      const productsSection = document.getElementById('productsSection');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
      store.setFilter('category', slug);
      // update active pills
      document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.classList.toggle('active', pill.getAttribute('data-cat') === slug);
      });
    });
  });
}

export function renderProductCard(product) {
  const isWish = store.isInWishlist(product.id);
  const discountVal = product.discount || product.discountPercent || 51;
  const discountText = `${discountVal}% OFF`;
  const regularPriceFormatted = product.regularPrice > 0 ? `₹${product.regularPrice}` : '';
  const salePriceFormatted = product.salePrice === 0 ? 'FREE' : `₹${product.salePrice}`;
  const desc = product.shortDescription || product.tagline || product.description || 'Curated digital resource package.';
  const thumb = product.thumbnail || product.image;

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-card-preview" data-action="view-product" data-id="${product.id}">
        ${thumb ? `
          <div style="height: 180px; width: 100%; border-radius: 12px; overflow: hidden; position: relative; background: #0F0C20;">
            <img src="${thumb}" alt="${product.title || product.name}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        ` : (product.imageType ? getProductMockupSvg(product.imageType, product.title, product.categoryName) : `
          <div style="height: 180px; background: linear-gradient(135deg, #130D2B 0%, #201348 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
            <div style="width: 72px; height: 100px; background: #2E1B69; border-radius: 6px; transform: rotate(-8deg); box-shadow: 0 8px 16px rgba(0,0,0,0.4);"></div>
            <div style="width: 80px; height: 110px; background: #7C3AED; border-radius: 8px; margin-left: -20px; z-index: 2; box-shadow: 0 12px 24px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #FFF; font-weight: 800; font-size: 0.75rem;">${(product.title || product.name || 'CANVA').slice(0, 10).toUpperCase()}</div>
            <div style="width: 72px; height: 100px; background: #A78BFA; border-radius: 6px; margin-left: -20px; transform: rotate(8deg); box-shadow: 0 8px 16px rgba(0,0,0,0.4);"></div>
          </div>
        `)}
        <div class="product-card-badges">
          <span class="badge-pill badge-bestseller">BEST SELLER</span>
          <span class="badge-pill badge-sale">${discountText}</span>
        </div>
        <button class="wishlist-toggle-btn ${isWish ? 'active' : ''}" data-action="toggle-wishlist" data-id="${product.id}" title="Save to Wishlist" aria-label="Save to Wishlist">
          ${isWish ? getIcon('heart-filled') : getIcon('heart')}
        </button>
      </div>

      <div class="product-card-body">
        <div class="product-meta-row">
          <span class="product-category-tag">${product.categoryName || 'Curated Bundles'}</span>
          <span class="product-templates-count">${getIcon('file-text', 'mini-icon')} ${product.templateCount || (product.isBundle ? 'Mega Bundle' : 'Digital Pack')}</span>
        </div>

        <h3 class="product-card-title" data-action="view-product" data-id="${product.id}">${product.title || product.name}</h3>
        <p class="product-card-desc">${desc}</p>

        <div class="product-rating-row">
          <div class="rating-stars">
            ${getIcon('star')}${getIcon('star')}${getIcon('star')}${getIcon('star')}${getIcon('star')}
          </div>
          <span class="rating-score">${(product.rating || 5.0).toFixed(1)}</span>
          <span class="rating-reviews">(${product.reviewsCount || 120})</span>
        </div>

        <div class="product-card-footer">
          <div class="product-price-block">
            ${regularPriceFormatted && !product.free ? `<span class="product-regular-price">${regularPriceFormatted}</span>` : ''}
            <span class="product-sale-price">${salePriceFormatted}</span>
          </div>

          <div class="product-card-actions">
            <button class="btn btn-primary btn-sm btn-get-bundle-full" data-action="buy-now" data-id="${product.id}" onclick="if(window.digitalVaultDirectBuy)window.digitalVaultDirectBuy('${product.id}', this)">
              ${getIcon('zap')} Get Bundle
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderProductsCatalog(products = null) {
  const container = document.getElementById('productsCatalogGrid');
  if (!container) return;

  const catalogItems = products || store.getFilteredProducts().slice(0, 10);
  container.innerHTML = catalogItems.map(p => renderProductCard(p)).join('');
}

export function renderBundlesSection() {
  const container = document.getElementById('bundleShowcaseContent');
  if (!container) return;
  const bundles = store.getBundles();

  container.innerHTML = `
    <div class="bundles-cards-grid">
      ${bundles.map(b => {
        const thumb = b.thumbnail || b.image;
        const discountVal = b.discount || b.discountPercent || 51;
        const discountText = `${discountVal}% OFF`;
        return `
        <div class="bundle-card ${b.featured ? 'featured-bundle' : ''}" data-id="${b.id}">
          <div class="product-card-preview" style="height: 180px; border-radius: 12px; overflow: hidden; position: relative; margin-bottom: 16px; background: #0F0C20;">
            ${thumb ? `
              <img src="${thumb}" alt="${b.title || b.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            ` : `
              <div style="height: 100%; width: 100%; background: linear-gradient(135deg, #130D2B 0%, #201348 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                <div style="width: 72px; height: 100px; background: #2E1B69; border-radius: 6px; transform: rotate(-8deg); box-shadow: 0 8px 16px rgba(0,0,0,0.4);"></div>
                <div style="width: 80px; height: 110px; background: #7C3AED; border-radius: 8px; margin-left: -20px; z-index: 2; box-shadow: 0 12px 24px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #FFF; font-weight: 800; font-size: 0.75rem;">${(b.title || b.name || 'CANVA').slice(0, 10).toUpperCase()}</div>
                <div style="width: 72px; height: 100px; background: #A78BFA; border-radius: 6px; margin-left: -20px; transform: rotate(8deg); box-shadow: 0 8px 16px rgba(0,0,0,0.4);"></div>
              </div>
            `}
            <div class="product-card-badges" style="position: absolute; top: 12px; left: 12px; display: flex; gap: 6px;">
              <span class="badge-pill badge-bestseller">BEST SELLER</span>
              <span class="badge-pill badge-sale">${discountText}</span>
            </div>
          </div>

          <div class="bundle-card-top-tag">
            ${b.badge || 'Curated Bundle'}
          </div>

          <div class="bundle-card-header">
            <h3 class="bundle-card-title">${b.title || b.name}</h3>
            <p class="bundle-card-tagline">${b.tagline || b.description}</p>
          </div>

          <div class="bundle-card-pricing">
            <div class="bundle-card-pricing-top">
              <span class="bundle-card-strike">Value: ₹${b.regularPrice}</span>
              <span class="bundle-card-savings-pill">Save ₹${b.savings} (${b.discountPercent}% OFF)</span>
            </div>
            <div class="bundle-card-main-price">
              <span style="font-size: 1.25rem; font-weight: 700; color: #A78BFA; margin-right: 2px;">₹</span>
              <span class="bundle-card-amount">${b.salePrice}</span>
              <span class="bundle-card-period">• One-time payment</span>
            </div>
          </div>

          <div class="bundle-card-items-wrap">
            ${(b.items && b.items.length > 0) ? `
              <div class="bundle-card-items-title">What's Inside (${b.items.length} Systems):</div>
              <ul class="bundle-card-checklist">
                ${b.items.map(item => `
                  <li class="bundle-card-check-item">
                    <span class="check-icon">✓</span>
                    <span><strong>${item.name || item}</strong> ${item.value ? `<span style="color: #94A3B8; font-size: 0.75rem;">(${item.value} val)</span>` : ''}</span>
                  </li>
                `).join('')}
              </ul>
            ` : `
              <div class="bundle-card-items-title">Bundle Details:</div>
              <p style="font-size: 0.875rem; color: #CBD5E1; line-height: 1.5; margin: 0 0 10px 0;">
                ${b.description || b.tagline || 'Complete curated bundle with direct download access.'}
              </p>
            `}

            ${b.bonuses && b.bonuses.length > 0 ? `
              <div class="bundle-card-bonus-strip">
                <span>🎁</span>
                <span>${b.bonuses[0]}</span>
              </div>
            ` : ''}
          </div>

          <div class="bundle-card-actions">
            <button class="btn btn-primary bundle-get-btn" data-action="add-bundle" data-id="${b.id}">
              ${getIcon('zap')} Get This Bundle (₹${b.salePrice})
            </button>
            <button class="btn btn-secondary btn-sm" data-action="buy-now-bundle" data-id="${b.id}">
              Instant Express Checkout →
            </button>
          </div>

          <div class="bundle-card-trust-note">
            ✓ Instant Download • ✓ Commercial License • ✓ Lifetime Access
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderFreebiesSection() {
  const container = document.getElementById('freebiesGrid');
  if (!container) return;
  const freeProducts = store.getProducts().filter(p => p.free);

  container.innerHTML = freeProducts.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-card-preview" data-action="view-product" data-id="${p.id}">
        ${getProductMockupSvg(p.imageType, p.title, p.categoryName)}
        <div class="product-card-badges">
          <span class="badge-pill badge-free">100% Free</span>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-meta-row">
          <span class="product-category-tag">${p.categoryName}</span>
          <span class="product-templates-count">${p.templateCount}</span>
        </div>
        <h3 class="product-card-title" data-action="view-product" data-id="${p.id}">${p.title}</h3>
        <p class="product-card-desc">${p.shortDescription}</p>
        <div class="product-card-footer">
          <div class="product-price-block">
            <span class="product-sale-price" style="color: #10B981;">FREE</span>
          </div>
          <button class="btn btn-primary btn-sm" data-action="download-free" data-id="${p.id}">
            ${getIcon('download')} Download Free
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

export function renderTestimonials() {
  const container = document.getElementById('testimonialsGrid');
  if (!container) return;
  const list = store.getTestimonials();

  container.innerHTML = list.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-header">
        <div class="testimonial-stars">
          ${getIcon('star')}${getIcon('star')}${getIcon('star')}${getIcon('star')}${getIcon('star')}
        </div>
        <span class="testimonial-notice">${t.isPlaceholderNotice || 'Sample Creator Review'}</span>
      </div>
      <p class="testimonial-quote">"${t.text}"</p>
      <div class="testimonial-author">
        <img src="${t.avatar}" alt="${t.name}" class="author-avatar" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'" />
        <div class="author-info">
          <div class="author-name">
            ${t.name}
            ${t.verified ? `<span style="color: var(--color-accent);">${getIcon('shield-check')}</span>` : ''}
          </div>
          <div class="author-role">${t.role}</div>
        </div>
      </div>
    </div>
  `).join('');
}

export function renderFaqs() {
  const container = document.getElementById('faqAccordion');
  if (!container) return;
  const faqs = store.getFaqs();

  container.innerHTML = faqs.map((faq, idx) => `
    <div class="faq-item ${idx === 0 ? 'active' : ''}" data-faq-id="${faq.id}">
      <button class="faq-question-btn" aria-expanded="${idx === 0 ? 'true' : 'false'}">
        <span>${faq.question}</span>
        <span class="faq-icon-chevron">${getIcon('chevron-down')}</span>
      </button>
      <div class="faq-answer">
        <p>${faq.answer}</p>
      </div>
    </div>
  `).join('');

  // Accordion toggle handlers
  container.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.currentTarget.closest('.faq-item');
      const wasActive = item.classList.contains('active');
      container.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });
}

// Product Detail Full Modal View
export function openProductDetailModal(productId) {
  const modal = document.getElementById('productDetailModal');
  const modalContent = document.getElementById('productDetailContent');
  if (!modal || !modalContent) return;

  const product = store.getProductById(productId) || store.getBundleById(productId);
  if (!product) return;

  const isFree = product.salePrice === 0 || product.free;
  const isWish = store.isInWishlist(product.id);

  modalContent.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-detail-preview-col">
        <div class="product-detail-hero-box">
          ${getProductMockupSvg(product.imageType || 'canva-pack', product.title, product.categoryName)}
        </div>

        <div class="product-detail-spec-box">
          <div class="spec-row">
            <span class="spec-label">File Count / Scope:</span>
            <span class="spec-val">${product.templateCount || '10+ Files'}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Formats:</span>
            <span class="spec-val">${(product.formats || ['Canva', 'PDF']).join(', ')}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Compatibility:</span>
            <span class="spec-val">${product.compatibility || 'Canva Free & Pro, Desktop, Mobile'}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">License:</span>
            <span class="spec-val">Commercial Rights Included</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Delivery:</span>
            <span class="spec-val" style="color: #10B981;">Instant Digital Download</span>
          </div>
        </div>
      </div>

      <div class="product-detail-info-col">
        <div class="product-meta-row" style="margin-bottom: 12px;">
          <span class="product-category-tag">${product.categoryName || 'Digital Resource'}</span>
          <span style="font-size: 0.8125rem; color: #10B981; font-weight: 700;">★ 4.9 Verified Rating</span>
        </div>

        <h1 class="detail-title">${product.title}</h1>

        <div class="detail-price-strip">
          <span class="detail-sale-price">${isFree ? 'FREE' : `₹${product.salePrice}`}</span>
          ${product.regularPrice > 0 && !isFree ? `<span class="detail-regular-price">₹${product.regularPrice}</span>` : ''}
          ${product.discount && !isFree ? `<span class="badge-pill badge-sale">${product.discount}% OFF</span>` : ''}
        </div>

        <p class="detail-desc">${product.shortDescription}</p>

        <h4 class="detail-section-title">What's Included:</h4>
        <ul class="detail-checklist">
          ${(product.whatIncluded || [
            'Instant 1-click access templates',
            'Full commercial use rights for personal & client projects',
            'High-resolution export settings guide',
            'Lifetime free updates and file revisions'
          ]).map(item => `
            <li class="detail-check-item">
              <span style="color: #10B981; font-weight: bold;">✓</span>
              <span>${item}</span>
            </li>
          `).join('')}
        </ul>

        <h4 class="detail-section-title">Who Is This For?</h4>
        <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 18px;">
          ${product.targetAudience || 'Creators, freelancers, marketing agencies, solopreneurs, and coaches looking to save hours of manual design and copywriting.'}
        </p>

        <h4 class="detail-section-title">License Terms:</h4>
        <p style="font-size: 0.8125rem; color: #64748B; margin-bottom: 24px; background: #F8FAFC; padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--color-accent);">
          ${product.license || 'Commercial License: Use freely for unlimited client deliverables and personal brand assets. Resale of original template files is strictly prohibited.'}
        </p>

        <div class="detail-cta-row">
          ${isFree ? `
            <button class="btn btn-primary btn-lg" style="flex: 1;" data-action="download-free" data-id="${product.id}">
              ${getIcon('download')} Unlock Free Instant Download
            </button>
          ` : `
            <button class="btn btn-primary btn-lg" style="flex: 1;" data-action="buy-now" data-id="${product.id}">
              ${getIcon('zap')} Buy Now (₹${product.salePrice})
            </button>
            <button class="btn btn-secondary btn-lg" data-action="add-cart" data-id="${product.id}">
              ${getIcon('shopping-bag')} Add to Cart
            </button>
          `}
          <button class="btn btn-secondary btn-icon-only ${isWish ? 'active' : ''}" data-action="toggle-wishlist" data-id="${product.id}" title="Wishlist">
            ${isWish ? getIcon('heart-filled') : getIcon('heart')}
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}
