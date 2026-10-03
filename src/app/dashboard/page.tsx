import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Package, Eye, MessageCircle } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: products } = await supabase
    .from('product_feed')
    .select('*')
    .eq('trader_id', user.id)
    .order('created_at', { ascending: false });

  const list = (products ?? []) as Product[];
  const totalViews = list.reduce((s, p) => s + (p.views_count ?? 0), 0);
  const totalClicks = list.reduce((s, p) => s + (p.whatsapp_clicks ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">لوحة التاجر</h1>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> منتج جديد
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat icon={<Package />} label="المنتجات" value={list.length} />
        <Stat icon={<Eye />} label="المشاهدات" value={totalViews} />
        <Stat icon={<MessageCircle />} label="تواصل واتساب" value={totalClicks} />
      </div>

      {list.length === 0 ? (
        <EmptyState title="لم تُضف أي منتج بعد" desc="ابدأ بنشر أول منتج لك الآن" />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((p) => (
            <div key={p.id} className="relative">
              <ProductCard p={p} />
              <div className="absolute top-2 left-2 flex gap-1">
                <Link
                  href={`/dashboard/edit/${p.id}`}
                  className="bg-white/90 backdrop-blur text-xs px-2.5 py-1 rounded-lg border"
                >
                  تعديل
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon, label, value
}: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}
