// Digital Vault - Seed Database & Initial Mock Data
// All data can be edited dynamically from the Admin Panel and persists in localStorage.

export const initialData = {
  trustStats: [
    { id: 'stat-1', number: '10,000+', label: 'Digital Resources', icon: 'layers' },
    { id: 'stat-2', number: 'Instant', label: 'Downloads Access', icon: 'zap' },
    { id: 'stat-3', number: 'Affordable', label: 'Transparent Pricing', icon: 'tag' },
    { id: 'stat-4', number: 'Commercial', label: 'Friendly Licenses', icon: 'shield-check' },
    { id: 'stat-5', number: 'Regularly', label: 'Updated Content', icon: 'refresh-cw' }
  ],

  categories: [
    {
      id: 'canva-templates',
      name: 'Canva Templates',
      slug: 'canva-templates',
      icon: 'palette',
      description: 'Fully editable Canva Pro & Free templates ready to brand in minutes.',
      productCount: 142
    },
    {
      id: 'social-media',
      name: 'Social Media',
      slug: 'social-media',
      icon: 'share-2',
      description: 'Carousels, story frames, reels hooks, and viral post graphics.',
      productCount: 88
    },
    {
      id: 'digital-marketing',
      name: 'Digital Marketing',
      slug: 'digital-marketing',
      icon: 'trending-up',
      description: 'Funnels, lead magnet templates, email sequences, and checklists.',
      productCount: 64
    },
    {
      id: 'advertising',
      name: 'Advertising',
      slug: 'advertising',
      icon: 'target',
      description: 'High-converting Meta, Google, and TikTok ad copy & creative packs.',
      productCount: 52
    },
    {
      id: 'content-creation',
      name: 'Content Creation',
      slug: 'content-creation',
      icon: 'feather',
      description: 'Content calendars, prompt banks, video scripts, and swipe files.',
      productCount: 76
    },
    {
      id: 'business-resources',
      name: 'Business Resources',
      slug: 'business-resources',
      icon: 'briefcase',
      description: 'SOPs, client contracts, project trackers, and financial sheets.',
      productCount: 45
    },
    {
      id: 'ai-prompts',
      name: 'AI Prompts',
      slug: 'ai-prompts',
      icon: 'cpu',
      description: 'Battle-tested ChatGPT, Midjourney, and Claude prompt collections.',
      productCount: 39
    },
    {
      id: 'ebooks-guides',
      name: 'Ebooks & Guides',
      slug: 'ebooks-guides',
      icon: 'book-open',
      description: 'Actionable playbooks, strategy blueprints, and PDF toolkits.',
      productCount: 31
    },
    {
      id: 'freelancer-resources',
      name: 'Freelancer Resources',
      slug: 'freelancer-resources',
      icon: 'user-check',
      description: 'Proposal templates, invoices, onboarding workflows, and rate cards.',
      productCount: 48
    },
    {
      id: 'branding-design',
      name: 'Branding & Design',
      slug: 'branding-design',
      icon: 'sparkles',
      description: 'Brand style guidelines, color palettes, vector icons, and typography kits.',
      productCount: 56
    }
  ],

  products: [
    {
      id: 'dv-prod-1',
      title: '500+ Canva Social Media Templates Masterpack',
      slug: '500-canva-social-media-templates',
      shortDescription: 'Modern, viral Instagram carousel posts, reels covers, and Pinterest pins optimized for engagement.',
      category: 'canva-templates',
      categoryName: 'Canva Templates',
      regularPrice: 999,
      salePrice: 499,
      discount: 50,
      rating: 4.9,
      reviewsCount: 384,
      templateCount: '500+ Templates',
      formats: ['Canva Pro & Free', 'PNG Preview', 'Color Guides'],
      featured: true,
      free: false,
      isBundle: false,
      badge: 'Best Seller',
      imageType: 'canva-pack',
      whatIncluded: [
        '250 Carousel slide layouts (1080x1350)',
        '150 Reel & TikTok cover templates (1080x1920)',
        '100 Quote & engagement single graphics (1080x1080)',
        'Click-to-import Canva direct access links',
        'Commercial lifetime usage rights',
        'Free lifetime updates'
      ],
      compatibility: 'Canva (Free & Pro accounts) on Desktop, iPad, and Mobile',
      targetAudience: 'Content creators, social media managers, marketing agencies, and indie founders.',
      howItWorks: [
        '1. Purchase & receive instant direct link to your personal Canva account',
        '2. Change colors, fonts, images, and text with 1 click',
        '3. Export directly to Instagram, LinkedIn, or schedule via your favorite tool'
      ],
      license: 'Commercial License: Use for unlimited client & personal projects. Reselling template files directly is prohibited.',
      downloadFilename: 'DigitalVault_500_Canva_Masterpack.zip'
    },
    {
      id: 'dv-prod-2',
      title: '100 Premium Meta Ad Primary Texts & Hook Formulas',
      slug: '100-meta-ad-primary-texts',
      shortDescription: 'Tested copywriting swipe files and psychological hooks for Facebook, Instagram, and TikTok ads.',
      category: 'advertising',
      categoryName: 'Advertising',
      regularPrice: 799,
      salePrice: 399,
      discount: 50,
      rating: 4.8,
      reviewsCount: 219,
      templateCount: '100 Ad Copies',
      formats: ['Notion Database', 'PDF Swipebook', 'Google Sheets'],
      featured: true,
      free: false,
      isBundle: false,
      badge: 'High Conversion',
      imageType: 'ad-copy',
      whatIncluded: [
        '100 Ready-to-adapt primary text variations',
        '50 Irresistible opening hook formulas for video and static ads',
        '15 High-converting headline formulas',
        'Categorized by E-commerce, B2B, Coaching, and SaaS',
        'Notion workspace + clean printable PDF'
      ],
      compatibility: 'Any device, Notion, Google Docs, Apple Notes',
      targetAudience: 'Media buyers, performance marketers, agency copywriters, and DTC brands.',
      howItWorks: [
        '1. Browse by your niche or product angle (curiosity, fear of missing out, proof)',
        '2. Fill in your product name and unique hook into the formula',
        '3. Paste into Ads Manager and test winning variants'
      ],
      license: 'Commercial License: Use in unlimited paid campaigns for yourself and clients.',
      downloadFilename: 'DigitalVault_100_Meta_Ad_Formulas.zip'
    },
    {
      id: 'dv-prod-3',
      title: '365 Days Social Media Content Calendar & Strategy Engine',
      slug: '365-days-social-media-content-calendar',
      shortDescription: 'Complete year of daily post prompts, strategic themes, holiday tie-ins, and performance trackers.',
      category: 'content-creation',
      categoryName: 'Content Creation',
      regularPrice: 1199,
      salePrice: 599,
      discount: 50,
      rating: 5.0,
      reviewsCount: 167,
      templateCount: '365 Content Ideas',
      formats: ['Notion Operating System', 'Google Sheets', 'Excel'],
      featured: true,
      free: false,
      isBundle: false,
      badge: 'Staff Pick',
      imageType: 'calendar',
      whatIncluded: [
        '365 Daily specific content prompts mapped to quarterly goals',
        '52 Weekly educational deep-dive topics',
        'Real-time content pipeline & status tracker in Notion',
        'Key 2026-2027 marketing calendar dates & trending awareness days',
        'Analytics tracking sheet with automated engagement formulas'
      ],
      compatibility: 'Notion, Microsoft Excel, Google Sheets',
      targetAudience: 'Solopreneurs, small business owners, brand managers, and influencers.',
      howItWorks: [
        '1. Duplicate the template into your free Notion workspace',
        '2. Filter by month or content pillar (authority, trust, sell, entertain)',
        '3. Write or delegate posts 30 days in advance'
      ],
      license: 'Commercial License: Suitable for managing personal and client content pipelines.',
      downloadFilename: 'DigitalVault_365_Content_Calendar.zip'
    },
    {
      id: 'dv-prod-4',
      title: 'Ultimate Instagram Content Kit (Reels, Carousels & Stories)',
      slug: 'ultimate-instagram-content-kit',
      shortDescription: 'Aesthetic, high-retention design system built specifically to grow Instagram followers and engagement.',
      category: 'social-media',
      categoryName: 'Social Media',
      regularPrice: 999,
      salePrice: 499,
      discount: 50,
      rating: 4.9,
      reviewsCount: 290,
      templateCount: '240 Assets',
      formats: ['Canva Pro & Free', 'Figma File', 'Vector SVG'],
      featured: true,
      free: false,
      isBundle: false,
      badge: 'Trending',
      imageType: 'instagram-kit',
      whatIncluded: [
        '80 Viral carousel slides with seamless slide transitions',
        '60 Aesthetic Reel cover graphics & text title animations',
        '50 Daily story engagement stickers & poll graphics',
        '50 Highlight cover icons',
        'Figma source file + 1-click Canva template links'
      ],
      compatibility: 'Canva (Free & Pro), Figma',
      targetAudience: 'Instagram creators, coaches, lifestyle brands, visual designers.',
      howItWorks: [
        '1. Open in Canva or Figma with our instant access invite',
        '2. Swap your photo and brand palette in 30 seconds',
        '3. Export directly to your camera roll or scheduling app'
      ],
      license: 'Commercial License: Use for personal brands and unlimited client accounts.',
      downloadFilename: 'DigitalVault_Ultimate_IG_Content_Kit.zip'
    },
    {
      id: 'dv-prod-5',
      title: 'Digital Marketing Starter Bundle',
      slug: 'digital-marketing-starter-bundle',
      shortDescription: 'The foundational toolkit with funnel blueprints, email copy swipes, and client pitch decks.',
      category: 'digital-marketing',
      categoryName: 'Digital Marketing',
      regularPrice: 1599,
      salePrice: 799,
      discount: 50,
      rating: 4.9,
      reviewsCount: 412,
      templateCount: '15 Core Assets',
      formats: ['Notion', 'Canva', 'PDF', 'Google Docs'],
      featured: true,
      free: false,
      isBundle: true,
      badge: 'Popular Bundle',
      imageType: 'marketing-bundle',
      whatIncluded: [
        '7-Step Sales Funnel Blueprint & wireframe map',
        '14-Day Welcome Email Sequence swipe files',
        'Lead Magnet Canva Template (20-page ebook layout)',
        'Agency Client Pitch Deck in Canva & Keynote',
        'Paid Traffic Audit Checklist'
      ],
      compatibility: 'Canva, Notion, Google Docs, PDF Reader',
      targetAudience: 'Agency founders, digital marketers, affiliate creators, startup teams.',
      howItWorks: [
        '1. Access the comprehensive Digital Vault dashboard',
        '2. Deploy battle-tested marketing frameworks into your funnel',
        '3. Convert visitors into paying customers consistently'
      ],
      license: 'Commercial License: Use for your business and client campaigns.',
      downloadFilename: 'DigitalVault_Marketing_Starter_Bundle.zip'
    },
    {
      id: 'dv-prod-6',
      title: '1,000+ Content Ideas & Viral Hooks for Businesses',
      slug: '1000-content-ideas-for-businesses',
      shortDescription: 'Never run out of ideas again. Categorized across 20 industries with proven engagement frameworks.',
      category: 'content-creation',
      categoryName: 'Content Creation',
      regularPrice: 599,
      salePrice: 299,
      discount: 50,
      rating: 4.8,
      reviewsCount: 195,
      templateCount: '1,000 Ideas',
      formats: ['Notion Hub', 'Airtable Base', 'Spreadsheet'],
      featured: true,
      free: false,
      isBundle: false,
      badge: 'High Value',
      imageType: 'content-ideas',
      whatIncluded: [
        '1,000 Categorized content prompts with hook/body/CTA structure',
        'Coverage for 20 distinct industries (SaaS, Real Estate, Fitness, etc.)',
        'Viral TikTok & Reel opening hook generator formula',
        'Sortable Airtable & Notion database',
        'Lifetime access with quarterly updates'
      ],
      compatibility: 'Notion, Airtable, Google Sheets, Excel',
      targetAudience: 'Content teams, social media managers, copywriters, entrepreneurs.',
      howItWorks: [
        '1. Filter ideas by your industry and target customer emotion',
        '2. Use the pre-written script prompts to outline your post or video',
        '3. Publish with confidence knowing the topic has proven demand'
      ],
      license: 'Commercial License: Free to use across all personal and commercial platforms.',
      downloadFilename: 'DigitalVault_1000_Content_Ideas.zip'
    },
    {
      id: 'dv-prod-7',
      title: 'Complete Freelancer Proposal & Client Onboarding System',
      slug: 'complete-freelancer-proposal-onboarding',
      shortDescription: 'High-converting proposal decks, legally sound contract templates, and automated onboarding checklists.',
      category: 'freelancer-resources',
      categoryName: 'Freelancer Resources',
      regularPrice: 999,
      salePrice: 499,
      discount: 50,
      rating: 4.9,
      reviewsCount: 154,
      templateCount: '12 Documents',
      formats: ['Notion Hub', 'Canva Presentation', 'Word & Docs'],
      featured: true,
      free: false,
      isBundle: false,
      badge: 'Agency Grade',
      imageType: 'freelance-kit',
      whatIncluded: [
        'Canva Client Proposal Deck (24-slide customizable deck)',
        'Master Services Agreement & Statement of Work template',
        'Client Welcome Portal in Notion with project roadmap',
        'Invoice and payment receipt templates',
        'Project handover and testimonial request script'
      ],
      compatibility: 'Notion, Canva, Google Docs, Microsoft Word',
      targetAudience: 'Freelance designers, developers, copywriters, and boutique agency owners.',
      howItWorks: [
        '1. Customize with your branding, services, and pricing tiers',
        '2. Send interactive proposals that impress clients and close deals',
        '3. Deliver projects with seamless client portal onboarding'
      ],
      license: 'Commercial License: Use for all your client contracts and business dealings.',
      downloadFilename: 'DigitalVault_Freelancer_System.zip'
    },
    {
      id: 'dv-prod-8',
      title: '2,500+ High-Conversion AI Prompts for Marketers & Creators',
      slug: '2500-ai-prompts-for-marketers',
      shortDescription: 'Targeted prompt engineering library for ChatGPT, Claude, and Midjourney to automate marketing tasks.',
      category: 'ai-prompts',
      categoryName: 'AI Prompts',
      regularPrice: 799,
      salePrice: 399,
      discount: 50,
      rating: 4.9,
      reviewsCount: 320,
      templateCount: '2,500+ Prompts',
      formats: ['Notion Database', 'CSV Export', 'Interactive Search Book'],
      featured: true,
      free: false,
      isBundle: false,
      badge: 'AI Superpack',
      imageType: 'ai-prompts',
      whatIncluded: [
        '500 Copywriting & landing page prompts',
        '400 Email marketing & newsletter generation prompts',
        '600 SEO, keyword strategy, and blog outlining prompts',
        '500 Social media hook & script writing prompts',
        '500 Midjourney visual prompt recipes with style parameters'
      ],
      compatibility: 'ChatGPT-4o, Claude 3.5 Sonnet, Midjourney, Perplexity',
      targetAudience: 'AI-assisted creators, copywriters, founders, productivity enthusiasts.',
      howItWorks: [
        '1. Search prompt bank by task (e.g. "SaaS landing page headline")',
        '2. Fill in the bracketed variables [Product], [Audience], [Benefit]',
        '3. Get instant, high-grade professional output from your favorite LLM'
      ],
      license: 'Commercial License: Use outputs freely in commercial client deliverables.',
      downloadFilename: 'DigitalVault_2500_AI_Prompts.zip'
    },
    {
      id: 'dv-prod-9',
      title: 'Brand Identity & Design System Master Guidelines',
      slug: 'brand-identity-design-system-guidelines',
      shortDescription: 'Professional brand guidelines template to present logos, color palettes, typography, and iconography.',
      category: 'branding-design',
      categoryName: 'Branding & Design',
      regularPrice: 1199,
      salePrice: 599,
      discount: 50,
      rating: 5.0,
      reviewsCount: 112,
      templateCount: '40 Slide System',
      formats: ['Canva Pro & Free', 'Figma Design System', 'PDF Book'],
      featured: true,
      free: false,
      isBundle: false,
      badge: 'Design Standard',
      imageType: 'brand-system',
      whatIncluded: [
        '40-Slide comprehensive brand style guide layout',
        'Color theory & accessible contrast ratio matrix',
        'Typography hierarchy scales & spacing tokens',
        'Logo clearspace and misuse rules',
        'Social media and packaging mockup showcase slides'
      ],
      compatibility: 'Canva, Figma, Adobe InDesign, Illustrator',
      targetAudience: 'Brand designers, agency art directors, startup founders, marketing teams.',
      howItWorks: [
        '1. Duplicate into Canva or Figma',
        '2. Place your client logo, color hex codes, and font choices',
        '3. Export a ₹50,000-grade brand book in under 2 hours'
      ],
      license: 'Commercial License: Deliver completed brand guidelines to paying clients.',
      downloadFilename: 'DigitalVault_Brand_Identity_System.zip'
    },
    // FREEBIE PRODUCTS (Require email signup)
    {
      id: 'dv-free-1',
      title: 'Free 30-Day Social Media Starter Pack',
      slug: 'free-30-day-social-media-starter-pack',
      shortDescription: '30 clean, customizable Canva templates designed to jumpstart your personal brand or agency.',
      category: 'canva-templates',
      categoryName: 'Canva Templates',
      regularPrice: 29,
      salePrice: 0,
      discount: 100,
      rating: 4.8,
      reviewsCount: 520,
      templateCount: '30 Templates',
      formats: ['Canva Direct Link', 'PDF Guide'],
      featured: false,
      free: true,
      isBundle: false,
      badge: '100% Free',
      imageType: 'free-social',
      whatIncluded: [
        '15 Minimalist carousel slides',
        '10 Engagement story templates',
        '5 Reel cover templates',
        'Color palette cheat sheet'
      ],
      compatibility: 'Canva (Free & Pro)',
      targetAudience: 'Beginner creators and creators testing out Digital Vault.',
      howItWorks: ['Enter your email to receive immediate download link and Canva access.'],
      license: 'Personal & Commercial Use License included.',
      downloadFilename: 'DigitalVault_Free_30Day_Pack.zip'
    },
    {
      id: 'dv-free-2',
      title: '25 High-Converting Meta Ad Hook Formulas',
      slug: '25-meta-ad-hook-formulas',
      shortDescription: 'The 25 psychological hooks that generated over ₹1.2 Crore in client ad spend. Direct swipe sheet.',
      category: 'advertising',
      categoryName: 'Advertising',
      regularPrice: 399,
      salePrice: 0,
      discount: 100,
      rating: 4.9,
      reviewsCount: 410,
      templateCount: '25 Formulas',
      formats: ['PDF Cheat Sheet', 'Notion Page'],
      featured: false,
      free: true,
      isBundle: false,
      badge: '100% Free',
      imageType: 'free-ad-hooks',
      whatIncluded: [
        '25 Fill-in-the-blank ad hooks',
        'Analysis of why each hook stops the scroll',
        'Breakdown by niche (E-commerce, B2B, Coaching)'
      ],
      compatibility: 'PDF & Notion',
      targetAudience: 'Copywriters, ad managers, and indie founders.',
      howItWorks: ['Enter your email to unlock instant PDF swipe file.'],
      license: 'Personal & Commercial Use License included.',
      downloadFilename: 'DigitalVault_Free_25_Ad_Hooks.pdf'
    },
    {
      id: 'dv-free-3',
      title: 'Solopreneur Weekly Content Planner (Notion Template)',
      slug: 'solopreneur-weekly-content-planner',
      shortDescription: 'Clean, distraction-free Notion template to brainstorm, draft, and schedule your weekly posts.',
      category: 'content-creation',
      categoryName: 'Content Creation',
      regularPrice: 25,
      salePrice: 0,
      discount: 100,
      rating: 4.9,
      reviewsCount: 312,
      templateCount: '1 Notion Template',
      formats: ['Notion Template', 'Setup Guide'],
      featured: false,
      free: true,
      isBundle: false,
      badge: '100% Free',
      imageType: 'free-notion',
      whatIncluded: [
        'Weekly planning board with kanban workflow',
        'Repurposing checklist for multi-channel distribution',
        'Asset bank for captions and hashtag sets'
      ],
      compatibility: 'Notion (Free Account)',
      targetAudience: 'Solopreneurs, consultants, and indie builders.',
      howItWorks: ['Enter your email to duplicate directly into your Notion workspace.'],
      license: 'Personal & Commercial Use License included.',
      downloadFilename: 'DigitalVault_Free_Notion_Planner.zip'
    },
    {
      id: 'dv-free-4',
      title: '50 Tested AI Prompts for Viral Video Hooks',
      slug: '50-ai-prompts-viral-hooks',
      shortDescription: 'Feed these prompt structures into ChatGPT to generate 20 captivating video intros in under 60 seconds.',
      category: 'ai-prompts',
      categoryName: 'AI Prompts',
      regularPrice: 20,
      salePrice: 0,
      discount: 100,
      rating: 4.8,
      reviewsCount: 280,
      templateCount: '50 Prompts',
      formats: ['PDF Guide', 'Google Doc'],
      featured: false,
      free: true,
      isBundle: false,
      badge: '100% Free',
      imageType: 'free-prompts',
      whatIncluded: [
        '50 AI prompt templates tuned for short-form video hooks',
        'System prompt setup instructions for ChatGPT and Claude',
        'Hook classification: Contradiction, Secret, Question, Warning'
      ],
      compatibility: 'Any LLM (ChatGPT, Claude, Gemini)',
      targetAudience: 'TikTokers, YouTubers, and content creators.',
      howItWorks: ['Enter your email to receive direct PDF toolkit.'],
      license: 'Personal & Commercial Use License included.',
      downloadFilename: 'DigitalVault_Free_50_AI_Hooks.pdf'
    }
  ],

  bundles: [
    {
      id: 'dv-bundle-mega',
      title: 'THE ULTIMATE DIGITAL MARKETING VAULT',
      slug: 'the-ultimate-digital-marketing-vault',
      tagline: 'Everything you need to launch, scale, and automate high-converting campaigns.',
      category: 'digital-marketing',
      categoryName: 'Marketing Suites',
      imageType: 'marketing-bundle',
      templateCount: 'All 6 Masterpacks (3,500+ Assets)',
      formats: ['Canva Pro & Free', 'Notion OS', 'Google Docs', 'PDF'],
      regularPrice: 6999,
      salePrice: 1499,
      savings: 5500,
      discount: 78,
      discountPercent: 78,
      featured: true,
      free: false,
      isBundle: true,
      rating: 5.0,
      reviewsCount: 642,
      badge: '👑 Save 78% (Best Value)',
      items: [
        { name: '500+ Canva Social Media Templates Masterpack', value: '₹999' },
        { name: '100 Premium Meta Ad Primary Texts & Hooks', value: '₹799' },
        { name: '365 Days Social Media Content Calendar (Notion)', value: '₹1,199' },
        { name: '1,000+ Content Ideas & Viral Hooks Engine', value: '₹599' },
        { name: 'Marketing Strategy & SOP Blueprints', value: '₹899' },
        { name: '2,500+ High-Conversion AI Prompts Library', value: '₹799' },
        { name: 'Lifetime Commercial Unlimited License', value: '₹1,705' }
      ],
      bonuses: [
        'Bonus 1: Private Notion Vault with continuous 2026 updates',
        'Bonus 2: 50 High-Converting Email Subject Lines Swipe File',
        'Bonus 3: VIP Priority Support via Email'
      ],
      downloadFilename: 'DigitalVault_Ultimate_Marketing_Vault_MegaBundle.zip'
    },
    {
      id: 'dv-bundle-creator',
      title: 'THE COMPLETE CREATOR & CANVA SUITE',
      slug: 'complete-creator-canva-suite',
      tagline: 'Scale your visual brand on Instagram, LinkedIn, and YouTube without design skills.',
      category: 'canva-templates',
      categoryName: 'Canva Suites',
      imageType: 'instagram-kit',
      templateCount: '4 Core Kits (800+ Templates)',
      formats: ['Canva Direct Import', 'Figma Files', 'PNG Previews'],
      regularPrice: 4499,
      salePrice: 999,
      savings: 3500,
      discount: 78,
      discountPercent: 78,
      featured: true,
      free: false,
      isBundle: true,
      rating: 4.9,
      reviewsCount: 310,
      badge: '🎨 Most Popular for Creators',
      items: [
        { name: '500+ Canva Social Media Templates', value: '₹999' },
        { name: 'Ultimate Instagram Content Kit (Carousels & Reels)', value: '₹999' },
        { name: 'Brand Identity & Design System Guidelines', value: '₹1,199' },
        { name: 'YouTube & Carousel Cover Art Pack', value: '₹1,302' }
      ],
      bonuses: [
        'Bonus 1: 100 Minimalist Line Art Vector Icons (SVG)',
        'Bonus 2: Canva Keyboard Shortcuts Quick Cheatsheet'
      ],
      downloadFilename: 'DigitalVault_Complete_Creator_Suite.zip'
    },
    {
      id: 'dv-bundle-solopreneur',
      title: 'THE SOLOPRENEUR BUSINESS ACCELERATOR',
      slug: 'solopreneur-business-accelerator',
      tagline: 'Standardize operations, proposals, client contracts, and weekly marketing.',
      category: 'business-resources',
      categoryName: 'Business Suites',
      imageType: 'freelance-kit',
      templateCount: '4 Systems (Contracts + SOPs + CRM)',
      formats: ['Notion Workspace', 'Google Docs', 'Spreadsheets'],
      regularPrice: 4999,
      salePrice: 1299,
      savings: 3700,
      discount: 74,
      discountPercent: 74,
      featured: true,
      free: false,
      isBundle: true,
      rating: 4.9,
      reviewsCount: 228,
      badge: '🚀 For Freelancers & Agencies',
      items: [
        { name: 'Freelancer Proposal & Client Onboarding System', value: '₹999' },
        { name: '365 Days Content Calendar & Strategy Engine', value: '₹1,199' },
        { name: '2,500+ AI Prompts for Business Automation', value: '₹799' },
        { name: 'Client Invoicing & Contract Legal Suite', value: '₹2,002' }
      ],
      bonuses: [
        'Bonus 1: Notion Client Portal Template with live project tracker',
        'Bonus 2: High-Ticket Discovery Call Script'
      ],
      downloadFilename: 'DigitalVault_Solopreneur_Accelerator.zip'
    },
    {
      id: 'dv-bundle-ai',
      title: 'THE AI AUTOMATION & PROMPTS VAULT',
      slug: 'ai-automation-prompts-vault',
      tagline: 'Automate marketing, ad copywriting, research, and client deliverables with AI.',
      category: 'ai-prompts',
      categoryName: 'AI Suites',
      imageType: 'ai-prompts',
      templateCount: '2,500+ Prompts & Workflows',
      formats: ['Notion Database', 'Claude & ChatGPT Direct Packs', 'PDF'],
      regularPrice: 3499,
      salePrice: 799,
      savings: 2700,
      discount: 77,
      discountPercent: 77,
      featured: true,
      free: false,
      isBundle: true,
      rating: 4.9,
      reviewsCount: 195,
      badge: '⚡ AI Power Pack',
      items: [
        { name: '2,500+ Mega Prompts for ChatGPT, Claude & Gemini', value: '₹799' },
        { name: '100 Meta Ad Primary Copy Formulas & Psychological Hooks', value: '₹799' },
        { name: 'AI Video Scriptwriting & Reel Hook Generators', value: '₹599' },
        { name: 'Automated Agency Client Onboarding Blueprints', value: '₹1,302' }
      ],
      bonuses: [
        'Bonus 1: ChatGPT Custom Instructions Preset Cheat Sheet',
        'Bonus 2: Midjourney v6 Prompting Master Guide'
      ],
      downloadFilename: 'DigitalVault_AI_Automation_Vault.zip'
    }
  ],

  testimonials: [
    {
      id: 'test-1',
      name: 'Alex Rivera',
      role: 'Growth Marketer & Agency Owner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      verified: true,
      text: 'The 100 Meta Ad Primary Texts and Canva templates saved our agency at least 25 hours on our last client launch. The hooks are genuinely high-converting and easy to customize in seconds.',
      productBought: 'THE ULTIMATE DIGITAL MARKETING VAULT',
      isPlaceholderNotice: 'Verified Customer Feedback (Editable in Admin)'
    },
    {
      id: 'test-2',
      name: 'Elena Rostova',
      role: 'Content Creator & Notion Consultant',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      verified: true,
      text: 'Digital Vault feels like a high-end SaaS product rather than another cheap template site. The Notion content calendar alone transformed how I organize client pipelines. Truly phenomenal value.',
      productBought: '365 Days Social Media Content Calendar',
      isPlaceholderNotice: 'Verified Customer Feedback (Editable in Admin)'
    },
    {
      id: 'test-3',
      name: 'Marcus Chen',
      role: 'Freelance Brand Designer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      verified: true,
      text: 'I bought the Freelancer Proposal & Onboarding kit yesterday. Used the Canva deck this morning for a ₹3,50,000 branding proposal and the client signed on the spot. Paid for itself 150x over.',
      productBought: 'Complete Freelancer Proposal & Onboarding System',
      isPlaceholderNotice: 'Verified Customer Feedback (Editable in Admin)'
    },
    {
      id: 'test-4',
      name: 'Sarah Jenkins',
      role: 'E-commerce Brand Founder',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      verified: true,
      text: 'Having Canva templates that actually look modern and refined instead of tacky has been a breath of fresh air. Downloads were instant and the license covers everything we need.',
      productBought: '500+ Canva Social Media Templates',
      isPlaceholderNotice: 'Verified Customer Feedback (Editable in Admin)'
    }
  ],

  faqs: [
    {
      id: 'faq-1',
      question: 'What is Digital Vault?',
      answer: 'Digital Vault is a premium digital marketplace providing battle-tested, ready-to-use digital resources for creators, freelancers, marketers, agencies, and small businesses. We specialize in high-converting Canva templates, copywriting swipe files, Notion productivity engines, AI prompt databases, and commercial design kits.'
    },
    {
      id: 'faq-2',
      question: 'How do digital products work?',
      answer: 'Every product is 100% digital. Immediately after completing checkout, you will receive an on-screen download hub, an email with your secure lifetime download links, and instant access inside your Digital Vault Customer Dashboard. No shipping or waiting required.'
    },
    {
      id: 'faq-3',
      question: 'How will I receive my purchase?',
      answer: 'You will receive your purchase in three ways: 1) Instant on-screen download buttons right on the confirmation screen, 2) An automated delivery email with your receipt and access links, and 3) A permanent record in the "My Downloads" section of your customer account.'
    },
    {
      id: 'faq-4',
      question: 'Can I use the products commercially?',
      answer: 'Yes! All of our premium products come with our Commercial License. You are permitted to use them for personal projects, client deliverables, paid ad campaigns, client social media channels, and client branding. The only restriction is you cannot resell, redistribute, or sublicense the original template files as your own stock.'
    },
    {
      id: 'faq-5',
      question: 'Are the products editable?',
      answer: 'Absolutely. Canva templates work seamlessly with both free and Pro Canva accounts with one-click cloning. Notion templates can be duplicated into your workspace with one click. Spreadsheets and documents come in Google Sheets, Excel, and Word formats.'
    },
    {
      id: 'faq-6',
      question: 'Can I get a refund?',
      answer: 'We want you to be 100% confident in your purchase. Because digital items cannot be returned once downloaded, we evaluate refund requests on a fair, case-by-case basis within 14 days of purchase if you encounter technical defects or files that do not match the product description.'
    },
    {
      id: 'faq-7',
      question: 'Do digital products expire?',
      answer: 'Never. Once you purchase any resource or bundle on Digital Vault, you own lifetime access to that version, plus all future updates released for that product. You can re-download your files anytime from your account dashboard.'
    },
    {
      id: 'faq-8',
      question: 'How can I contact support?',
      answer: 'Our dedicated support team is available 7 days a week. You can reach out directly via the Support tab in your Customer Dashboard, use the contact form in the footer, or email us directly at support@digitalvault.io.'
    }
  ],

  coupons: [
    { code: 'VAULT20', discount: 20, type: 'percent', minSpend: 0, description: '20% off all orders' },
    { code: 'LAUNCH50', discount: 50, type: 'percent', minSpend: 799, description: '50% off orders over ₹799' },
    { code: 'SAVE100', discount: 100, type: 'fixed', minSpend: 499, description: '₹100 off orders over ₹499' }
  ],

  sampleOrders: [
    {
      id: 'DV-94821',
      date: '2026-09-28',
      customerName: 'Marcus Chen',
      customerEmail: 'marcus@chenstudio.design',
      items: [
        { id: 'dv-prod-7', title: 'Complete Freelancer Proposal & Client Onboarding System', price: 499, quantity: 1 }
      ],
      subtotal: 499,
      discount: 0,
      total: 499,
      status: 'Completed',
      gateway: 'UPI (Google Pay)',
      licenseKey: 'DV-LIC-MC8492-COMM'
    },
    {
      id: 'DV-94820',
      date: '2026-09-27',
      customerName: 'Elena Rostova',
      customerEmail: 'elena@rostovacontent.com',
      items: [
        { id: 'dv-bundle-mega', title: 'THE ULTIMATE DIGITAL MARKETING VAULT', price: 1499, quantity: 1 }
      ],
      subtotal: 1499,
      discount: 0,
      total: 1499,
      status: 'Completed',
      gateway: 'Razorpay',
      licenseKey: 'DV-LIC-ER7319-COMM'
    }
  ],

  subscribers: [
    { email: 'sarah.creator@gmail.com', date: '2026-09-25', source: 'Weekly Newsletter' },
    { email: 'kevin.growth@agency.io', date: '2026-09-26', source: 'Free 30-Day Pack' },
    { email: 'priya.marketing@startup.co', date: '2026-09-28', source: 'Free 25 Ad Hooks' }
  ],

  settings: {
    storeName: 'Digital Vault',
    tagline: 'Premium Digital Resources. Ready to Grow.',
    supportEmail: 'support@digitalvault.io',
    currency: 'INR',
    currencySymbol: '₹',
    activeGateway: 'upi_razorpay',
    stripePublishableKey: 'pk_test_vault_51Nz84920492810',
    razorpayKeyId: 'rzp_test_vault_839219',
    guestCheckoutEnabled: true
  }
};
