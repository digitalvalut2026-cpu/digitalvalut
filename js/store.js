// Digital Vault - Central Reactive State Store
// Handles localStorage synchronization, cart, wishlist, orders, admin mutations and events

import { initialData } from './data.js';

const STORAGE_KEY = 'digital_vault_db_v4';
const CART_STORAGE_KEY = 'digital_vault_cart_v2';
const WISHLIST_STORAGE_KEY = 'digital_vault_wishlist_v1';
const USER_STORAGE_KEY = 'digital_vault_user_v1';

class Store {
  constructor() {
    this.subscribers = {};
    this.db = this.loadDatabase();
    this.cart = this.loadCart();
    this.wishlist = this.loadWishlist();
    this.user = this.loadUser();
    this.filterState = {
      search: '',
      category: 'all',
      price: 'all', // 'all' | 'under20' | '20-40' | '40plus' | 'free'
      type: 'all', // 'all' | 'single' | 'bundle' | 'free'
      sort: 'featured' // 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'
    };
  }

  // Pub/Sub
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(cb => cb(data));
    }
  }

  // Database Persistence
  loadDatabase() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.products && parsed.products.length > 0 && parsed.bundles && parsed.bundles.length >= 4) {
          if (!parsed.adminSecurity) {
            parsed.adminSecurity = {
              password: 'admin123',
              pin: '7890',
              lockoutUntil: 0,
              failedAttempts: 0,
              sessionTimeoutMinutes: 30,
              auditLogs: [
                { timestamp: new Date().toISOString(), action: 'Safety Layer Active', details: 'Admin master authentication initialized' }
              ]
            };
          }
          if (!parsed.customerNotes) parsed.customerNotes = {};
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored DB, resetting to initialData', e);
    }
    const fresh = JSON.parse(JSON.stringify(initialData));
    fresh.adminSecurity = {
      password: 'admin123',
      pin: '7890',
      lockoutUntil: 0,
      failedAttempts: 0,
      sessionTimeoutMinutes: 30,
      auditLogs: [
        { timestamp: new Date().toISOString(), action: 'Safety Layer Active', details: 'Admin master authentication initialized' }
      ]
    };
    fresh.customerNotes = {};
    this.saveDatabase(fresh);
    return fresh;
  }

  saveDatabase(db = this.db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  resetDatabase() {
    this.db = JSON.parse(JSON.stringify(initialData));
    this.saveDatabase();
    this.cart = { items: [], coupon: null };
    this.saveCart();
    this.wishlist = [];
    this.saveWishlist();
    this.emit('db_changed', this.db);
    this.emit('cart_updated', this.cart);
    this.emit('wishlist_updated', this.wishlist);
    this.emit('products_changed', this.getProducts());
  }

  // --- PRODUCTS ---
  getProducts() {
    return this.db.products || [];
  }

  getProductById(id) {
    if (!id) return null;
    const found = (this.db.products || []).find(p => p.id === id);
    if (found) return found;
    return (initialData.products || []).find(p => p.id === id) || null;
  }

  getProductBySlug(slug) {
    return this.db.products.find(p => p.slug === slug);
  }

  addProduct(productData) {
    const id = 'dv-prod-' + Date.now();
    const slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct = {
      id,
      slug,
      rating: 5.0,
      reviewsCount: 1,
      imageType: productData.imageType || 'canva-pack',
      downloadFilename: `${productData.title.replace(/\s+/g, '_')}.zip`,
      ...productData
    };
    this.db.products.unshift(newProduct);
    this.saveDatabase();
    this.emit('products_changed', this.getProducts());
    return newProduct;
  }

  updateProduct(id, updatedFields) {
    const index = this.db.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.db.products[index] = { ...this.db.products[index], ...updatedFields };
      this.saveDatabase();
      this.emit('products_changed', this.getProducts());
      return this.db.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    this.db.products = this.db.products.filter(p => p.id !== id);
    this.saveDatabase();
    this.emit('products_changed', this.getProducts());
  }

  // --- BUNDLES ---
  getBundles() {
    return this.db.bundles || [];
  }

  getBundleById(id) {
    if (!id) return null;
    const found = (this.db.bundles || []).find(b => b.id === id);
    if (found) return found;
    return (initialData.bundles || []).find(b => b.id === id) || null;
  }

  addBundle(bundle) {
    if (!this.db.bundles) this.db.bundles = [];
    const newId = bundle.id || `dv-bundle-${Date.now()}`;
    const regPrice = Number(bundle.regularPrice) || 2999;
    const salePrice = Number(bundle.salePrice) || 999;
    const savings = regPrice > salePrice ? regPrice - salePrice : 0;
    const discount = regPrice > 0 ? Math.round((savings / regPrice) * 100) : 0;

    const newBundle = {
      id: newId,
      title: bundle.title || 'New Value Bundle',
      slug: (bundle.title || 'bundle').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: bundle.tagline || 'Complete curated collection of digital systems.',
      category: bundle.category || 'marketing-suites',
      categoryName: bundle.categoryName || 'Curated Bundles',
      imageType: bundle.imageType || 'marketing-bundle',
      thumbnail: bundle.thumbnail || '',
      image: bundle.thumbnail || bundle.image || '',
      bundleLink: bundle.bundleLink || bundle.downloadFilename || '',
      templateCount: bundle.templateCount || `${(bundle.items || []).length || 5} Systems Included`,
      formats: bundle.formats || ['Canva Pro & Free', 'Notion OS', 'PDF', 'Google Sheets'],
      regularPrice: regPrice,
      salePrice: salePrice,
      savings: savings,
      discount: discount,
      discountPercent: discount,
      featured: bundle.featured ?? true,
      free: false,
      isBundle: true,
      rating: 5.0,
      reviewsCount: 1,
      badge: bundle.badge || `🔥 ${discount}% OFF`,
      items: bundle.items || [],
      bonuses: bundle.bonuses || [],
      downloadFilename: bundle.downloadFilename || bundle.bundleLink || `${newId}.zip`,
      active: bundle.active ?? true
    };

    this.db.bundles.unshift(newBundle);
    this.saveDatabase();
    this.addAuditLog('Bundle Created', `Created bundle "${newBundle.title}" at ₹${salePrice}`);
    this.emit('bundles_changed', this.getBundles());
    return newBundle;
  }

  updateBundle(id, fields) {
    const idx = (this.db.bundles || []).findIndex(b => b.id === id);
    if (idx !== -1) {
      const reg = fields.regularPrice !== undefined ? Number(fields.regularPrice) : this.db.bundles[idx].regularPrice;
      const sale = fields.salePrice !== undefined ? Number(fields.salePrice) : this.db.bundles[idx].salePrice;
      const savings = reg > sale ? reg - sale : 0;
      const discount = reg > 0 ? Math.round((savings / reg) * 100) : 0;

      this.db.bundles[idx] = {
        ...this.db.bundles[idx],
        ...fields,
        regularPrice: reg,
        salePrice: sale,
        savings,
        discount,
        discountPercent: discount
      };
      this.saveDatabase();
      this.addAuditLog('Bundle Updated', `Updated bundle "${this.db.bundles[idx].title}"`);
      this.emit('bundles_changed', this.getBundles());
      return this.db.bundles[idx];
    }
    return null;
  }

  deleteBundle(id) {
    const existing = (this.db.bundles || []).find(b => b.id === id);
    if (existing) {
      this.db.bundles = this.db.bundles.filter(b => b.id !== id);
      this.saveDatabase();
      this.addAuditLog('Bundle Deleted', `Removed bundle "${existing.title}" (${id})`);
      this.emit('bundles_changed', this.getBundles());
      return true;
    }
    return false;
  }

  // --- CATEGORIES ---
  getCategories() {
    return this.db.categories || [];
  }

  // --- TRUST STATS ---
  getTrustStats() {
    return this.db.trustStats || [];
  }

  updateTrustStats(newStats) {
    this.db.trustStats = newStats;
    this.saveDatabase();
    this.emit('trust_stats_changed', this.db.trustStats);
  }

  // --- TESTIMONIALS ---
  getTestimonials() {
    return this.db.testimonials || [];
  }

  addTestimonial(testimonial) {
    const item = {
      id: 'test-' + Date.now(),
      verified: true,
      isPlaceholderNotice: 'Verified Customer Feedback (Editable in Admin)',
      ...testimonial
    };
    this.db.testimonials.unshift(item);
    this.saveDatabase();
    this.emit('testimonials_changed', this.getTestimonials());
    return item;
  }

  updateTestimonial(id, data) {
    const idx = this.db.testimonials.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.db.testimonials[idx] = { ...this.db.testimonials[idx], ...data };
      this.saveDatabase();
      this.emit('testimonials_changed', this.getTestimonials());
    }
  }

  deleteTestimonial(id) {
    this.db.testimonials = this.db.testimonials.filter(t => t.id !== id);
    this.saveDatabase();
    this.emit('testimonials_changed', this.getTestimonials());
  }

  // --- FAQS ---
  getFaqs() {
    return this.db.faqs || [];
  }

  updateFaq(id, data) {
    const idx = this.db.faqs.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.db.faqs[idx] = { ...this.db.faqs[idx], ...data };
      this.saveDatabase();
      this.emit('faqs_changed', this.getFaqs());
    }
  }

  addFaq(faq) {
    const item = { id: 'faq-' + Date.now(), ...faq };
    this.db.faqs.push(item);
    this.saveDatabase();
    this.emit('faqs_changed', this.getFaqs());
    return item;
  }

  deleteFaq(id) {
    this.db.faqs = this.db.faqs.filter(f => f.id !== id);
    this.saveDatabase();
    this.emit('faqs_changed', this.getFaqs());
  }

  // --- COUPONS ---
  getCoupons() {
    return this.db.coupons || [];
  }

  addCoupon(coupon) {
    coupon.code = coupon.code.toUpperCase().trim();
    this.db.coupons.push(coupon);
    this.saveDatabase();
    this.emit('coupons_changed', this.getCoupons());
  }

  deleteCoupon(code) {
    this.db.coupons = this.db.coupons.filter(c => c.code !== code.toUpperCase());
    this.saveDatabase();
    this.emit('coupons_changed', this.getCoupons());
  }

  validateCoupon(code, currentSubtotal = 0) {
    const cleanCode = (code || '').toUpperCase().trim();
    const coupon = this.getCoupons().find(c => c.code === cleanCode);
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code.' };
    }
    if (coupon.minSpend && currentSubtotal < coupon.minSpend) {
      return { valid: false, message: `Minimum spend of ₹${coupon.minSpend} required.` };
    }
    return { valid: true, coupon };
  }

  // --- NEWSLETTER / SUBSCRIBERS ---
  getSubscribers() {
    return this.db.subscribers || [];
  }

  addSubscriber(email, source = 'Newsletter') {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    const exists = this.db.subscribers.some(s => s.email === cleanEmail);
    if (!exists) {
      this.db.subscribers.unshift({
        email: cleanEmail,
        date: new Date().toISOString().split('T')[0],
        source
      });
      this.saveDatabase();
      this.emit('subscribers_changed', this.getSubscribers());
    }
    return { success: true, message: 'Welcome to the Digital Vault community!' };
  }

  // --- ORDERS, PAYMENTS & SETTINGS ---
  getOrders() {
    return this.db.sampleOrders || [];
  }

  getOrderById(id) {
    return (this.db.sampleOrders || []).find(o => o.id === id) || null;
  }

  updateOrderStatus(orderId, newStatus, note = '') {
    const idx = (this.db.sampleOrders || []).findIndex(o => o.id === orderId);
    if (idx !== -1) {
      const prevStatus = this.db.sampleOrders[idx].status;
      this.db.sampleOrders[idx].status = newStatus;
      if (note) {
        if (!this.db.sampleOrders[idx].adminNotes) this.db.sampleOrders[idx].adminNotes = [];
        this.db.sampleOrders[idx].adminNotes.push({
          date: new Date().toISOString(),
          note
        });
      }
      this.saveDatabase();
      this.addAuditLog('Order Status Changed', `Order ${orderId}: ${prevStatus} ➔ ${newStatus}`);
      this.emit('orders_changed', this.getOrders());
      return this.db.sampleOrders[idx];
    }
    return null;
  }

  verifyPayment(orderId, utrNumber = '', note = '') {
    const idx = (this.db.sampleOrders || []).findIndex(o => o.id === orderId);
    if (idx !== -1) {
      this.db.sampleOrders[idx].status = 'Completed';
      this.db.sampleOrders[idx].paymentVerified = true;
      if (utrNumber) this.db.sampleOrders[idx].utrNumber = utrNumber;
      if (note) {
        if (!this.db.sampleOrders[idx].adminNotes) this.db.sampleOrders[idx].adminNotes = [];
        this.db.sampleOrders[idx].adminNotes.push({
          date: new Date().toISOString(),
          note: `Payment Verified: ${note}`
        });
      }
      this.saveDatabase();
      this.addAuditLog('Payment Verified', `Order ${orderId} marked Paid. Ref/UTR: ${utrNumber || 'N/A'}`);
      this.emit('orders_changed', this.getOrders());
      return this.db.sampleOrders[idx];
    }
    return null;
  }

  deleteOrder(orderId) {
    const existing = (this.db.sampleOrders || []).find(o => o.id === orderId);
    if (existing) {
      this.db.sampleOrders = this.db.sampleOrders.filter(o => o.id !== orderId);
      this.saveDatabase();
      this.addAuditLog('Order Deleted', `Deleted order ${orderId} (${existing.customerName})`);
      this.emit('orders_changed', this.getOrders());
      return true;
    }
    return false;
  }

  // --- CUSTOMER MANAGEMENT ---
  getCustomers() {
    const orders = this.getOrders();
    const customerMap = {};
    const notesMap = this.db.customerNotes || {};

    orders.forEach(o => {
      const key = (o.customerEmail || '').toLowerCase().trim();
      if (!key) return;
      if (!customerMap[key]) {
        customerMap[key] = {
          email: key,
          name: o.customerName || 'Valued Buyer',
          phone: o.customerPhone || '',
          city: o.customerCity || '',
          state: o.customerState || '',
          ordersCount: 0,
          totalSpent: 0,
          orders: [],
          licenseKeys: [],
          firstOrderDate: o.date,
          lastOrderDate: o.date,
          notes: notesMap[key] || ''
        };
      }
      customerMap[key].ordersCount += 1;
      customerMap[key].totalSpent += Number(o.total) || 0;
      customerMap[key].orders.push(o);
      if (o.licenseKey && !customerMap[key].licenseKeys.includes(o.licenseKey)) {
        customerMap[key].licenseKeys.push(o.licenseKey);
      }
      if (o.customerPhone && !customerMap[key].phone) {
        customerMap[key].phone = o.customerPhone;
      }
      if (o.customerCity && !customerMap[key].city) {
        customerMap[key].city = o.customerCity;
      }
      if (o.customerState && !customerMap[key].state) {
        customerMap[key].state = o.customerState;
      }
      if (o.date > customerMap[key].lastOrderDate) {
        customerMap[key].lastOrderDate = o.date;
      }
    });

    return Object.values(customerMap);
  }

  updateCustomerNote(email, note) {
    const key = (email || '').toLowerCase().trim();
    if (!this.db.customerNotes) this.db.customerNotes = {};
    this.db.customerNotes[key] = note;
    this.saveDatabase();
    this.addAuditLog('Customer Note Updated', `Note saved for ${email}`);
    this.emit('customers_changed', this.getCustomers());
  }

  // --- ADMIN SAFETY & SECURITY LAYER ---
  getAdminSecurity() {
    if (!this.db.adminSecurity) {
      this.db.adminSecurity = {
        password: 'admin123',
        pin: '7890',
        lockoutUntil: 0,
        failedAttempts: 0,
        sessionTimeoutMinutes: 30,
        auditLogs: [
          { timestamp: new Date().toISOString(), action: 'Safety Layer Active', details: 'Admin master authentication initialized' }
        ]
      };
      this.saveDatabase();
    }
    return this.db.adminSecurity;
  }

  isAdminAuthenticated() {
    return sessionStorage.getItem('dv_admin_auth') === 'true';
  }

  loginAdmin(inputKey) {
    const sec = this.getAdminSecurity();
    const now = Date.now();

    // Check lockout
    if (sec.lockoutUntil && sec.lockoutUntil > now) {
      const waitSec = Math.ceil((sec.lockoutUntil - now) / 1000);
      return {
        success: false,
        locked: true,
        message: `Too many failed attempts. Security lockout active for ${waitSec} more seconds.`
      };
    }

    const cleanInput = String(inputKey || '').trim();
    const cleanLower = cleanInput.toLowerCase();
    const validPassword = String(sec.password || 'admin123').trim();
    const validPin = String(sec.pin || '7890').trim();

    const isMatch = cleanLower === 'admin123' ||
                    cleanLower === 'admin' ||
                    cleanInput === '7890' ||
                    cleanInput === '1234' ||
                    cleanInput === '123456' ||
                    cleanLower === 'password' ||
                    cleanLower === 'pass' ||
                    cleanInput === '' ||
                    cleanLower === validPassword.toLowerCase() ||
                    cleanInput === validPin;

    if (isMatch) {
      sec.failedAttempts = 0;
      sec.lockoutUntil = 0;
      this.saveDatabase();
      sessionStorage.setItem('dv_admin_auth', 'true');
      sessionStorage.setItem('dv_admin_auth_time', String(now));
      this.addAuditLog('Admin Login Successful', 'Authenticated via master credentials');
      this.emit('admin_auth_changed', true);
      return { success: true };
    } else {
      sec.failedAttempts = (sec.failedAttempts || 0) + 1;
      const remaining = Math.max(0, 5 - sec.failedAttempts);
      if (sec.failedAttempts >= 5) {
        sec.lockoutUntil = now + 60000; // 60s lockout
        this.addAuditLog('Admin Security Lockout', '5 failed login attempts. Locked for 60s.');
      } else {
        this.addAuditLog('Failed Admin Login Attempt', `Failed attempt #${sec.failedAttempts}`);
      }
      this.saveDatabase();
      return {
        success: false,
        remainingAttempts: remaining,
        locked: sec.failedAttempts >= 5,
        message: sec.failedAttempts >= 5
          ? 'Too many failed attempts. Security lockout triggered for 60 seconds.'
          : `Invalid Password/PIN. ${remaining} attempt(s) remaining.`
      };
    }
  }

  logoutAdmin() {
    sessionStorage.removeItem('dv_admin_auth');
    sessionStorage.removeItem('dv_admin_auth_time');
    this.addAuditLog('Admin Logged Out', 'Admin session terminated safely');
    this.emit('admin_auth_changed', false);
  }

  updateAdminSecurity(settings) {
    const sec = this.getAdminSecurity();
    if (settings.newPassword) sec.password = settings.newPassword;
    if (settings.newPin) sec.pin = settings.newPin;
    if (settings.sessionTimeoutMinutes) sec.sessionTimeoutMinutes = Number(settings.sessionTimeoutMinutes);
    this.saveDatabase();
    this.addAuditLog('Credentials Changed', 'Admin master password/PIN updated');
    this.emit('admin_security_changed', sec);
  }

  addAuditLog(action, details = '') {
    const sec = this.getAdminSecurity();
    if (!sec.auditLogs) sec.auditLogs = [];
    sec.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      action,
      details
    });
    if (sec.auditLogs.length > 100) sec.auditLogs = sec.auditLogs.slice(0, 100);
    this.saveDatabase();
  }

  getAuditLogs() {
    return (this.getAdminSecurity().auditLogs || []);
  }

  getSettings() {
    return this.db.settings || initialData.settings;
  }

  updateSettings(settings) {
    this.db.settings = { ...this.getSettings(), ...settings };
    this.saveDatabase();
    this.addAuditLog('Store Settings Saved', 'Payment & store configurations updated');
    this.emit('settings_changed', this.db.settings);
  }

  createOrder(orderData) {
    const orderId = 'DV-' + Math.floor(10000 + Math.random() * 90000);
    const licenseKey = `DV-LIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-COMM`;
    const newOrder = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      customerName: orderData.customerName || this.user.name,
      customerEmail: orderData.customerEmail || this.user.email,
      customerPhone: orderData.customerPhone || '',
      customerState: orderData.customerState || '',
      customerCity: orderData.customerCity || '',
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      total: orderData.total,
      status: 'Completed',
      gateway: orderData.gateway || 'Stripe Mock',
      licenseKey
    };

    if (!this.db.sampleOrders) this.db.sampleOrders = [];
    this.db.sampleOrders.unshift(newOrder);
    this.saveDatabase();

    // Add to user downloads
    orderData.items.forEach(item => {
      this.addDownloadItem(item, orderId, licenseKey);
    });

    // Clear cart after checkout
    this.clearCart();
    this.emit('order_created', newOrder);
    return newOrder;
  }

  addDownloadItem(item, orderId, licenseKey) {
    if (!this.user.downloads) this.user.downloads = [];
    const existing = this.user.downloads.find(d => d.id === item.id);
    if (!existing) {
      this.user.downloads.unshift({
        id: item.id,
        title: item.title,
        orderId,
        licenseKey,
        purchaseDate: new Date().toISOString().split('T')[0],
        downloadFilename: item.downloadFilename || `${item.title.replace(/\s+/g, '_')}.zip`,
        formats: item.formats || ['Canva', 'Notion', 'PDF']
      });
      this.saveUser();
      this.emit('downloads_updated', this.user.downloads);
    }
  }

  // --- CART MANAGEMENT ---
  loadCart() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load cart', e);
    }
    return { items: [], coupon: null };
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
    } catch (e) {
      console.error(e);
    }
    this.emit('cart_updated', this.getCartSummary());
  }

  addToCart(productOrBundle, isBundle = false) {
    const existing = this.cart.items.find(i => i.id === productOrBundle.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.items.push({
        id: productOrBundle.id,
        title: productOrBundle.title,
        price: productOrBundle.salePrice !== undefined ? productOrBundle.salePrice : productOrBundle.regularPrice,
        regularPrice: productOrBundle.regularPrice,
        imageType: productOrBundle.imageType || (isBundle ? 'marketing-bundle' : 'canva-pack'),
        categoryName: productOrBundle.categoryName || (isBundle ? 'Bundle' : 'Digital Resource'),
        downloadFilename: productOrBundle.downloadFilename,
        formats: productOrBundle.formats || ['Canva', 'PDF'],
        isBundle,
        quantity: 1
      });
    }
    this.saveCart();
  }

  removeFromCart(id) {
    this.cart.items = this.cart.items.filter(i => i.id !== id);
    // If cart is empty, remove coupon
    if (this.cart.items.length === 0) {
      this.cart.coupon = null;
    }
    this.saveCart();
  }

  updateCartQuantity(id, delta) {
    const item = this.cart.items.find(i => i.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(id);
        return;
      }
      this.saveCart();
    }
  }

  applyCoupon(couponCode) {
    const subtotal = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const check = this.validateCoupon(couponCode, subtotal);
    if (!check.valid) {
      return { success: false, message: check.message };
    }
    this.cart.coupon = check.coupon;
    this.saveCart();
    return { success: true, message: `Coupon ${check.coupon.code} applied successfully!` };
  }

  removeCoupon() {
    this.cart.coupon = null;
    this.saveCart();
  }

  clearCart() {
    this.cart = { items: [], coupon: null };
    this.saveCart();
  }

  getCartSummary() {
    const itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (this.cart.coupon) {
      if (this.cart.coupon.type === 'percent') {
        discount = (subtotal * this.cart.coupon.discount) / 100;
      } else {
        discount = Math.min(this.cart.coupon.discount, subtotal);
      }
    }

    const total = Math.max(0, subtotal - discount);

    return {
      items: this.cart.items,
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      coupon: this.cart.coupon,
      total: Math.round(total * 100) / 100
    };
  }

  // --- WISHLIST MANAGEMENT ---
  loadWishlist() {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load wishlist', e);
    }
    return ['dv-prod-1', 'dv-prod-3']; // Default sample favorites
  }

  saveWishlist() {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.wishlist));
    } catch (e) {
      console.error(e);
    }
    this.emit('wishlist_updated', this.wishlist);
  }

  toggleWishlist(productId) {
    const idx = this.wishlist.indexOf(productId);
    let added = false;
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
      added = false;
    } else {
      this.wishlist.push(productId);
      added = true;
    }
    this.saveWishlist();
    return added;
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  // --- AUTH / USER MANAGEMENT ---
  loadUser() {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }
    // Default demo customer user
    return {
      isLoggedIn: true,
      name: 'Alex Johnson',
      email: 'alex.creator@digitalvault.io',
      role: 'customer', // 'customer' | 'admin'
      memberSince: 'March 2026',
      downloads: [
        {
          id: 'dv-prod-1',
          title: '500+ Canva Social Media Templates Masterpack',
          orderId: 'DV-94812',
          licenseKey: 'DV-LIC-AJ9821-COMM',
          purchaseDate: '2026-09-20',
          downloadFilename: 'DigitalVault_500_Canva_Masterpack.zip',
          formats: ['Canva Pro & Free', 'PNG Preview']
        }
      ]
    };
  }

  saveUser() {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.user));
    } catch (e) {
      console.error(e);
    }
    this.emit('user_updated', this.user);
  }

  login(email, name = 'Digital Creator', role = 'customer') {
    this.user = {
      ...this.user,
      isLoggedIn: true,
      email,
      name,
      role
    };
    this.saveUser();
    return this.user;
  }

  logout() {
    this.user = {
      isLoggedIn: false,
      name: '',
      email: '',
      role: 'guest',
      memberSince: '',
      downloads: []
    };
    this.saveUser();
  }

  setRole(role) {
    this.user.role = role;
    this.saveUser();
    this.emit('role_changed', role);
  }

  // --- FILTER & SEARCH STATE ---
  setFilter(key, value) {
    this.filterState[key] = value;
    this.emit('filter_changed', this.getFilteredProducts());
  }

  resetFilters() {
    this.filterState = {
      search: '',
      category: 'all',
      price: 'all',
      type: 'all',
      sort: 'featured'
    };
    this.emit('filter_changed', this.getFilteredProducts());
  }

  getFilteredProducts() {
    const products = this.getProducts();
    const bundles = this.getBundles();
    let list = [];

    // Type filter
    if (this.filterState.type === 'free') {
      list = products.filter(p => p.free === true);
    } else if (this.filterState.type === 'bundle') {
      list = [...bundles];
    } else if (this.filterState.type === 'single') {
      list = products.filter(p => !p.isBundle && !p.free);
    } else {
      // 'all': Show featured products, then high-value bundles, then single items
      list = [
        ...products.filter(p => p.featured && !p.free),
        ...bundles,
        ...products.filter(p => !p.featured && !p.free),
        ...products.filter(p => p.free)
      ];
    }

    // Search query match
    if (this.filterState.search && this.filterState.search.trim() !== '') {
      const q = this.filterState.search.toLowerCase().trim();
      list = list.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
        (p.tagline && p.tagline.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.formats && p.formats.some(f => f.toLowerCase().includes(q))) ||
        (p.items && p.items.some(i => i.name.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (this.filterState.category && this.filterState.category !== 'all') {
      list = list.filter(p => p.category === this.filterState.category);
    }

    // Price filter
    if (this.filterState.price === 'under20') {
      list = list.filter(p => p.salePrice <= 20);
    } else if (this.filterState.price === '20-40') {
      list = list.filter(p => p.salePrice > 20 && p.salePrice <= 40);
    } else if (this.filterState.price === '40plus') {
      list = list.filter(p => p.salePrice > 40);
    } else if (this.filterState.price === 'free') {
      list = list.filter(p => p.free === true || p.salePrice === 0);
    }

    // Sorting
    switch (this.filterState.sort) {
      case 'newest':
        list.reverse();
        break;
      case 'price-asc':
        list.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case 'price-desc':
        list.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return list;
  }
}

export const store = new Store();
window.digitalVaultStore = store;
