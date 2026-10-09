import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/products
 * Fetch all active products (Deliverable secret URLs are omitted for security!)
 */
router.get('/', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database service unavailable' });
    }

    const { category, search, sort } = req.query;

    let query = supabase
      .from('products')
      .select('id, title, slug, category, price, original_price, rating, reviews_count, badge, image_type, description, is_active, is_free, created_at')
      .eq('is_active', true);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (sort === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'rating') {
      query = query.order('rating', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve products' });
  }
});

/**
 * GET /api/products/:id
 * Retrieve single product details (Deliverable secret URLs are excluded)
 */
router.get('/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database service unavailable' });
    }

    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('id, title, slug, category, price, original_price, rating, reviews_count, badge, image_type, description, is_active, is_free, created_at')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve product details' });
  }
});

/**
 * GET /api/bundles
 * Fetch active bundles
 */
router.get('/bundles/all', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database service unavailable' });
    }

    const { data, error } = await supabase
      .from('bundles')
      .select('id, title, price, original_price, badge, product_ids, description, is_active, created_at')
      .eq('is_active', true);

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve bundles' });
  }
});

/**
 * GET /api/categories
 * Fetch product categories
 */
router.get('/categories/all', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database service unavailable' });
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve categories' });
  }
});

/**
 * POST /api/coupons/validate
 * Validate coupon code on the server (Prevents discount spoofing)
 */
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, cartSubtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Coupon code is required' });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database service unavailable' });
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or expired coupon code' });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: 'This coupon has expired' });
    }

    const subtotal = Number(cartSubtotal) || 0;
    if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount)) {
      return res.status(400).json({
        success: false,
        error: `Coupon requires minimum order of ₹${coupon.min_order_amount}`
      });
    }

    let discount = 0;
    if (coupon.discount_percent > 0) {
      discount = (subtotal * Number(coupon.discount_percent)) / 100;
    } else if (coupon.discount_amount > 0) {
      discount = Number(coupon.discount_amount);
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discount: Math.min(discount, subtotal),
        discount_percent: coupon.discount_percent,
        discount_amount: coupon.discount_amount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to validate coupon' });
  }
});

export default router;
