import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ [WARNING] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in server environment variables.');
  console.warn('⚠️ Server will run in degraded mode until Supabase credentials are configured in .env');
}

// Client with Service Role privileges - NEVER expose this client to the browser!
export const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;
