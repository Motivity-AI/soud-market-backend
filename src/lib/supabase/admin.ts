import { createClient as createSb } from '@supabase/supabase-js';

/** عميل بصلاحيات كاملة — استخدمه فقط في Server Actions / Route Handlers */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY غير موجود');
  return createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
