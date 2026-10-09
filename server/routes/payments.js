import express from 'express';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { razorpay } from '../config/razorpay.js';
import { orderCreationLimiter } from '../middleware/rateLimiter.js';
import { logSecurityAudit } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/payments/create-order
 * 
 * CRITICAL SECURITY ARCHITECTURE:
 * Never trust client prices! The backend queries Supabase to calculate
 * the true prices and amounts before creating the Razorpay order.
 */
router.post('/create-order', orderCreationLimiter, async (req, res) => {
  try {
    const { items, customer, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart cannot be empty.' });
    }

    if (!customer || !customer.email || !customer.name) {
      return res.status(400).json({ success: false, error: 'Customer name and valid email are required.' });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database service is currently offline.' });
    }

    // 1. Fetch item prices strictly from Supabase
    let verifiedItems = [];
    let verifiedSubtotal = 0;

    for (const item of items) {
      if (item.type === 'bundle') {
        const { data: bundle } = await supabase
          .from('bundles')
          .select('id, title, price')
          .eq('id', item.id)
          .eq('is_active', true)
          .single();

        if (bundle) {
          const itemPrice = Number(bundle.price);
          verifiedItems.push({
            id: bundle.id,
            title: bundle.title,
            type: 'bundle',
            price: itemPrice
          });
          verifiedSubtotal += itemPrice;
        }
      } else {
        const { data: prod } = await supabase
          .from('products')
          .select('id, title, price, is_free')
          .eq('id', item.id)
          .eq('is_active', true)
          .single();

        if (prod) {
          const itemPrice = prod.is_free ? 0 : Number(prod.price);
          verifiedItems.push({
            id: prod.id,
            title: prod.title,
            type: 'product',
            price: itemPrice
          });
          verifiedSubtotal += itemPrice;
        }
      }
    }

    if (verifiedItems.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid products found for checkout.' });
    }

    // 2. Server-side coupon discount calculation
    let verifiedDiscount = 0;
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (coupon && (!coupon.expires_at || new Date(coupon.expires_at) > new Date())) {
        if (!coupon.min_order_amount || verifiedSubtotal >= Number(coupon.min_order_amount)) {
          if (coupon.discount_percent > 0) {
            verifiedDiscount = (verifiedSubtotal * Number(coupon.discount_percent)) / 100;
          } else if (coupon.discount_amount > 0) {
            verifiedDiscount = Number(coupon.discount_amount);
          }
        }
      }
    }

    const verifiedTotal = Math.max(0, verifiedSubtotal - verifiedDiscount);
    const orderNumber = 'DV-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);

    // Free order fulfillment (e.g. 100% discount or freebie items)
    if (verifiedTotal === 0) {
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

      const { data: freeOrder, error: freeErr } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_name: customer.name.trim(),
          customer_email: customer.email.trim().toLowerCase(),
          customer_phone: customer.phone || '',
          customer_state: customer.state || '',
          customer_city: customer.city || '',
          items: verifiedItems,
          subtotal: verifiedSubtotal,
          discount: verifiedDiscount,
          total: 0,
          currency: 'INR',
          payment_gateway: 'free',
          status: 'paid',
          download_token: downloadToken,
          download_token_expires_at: tokenExpiresAt,
          client_ip: req.ip
        }])
        .select()
        .single();

      if (freeErr) throw freeErr;

      return res.json({
        success: true,
        isFree: true,
        orderNumber: orderNumber,
        downloadToken: downloadToken
      });
    }

    // 3. Create Official Razorpay Order
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay payment gateway is not configured on the server. Please check .env credentials.'
      });
    }

    const razorpayOptions = {
      amount: Math.round(verifiedTotal * 100), // Razorpay operates in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        customerEmail: customer.email,
        customerName: customer.name
      }
    };

    const rzpOrder = await razorpay.orders.create(razorpayOptions);

    // 4. Record Pending Order in Supabase
    const { error: insertErr } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: customer.name.trim(),
        customer_email: customer.email.trim().toLowerCase(),
        customer_phone: customer.phone || '',
        customer_state: customer.state || '',
        customer_city: customer.city || '',
        items: verifiedItems,
        subtotal: verifiedSubtotal,
        discount: verifiedDiscount,
        total: verifiedTotal,
        currency: 'INR',
        payment_gateway: 'razorpay',
        razorpay_order_id: rzpOrder.id,
        status: 'pending',
        client_ip: req.ip
      }]);

    if (insertErr) throw insertErr;

    res.json({
      success: true,
      orderId: rzpOrder.id,
      orderNumber: orderNumber,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }
    });

  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: 'Failed to create payment order.' });
  }
});

/**
 * POST /api/payments/verify
 * 
 * CRITICAL CRYPTOGRAPHIC SIGNATURE VERIFICATION
 * Uses HMAC-SHA256 with RAZORPAY_KEY_SECRET to guarantee that payment was genuine.
 */
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Incomplete payment payload' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ success: false, error: 'Server payment key missing' });
    }

    // Cryptographic verification
    const bodyToSign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(bodyToSign.toString())
      .digest('hex');

    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isSignatureValid) {
      await logSecurityAudit(req, 'PAYMENT_SIGNATURE_TAMPERING_DETECTED', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });

      return res.status(400).json({
        success: false,
        error: 'Security verification failed: Invalid payment signature.'
      });
    }

    // Generate high-entropy 64-char download token
    const downloadToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72 hours valid

    // Update Order to PAID status in Supabase
    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        download_token: downloadToken,
        download_token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();

    if (updateErr || !updatedOrder) {
      console.error('Failed to update order status:', updateErr);
      return res.status(500).json({ success: false, error: 'Failed to record paid order.' });
    }

    await logSecurityAudit(req, 'ORDER_PAID_SUCCESS', {
      orderNumber: updatedOrder.order_number,
      total: updatedOrder.total
    });

    res.json({
      success: true,
      message: 'Payment verified successfully!',
      orderNumber: updatedOrder.order_number,
      downloadToken: downloadToken,
      orderDetails: {
        total: updatedOrder.total,
        customerName: updatedOrder.customer_name,
        customerEmail: updatedOrder.customer_email,
        itemsCount: updatedOrder.items.length
      }
    });

  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay Webhook for server-to-server confirmation
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !webhookSignature) {
      return res.status(200).json({ received: true });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (expectedSignature === webhookSignature) {
      const event = JSON.parse(req.body.toString());
      if (event.event === 'order.paid' || event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;

        // Auto-fulfill if pending
        const downloadToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

        await supabase
          .from('orders')
          .update({
            status: 'paid',
            razorpay_payment_id: payment.id,
            download_token: downloadToken,
            download_token_expires_at: tokenExpiresAt,
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', razorpayOrderId)
          .eq('status', 'pending');
      }
    }

    res.json({ status: 'ok' });
  } catch (e) {
    res.status(200).json({ status: 'ignored' });
  }
});

export default router;
