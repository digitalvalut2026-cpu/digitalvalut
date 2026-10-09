// Digital Vault - Environment & Deployment Configuration
// Automatically adapts between local development, Railway backend, and Cloudflare Pages

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.')
);

// CONFIGURE YOUR PRODUCTION RAILWAY BACKEND URL HERE
// If deployed fullstack on Railway, window.location.origin is automatically used!
export const PRODUCTION_API_URL = window.DIGITAL_VAULT_API_URL || window.location.origin;

export const API_BASE_URL = isLocalhost 
  ? 'http://localhost:5000' 
  : PRODUCTION_API_URL;

export const CONFIG = {
  apiBaseUrl: API_BASE_URL,
  isLocal: isLocalhost,
  currency: 'INR',
  currencySymbol: '₹',
  supportEmail: 'support@digitalvault.io'
};
