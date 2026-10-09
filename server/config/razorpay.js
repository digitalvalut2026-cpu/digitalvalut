import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn('⚠️ [WARNING] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing.');
  console.warn('⚠️ Real payments will not execute until Razorpay API keys are configured in .env');
}

export const razorpay = (keyId && keySecret)
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    })
  : null;
