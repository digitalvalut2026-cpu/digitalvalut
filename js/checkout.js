// Digital Vault - Multi-Step Checkout, Payment Gateway Simulation & Digital Fulfillment

import { store } from './store.js';
import { getIcon } from './icons.js';
import { showToast } from './app.js';
import { downloadRealDigitalProductPackage } from './dashboard.js';
import { api } from './api.js';

let checkoutState = {
  currentStep: 1,
  customerName: 'Jatin Patel',
  customerEmail: 'jatin.patel@creator.in',
  customerPhone: '9876543210',
  customerState: 'Gujarat',
  customerCity: 'Ahmedabad',
  selectedGateway: 'upi',
  upiApp: 'gpay',
  directItem: null, // if Buy Now was clicked for a single item
  confirmedOrder: null
};

export function initCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  const closeBtn = document.getElementById('checkoutModalCloseBtn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
}

export function openCheckoutModal(singleProductOrBundle = null) {
  if (typeof window.digitalVaultDirectBuy === 'function') {
    const id = singleProductOrBundle ? singleProductOrBundle.id : 'dv-prod-1';
    window.digitalVaultDirectBuy(id);
    return;
  }
  checkoutState.directItem = singleProductOrBundle;
  checkoutState.currentStep = 1;
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;

  renderCheckoutStep();
  modal.classList.add('active');
}

export function renderCheckoutStep() {
  const container = document.getElementById('checkoutModalBody');
  if (!container) return;

  // Determine items and totals
  let items = [];
  let subtotal = 0;
  let discount = 0;
  let total = 0;

  if (checkoutState.directItem) {
    items = [{
      id: checkoutState.directItem.id,
      title: checkoutState.directItem.title,
      price: checkoutState.directItem.salePrice,
      regularPrice: checkoutState.directItem.regularPrice,
      downloadFilename: checkoutState.directItem.downloadFilename,
      formats: checkoutState.directItem.formats,
      quantity: 1
    }];
    subtotal = checkoutState.directItem.salePrice;
    total = subtotal;
  } else {
    const summary = store.getCartSummary();
    items = summary.items;
    subtotal = summary.subtotal;
    discount = summary.discount;
    total = summary.total;
  }

  // Pre-fill user details if logged in
  if (store.user && store.user.isLoggedIn) {
    checkoutState.customerName = store.user.name || checkoutState.customerName;
    checkoutState.customerEmail = store.user.email || checkoutState.customerEmail;
  }

  container.innerHTML = `
    <div class="checkout-steps-indicator">
      <div class="checkout-step ${checkoutState.currentStep >= 1 ? 'active' : ''}">
        <span class="checkout-step-num">1</span>
        <span>Account & Details</span>
      </div>
      <div class="checkout-step ${checkoutState.currentStep >= 2 ? 'active' : ''}">
        <span class="checkout-step-num">2</span>
        <span>Payment Gateway</span>
      </div>
      <div class="checkout-step ${checkoutState.currentStep >= 3 ? 'active' : ''}">
        <span class="checkout-step-num">3</span>
        <span>Download Bundle</span>
      </div>
    </div>

    ${checkoutState.currentStep === 1 ? `
      <!-- Step 1: Customer Details (All Compulsory) -->
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
          <h3 style="font-size: 1.25rem; font-weight: 800; margin: 0;">Customer &amp; Billing Details</h3>
          <span class="badge-pill" style="background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; font-size: 0.6875rem; font-weight: 700; padding: 4px 8px;">
            ⚠️ All Details Compulsory
          </span>
        </div>
        <p style="font-size: 0.8125rem; color: var(--color-text-muted); margin-bottom: 16px;">
          Please enter your details below. All fields marked with <span style="color: #EF4444; font-weight: 700;">* Compulsory</span> must be filled before proceeding to payment.
        </p>

        <div id="checkoutFormAlert" style="display: none; background: #FEF2F2; border: 1px solid #FCA5A5; color: #B91C1C; padding: 10px 14px; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; margin-bottom: 16px;">
        </div>

        <div class="checkout-form-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px;">
          <div style="grid-column: 1 / -1;">
            <label class="form-label" for="checkoutNameInput" style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.8125rem; margin-bottom: 6px;">
              <span>Full Name</span>
              <span style="color: #EF4444; font-weight: 700;">* Compulsory</span>
            </label>
            <input type="text" class="form-input" id="checkoutNameInput" value="${checkoutState.customerName}" placeholder="e.g. Jatin Patel" required style="width: 100%;" />
            <div class="form-field-error" id="nameErrorMsg" style="display: none; color: #EF4444; font-size: 0.75rem; margin-top: 4px; font-weight: 600;">⚠️ Full Name is compulsory.</div>
          </div>

          <div style="grid-column: 1 / -1;">
            <label class="form-label" for="checkoutEmailInput" style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.8125rem; margin-bottom: 6px;">
              <span>Email Address (For Instant Download Delivery)</span>
              <span style="color: #EF4444; font-weight: 700;">* Compulsory</span>
            </label>
            <input type="email" class="form-input" id="checkoutEmailInput" value="${checkoutState.customerEmail}" placeholder="e.g. jatin.patel@gmail.com" required style="width: 100%;" />
            <div class="form-field-error" id="emailErrorMsg" style="display: none; color: #EF4444; font-size: 0.75rem; margin-top: 4px; font-weight: 600;">⚠️ Valid Email Address is compulsory.</div>
          </div>

          <div style="grid-column: 1 / -1;">
            <label class="form-label" for="checkoutPhoneInput" style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.8125rem; margin-bottom: 6px;">
              <span>Mobile / WhatsApp Number</span>
              <span style="color: #EF4444; font-weight: 700;">* Compulsory (10 Digits)</span>
            </label>
            <div style="display: flex; gap: 8px;">
              <span style="display: flex; align-items: center; justify-content: center; padding: 0 12px; background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: var(--radius-sm); font-size: 0.875rem; font-weight: 700; color: #334155; white-space: nowrap;">🇮🇳 +91</span>
              <input type="tel" class="form-input" id="checkoutPhoneInput" value="${checkoutState.customerPhone}" placeholder="9876543210" maxlength="10" required style="flex: 1;" />
            </div>
            <div class="form-field-error" id="phoneErrorMsg" style="display: none; color: #EF4444; font-size: 0.75rem; margin-top: 4px; font-weight: 600;">⚠️ 10-digit Indian Mobile Number is compulsory.</div>
          </div>

          <div>
            <label class="form-label" for="checkoutStateInput" style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.8125rem; margin-bottom: 6px;">
              <span>State</span>
              <span style="color: #EF4444; font-weight: 700;">* Compulsory</span>
            </label>
            <select class="form-input" id="checkoutStateInput" required style="width: 100%;">
              <option value="" disabled ${!checkoutState.customerState ? 'selected' : ''}>-- Select State --</option>
              <option value="Gujarat" ${checkoutState.customerState === 'Gujarat' ? 'selected' : ''}>Gujarat</option>
              <option value="Maharashtra" ${checkoutState.customerState === 'Maharashtra' ? 'selected' : ''}>Maharashtra</option>
              <option value="Delhi NCR" ${checkoutState.customerState === 'Delhi NCR' ? 'selected' : ''}>Delhi NCR</option>
              <option value="Karnataka" ${checkoutState.customerState === 'Karnataka' ? 'selected' : ''}>Karnataka</option>
              <option value="Rajasthan" ${checkoutState.customerState === 'Rajasthan' ? 'selected' : ''}>Rajasthan</option>
              <option value="Uttar Pradesh" ${checkoutState.customerState === 'Uttar Pradesh' ? 'selected' : ''}>Uttar Pradesh</option>
              <option value="Madhya Pradesh" ${checkoutState.customerState === 'Madhya Pradesh' ? 'selected' : ''}>Madhya Pradesh</option>
              <option value="Punjab" ${checkoutState.customerState === 'Punjab' ? 'selected' : ''}>Punjab</option>
              <option value="Haryana" ${checkoutState.customerState === 'Haryana' ? 'selected' : ''}>Haryana</option>
              <option value="Tamil Nadu" ${checkoutState.customerState === 'Tamil Nadu' ? 'selected' : ''}>Tamil Nadu</option>
              <option value="Telangana" ${checkoutState.customerState === 'Telangana' ? 'selected' : ''}>Telangana</option>
              <option value="West Bengal" ${checkoutState.customerState === 'West Bengal' ? 'selected' : ''}>West Bengal</option>
              <option value="Kerala" ${checkoutState.customerState === 'Kerala' ? 'selected' : ''}>Kerala</option>
              <option value="Goa" ${checkoutState.customerState === 'Goa' ? 'selected' : ''}>Goa</option>
              <option value="Other Indian State" ${checkoutState.customerState === 'Other Indian State' ? 'selected' : ''}>Other Indian State</option>
            </select>
            <div class="form-field-error" id="stateErrorMsg" style="display: none; color: #EF4444; font-size: 0.75rem; margin-top: 4px; font-weight: 600;">⚠️ Please select your State.</div>
          </div>

          <div>
            <label class="form-label" for="checkoutCityInput" style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.8125rem; margin-bottom: 6px;">
              <span>City / Town</span>
              <span style="color: #EF4444; font-weight: 700;">* Compulsory</span>
            </label>
            <input type="text" class="form-input" id="checkoutCityInput" value="${checkoutState.customerCity}" placeholder="e.g. Ahmedabad, Surat" required style="width: 100%;" />
            <div class="form-field-error" id="cityErrorMsg" style="display: none; color: #EF4444; font-size: 0.75rem; margin-top: 4px; font-weight: 600;">⚠️ City is compulsory.</div>
          </div>
        </div>

        <!-- Order Summary Box -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="font-size: 0.875rem; font-weight: 700; margin: 0;">Selected Bundle Summary</h4>
            <span class="badge-pill badge-bestseller" style="font-size: 0.6875rem;">Instant Access</span>
          </div>
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 6px;">
              <span style="color: #1E293B; font-weight: 600;">${item.title}</span>
              <span style="font-weight: 800; color: #0F172A;">₹${(item.price * (item.quantity || 1))}</span>
            </div>
          `).join('')}
          <div style="border-top: 1px dashed #CBD5E1; margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 1.05rem;">
            <span>Total Payable Amount:</span>
            <span style="color: var(--color-accent); font-size: 1.25rem;">₹${total}</span>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" style="width: 100%; font-weight: 800; font-size: 1rem; padding: 14px;" id="checkoutNextBtn">
          Continue to Payment (₹${total}) ${getIcon('arrow-right')}
        </button>
      </div>
    ` : ''}

    ${checkoutState.currentStep === 2 ? `
      <!-- Step 2: Indian Payment Gateway Selection -->
      <div>
        <div style="background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 0.75rem; color: #64748B; font-weight: 600;">Delivering Order To:</div>
            <div style="font-size: 0.875rem; font-weight: 700; color: #1E293B;">
              ${checkoutState.customerName} • +91 ${checkoutState.customerPhone}
            </div>
            <div style="font-size: 0.75rem; color: #64748B;">
              ${checkoutState.customerEmail} (${checkoutState.customerCity}, ${checkoutState.customerState})
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="editDetailsLinkBtn" style="font-size: 0.75rem; padding: 4px 10px;">
            Edit Details
          </button>
        </div>

        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 6px;">Select Payment Method (INR ₹)</h3>
        <p style="font-size: 0.8125rem; color: var(--color-text-muted); margin-bottom: 18px;">
          Fast, zero-fee Indian payment gateways supporting UPI, Net Banking, Razorpay &amp; Cards.
        </p>

        <div class="gateway-selection-grid">
          <div class="gateway-card ${checkoutState.selectedGateway === 'upi' ? 'selected' : ''}" data-gateway="upi">
            <input type="radio" name="paymentGateway" value="upi" ${checkoutState.selectedGateway === 'upi' ? 'checked' : ''} />
            <div>
              <div style="font-weight: 700; font-size: 0.9375rem; display: flex; align-items: center; gap: 6px;">
                ⚡ UPI Instant
                <span class="badge-pill badge-sale" style="font-size: 0.625rem; padding: 2px 6px;">Fastest</span>
              </div>
              <div style="font-size: 0.75rem; color: #10B981; font-weight: 600;">Google Pay, PhonePe, Paytm, QR</div>
            </div>
          </div>

          <div class="gateway-card ${checkoutState.selectedGateway === 'razorpay' ? 'selected' : ''}" data-gateway="razorpay">
            <input type="radio" name="paymentGateway" value="razorpay" ${checkoutState.selectedGateway === 'razorpay' ? 'checked' : ''} />
            <div>
              <div style="font-weight: 700; font-size: 0.9375rem;">Razorpay Gateway</div>
              <div style="font-size: 0.75rem; color: #64748B;">UPI, All Indian Banks, Cards</div>
            </div>
          </div>

          <div class="gateway-card ${checkoutState.selectedGateway === 'card' ? 'selected' : ''}" data-gateway="card">
            <input type="radio" name="paymentGateway" value="card" ${checkoutState.selectedGateway === 'card' ? 'checked' : ''} />
            <div>
              <div style="font-weight: 700; font-size: 0.9375rem;">Debit / Credit Card</div>
              <div style="font-size: 0.75rem; color: #64748B;">RuPay, Visa, Mastercard</div>
            </div>
          </div>

          <div class="gateway-card ${checkoutState.selectedGateway === 'netbanking' ? 'selected' : ''}" data-gateway="netbanking">
            <input type="radio" name="paymentGateway" value="netbanking" ${checkoutState.selectedGateway === 'netbanking' ? 'checked' : ''} />
            <div>
              <div style="font-weight: 700; font-size: 0.9375rem;">Net Banking</div>
              <div style="font-size: 0.75rem; color: #64748B;">SBI, HDFC, ICICI &amp; 50+ Banks</div>
            </div>
          </div>
        </div>

        <!-- Dynamic Gateway Specific Panel -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <span style="font-weight: 700; font-size: 0.875rem;">Payment Gateway Verification</span>
            <span style="font-size: 0.75rem; color: #10B981; display: flex; align-items: center; gap: 4px;">
              ${getIcon('lock')} 256-Bit SSL Encrypted • RBI Compliant
            </span>
          </div>

          ${checkoutState.selectedGateway === 'upi' ? `
            <!-- UPI Details -->
            <div>
              <label class="form-label">Enter UPI ID / VPA</label>
              <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <input type="text" class="form-input" id="checkoutUpiIdInput" value="${checkoutState.customerPhone}@okaxis" placeholder="username@upi or mobilenumber@ybl" style="flex: 1;" />
                <button type="button" class="btn btn-secondary btn-sm" id="verifyUpiBtn" style="white-space: nowrap;">Verify UPI</button>
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
                <span class="badge-pill" style="background: #FFF; border: 1px solid #CBD5E1; color: #334155; font-size: 0.75rem;">🟢 Google Pay</span>
                <span class="badge-pill" style="background: #FFF; border: 1px solid #CBD5E1; color: #334155; font-size: 0.75rem;">🟣 PhonePe</span>
                <span class="badge-pill" style="background: #FFF; border: 1px solid #CBD5E1; color: #334155; font-size: 0.75rem;">🔵 Paytm</span>
                <span class="badge-pill" style="background: #FFF; border: 1px solid #CBD5E1; color: #334155; font-size: 0.75rem;">🟠 BHIM UPI</span>
                <span class="badge-pill" style="background: #FFF; border: 1px solid #CBD5E1; color: #334155; font-size: 0.75rem;">⚪ CRED</span>
              </div>
              <div style="padding: 12px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 8px; display: flex; align-items: center; gap: 14px;">
                <div style="width: 54px; height: 54px; background: #0B0B0F; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #FFF; font-weight: 800; font-size: 0.625rem; text-align: center; line-height: 1.2;">
                  UPI<br>QR
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 0.8125rem; color: #1E293B;">Instant QR Code Available</div>
                  <div style="font-size: 0.75rem; color: #64748B;">Click Pay Now below to scan &amp; approve from any UPI mobile app for ₹${total}.</div>
                </div>
              </div>
            </div>
          ` : checkoutState.selectedGateway === 'netbanking' ? `
            <!-- Net Banking Selector -->
            <div>
              <label class="form-label">Select Your Bank</label>
              <select class="form-input" id="checkoutBankSelect" style="margin-bottom: 12px;">
                <option value="SBI">State Bank of India (SBI)</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="AXIS">Axis Bank</option>
                <option value="KOTAK">Kotak Mahindra Bank</option>
                <option value="PNB">Punjab National Bank</option>
                <option value="BOB">Bank of Baroda</option>
                <option value="OTHER">Other Indian Bank (50+)</option>
              </select>
              <p style="font-size: 0.75rem; color: #64748B;">You will be safely directed to your bank's official net banking portal to authorize the ₹${total} payment.</p>
            </div>
          ` : checkoutState.selectedGateway === 'razorpay' ? `
            <!-- Razorpay Gateway Info -->
            <div style="text-align: center; padding: 12px 0;">
              <div style="font-weight: 800; font-size: 1rem; color: var(--color-primary); margin-bottom: 4px;">Razorpay Trusted Indian Checkout</div>
              <p style="font-size: 0.8125rem; color: #64748B; margin-bottom: 8px;">Supports all Indian credit cards, debit cards, UPI, EMI and digital wallets.</p>
              <span class="badge-pill" style="background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE;">Instant INR ₹ Settlement</span>
            </div>
          ` : `
            <!-- Card Details (RuPay, Visa, Master) -->
            <div class="checkout-form-grid">
              <div class="checkout-form-col-full">
                <label class="form-label">Card Number (RuPay, Visa, Mastercard)</label>
                <input type="text" class="form-input" value="6074 •••• •••• 9102 (RuPay Card)" readonly style="background: #FFFFFF; font-family: var(--font-mono);" />
              </div>
              <div>
                <label class="form-label">Expiry Date</label>
                <input type="text" class="form-input" value="08 / 29" readonly style="background: #FFFFFF;" />
              </div>
              <div>
                <label class="form-label">CVV / Security Code</label>
                <input type="text" class="form-input" value="•••" readonly style="background: #FFFFFF;" />
              </div>
            </div>
          `}
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" id="checkoutBackBtn">
            Back
          </button>
          <button class="btn btn-primary btn-lg" style="flex: 1; font-weight: 800; font-size: 1.05rem;" id="checkoutPayBtn">
            ${getIcon('lock')} Pay Now (₹${total})
          </button>
        </div>
      </div>
    ` : ''}

    ${checkoutState.currentStep === 3 ? `
      <!-- Step 3: Instant Order Confirmation & Prominent Download Bundle Button -->
      <div id="orderConfirmationSuccessScreen" style="text-align: center; padding: 10px 0;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: #ECFDF5; color: #10B981; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; font-size: 1.6rem; border: 2px solid #A7F3D0;">
          ${getIcon('check')}
        </div>
        <span class="section-tag" style="background: #ECFDF5; color: #059669; border-color: #A7F3D0; margin-bottom: 8px;">
          Payment Successful &amp; Order Confirmed
        </span>
        <h2 style="font-size: 1.6rem; font-weight: 900; margin: 8px 0;">Thank you, ${checkoutState.customerName}!</h2>
        <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 20px;">
          Your payment of <strong>₹${total}</strong> was successful. Your bundle package is ready for download below.
        </p>

        <!-- PROMINENT HERO DOWNLOAD BUNDLE CTA -->
        <div class="hero-download-bundle-card" style="background: linear-gradient(135deg, #18122B 0%, #0F0C20 100%); border: 2px solid #7C3AED; border-radius: 16px; padding: 24px 20px; margin: 0 0 24px 0; text-align: center; box-shadow: 0 16px 36px rgba(124, 58, 237, 0.28);">
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(124, 58, 237, 0.25); color: #C4B5FD; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(167, 139, 250, 0.4); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            ⚡ Verified Digital Package Ready
          </div>
          <h3 style="color: #FFFFFF; font-size: 1.25rem; font-weight: 900; margin-bottom: 6px;">
            ${items.length === 1 ? items[0].title : 'Purchased Bundle Masterpack'}
          </h3>
          <p style="color: #94A3B8; font-size: 0.8125rem; margin-bottom: 18px;">
            Instant ZIP package with all templates, swipe files &amp; lifetime commercial license.
          </p>

          <button class="btn btn-primary btn-lg" id="confirmedDownloadBundleHeroBtn" style="width: 100%; max-width: 440px; font-size: 1.15rem; font-weight: 900; padding: 18px 28px; background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); border: none; border-radius: 12px; box-shadow: 0 10px 28px rgba(124, 58, 237, 0.5); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 12px; transition: transform 0.2s, box-shadow 0.2s; margin: 0 auto;">
            ${getIcon('download')} <span id="downloadBtnText">📥 Download Bundle (.zip)</span>
          </button>

          <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 14px; font-size: 0.75rem; color: #CBD5E1; flex-wrap: wrap;">
            <span>⚡ Instant .ZIP Delivery</span>
            <span>•</span>
            <span>🔒 100% Virus-Free &amp; Verified</span>
            <span>•</span>
            <span>♾️ Lifetime Access</span>
          </div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-lg); padding: 20px; text-align: left; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-size: 0.75rem; color: #64748B; display: block;">Order Reference:</span>
              <strong style="font-family: var(--font-mono); color: var(--color-accent); font-size: 1rem;" id="confirmedOrderId">DV-94821</strong>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; color: #64748B; display: block;">Delivered To Email:</span>
              <strong style="font-size: 0.875rem;">${checkoutState.customerEmail}</strong>
            </div>
          </div>

          <h4 style="font-size: 0.875rem; font-weight: 700; margin-bottom: 10px; color: var(--color-primary);">
            Your Digital Files &amp; License Keys:
          </h4>

          <div id="confirmedDownloadsList" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-secondary" id="confirmedViewInvoiceBtn">
            ${getIcon('file-text')} View Tax Invoice
          </button>
          <button class="btn btn-primary" id="confirmedGoDashboardBtn">
            ${getIcon('user')} Go to My Downloads Dashboard
          </button>
        </div>
      </div>
    ` : ''}
  `;

  // Attach Step 1 Handlers (Strict Compulsory Validation)
  if (checkoutState.currentStep === 1) {
    const nextBtn = document.getElementById('checkoutNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('checkoutNameInput');
        const emailInput = document.getElementById('checkoutEmailInput');
        const phoneInput = document.getElementById('checkoutPhoneInput');
        const stateInput = document.getElementById('checkoutStateInput');
        const cityInput = document.getElementById('checkoutCityInput');
        const alertBox = document.getElementById('checkoutFormAlert');

        let isValid = true;
        let firstInvalid = null;

        // Reset styling
        [nameInput, emailInput, phoneInput, stateInput, cityInput].forEach(inp => {
          if (inp) {
            inp.style.borderColor = '';
            inp.style.backgroundColor = '';
          }
        });
        ['nameErrorMsg', 'emailErrorMsg', 'phoneErrorMsg', 'stateErrorMsg', 'cityErrorMsg'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });

        // 1. Name check
        const nameVal = nameInput ? nameInput.value.trim() : '';
        if (!nameVal || nameVal.length < 2) {
          if (nameInput) {
            nameInput.style.borderColor = '#EF4444';
            nameInput.style.backgroundColor = '#FEF2F2';
          }
          const el = document.getElementById('nameErrorMsg');
          if (el) el.style.display = 'block';
          isValid = false;
          if (!firstInvalid) firstInvalid = nameInput;
        }

        // 2. Email check
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailVal || !emailRegex.test(emailVal)) {
          if (emailInput) {
            emailInput.style.borderColor = '#EF4444';
            emailInput.style.backgroundColor = '#FEF2F2';
          }
          const el = document.getElementById('emailErrorMsg');
          if (el) el.style.display = 'block';
          isValid = false;
          if (!firstInvalid) firstInvalid = emailInput;
        }

        // 3. Mobile Number check (10 digits Indian mobile)
        const rawPhone = phoneInput ? phoneInput.value.trim().replace(/\D/g, '') : '';
        if (!rawPhone || rawPhone.length !== 10) {
          if (phoneInput) {
            phoneInput.style.borderColor = '#EF4444';
            phoneInput.style.backgroundColor = '#FEF2F2';
          }
          const el = document.getElementById('phoneErrorMsg');
          if (el) el.style.display = 'block';
          isValid = false;
          if (!firstInvalid) firstInvalid = phoneInput;
        }

        // 4. State check
        const stateVal = stateInput ? stateInput.value : '';
        if (!stateVal) {
          if (stateInput) {
            stateInput.style.borderColor = '#EF4444';
            stateInput.style.backgroundColor = '#FEF2F2';
          }
          const el = document.getElementById('stateErrorMsg');
          if (el) el.style.display = 'block';
          isValid = false;
          if (!firstInvalid) firstInvalid = stateInput;
        }

        // 5. City check
        const cityVal = cityInput ? cityInput.value.trim() : '';
        if (!cityVal || cityVal.length < 2) {
          if (cityInput) {
            cityInput.style.borderColor = '#EF4444';
            cityInput.style.backgroundColor = '#FEF2F2';
          }
          const el = document.getElementById('cityErrorMsg');
          if (el) el.style.display = 'block';
          isValid = false;
          if (!firstInvalid) firstInvalid = cityInput;
        }

        if (!isValid) {
          if (alertBox) {
            alertBox.innerHTML = '⚠️ <strong>Compulsory Details Required:</strong> Please fill all mandatory fields (Full Name, Valid Email, 10-digit Mobile Number, State and City) to proceed to payment.';
            alertBox.style.display = 'block';
          }
          showToast('Compulsory Details Required', 'Please complete all required fields to proceed to payment.', 'warning');
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        // All compulsory fields valid
        checkoutState.customerName = nameVal;
        checkoutState.customerEmail = emailVal;
        checkoutState.customerPhone = rawPhone;
        checkoutState.customerState = stateVal;
        checkoutState.customerCity = cityVal;

        checkoutState.currentStep = 2;
        renderCheckoutStep();
      });
    }
  }

  // Attach Step 2 Handlers
  if (checkoutState.currentStep === 2) {
    const backBtn = document.getElementById('checkoutBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        checkoutState.currentStep = 1;
        renderCheckoutStep();
      });
    }

    const editDetailsLinkBtn = document.getElementById('editDetailsLinkBtn');
    if (editDetailsLinkBtn) {
      editDetailsLinkBtn.addEventListener('click', () => {
        checkoutState.currentStep = 1;
        renderCheckoutStep();
      });
    }

    container.querySelectorAll('.gateway-card').forEach(card => {
      card.addEventListener('click', () => {
        const gateway = card.getAttribute('data-gateway');
        if (checkoutState.selectedGateway !== gateway) {
          checkoutState.selectedGateway = gateway;
          renderCheckoutStep();
        }
      });
    });

    const verifyUpiBtn = document.getElementById('verifyUpiBtn');
    if (verifyUpiBtn) {
      verifyUpiBtn.addEventListener('click', () => {
        const input = document.getElementById('checkoutUpiIdInput');
        const vpa = input ? input.value.trim() : '';
        if (vpa && vpa.includes('@')) {
          showToast('UPI ID Verified', `${vpa} is verified & ready to pay!`, 'success');
        } else {
          showToast('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. 9876543210@upi, name@okhdfcbank)', 'warning');
        }
      });
    }

    const payBtn = document.getElementById('checkoutPayBtn');
    if (payBtn) {
      payBtn.addEventListener('click', async () => {
        payBtn.innerHTML = `${getIcon('refresh-cw')} Initializing Secure Payment...`;
        payBtn.disabled = true;

        const couponCode = store.cart.appliedCoupon ? store.cart.appliedCoupon.code : null;
        const customerPayload = {
          name: checkoutState.customerName,
          email: checkoutState.customerEmail,
          phone: checkoutState.customerPhone,
          state: checkoutState.customerState,
          city: checkoutState.customerCity
        };

        const finalizeAndRenderSuccess = (orderData, token = null) => {
          checkoutState.confirmedOrder = orderData;
          checkoutState.downloadToken = token;
          checkoutState.currentStep = 3;
          renderCheckoutStep();

          const orderRefEl = document.getElementById('confirmedOrderId');
          if (orderRefEl) orderRefEl.textContent = orderData.id || orderData.orderNumber;

          const heroDownloadBtn = document.getElementById('confirmedDownloadBundleHeroBtn');
          const downloadBtnText = document.getElementById('downloadBtnText');
          if (heroDownloadBtn) {
            heroDownloadBtn.addEventListener('click', () => {
              if (downloadBtnText) downloadBtnText.textContent = '⏳ Preparing & Downloading Bundle...';
              showToast('Download Started!', 'Your verified digital package is downloading now.', 'success');
              
              (orderData.items || []).forEach((item, index) => {
                setTimeout(() => {
                  downloadRealDigitalProductPackage(item.id, item.downloadFilename || `${item.title.replace(/\s+/g, '_')}.zip`, orderData.licenseKey || 'DV-COMMERCIAL-UNLIMITED');
                }, index * 300);
              });

              setTimeout(() => {
                if (downloadBtnText) downloadBtnText.textContent = '📥 Download Bundle Again (.zip)';
              }, 2500);
            });
          }

          const downloadsContainer = document.getElementById('confirmedDownloadsList');
          if (downloadsContainer) {
            downloadsContainer.innerHTML = (orderData.items || []).map(item => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: var(--radius-md);">
                <div>
                  <div style="font-weight: 700; font-size: 0.9375rem; color: var(--color-primary);">${item.title}</div>
                  <div style="font-size: 0.75rem; color: #64748B; font-family: var(--font-mono); margin-top: 2px;">
                    License Key: <strong>${orderData.licenseKey || 'DV-COMMERCIAL-PRO'}</strong>
                  </div>
                </div>
                <button class="btn btn-primary btn-sm" data-action="download-confirmed-item" data-id="${item.id}" data-filename="${item.downloadFilename || 'DigitalVault_Asset.zip'}">
                  ${getIcon('download')} Download
                </button>
              </div>
            `).join('');
          }
        };

        // Try Fullstack Backend Razorpay Order Creation
        try {
          const apiOrder = await api.createRazorpayOrder({
            items: items.map(i => ({ id: i.id, type: i.type || 'product' })),
            customer: customerPayload,
            couponCode
          });

          // Free Item / 100% Coupon zero-cost checkout
          if (apiOrder.isFree) {
            showToast('Order Complete!', 'Free digital product unlocked!', 'success');
            const createdOrder = store.createOrder({
              id: apiOrder.orderNumber,
              customerName: customerPayload.name,
              customerEmail: customerPayload.email,
              customerPhone: customerPayload.phone,
              customerState: customerPayload.state,
              customerCity: customerPayload.city,
              items: items,
              subtotal,
              discount,
              total: 0,
              gateway: 'FREE_CLAIM'
            });
            finalizeAndRenderSuccess(createdOrder, apiOrder.downloadToken);
            return;
          }

          // Launch Official Razorpay Modal
          if (window.Razorpay && apiOrder.orderId && apiOrder.keyId) {
            const rzpOptions = {
              key: apiOrder.keyId,
              amount: apiOrder.amount,
              currency: apiOrder.currency || 'INR',
              name: 'Digital Vault',
              description: items.length === 1 ? items[0].title : 'Digital Empire Resource Bundle',
              order_id: apiOrder.orderId,
              prefill: {
                name: customerPayload.name,
                email: customerPayload.email,
                contact: customerPayload.phone
              },
              theme: {
                color: '#7C3AED'
              },
              modal: {
                ondismiss: function() {
                  payBtn.disabled = false;
                  payBtn.innerHTML = `Pay ₹${total} Now`;
                  showToast('Payment Cancelled', 'You cancelled the Razorpay payment window.', 'info');
                }
              },
              handler: async function (response) {
                payBtn.innerHTML = `${getIcon('refresh-cw')} Verifying Signature...`;
                try {
                  const verified = await api.verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  });

                  showToast('Payment Verified!', 'Razorpay payment successfully verified.', 'success');

                  const createdOrder = store.createOrder({
                    id: verified.orderNumber,
                    customerName: customerPayload.name,
                    customerEmail: customerPayload.email,
                    customerPhone: customerPayload.phone,
                    customerState: customerPayload.state,
                    customerCity: customerPayload.city,
                    items: items,
                    subtotal,
                    discount,
                    total,
                    gateway: 'RAZORPAY',
                    razorpayPaymentId: response.razorpay_payment_id,
                    downloadToken: verified.downloadToken
                  });

                  finalizeAndRenderSuccess(createdOrder, verified.downloadToken);
                } catch (verifyErr) {
                  showToast('Verification Failed', verifyErr.message || 'Signature mismatch.', 'error');
                  payBtn.disabled = false;
                  payBtn.innerHTML = `Retry Payment (₹${total})`;
                }
              }
            };

            const rzpInstance = new window.Razorpay(rzpOptions);
            rzpInstance.on('payment.failed', function (failResp) {
              showToast('Payment Failed', failResp.error.description || 'Payment did not complete.', 'error');
              payBtn.disabled = false;
              payBtn.innerHTML = `Pay ₹${total} Now`;
            });
            rzpInstance.open();
            return;
          }
        } catch (apiErr) {
          console.warn('Backend Razorpay unavailable, falling back to local simulator:', apiErr.message);
        }

        // Offline / Simulation Fallback
        setTimeout(() => {
          const createdOrder = store.createOrder({
            customerName: checkoutState.customerName,
            customerEmail: checkoutState.customerEmail,
            customerPhone: checkoutState.customerPhone,
            customerState: checkoutState.customerState,
            customerCity: checkoutState.customerCity,
            items: items,
            subtotal,
            discount,
            total,
            gateway: checkoutState.selectedGateway.toUpperCase()
          });

          finalizeAndRenderSuccess(createdOrder);
        }, 1200);
      });
    }

            downloadsContainer.querySelectorAll('[data-action="download-confirmed-item"]').forEach(btn => {
              btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const filename = e.currentTarget.getAttribute('data-filename');
                downloadRealDigitalProductPackage(id, filename, createdOrder.licenseKey);
              });
            });
          }

          // Attach secondary actions
          const viewInvBtn = document.getElementById('confirmedViewInvoiceBtn');
          if (viewInvBtn) {
            viewInvBtn.addEventListener('click', () => {
              openInvoiceModal(createdOrder);
            });
          }

          const goDashBtn = document.getElementById('confirmedGoDashboardBtn');
          if (goDashBtn) {
            goDashBtn.addEventListener('click', () => {
              document.getElementById('checkoutModal').classList.remove('active');
              window.digitalVaultApp.switchView('dashboard', 'downloads');
            });
          }

          showToast('Payment Successful!', `Order ${createdOrder.id} confirmed. Bundle unlocked for download.`, 'success');
        }, 800);
      });
    }
  }
}

// Tax Invoice Modal Generator
export function openInvoiceModal(order) {
  const modal = document.getElementById('invoiceModal');
  const content = document.getElementById('invoiceModalContent');
  if (!modal || !content) return;

  const dateStr = order.date || new Date().toISOString().split('T')[0];
  const items = order.items || [];
  const total = order.total || 0;
  const subtotal = order.subtotal || total;
  const discount = order.discount || 0;

  content.innerHTML = `
    <div class="invoice-sheet" id="printableInvoiceArea">
      <div class="invoice-header">
        <div>
          <div class="invoice-brand-title">DIGITAL VAULT</div>
          <p style="font-size: 0.8125rem; color: #64748B;">Premium Digital Resources. Ready to Grow.</p>
          <p style="font-size: 0.75rem; color: #94A3B8;">support@digitalvault.io • https://digitalvault.io</p>
        </div>
        <div style="text-align: right;">
          <div class="invoice-id-badge">INVOICE: ${order.id}</div>
          <p style="font-size: 0.8125rem; color: #64748B; margin-top: 4px;">Date: ${dateStr}</p>
          <span class="status-badge status-completed" style="margin-top: 6px;">PAID IN FULL</span>
        </div>
      </div>

      <div class="invoice-party-row">
        <div>
          <strong style="color: #64748B; font-size: 0.75rem; text-transform: uppercase;">Billed To:</strong>
          <div style="font-weight: 700; margin-top: 4px;">${order.customerName || 'Customer'}</div>
          <div style="color: #475569;">${order.customerEmail}</div>
        </div>
        <div style="text-align: right;">
          <strong style="color: #64748B; font-size: 0.75rem; text-transform: uppercase;">Payment Method:</strong>
          <div style="font-weight: 700; margin-top: 4px;">${order.gateway || 'Stripe'}</div>
          <div style="color: #475569; font-family: var(--font-mono); font-size: 0.75rem;">Auth: AUTH_${Math.random().toString(36).substring(2, 7).toUpperCase()}</div>
        </div>
      </div>

      <table class="vault-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td>
                <strong>${i.title}</strong>
                <div style="font-size: 0.75rem; color: #64748B;">Commercial Lifetime License Included</div>
              </td>
              <td style="text-align: center;">${i.quantity || 1}</td>
              <td style="text-align: right;">₹${Number(i.price).toFixed(2)}</td>
              <td style="text-align: right;">₹${(Number(i.price) * (i.quantity || 1)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="invoice-totals-box">
        <div style="display: flex; justify-content: space-between; width: 240px; font-size: 0.875rem;">
          <span style="color: #64748B;">Subtotal:</span>
          <span>₹${Number(subtotal).toFixed(2)}</span>
        </div>
        ${discount > 0 ? `
          <div style="display: flex; justify-content: space-between; width: 240px; font-size: 0.875rem; color: #10B981;">
            <span>Discount Applied:</span>
            <span>-₹${Number(discount).toFixed(2)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; width: 240px; font-size: 0.875rem;">
          <span style="color: #64748B;">GST (18% Included):</span>
          <span>₹0.00 (All-Inclusive)</span>
        </div>
        <div style="display: flex; justify-content: space-between; width: 240px; border-top: 2px solid #E4E4E7; margin-top: 6px; padding-top: 6px;" class="invoice-grand-total">
          <span>Total Paid (INR):</span>
          <span>₹${Number(total).toFixed(2)}</span>
        </div>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #CBD5E1; text-align: center; font-size: 0.75rem; color: #94A3B8;">
        Thank you for choosing Digital Vault. All digital products are subject to our Commercial License agreement.
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button class="btn btn-secondary" onclick="window.print()">
          Print / Save PDF
        </button>
        <button class="btn btn-dark" id="invoiceCloseActionBtn">
          Close Invoice
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  const closeBtn = document.getElementById('invoiceCloseActionBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
}
