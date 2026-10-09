import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { requireAdminAuth, logSecurityAudit } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_change_in_production';

/**
 * POST /api/admin/login
 * High-Security Admin Authentication (bcrypt + PIN + Rate Limiting + JWT)
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password, pin } = req.body;

    if (!username || !password || !pin) {
      return res.status(400).json({ success: false, error: 'Username, password, and 4-digit PIN are required.' });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database service is offline' });
    }

    // 1. Fetch admin user from Supabase
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username.trim())
      .single();

    if (error || !adminUser) {
      await logSecurityAudit(req, 'ADMIN_LOGIN_FAILED_UNKNOWN_USER', { username });
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    // 2. Lockout verification
    if (adminUser.locked_until && new Date(adminUser.locked_until) > new Date()) {
      return res.status(403).json({
        success: false,
        error: 'Account temporarily locked due to previous failed attempts. Try again later.'
      });
    }

    // 3. Verify Password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);

    // 4. Verify PIN using bcrypt
    const isPinValid = await bcrypt.compare(String(pin), adminUser.pin_hash);

    if (!isPasswordValid || !isPinValid) {
      const failedCount = (adminUser.failed_attempts || 0) + 1;
      let lockoutDate = null;

      if (failedCount >= 5) {
        lockoutDate = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min lock
      }

      await supabase
        .from('admin_users')
        .update({
          failed_attempts: failedCount,
          locked_until: lockoutDate
        })
        .eq('id', adminUser.id);

      await logSecurityAudit(req, 'ADMIN_LOGIN_PASSWORD_MISMATCH', {
        username,
        failedAttempts: failedCount
      });

      return res.status(401).json({ success: false, error: 'Invalid password or PIN.' });
    }

    // 5. Successful login: Reset failed attempts & issue JWT
    await supabase
      .from('admin_users')
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString()
      })
      .eq('id', adminUser.id);

    const token = jwt.sign(
      {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role || 'superadmin'
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    await logSecurityAudit(req, 'ADMIN_LOGIN_SUCCESS', { username: adminUser.username });

    res.json({
      success: true,
      token,
      admin: {
        username: adminUser.username,
        role: adminUser.role
      }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, error: 'Login verification failed.' });
  }
});

/**
 * GET /api/admin/overview
 * Real-time business metrics from Supabase
 */
router.get('/overview', requireAdminAuth, async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ success: false, error: 'DB offline' });

    // Orders summary
    const { data: paidOrders, error: orderErr } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'paid');

    const totalRevenue = (paidOrders || []).reduce((acc, curr) => acc + Number(curr.total || 0), 0);
    const paidOrdersCount = (paidOrders || []).length;

    // Total products count
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Total bundles count
    const { count: bundlesCount } = await supabase
      .from('bundles')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      metrics: {
        totalRevenue: Math.round(totalRevenue),
        ordersCount: paidOrdersCount,
        productsCount: productsCount || 0,
        bundlesCount: bundlesCount || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve overview metrics' });
  }
});

/**
 * GET /api/admin/orders
 * Retrieve orders list
 */
router.get('/orders', requireAdminAuth, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, orders: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve orders' });
  }
});

/**
 * POST /api/admin/products
 * Add or Edit a product (Protected)
 */
router.post('/products', requireAdminAuth, async (req, res) => {
  try {
    const productData = req.body;

    if (!productData.id || !productData.title || productData.price === undefined) {
      return res.status(400).json({ success: false, error: 'ID, title, and price are required.' });
    }

    const { data, error } = await supabase
      .from('products')
      .upsert([productData])
      .select()
      .single();

    if (error) throw error;

    await logSecurityAudit(req, 'PRODUCT_UPSERTED', { productId: productData.id });
    res.json({ success: true, product: data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save product' });
  }
});

/**
 * DELETE /api/admin/products/:id
 * Delete a product (Protected)
 */
router.delete('/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await logSecurityAudit(req, 'PRODUCT_DELETED', { productId: id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

/**
 * GET /api/admin/audit-logs
 * Security Audit Log Inspector
 */
router.get('/audit-logs', requireAdminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json({ success: true, logs: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve audit logs' });
  }
});

export default router;
