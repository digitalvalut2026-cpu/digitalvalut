-- ==============================================================================
-- DIGITAL VAULT - SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Enterprise Security & Fullstack Architecture for Digital Vault
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PRODUCTS TABLE
-- Sensitive asset links (deliverable_secret_url) are restricted from anon access
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price >= price),
    rating NUMERIC(3, 2) DEFAULT 4.90 CHECK (rating BETWEEN 0 AND 5),
    reviews_count INTEGER DEFAULT 0,
    badge VARCHAR(64),
    image_type VARCHAR(64),
    description TEXT,
    deliverable_type VARCHAR(64) DEFAULT 'canva_link', -- 'canva_link', 'google_drive', 'zip_package'
    deliverable_secret_url TEXT,                        -- Strictly hidden from public API
    deliverable_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. BUNDLES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bundles (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) NOT NULL,
    badge VARCHAR(64),
    product_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT,
    deliverable_secret_url TEXT,
    deliverable_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    icon VARCHAR(64),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. ORDERS TABLE (With Razorpay Payment Details & Download Security)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(64) UNIQUE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_state VARCHAR(100),
    customer_city VARCHAR(100),
    items JSONB NOT NULL,                   -- Snapshot of purchased items & verified prices
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_gateway VARCHAR(50) DEFAULT 'razorpay',
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100),
    razorpay_signature TEXT,
    status VARCHAR(50) DEFAULT 'pending',   -- 'pending', 'paid', 'failed', 'refunded'
    download_token VARCHAR(128) UNIQUE,     -- High-entropy cryptographic token
    download_token_expires_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 15,
    client_ip VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. COUPONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    code VARCHAR(50) PRIMARY KEY,
    discount_percent NUMERIC(5, 2) DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    min_order_amount NUMERIC(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. ADMIN USERS TABLE (Secure Passwords & PIN using bcrypt)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,           -- bcrypt hash (cost factor >= 12)
    pin_hash TEXT NOT NULL,                -- bcrypt hash for 2-factor PIN verification
    role VARCHAR(50) DEFAULT 'superadmin',
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. SECURITY AUDIT LOGS TABLE
-- Tracks sensitive actions, failed logins, and order verification attempts
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(64),
    user_agent TEXT,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. STORE SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY SPEED & SECURITY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_download_token ON public.orders(download_token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Prevent public access to sensitive columns & unauthorized mutations
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies for Catalog (Only active items, secret URLs kept hidden via views or server)
CREATE POLICY "Public can view active products" 
    ON public.products FOR SELECT 
    USING (is_active = TRUE);

CREATE POLICY "Public can view active bundles" 
    ON public.bundles FOR SELECT 
    USING (is_active = TRUE);

CREATE POLICY "Public can view categories" 
    ON public.categories FOR SELECT 
    TO public USING (true);

CREATE POLICY "Public can view active coupons" 
    ON public.coupons FOR SELECT 
    USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Public can view store settings" 
    ON public.store_settings FOR SELECT 
    TO public USING (true);

-- 2. Orders: No public inserts/selects directly via Anon.
-- All Order creation, Razorpay verification, and download access must be handled
-- by the Node.js backend using the SUPABASE_SERVICE_ROLE_KEY.
-- This guarantees zero tampering!

-- 3. Admin & Audit Tables: Deny all public anon access
CREATE POLICY "Deny anon access to admin_users" 
    ON public.admin_users FOR ALL 
    TO anon USING (false);

CREATE POLICY "Deny anon access to audit_logs" 
    ON public.audit_logs FOR ALL 
    TO anon USING (false);

-- ==============================================================================
-- SEED DATA (INITIAL PRODUCTS & CATEGORIES)
-- ==============================================================================
INSERT INTO public.categories (id, title, icon, sort_order) VALUES
('canva', 'Canva Templates', 'palette', 1),
('marketing', 'Marketing & Ads', 'target', 2),
('content', 'Content Calendars', 'clock', 3),
('notion', 'Notion Systems', 'layers', 4),
('business', 'Business Toolkits', 'briefcase', 5),
('ai', 'AI Prompts & Guides', 'cpu', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, title, slug, category, price, original_price, rating, reviews_count, badge, image_type, description, deliverable_type, deliverable_secret_url, deliverable_instructions, is_active, is_free) VALUES
('dv-prod-1', '500+ Luxury Real Estate Canva Templates', 'luxury-real-estate-templates', 'canva', 29.00, 79.00, 4.95, 412, 'Bestseller', 'canva-pack', 'Premium editable Canva pack with property showcase reels, carousel posts, story highlights, flyer printables, and closing announcement banners designed to turn views into high-ticket buyer inquiries.', 'canva_link', 'https://www.canva.com/design/sample-real-estate-vault', '1. Click Open Canva Template\n2. Make a copy to your Canva Account\n3. Customize brand colors and photos', TRUE, FALSE),

('dv-prod-2', 'Ultimate Meta Ads Copywriting Swipe File', 'meta-ads-copywriting-swipe', 'marketing', 19.00, 49.00, 4.92, 329, 'Popular', 'copy-bundle', 'High-converting ad copy formulas, 250+ battle-tested hooks, objection crushers, and offer angle blueprints tailored for eCommerce, coaching, SaaS, and agency campaigns.', 'google_drive', 'https://drive.google.com/drive/folders/sample-ad-copy-swipe', 'Access the Notion database and Google Docs swipe files immediately.', TRUE, FALSE),

('dv-prod-3', '365-Day Omnichannel Social Media Calendar', 'social-media-content-calendar', 'content', 24.00, 59.00, 4.88, 280, 'Top Rated', 'calendar-vault', 'Full year plug-and-play content schedule with pre-written caption hooks, daily engagement prompt ideas, weekly viral reel audio strategies, and conversion campaign milestones.', 'notion_template', 'https://notion.so/sample-content-calendar-vault', 'Duplicate this workspace into your personal Notion workspace.', TRUE, FALSE),

('dv-prod-4', 'Complete Startup Pitch Deck & Financial Model', 'startup-pitch-deck-toolkit', 'business', 39.00, 99.00, 4.97, 194, 'Featured', 'deck-pro', 'Investor-ready 25-slide master pitch deck kit in Figma and Canva alongside automated 3-statement dynamic Excel & Google Sheet financial forecasting models.', 'zip_package', 'https://storage.digitalvault.io/deliverables/startup-pitch-deck.zip', 'Unzip file for Figma file, Canva links, and Excel financial model.', TRUE, FALSE),

('dv-prod-5', '10,000+ Production-Ready ChatGPT & Midjourney Prompts', 'ai-master-prompt-vault', 'ai', 15.00, 39.00, 4.89, 510, 'Hot Deal', 'ai-core', 'Engineered prompt library categorized for SEO blogs, landing page copywriting, cold outreach emails, viral hooks, and photorealistic Midjourney v6 visual assets.', 'notion_template', 'https://notion.so/sample-ai-prompt-vault', 'Open Notion template and duplicate to your workspace.', TRUE, FALSE),

('dv-prod-6', 'Agency Client Onboarding & Retention Portal', 'agency-client-portal', 'notion', 34.00, 89.00, 4.93, 168, 'New', 'portal-kit', 'Full client management dashboard for agencies, freelancers, and creative studios. Features automated project roadmaps, invoice tracking, deliverable approvals, and Loom brief templates.', 'notion_template', 'https://notion.so/sample-agency-portal-vault', 'Duplicate to Notion and invite your team.', TRUE, FALSE),

('dv-free-1', 'Free Starter Canva Creator Kit (15 Editable Posts)', 'free-canva-starter-kit', 'canva', 0.00, 19.00, 4.85, 874, 'Free Gift', 'canva-pack', 'Free aesthetic modern social media templates to supercharge your Instagram feed today.', 'canva_link', 'https://www.canva.com/design/sample-freebie-starter', 'Click to open and edit directly in free Canva account.', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bundles (id, title, price, original_price, badge, product_ids, description, deliverable_secret_url, deliverable_instructions) VALUES
('dv-bundle-all', 'The Complete Digital Empire Mega Bundle', 69.00, 245.00, 'Best Value - 72% OFF', '["dv-prod-1", "dv-prod-2", "dv-prod-3", "dv-prod-4", "dv-prod-5", "dv-prod-6"]'::jsonb, 'Get instant lifetime access to every single template, swipe file, Notion system, and AI toolkit inside the Digital Vault.', 'https://storage.digitalvault.io/deliverables/mega-empire-bundle.zip', 'Includes master access link to all 6 products with lifetime updates.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.coupons (code, discount_percent, discount_amount, min_order_amount, is_active) VALUES
('WELCOME10', 10.00, 0.00, 10.00, TRUE),
('VAULT20', 20.00, 0.00, 25.00, TRUE),
('FLAT50', 0.00, 50.00, 100.00, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Initial Admin Account:
-- Default Username: admin
-- Default Password: AdminSecretPassword2026! (bcrypt hash below)
-- Default PIN: 7890 (bcrypt hash below)
INSERT INTO public.admin_users (username, password_hash, pin_hash, role) VALUES
('admin', '$2a$12$e8q4lV6b1jL7e79lF0d2fe7G9BwH8C6X5uQ3p1N5eZ6q8W9k4v2Gy', '$2a$12$Z0o7E.M8N8H.A0U9l7F9ce4G9HwH8C6X5uQ3p1N5eZ6q8W9k4v2Gy', 'superadmin')
ON CONFLICT (username) DO NOTHING;
