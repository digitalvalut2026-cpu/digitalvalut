import express from 'express';
import { supabase } from '../config/supabase.js';
import { downloadLimiter } from '../middleware/rateLimiter.js';
import { logSecurityAudit } from '../middleware/auth.js';
import { generateR2DownloadUrl, isR2Configured } from '../config/r2.js';

const router = express.Router();

/**
 * GET /api/downloads/:token
 * 
 * TOKEN-GATED ASSET ACCESS
 * Strictly validates single-order cryptographic token and download limits.
 */
router.get('/:token', downloadLimiter, async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length < 32) {
      return res.status(400).json({ success: false, error: 'Invalid download token format' });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database service unavailable' });
    }

    // 1. Fetch order by download token
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email, items, status, download_token, download_token_expires_at, download_count, max_downloads')
      .eq('download_token', token)
      .eq('status', 'paid')
      .single();

    if (error || !order) {
      await logSecurityAudit(req, 'UNAUTHORIZED_DOWNLOAD_ATTEMPT', { tokenPrefix: token.substring(0, 10) });
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Invalid, unpaid, or expired download token.'
      });
    }

    // 2. Expiry check
    if (order.download_token_expires_at && new Date(order.download_token_expires_at) < new Date()) {
      return res.status(403).json({
        success: false,
        error: 'Download token has expired (72-hour validity exceeded). Please request a renewed link.'
      });
    }

    // 3. Download count limit check
    if (order.download_count >= order.max_downloads) {
      return res.status(403).json({
        success: false,
        error: `Maximum download limit of ${order.max_downloads} reached for this order.`
      });
    }

    // 4. Increment download count
    await supabase
      .from('orders')
      .update({ download_count: order.download_count + 1 })
      .eq('id', order.id);

    // 5. Gather secure deliverables for each item in the order
    const deliverableItems = [];

    for (const item of order.items) {
      if (item.type === 'bundle') {
        const { data: bundle } = await supabase
          .from('bundles')
          .select('id, title, deliverable_secret_url, deliverable_instructions')
          .eq('id', item.id)
          .single();

        if (bundle) {
          let deliverableUrl = bundle.deliverable_secret_url;
          if (deliverableUrl && (deliverableUrl.startsWith('r2://') || (!deliverableUrl.startsWith('http') && deliverableUrl.endsWith('.zip'))) && isR2Configured) {
            try {
              deliverableUrl = await generateR2DownloadUrl(deliverableUrl, 3600);
            } catch (r2Err) {
              console.warn('R2 signing error for bundle:', r2Err.message);
            }
          }

          deliverableItems.push({
            id: bundle.id,
            title: bundle.title,
            type: 'bundle',
            url: deliverableUrl,
            instructions: bundle.deliverable_instructions
          });
        }
      } else {
        const { data: prod } = await supabase
          .from('products')
          .select('id, title, deliverable_type, deliverable_secret_url, deliverable_instructions')
          .eq('id', item.id)
          .single();

        if (prod) {
          let deliverableUrl = prod.deliverable_secret_url;
          if (deliverableUrl && (deliverableUrl.startsWith('r2://') || (!deliverableUrl.startsWith('http') && (deliverableUrl.endsWith('.zip') || deliverableUrl.endsWith('.pdf')))) && isR2Configured) {
            try {
              deliverableUrl = await generateR2DownloadUrl(deliverableUrl, 3600);
            } catch (r2Err) {
              console.warn('R2 signing error for product:', r2Err.message);
            }
          }

          deliverableItems.push({
            id: prod.id,
            title: prod.title,
            type: 'product',
            deliverable_type: prod.deliverable_type,
            url: deliverableUrl,
            instructions: prod.deliverable_instructions
          });
        }
      }
    }

    res.json({
      success: true,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      downloadsRemaining: order.max_downloads - (order.download_count + 1),
      deliverables: deliverableItems
    });

  } catch (err) {
    console.error('Download delivery error:', err);
    res.status(500).json({ success: false, error: 'Internal delivery error' });
  }
});

/**
 * POST /api/downloads/lookup-order
 * Customer downloads lookup by verified Email & Order Number
 */
router.post('/lookup-order', downloadLimiter, async (req, res) => {
  try {
    const { email, orderNumber } = req.body;

    if (!email || !orderNumber) {
      return res.status(400).json({ success: false, error: 'Email and Order Number are required' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('order_number, customer_name, customer_email, items, status, download_token, created_at, total')
      .eq('order_number', orderNumber.trim())
      .ilike('customer_email', email.trim().toLowerCase())
      .eq('status', 'paid')
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, error: 'No paid order found matching these credentials.' });
    }

    res.json({
      success: true,
      order: {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        date: order.created_at,
        total: order.total,
        downloadToken: order.download_token
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: 'Lookup failed' });
  }
});

export default router;
