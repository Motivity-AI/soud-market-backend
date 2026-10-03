'use client';
import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductCard from './ProductCard';
import Filters from './Filters';
import EmptyState from './EmptyState';
import RateEditor from './RateEditor';
import { cacheProducts } from '@/lib/offline/sync';
import toast from 'react-hot-toast';
import type { Category, Product } from '@/lib/types';

export default function ProductFeed({
  initialProducts, categories, initialFilters
}: {
  initialProducts: Product[];
  categories: Category[];
  initialFilters: { q: string; category: string; state: string };
}) {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [q, setQ] = useState(initialFilters.q);
  const [cat, setCat] = useState(initialFilters.category);
  const [state, setState] = useState(initialFilters.state);

  // 🔴 Realtime — استقبال المنتجات الجديدة
  useEffect(() => {
    const channel = supabase
      .channel('products-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'products' },
        async (payload) => {
          const { data } = await supabase
            .from('product_feed').select('*').eq('id', payload.new.id).single();
          if (data) {
            setProducts((prev) => [data, ...prev.filter((x) => x.id !== data.id)]);
            toast.success(`🆕 منتج جديد: ${data.name}`, { duration: 2500 });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          setProducts((prev) =>
            prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'products' },
        (payload) => {
          setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  // 💾 تخزين آخر نسخة للقراءة أوفلاين
  useEffect(() => {
    if (products.length > 0) cacheProducts(products);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchQ =
        !q ||
        p.name.includes(q) ||
        (p.description ?? '').includes(q) ||
        (p.trader_name ?? '').includes(q) ||
        (p.market ?? '').includes(q);
      const matchC = !cat || p.category_slug === cat;
      const matchS = !state || p.state === state;
      return matchQ && matchC && matchS;
    });
  }, [products, q, cat, state]);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <aside className="space-y-4">
        <Filters
          q={q} setQ={setQ}
          category={cat} setCategory={setCat}
          state={state} setState={setState}
          categories={categories}
        />
        <RateEditor />
      </aside>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">🏪 الأسعار المتاحة</h1>
          <span className="text-sm text-gray-500">{filtered.length} منتج</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            title="لا توجد منتجات مطابقة"
            desc="جرّب تغيير الفلاتر أو ابحث بكلمة أخرى"
          />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
