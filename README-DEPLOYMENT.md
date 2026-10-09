# 🛡️ Digital Vault - Production Fullstack Deployment & Security Guide
**Supabase (Database) + Cloudflare R2 (Asset Storage) + Razorpay (Payments) + Railway (All-in-One Fullstack)**

---

## 🇮🇳 પ્રોજેક્ટ ઓવરવ્યૂ (Overview in Gujarati)
આ પ્રોજેક્ટ હવે **Railway પર 100% All-in-One Live Deployment** માટે અને **Cloudflare R2 Bucket Storage** સાથે સંપૂર્ણ તૈયાર છે:

* **ગિટહબ રિપોઝીટરી**: `https://github.com/digitalvalut2026-cpu/digitalvalut`
* **સંપૂર્ણ હોસ્ટિંગ (Railway)**: ફ્રન્ટએન્ડ સ્ટોરફ્રન્ટ, એડમિન પેનલ અને Node.js Express API ત્રણેય Railway પર એક જ સર્વિસમાં લાઈવ થશે (ઝીરો CORS ઈશ્યુ).
* **ડેટાબેઝ (Supabase)**: તમારી આપેલી કી સાથે PostgreSQL ડેટાબેઝ & Row-Level Security.
* **ડિજિટલ એસેટ સ્ટોરેજ (Cloudflare R2 Bucket)**: ZIP, PDF અને templates સ્ટોર કરવા માટે Cloudflare R2 નો ઉપયોગ (Zero Egress Fees + 1-કલાક ટાઈમ-લિમિટેડ Presigned URLs).
* **પેમેન્ટ ગેટવે (Razorpay)**: UPI, NetBanking, Cards સપોર્ટ & સર્વર-સાઇડ HMAC-SHA256 વેરિફિકેશન.

---

## 🗄️ 1. Supabase સેટઅપ (Database Setup)

તમે આપેલી કી:
* **Publishable / Anon Key**: `your_supabase_anon_key_here`
* **Secret / Service Role Key**: `your_supabase_service_role_secret_key_here`

### Supabase URL મેળવવાની રીત:
1. તમારા **[Supabase Dashboard](https://supabase.com/dashboard)** પર જાઓ.
2. તમારા પ્રોજેક્ટ પર ક્લિક કરો.
3. બ્રાઉઝર URL માંથી અથવા **Project Settings -> API** માંથી તમારું Project URL કોપી કરો:
   `https://<તમારો-પ્રોજેક્ટ-આઈડી>.supabase.co`
4. **SQL Editor** માં જાઓ અને [database/supabase-schema.sql](file:///e:/Digital%20Vault/database/supabase-schema.sql) ફાઈલનો સમગ્ર કોડ પેસ્ટ કરીને **Run** કરો.

---

## 📦 2. Cloudflare R2 બકેટ સેટઅપ (Digital Assets Storage)

Cloudflare R2 બકેટ ડિજિટલ ફાઈલ્સ સ્ટોર કરવા માટે બેસ્ટ છે કારણ કે તેના પર કોઈ ડાઉનલોડ બેન્ડવિડ્થ ચાર્જ (Egress Fees) નથી અને ફાઈલો 100% પ્રાઈવેટ રહે છે!

### R2 બકેટ બનાવવાની રીત:
1. **[Cloudflare Dashboard](https://dash.cloudflare.com/)** પર લોગિન કરો.
2. ડાબી બાજુથી **R2 Object Storage** પર ક્લિક કરો.
3. **Create Bucket** બટન પર ક્લિક કરો:
   * **Bucket Name**: `digital-vault-assets`
   * Location: Automatic
   * Create Bucket પર ક્લિક કરો.
4. **API Token મેળવવો**:
   * R2 પેજ પર જમણી બાજુ **Manage R2 API Tokens** પર ક્લિક કરો.
   * **Create API Token** પસંદ કરો.
   * Permissions: **Object Read & Write** પસંદ કરો.
   * Create Token પર ક્લિક કરો.
5. હવે નીચેની વિગતો નોંધી લો:
   * **Account ID**: (R2 ઓવરવ્યૂ પેજ પર જમણી બાજુ ઉપલબ્ધ હોય છે)
   * **Access Key ID**
   * **Secret Access Key**
   * **Bucket Name**: `digital-vault-assets`

### R2 માં ફાઈલ કેવી રીતે મૂકવી:
* તમે બનાવેલા બકેટમાં તમારા ડિજિટલ પેકેજ (દા.ત. `startup-pitch-deck.zip` અથવા `mega-bundle.zip`) સીધા અપલોડ કરી શકો છો.
* જ્યારે કોઈ ગ્રાહક Razorpay થી પેમેન્ટ કરશે, ત્યારે આપણું સર્વર **Cloudflare R2 Presigned Signed URL** આપમેળે જનરેટ કરશે, જે 1 કલાક માટે જ માન્ય રહેશે. ગ્રાહક લિંક ચોરી કે શેર કરી શકશે નહીં!

---

## 💳 3. Razorpay પેમેન્ટ ગેટવે સેટઅપ

1. **[Razorpay Dashboard](https://dashboard.razorpay.com/)** -> **Settings -> API Keys** પર જાઓ.
2. `Key ID` (દા.ત. `rzp_test_xxxx` અથવા `rzp_live_xxxx`) અને `Key Secret` કોપી કરો.

---

## 🚂 4. Railway પર સંપૂર્ણ પ્રોજેક્ટ લાઈવ કરવો (All-in-One Railway Deployment)

આખો પ્રોજેક્ટ એક જ જગ્યાએ ચલાવવા માટે:

### Step 4.1: કોડ GitHub પર પુશ કરવો
તમારી રિપોઝીટરી `https://github.com/digitalvalut2026-cpu/digitalvalut` છે:

જો તમારા કોમ્પ્યુટરમાં **Git** ઇન્સ્ટોલ ન હોય, તો:
* [git-scm.com/download/win](https://git-scm.com/download/win) પરથી Git ડાઉનલોડ કરીને ઇન્સ્ટોલ કરો.
* અથવા **GitHub Desktop** નો ઉપયોગ કરીને આ `E:\Digital Vault` ફોલ્ડર પસંદ કરી સીધું પુશ કરો.

ટર્મિનલ કમાન્ડ્સ:
```bash
git init
git branch -M main
git remote add origin https://github.com/digitalvalut2026-cpu/digitalvalut.git
git add .
git commit -m "Deploy Fullstack Digital Vault with Supabase, Razorpay & R2"
git push -u origin main --force
```

### Step 4.2: Railway પ્રોજેક્ટ બનાવવો
1. **[Railway.app](https://railway.app)** પર લોગિન કરો.
2. **New Project -> Deploy from GitHub Repo** પસંદ કરો.
3. `digitalvalut2026-cpu/digitalvalut` સિલેક્ટ કરો.
4. Railway પ્રોજેક્ટ સેટિંગ્સમાં **Variables** ટેબ પર જાઓ અને નીચેના વેરિએબલ્સ સેટ કરો:

| Variable Name | Value |
| :--- | :--- |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | `https://<your-project-id>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | તમારી Supabase Service Role Key |
| `SUPABASE_ANON_KEY` | તમારી Supabase Anon / Publishable Key |
| `RAZORPAY_KEY_ID` | તમારો Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | તમારો Razorpay Key Secret |
| `R2_ACCOUNT_ID` | તમારો Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | તમારો Cloudflare R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | તમારો Cloudflare R2 Secret Access Key |
| `R2_BUCKET_NAME` | `digital-vault-assets` |
| `JWT_SECRET` | `digital_vault_super_secure_key_2026_unhackable` |

5. **Networking**:
   * **Settings -> Networking -> Public Networking** માં જાઓ અને **Generate Domain** પર ક્લિક કરો.
   * રેલવે તમને એક સુંદર ફ્રી લિંક આપશે (દા.ત. `https://digitalvalut-production.up.railway.app`).
6. **Done! 🚀**
   તમારો આખો ડિજિટલ સ્ટોરફ્રન્ટ, Razorpay પેમેન્ટ્સ, એડમિન કન્સોલ અને સુરક્ષિત ડાઉનલોડ્સ હવે લાઈવ છે!

---

## 🔒 સિક્યુરિટી ચેકલિસ્ટ (Hack-Proof Guarantee)
* **પ્રાઈસ ટેમ્પરિંગ અશક્ય**: હેકર્સ ક્લાયન્ટ તરફથી ભાવ બદલી શકતા નથી; સર્વર જાતે Supabase માંથી ઓર્ડર ટોટલ ગણે છે.
* **પેમેન્ટ સ્પોફિંગ અશક્ય**: Razorpay સિક્રેટ કી દ્વારા `HMAC-SHA256` વેરિફિકેશન થાય છે.
* **લિંક ચોરી અશક્ય**: ફાઈલો Cloudflare R2 બકેટમાં સુરક્ષિત છે અને ફક્ત 1 કલાકની માન્યતાવાળી પ્રાઈવેટ સાઇન્ડ લિંક દ્વારા જ ડાઉનલોડ થાય છે.
* **એડમિન સુરક્ષિત**: `bcrypt` પાસવર્ડ & PIN હેશિંગ, રેટ લિમિટીંગ (5 પ્રયાસો બાદ લોકઆઉટ) અને JWT.
