// Digital Vault - SVG Vector Visual & Mockup Engine
// Generates stunning, ultra-crisp SaaS-grade product graphics

export function getProductMockupSvg(imageType, title = '', category = '') {
  switch (imageType) {
    case 'canva-pack':
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <defs>
            <linearGradient id="bg-canva" x1="0" y1="0" x2="400" y2="250" gradientUnits="userSpaceOnUse">
              <stop stop-color="#0F0C20" />
              <stop offset="1" stop-color="#1A1235" />
            </linearGradient>
            <linearGradient id="glow-purple" x1="200" y1="0" x2="200" y2="250" gradientUnits="userSpaceOnUse">
              <stop stop-color="#7C3AED" stop-opacity="0.3" />
              <stop offset="1" stop-color="#7C3AED" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="card-grad1" x1="0" y1="0" x2="140" y2="180" gradientUnits="userSpaceOnUse">
              <stop stop-color="#2D1B69" />
              <stop offset="1" stop-color="#160D33" />
            </linearGradient>
            <linearGradient id="card-grad2" x1="0" y1="0" x2="140" y2="180" gradientUnits="userSpaceOnUse">
              <stop stop-color="#7C3AED" />
              <stop offset="1" stop-color="#4C1D95" />
            </linearGradient>
          </defs>
          <rect width="400" height="250" rx="12" fill="url(#bg-canva)" />
          <rect width="400" height="250" fill="url(#glow-purple)" />
          <!-- Floating UI Frame Background -->
          <g opacity="0.6">
            <rect x="30" y="30" width="340" height="190" rx="8" stroke="rgba(255,255,255,0.08)" stroke-width="1" fill="#141028" />
            <circle cx="48" cy="45" r="4" fill="#EF4444" opacity="0.7"/>
            <circle cx="60" cy="45" r="4" fill="#F59E0B" opacity="0.7"/>
            <circle cx="72" cy="45" r="4" fill="#10B981" opacity="0.7"/>
            <rect x="90" y="42" width="120" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>
          </g>
          <!-- Left Carousel Card -->
          <g transform="translate(60, 65) rotate(-6)">
            <rect width="110" height="140" rx="8" fill="url(#card-grad1)" stroke="rgba(167,139,250,0.3)" stroke-width="1" />
            <rect x="12" y="15" width="86" height="8" rx="4" fill="#A78BFA" opacity="0.9" />
            <rect x="12" y="30" width="60" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
            <rect x="12" y="50" width="86" height="55" rx="6" fill="#1E1346" />
            <circle cx="55" cy="78" r="16" fill="#7C3AED" opacity="0.8"/>
            <path d="M52 72 L62 78 L52 84 Z" fill="#FFF"/>
            <rect x="12" y="115" width="45" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
          </g>
          <!-- Center Focus Card -->
          <g transform="translate(145, 55)">
            <rect width="115" height="150" rx="10" fill="url(#card-grad2)" stroke="#C4B5FD" stroke-width="1.5" filter="drop-shadow(0 12px 24px rgba(0,0,0,0.5))" />
            <rect x="14" y="18" width="87" height="10" rx="5" fill="#FFFFFF" />
            <rect x="14" y="35" width="55" height="6" rx="3" fill="rgba(255,255,255,0.7)" />
            <rect x="14" y="52" width="87" height="60" rx="6" fill="#110A26" />
            <!-- Canva UI Mockup Graphic -->
            <path d="M28 85 C 40 65, 75 65, 87 85" stroke="#A78BFA" stroke-width="3" stroke-linecap="round" fill="none"/>
            <circle cx="70" cy="70" r="6" fill="#F472B6" />
            <rect x="14" y="122" width="40" height="14" rx="7" fill="#FFFFFF" />
            <text x="21" y="132" font-family="sans-serif" font-size="7" font-weight="bold" fill="#581C87">CANVA</text>
            <rect x="60" y="124" width="41" height="10" rx="5" fill="rgba(255,255,255,0.2)"/>
          </g>
          <!-- Right Carousel Card -->
          <g transform="translate(235, 65) rotate(6)">
            <rect width="110" height="140" rx="8" fill="url(#card-grad1)" stroke="rgba(167,139,250,0.3)" stroke-width="1" />
            <rect x="12" y="15" width="70" height="8" rx="4" fill="#A78BFA" opacity="0.8" />
            <rect x="12" y="30" width="86" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
            <rect x="12" y="48" width="86" height="55" rx="6" fill="#1E1346" />
            <rect x="22" y="60" width="66" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="22" y="70" width="50" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="22" y="80" width="58" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="12" y="115" width="45" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
          </g>
        </svg>
      `;

    case 'ad-copy':
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <rect width="400" height="250" rx="12" fill="#0B0B14" />
          <circle cx="200" cy="125" r="90" fill="#7C3AED" opacity="0.15" filter="blur(30px)"/>
          <!-- Meta Ad Mockup Card -->
          <g transform="translate(45, 30)">
            <rect width="310" height="190" rx="10" fill="#151522" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
            <!-- Profile row -->
            <circle cx="30" cy="30" r="14" fill="#7C3AED" />
            <text x="25" y="34" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFF">DV</text>
            <rect x="52" y="21" width="90" height="8" rx="4" fill="#FFF" opacity="0.9" />
            <rect x="52" y="33" width="60" height="6" rx="3" fill="#A78BFA" opacity="0.7" />
            <rect x="240" y="23" width="50" height="16" rx="4" fill="rgba(124,58,237,0.2)" />
            <text x="249" y="34" font-family="sans-serif" font-size="8" font-weight="bold" fill="#A78BFA">SPONSORED</text>
            <!-- Ad Copy Lines with Highlighted Hook -->
            <rect x="20" y="55" width="270" height="8" rx="4" fill="#FDE047" opacity="0.9" />
            <rect x="20" y="70" width="250" height="6" rx="3" fill="rgba(255,255,255,0.6)" />
            <rect x="20" y="82" width="220" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
            <!-- Media Box -->
            <rect x="20" y="98" width="270" height="58" rx="6" fill="#1F1A3A" stroke="rgba(124,58,237,0.3)" />
            <rect x="35" y="112" width="100" height="12" rx="4" fill="#FFFFFF" />
            <rect x="35" y="130" width="130" height="8" rx="4" fill="#A78BFA" />
            <rect x="205" y="114" width="70" height="26" rx="6" fill="#7C3AED" />
            <text x="216" y="130" font-family="sans-serif" font-size="9" font-weight="bold" fill="#FFF">LEARN MORE</text>
            <!-- Formula Tags -->
            <rect x="20" y="166" width="75" height="14" rx="7" fill="rgba(255,255,255,0.06)" />
            <text x="28" y="176" font-family="sans-serif" font-size="7" fill="#A1A1AA">PAS Framework</text>
            <rect x="102" y="166" width="68" height="14" rx="7" fill="rgba(255,255,255,0.06)" />
            <text x="110" y="176" font-family="sans-serif" font-size="7" fill="#A1A1AA">Curiosity Gap</text>
            <rect x="177" y="166" width="70" height="14" rx="7" fill="rgba(255,255,255,0.06)" />
            <text x="185" y="176" font-family="sans-serif" font-size="7" fill="#A1A1AA">FOMO Trigger</text>
          </g>
        </svg>
      `;

    case 'calendar':
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <rect width="400" height="250" rx="12" fill="#0C0D17" />
          <circle cx="340" cy="60" r="80" fill="#7C3AED" opacity="0.15" filter="blur(30px)" />
          <!-- Notion Calendar Matrix -->
          <g transform="translate(35, 25)">
            <rect width="330" height="200" rx="10" fill="#141624" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
            <rect x="20" y="18" width="120" height="10" rx="5" fill="#FFFFFF" />
            <rect x="20" y="34" width="70" height="6" rx="3" fill="#A78BFA" opacity="0.8" />
            <rect x="240" y="18" width="70" height="18" rx="6" fill="#7C3AED" opacity="0.8" />
            <text x="254" y="30" font-family="sans-serif" font-size="8" font-weight="bold" fill="#FFF">365 DAYS</text>
            <!-- Calendar Days Grid -->
            <!-- Col 1 -->
            <rect x="20" y="55" width="66" height="62" rx="6" fill="#1C1F33" stroke="rgba(255,255,255,0.05)" />
            <text x="28" y="70" font-family="sans-serif" font-size="10" font-weight="bold" fill="#A78BFA">MON</text>
            <rect x="26" y="78" width="54" height="14" rx="4" fill="rgba(124,58,237,0.3)" />
            <text x="30" y="88" font-family="sans-serif" font-size="7" fill="#C4B5FD">Authority Reel</text>
            <rect x="26" y="96" width="54" height="14" rx="4" fill="rgba(16,185,129,0.2)" />
            <text x="30" y="106" font-family="sans-serif" font-size="7" fill="#6EE7B7">Done ✓</text>
            <!-- Col 2 -->
            <rect x="94" y="55" width="66" height="62" rx="6" fill="#1C1F33" stroke="rgba(255,255,255,0.05)" />
            <text x="102" y="70" font-family="sans-serif" font-size="10" font-weight="bold" fill="#A78BFA">TUE</text>
            <rect x="100" y="78" width="54" height="14" rx="4" fill="rgba(245,158,11,0.2)" />
            <text x="104" y="88" font-family="sans-serif" font-size="7" fill="#FCD34D">Carousel Hook</text>
            <rect x="100" y="96" width="44" height="8" rx="4" fill="rgba(255,255,255,0.2)" />
            <!-- Col 3 -->
            <rect x="168" y="55" width="66" height="62" rx="6" fill="#1C1F33" stroke="rgba(255,255,255,0.05)" />
            <text x="176" y="70" font-family="sans-serif" font-size="10" font-weight="bold" fill="#A78BFA">WED</text>
            <rect x="174" y="78" width="54" height="14" rx="4" fill="rgba(236,72,153,0.2)" />
            <text x="178" y="88" font-family="sans-serif" font-size="7" fill="#F472B6">Case Study</text>
            <!-- Col 4 -->
            <rect x="242" y="55" width="68" height="62" rx="6" fill="#1C1F33" stroke="rgba(255,255,255,0.05)" />
            <text x="250" y="70" font-family="sans-serif" font-size="10" font-weight="bold" fill="#A78BFA">THU</text>
            <rect x="248" y="78" width="56" height="14" rx="4" fill="rgba(59,130,246,0.2)" />
            <text x="252" y="88" font-family="sans-serif" font-size="7" fill="#93C5FD">Story Q&A</text>
            <!-- Bottom Row Pipeline -->
            <rect x="20" y="128" width="290" height="55" rx="6" fill="#181B2C" />
            <text x="32" y="145" font-family="sans-serif" font-size="8" font-weight="bold" fill="#94A3B8">Q1 STRATEGY MAP • 12 WEEKS</text>
            <rect x="32" y="155" width="80" height="16" rx="4" fill="#7C3AED" />
            <text x="40" y="166" font-family="sans-serif" font-size="8" fill="#FFF">Week 1: Growth</text>
            <rect x="120" y="155" width="85" height="16" rx="4" fill="#2E2356" />
            <text x="128" y="166" font-family="sans-serif" font-size="8" fill="#C4B5FD">Week 2: Conversion</text>
            <rect x="213" y="155" width="85" height="16" rx="4" fill="#2E2356" />
            <text x="221" y="166" font-family="sans-serif" font-size="8" fill="#C4B5FD">Week 3: Retention</text>
          </g>
        </svg>
      `;

    case 'instagram-kit':
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <rect width="400" height="250" rx="12" fill="#0E0C1C" />
          <linearGradient id="ig-glow" x1="0" y1="0" x2="400" y2="250" gradientUnits="userSpaceOnUse">
            <stop stop-color="#C026D3" stop-opacity="0.2" />
            <stop offset="0.5" stop-color="#7C3AED" stop-opacity="0.15" />
            <stop offset="1" stop-color="#2563EB" stop-opacity="0.1" />
          </linearGradient>
          <rect width="400" height="250" fill="url(#ig-glow)" />
          <!-- Phone Silhouette -->
          <g transform="translate(130, 20)">
            <rect width="140" height="215" rx="20" fill="#18142E" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
            <rect x="45" y="8" width="50" height="8" rx="4" fill="#0E0C1C" />
            <!-- IG Header -->
            <rect x="15" y="26" width="50" height="7" rx="3.5" fill="#FFFFFF" />
            <!-- Carousel Post -->
            <rect x="15" y="42" width="110" height="110" rx="8" fill="#2A1B4E" stroke="#A78BFA" stroke-width="1" />
            <circle cx="70" cy="85" r="22" fill="#7C3AED" />
            <path d="M60 85 L80 85 M70 75 L70 95" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" />
            <rect x="25" y="120" width="90" height="6" rx="3" fill="#FFF" opacity="0.9" />
            <rect x="25" y="132" width="60" height="5" rx="2.5" fill="#A78BFA" />
            <!-- Dot indicators -->
            <circle cx="62" cy="160" r="2" fill="#7C3AED" />
            <circle cx="68" cy="160" r="2" fill="rgba(255,255,255,0.4)" />
            <circle cx="74" cy="160" r="2" fill="rgba(255,255,255,0.4)" />
            <circle cx="80" cy="160" r="2" fill="rgba(255,255,255,0.4)" />
            <!-- Engagement Buttons -->
            <circle cx="25" cy="175" r="5" fill="#EC4899" />
            <circle cx="40" cy="175" r="5" fill="rgba(255,255,255,0.3)" />
            <circle cx="55" cy="175" r="5" fill="rgba(255,255,255,0.3)" />
            <rect x="15" y="190" width="70" height="5" rx="2.5" fill="rgba(255,255,255,0.6)" />
          </g>
          <!-- Side Floating Reels -->
          <g transform="translate(35, 60) rotate(-8)">
            <rect width="75" height="120" rx="10" fill="#1C1438" stroke="rgba(167,139,250,0.3)" stroke-width="1"/>
            <rect x="10" y="15" width="55" height="6" rx="3" fill="#A78BFA"/>
            <circle cx="37" cy="60" r="14" fill="#7C3AED"/>
            <polygon points="34,53 44,60 34,67" fill="#FFF"/>
            <rect x="10" y="90" width="45" height="5" rx="2.5" fill="rgba(255,255,255,0.4)"/>
          </g>
          <g transform="translate(290, 60) rotate(8)">
            <rect width="75" height="120" rx="10" fill="#1C1438" stroke="rgba(167,139,250,0.3)" stroke-width="1"/>
            <rect x="10" y="15" width="55" height="6" rx="3" fill="#A78BFA"/>
            <circle cx="37" cy="60" r="14" fill="#7C3AED"/>
            <polygon points="34,53 44,60 34,67" fill="#FFF"/>
            <rect x="10" y="90" width="45" height="5" rx="2.5" fill="rgba(255,255,255,0.4)"/>
          </g>
        </svg>
      `;

    case 'marketing-bundle':
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <rect width="400" height="250" rx="12" fill="#0B0916" />
          <circle cx="200" cy="125" r="110" fill="#7C3AED" opacity="0.2" filter="blur(40px)" />
          <!-- Bundle Stack -->
          <g transform="translate(60, 40)">
            <!-- Box 3 -->
            <rect x="40" y="10" width="200" height="130" rx="10" fill="#191336" stroke="rgba(255,255,255,0.06)" />
            <!-- Box 2 -->
            <rect x="20" y="25" width="220" height="135" rx="10" fill="#221846" stroke="rgba(167,139,250,0.2)" />
            <!-- Main Hero Box -->
            <rect x="0" y="40" width="240" height="145" rx="12" fill="#2E1F5E" stroke="#A78BFA" stroke-width="1.5" />
            <rect x="20" y="60" width="130" height="12" rx="6" fill="#FFFFFF" />
            <rect x="20" y="80" width="80" height="8" rx="4" fill="#C4B5FD" />
            <!-- Checklist items -->
            <circle cx="28" cy="105" r="6" fill="#10B981" />
            <path d="M25 105 L27 107 L31 103" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" />
            <rect x="42" y="102" width="130" height="6" rx="3" fill="rgba(255,255,255,0.8)" />
            <circle cx="28" cy="122" r="6" fill="#10B981" />
            <path d="M25 122 L27 124 L31 120" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" />
            <rect x="42" y="119" width="115" height="6" rx="3" fill="rgba(255,255,255,0.8)" />
            <circle cx="28" cy="139" r="6" fill="#10B981" />
            <path d="M25 139 L27 141 L31 137" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" />
            <rect x="42" y="136" width="100" height="6" rx="3" fill="rgba(255,255,255,0.8)" />
            <!-- Badge -->
            <rect x="20" y="156" width="85" height="16" rx="8" fill="#7C3AED" />
            <text x="30" y="167" font-family="sans-serif" font-size="8" font-weight="bold" fill="#FFF">FULL SUITE</text>
          </g>
          <!-- Floating Emblem -->
          <g transform="translate(290, 75)">
            <circle cx="35" cy="35" r="35" fill="#7C3AED" stroke="#C4B5FD" stroke-width="2" />
            <text x="18" y="32" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFF">VALUE</text>
            <text x="16" y="47" font-family="sans-serif" font-size="11" font-weight="900" fill="#FDE047">₹6,999+</text>
          </g>
        </svg>
      `;

    case 'content-ideas':
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <rect width="400" height="250" rx="12" fill="#0A0B12" />
          <circle cx="200" cy="120" r="85" fill="#7C3AED" opacity="0.18" filter="blur(30px)" />
          <g transform="translate(45, 30)">
            <rect width="310" height="190" rx="10" fill="#131522" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
            <rect x="25" y="20" width="140" height="12" rx="6" fill="#FFFFFF" />
            <rect x="25" y="38" width="90" height="6" rx="3" fill="#A78BFA" />
            <rect x="210" y="20" width="75" height="20" rx="6" fill="#7C3AED" />
            <text x="220" y="33" font-family="sans-serif" font-size="9" font-weight="bold" fill="#FFF">1,000 IDEAS</text>
            <!-- Idea Cards -->
            <rect x="25" y="60" width="260" height="32" rx="6" fill="#1C1F33" stroke="rgba(255,255,255,0.04)" />
            <circle cx="42" cy="76" r="8" fill="#7C3AED" />
            <text x="39" y="80" font-family="sans-serif" font-size="9" font-weight="bold" fill="#FFF">1</text>
            <rect x="58" y="70" width="150" height="6" rx="3" fill="#FFF" />
            <rect x="58" y="80" width="90" height="5" rx="2.5" fill="#94A3B8" />
            <rect x="225" y="70" width="50" height="12" rx="4" fill="rgba(16,185,129,0.15)" />
            <text x="233" y="79" font-family="sans-serif" font-size="7" fill="#6EE7B7">Viral Hook</text>

            <rect x="25" y="98" width="260" height="32" rx="6" fill="#1C1F33" stroke="rgba(255,255,255,0.04)" />
            <circle cx="42" cy="114" r="8" fill="#7C3AED" />
            <text x="38" y="118" font-family="sans-serif" font-size="9" font-weight="bold" fill="#FFF">2</text>
            <rect x="58" y="108" width="140" height="6" rx="3" fill="#FFF" />
            <rect x="58" y="118" width="110" height="5" rx="2.5" fill="#94A3B8" />
            <rect x="225" y="108" width="50" height="12" rx="4" fill="rgba(245,158,11,0.15)" />
            <text x="231" y="117" font-family="sans-serif" font-size="7" fill="#FCD34D">Story Arc</text>

            <rect x="25" y="136" width="260" height="32" rx="6" fill="#1C1F33" stroke="rgba(255,255,255,0.04)" />
            <circle cx="42" cy="152" r="8" fill="#7C3AED" />
            <text x="38" y="156" font-family="sans-serif" font-size="9" font-weight="bold" fill="#FFF">3</text>
            <rect x="58" y="146" width="160" height="6" rx="3" fill="#FFF" />
            <rect x="58" y="156" width="70" height="5" rx="2.5" fill="#94A3B8" />
            <rect x="225" y="146" width="50" height="12" rx="4" fill="rgba(59,130,246,0.15)" />
            <text x="231" y="155" font-family="sans-serif" font-size="7" fill="#93C5FD">Contrarian</text>
          </g>
        </svg>
      `;

    case 'freelance-kit':
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <rect width="400" height="250" rx="12" fill="#0C0B14" />
          <circle cx="100" cy="100" r="80" fill="#7C3AED" opacity="0.15" filter="blur(30px)" />
          <!-- Proposal Slide Deck Stack -->
          <g transform="translate(60, 35)">
            <rect x="20" y="20" width="260" height="150" rx="8" fill="#18152A" stroke="rgba(255,255,255,0.05)" />
            <rect x="10" y="10" width="260" height="150" rx="8" fill="#211B3B" stroke="rgba(167,139,250,0.2)" />
            <!-- Front Deck -->
            <rect x="0" y="0" width="260" height="150" rx="8" fill="#120E24" stroke="#7C3AED" stroke-width="1.5" />
            <!-- Slide UI -->
            <rect x="20" y="20" width="90" height="10" rx="5" fill="#FFFFFF" />
            <rect x="20" y="35" width="140" height="6" rx="3" fill="#A78BFA" />
            <!-- Contract Price Tag -->
            <rect x="170" y="20" width="70" height="24" rx="6" fill="#7C3AED" />
            <text x="175" y="36" font-family="sans-serif" font-size="10" font-weight="900" fill="#FFF">₹45,000</text>
            <!-- Timeline Grid -->
            <rect x="20" y="60" width="220" height="2" fill="rgba(255,255,255,0.1)" />
            <circle cx="35" cy="61" r="5" fill="#7C3AED" />
            <circle cx="105" cy="61" r="5" fill="#7C3AED" />
            <circle cx="175" cy="61" r="5" fill="#7C3AED" />
            <circle cx="230" cy="61" r="5" fill="#10B981" />
            <text x="25" y="78" font-family="sans-serif" font-size="7" fill="#CBD5E1">Discovery</text>
            <text x="95" y="78" font-family="sans-serif" font-size="7" fill="#CBD5E1">Design</text>
            <text x="165" y="78" font-family="sans-serif" font-size="7" fill="#CBD5E1">Delivery</text>
            <text x="220" y="78" font-family="sans-serif" font-size="7" fill="#6EE7B7">Launch ✓</text>
            <!-- Signature area -->
            <rect x="20" y="100" width="100" height="32" rx="6" fill="#1C1838" />
            <rect x="28" y="108" width="60" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
            <path d="M28 122 Q 45 112 60 120 T 80 118" stroke="#A78BFA" stroke-width="2" fill="none" />
            <rect x="135" y="100" width="105" height="32" rx="6" fill="#7C3AED" opacity="0.3" stroke="#A78BFA" stroke-dasharray="3 3" />
            <text x="147" y="120" font-family="sans-serif" font-size="8" fill="#DDD6FE">Client Sign Ready</text>
          </g>
        </svg>
      `;

    case 'ai-prompts':
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <rect width="400" height="250" rx="12" fill="#090A10" />
          <circle cx="280" cy="140" r="90" fill="#7C3AED" opacity="0.18" filter="blur(35px)" />
          <!-- Code / AI Terminal Window -->
          <g transform="translate(45, 25)">
            <rect width="310" height="195" rx="10" fill="#111320" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
            <!-- Window header -->
            <rect width="310" height="28" rx="10" fill="#191C2E" />
            <circle cx="20" cy="14" r="4" fill="#EF4444" opacity="0.8"/>
            <circle cx="32" cy="14" r="4" fill="#F59E0B" opacity="0.8"/>
            <circle cx="44" cy="14" r="4" fill="#10B981" opacity="0.8"/>
            <text x="65" y="18" font-family="monospace" font-size="9" fill="#94A3B8">chatgpt_prompt_engine.sh</text>
            <!-- Prompt Lines -->
            <text x="20" y="52" font-family="monospace" font-size="9" fill="#A78BFA">SYSTEM_ROLE:</text>
            <text x="110" y="52" font-family="monospace" font-size="9" fill="#E2E8F0">Elite Direct Response Marketer</text>
            <text x="20" y="72" font-family="monospace" font-size="9" fill="#A78BFA">TASK_TYPE:</text>
            <text x="110" y="72" font-family="monospace" font-size="9" fill="#FDE047">SaaS Landing Page Hero Hook</text>
            <rect x="20" y="85" width="270" height="50" rx="6" fill="#1B1E33" stroke="rgba(124,58,237,0.3)" />
            <text x="28" y="102" font-family="monospace" font-size="8" fill="#A1A1AA">Input: [Product: Digital Vault] [Audience: Creators]</text>
            <text x="28" y="118" font-family="monospace" font-size="8" fill="#4ADE80">&gt; "Your Shortcut to Better Digital Content."</text>
            <!-- Pill Badges -->
            <rect x="20" y="150" width="70" height="18" rx="6" fill="#7C3AED" />
            <text x="28" y="162" font-family="sans-serif" font-size="8" font-weight="bold" fill="#FFF">2,500+ PROMPTS</text>
            <rect x="100" y="150" width="60" height="18" rx="6" fill="#1E193C" />
            <text x="108" y="162" font-family="sans-serif" font-size="8" fill="#DDD6FE">GPT-4o</text>
            <rect x="170" y="150" width="60" height="18" rx="6" fill="#1E193C" />
            <text x="178" y="162" font-family="sans-serif" font-size="8" fill="#DDD6FE">Claude 3.5</text>
            <rect x="240" y="150" width="50" height="18" rx="6" fill="#1E193C" />
            <text x="248" y="162" font-family="sans-serif" font-size="8" fill="#DDD6FE">Midjourney</text>
          </g>
        </svg>
      `;

    case 'brand-system':
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <rect width="400" height="250" rx="12" fill="#0C0C16" />
          <circle cx="150" cy="125" r="90" fill="#7C3AED" opacity="0.18" filter="blur(30px)" />
          <g transform="translate(45, 25)">
            <rect width="310" height="195" rx="10" fill="#151524" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
            <rect x="20" y="20" width="130" height="12" rx="6" fill="#FFFFFF" />
            <rect x="20" y="38" width="90" height="6" rx="3" fill="#A78BFA" />
            <!-- Color Swatches -->
            <rect x="20" y="60" width="48" height="48" rx="8" fill="#0B0B0F" stroke="rgba(255,255,255,0.2)" />
            <rect x="25" y="92" width="38" height="10" rx="2" fill="#FFFFFF" opacity="0.9" />
            <rect x="76" y="60" width="48" height="48" rx="8" fill="#7C3AED" />
            <rect x="81" y="92" width="38" height="10" rx="2" fill="#FFFFFF" opacity="0.9" />
            <rect x="132" y="60" width="48" height="48" rx="8" fill="#A78BFA" />
            <rect x="137" y="92" width="38" height="10" rx="2" fill="#18181B" opacity="0.9" />
            <rect x="188" y="60" width="48" height="48" rx="8" fill="#F7F7FA" />
            <rect x="193" y="92" width="38" height="10" rx="2" fill="#18181B" opacity="0.9" />
            <rect x="244" y="60" width="48" height="48" rx="8" fill="#10B981" />
            <rect x="249" y="92" width="38" height="10" rx="2" fill="#FFFFFF" opacity="0.9" />
            <!-- Typography Scales -->
            <rect x="20" y="125" width="272" height="52" rx="6" fill="#1C1C30" />
            <text x="32" y="145" font-family="sans-serif" font-size="14" font-weight="900" fill="#FFF">Aa Bb Gg 123</text>
            <text x="32" y="162" font-family="sans-serif" font-size="8" fill="#94A3B8">Plus Jakarta Sans / Inter Scale System</text>
            <rect x="220" y="140" width="60" height="20" rx="6" fill="#7C3AED" />
            <text x="228" y="153" font-family="sans-serif" font-size="8" font-weight="bold" fill="#FFF">40 SLIDES</text>
          </g>
        </svg>
      `;

    // Freebies
    case 'free-social':
    case 'free-ad-hooks':
    case 'free-notion':
    case 'free-prompts':
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <rect width="400" height="250" rx="12" fill="#0D0E1A" />
          <circle cx="200" cy="120" r="80" fill="#10B981" opacity="0.15" filter="blur(30px)" />
          <g transform="translate(50, 30)">
            <rect width="300" height="185" rx="10" fill="#141829" stroke="rgba(16,185,129,0.3)" stroke-width="1.5" />
            <rect x="25" y="22" width="80" height="20" rx="10" fill="#10B981" />
            <text x="37" y="35" font-family="sans-serif" font-size="9" font-weight="900" fill="#064E3B">FREEBIE</text>
            <rect x="25" y="55" width="180" height="12" rx="6" fill="#FFFFFF" />
            <rect x="25" y="75" width="250" height="6" rx="3" fill="#94A3B8" />
            <rect x="25" y="87" width="200" height="6" rx="3" fill="#94A3B8" />
            <!-- Download Box -->
            <rect x="25" y="108" width="250" height="52" rx="8" fill="#1B2238" stroke="rgba(255,255,255,0.06)" />
            <circle cx="48" cy="134" r="14" fill="#7C3AED" />
            <path d="M48 126 L48 138 M44 134 L48 138 L52 134" stroke="#FFF" stroke-width="2" stroke-linecap="round" />
            <text x="70" y="132" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFF">Instant Free Download</text>
            <text x="70" y="145" font-family="sans-serif" font-size="8" fill="#A1A1AA">Unlock with your email address</text>
          </g>
        </svg>
      `;

    default:
      return `
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="product-svg-mockup">
          <rect width="400" height="250" rx="12" fill="#0F0F1A" />
          <rect x="40" y="40" width="320" height="170" rx="10" fill="#1A1A2E" stroke="#7C3AED" stroke-opacity="0.3" stroke-width="1" />
          <circle cx="200" cy="110" r="28" fill="#7C3AED" />
          <path d="M192 105 L200 97 L208 105 M200 99 L200 122" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" />
          <rect x="130" y="150" width="140" height="8" rx="4" fill="#FFFFFF" opacity="0.8" />
          <rect x="150" y="165" width="100" height="6" rx="3" fill="#A78BFA" opacity="0.6" />
        </svg>
      `;
  }
}
