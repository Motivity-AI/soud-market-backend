'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { STATES, UNITS, type Category, type Product } from '@/lib/types';
import { PRODUCT_SUGGESTIONS } from '@/lib/emojis';
import { enqueue } from '@/lib/offline/sync';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProductForm({
  categories, initial
}: { categories: Category[]; initial?: Partial<Product> }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    category_id: initial?.category_id ?? categories[0]?.id ?? null,
    emoji: initial?.emoji ?? '📦',
    qty: initial?.qty ?? '',
    unit: initial?.unit ?? 'قطعة',
    price: initial?.price ?? '',
    currency: initial?.currency ?? 'SDG',
    price_usd: initial?.price_usd ?? '',
    state: initial?.state ?? 'الخرطوم',
    city: initial?.city ?? '',
    market: initial?.market ?? '',
    min_order: initial?.min_order ?? 1
  });

  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('يجب تسجيل الدخول');
      setLoading(false);
      return;
    }

    const payload = {
      ...f,
      trader_id: user.id,
      qty: Number(f.qty),
      price: Number(f.price),
      price_usd: f.price_usd ? Number(f.price_usd) : null,
      min_order: Number(f.min_order)
    };

    // 🆕 وضع أوفلاين — احفظ محلياً
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await enqueue(
        initial?.id
          ? { type: 'update', id: initial.id, payload }
          : { type: 'insert', payload }
      );
      toast.success('📥 تم الحفظ محلياً — سيُنشر عند عودة الإنترنت');
      router.push('/dashboard');
      router.refresh();
      return;
    }

    // الوضع الطبيعي
    const { error } = initial?.id
      ? await supabase.from('products').update(payload).eq('id', initial.id)
      : await supabase.from('products').insert(payload);

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(initial?.id ? 'تم التحديث' : 'تم نشر المنتج');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <F label="اسم المنتج *">
          <input
            required value={f.name} onChange={(e) => set('name', e.target.value)}
            className="in" placeholder="سكر كنانة"
          />
        </F>
        <F label="التصنيف">
          <select
            value={f.category_id ?? ''}
            onChange={(e) => set('category_id', Number(e.target.value))}
            className="in"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name_ar}</option>
            ))}
          </select>
        </F>
      </div>

      <F label="رمز المنتج (اختياري)">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-3xl border-2 border-brand-200">
              {f.emoji || '📦'}
            </div>
            <input
              value={f.emoji}
              onChange={(e) => set('emoji', e.target.value.slice(0, 8))}
              placeholder="الصق إيموجي أو اختر من الأسفل"
              className="in flex-1 text-center text-2xl"
              maxLength={8}
            />
            {f.emoji && (
              <button
                type="button" onClick={() => set('emoji', '')}
                className="text-xs text-red-600 hover:underline"
              >
                مسح
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {PRODUCT_SUGGESTIONS.map((s) => (
              <button
                key={s.label} type="button" title={s.label}
                onClick={() => set('emoji', s.emoji)}
                className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition ${
                  f.emoji === s.emoji ? 'bg-brand-600 ring-2 ring-brand-300' : 'bg-gray-100 hover:bg-brand-50'
                }`}
              >
                {s.emoji}
              </button>
            ))}
          </div>
        </div>
      </F>

      <div className="grid sm:grid-cols-2 gap-4">
        <F label="الكمية المتاحة *">
          <input
            required type="number" step="any" min="0"
            value={f.qty} onChange={(e) => set('qty', e.target.value)}
            className="in"
          />
        </F>
        <F label="الوحدة">
          <select value={f.unit} onChange={(e) => set('unit', e.target.value)} className="in">
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </F>
        <F label="السعر *">
          <input
            required type="number" step="any" min="0"
            value={f.price} onChange={(e) => set('price', e.target.value)}
            className="in"
          />
        </F>
        <F label="العملة">
          <select value={f.currency} onChange={(e) => set('currency', e.target.value)} className="in">
            <option value="SDG">جنيه سوداني</option>
            <option value="USD">دولار أمريكي</option>
            <option value="SAR">ريال سعودي</option>
          </select>
        </F>
        <F label="الولاية *">
          <select value={f.state} onChange={(e) => set('state', e.target.value)} className="in">
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </F>
        <F label="المدينة">
          <input value={f.city} onChange={(e) => set('city', e.target.value)} className="in" />
        </F>
        <F label="السوق / المنطقة">
          <input
            value={f.market} onChange={(e) => set('market', e.target.value)}
            placeholder="سوق أم درمان الكبير" className="in"
          />
        </F>
        <F label="أقل كمية للطلب">
          <input
            type="number" step="any" min="1"
            value={f.min_order} onChange={(e) => set('min_order', e.target.value)}
            className="in"
          />
        </F>
      </div>

      <F label="الوصف / ملاحظات">
        <textarea
          rows={3} value={f.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder="تفاصيل إضافية، جودة، شروط التسليم..."
          className="in"
        />
      </F>

      <button
        disabled={loading} type="submit"
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {initial?.id ? 'حفظ التعديلات' : 'نشر المنتج'}
      </button>

      <style jsx>{`
        .in { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; background: #f9fafb; }
        .in:focus { border-color: #158049; background: #fff; outline: none; box-shadow: 0 0 0 3px rgba(21,128,73,0.1); }
      `}</style>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
