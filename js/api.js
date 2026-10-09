// Digital Vault - Central API Client Service
// Communicates with the Railway Node.js backend & Supabase

import { API_BASE_URL } from './config.js';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getAdminToken() {
    return sessionStorage.getItem('dv_admin_token') || localStorage.getItem('dv_admin_token');
  }

  setAdminToken(token) {
    if (token) {
      sessionStorage.setItem('dv_admin_token', token);
    } else {
      sessionStorage.removeItem('dv_admin_token');
      localStorage.removeItem('dv_admin_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const adminToken = this.getAdminToken();
    if (adminToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error((data && data.error) || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`[API Error] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // --- Public Store APIs ---

  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/products${query ? '?' + query : ''}`);
  }

  async getProduct(id) {
    return this.request(`/api/products/${encodeURIComponent(id)}`);
  }

  async getBundles() {
    return this.request('/api/products/bundles/all');
  }

  async getCategories() {
    return this.request('/api/products/categories/all');
  }

  async validateCoupon(code, cartSubtotal) {
    return this.request('/api/products/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartSubtotal })
    });
  }

  // --- Razorpay Payment & Verification APIs ---

  async createRazorpayOrder({ items, customer, couponCode }) {
    return this.request('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ items, customer, couponCode })
    });
  }

  async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    return this.request('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      })
    });
  }

  // --- Secure Downloads APIs ---

  async fetchDownloadDeliverables(token) {
    return this.request(`/api/downloads/${encodeURIComponent(token)}`);
  }

  async lookupOrderByEmail(email, orderNumber) {
    return this.request('/api/downloads/lookup-order', {
      method: 'POST',
      body: JSON.stringify({ email, orderNumber })
    });
  }

  // --- Admin APIs (Protected by JWT) ---

  async adminLogin(username, password, pin) {
    const res = await this.request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, pin })
    });

    if (res && res.token) {
      this.setAdminToken(res.token);
    }
    return res;
  }

  async getAdminOverview() {
    return this.request('/api/admin/overview');
  }

  async getAdminOrders(status = 'all') {
    return this.request(`/api/admin/orders?status=${encodeURIComponent(status)}`);
  }

  async saveProduct(productData) {
    return this.request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return this.request(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }

  async getAuditLogs() {
    return this.request('/api/admin/audit-logs');
  }
}

export const api = new ApiService();
