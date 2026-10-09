import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabase } from '../config/supabase.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_change_in_production';

/**
 * Middleware: Verify Admin JWT Token
 */
export function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Admin authentication token is required.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || decoded.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient privileges.'
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired admin session token.'
    });
  }
}

/**
 * Helper: Record Security Audit Logs to Supabase
 */
export async function logSecurityAudit(req, action, details = {}) {
  try {
    if (!supabase) return;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await supabase.from('audit_logs').insert([{
      ip_address: String(ip).split(',')[0].trim(),
      user_agent: userAgent,
      action: action,
      details: details,
      created_at: new Date().toISOString()
    }]);
  } catch (e) {
    console.error('Audit log failed:', e.message);
  }
}
