import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  if (me?.role !== 'admin') redirect('/');

  const [{ data: reports }, { data: traders }, { data: pendingProducts }] =
    await Promise.all([
      supabase
        .from('reports')
        .select('*, product:products(name), reporter:profiles!reporter_id(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('product_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
    ]);

  return (
    <AdminClient
      reports={reports ?? []}
      traders={traders ?? []}
      products={pendingProducts ?? []}
    />
  );
}
