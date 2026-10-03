'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, Flag, Users, Package, CheckCircle2, XCircle, Ban, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { timeAgo } from '@/lib/utils';
import type { Profile, Product, Report } from '@/lib/types';

type Tab = 'reports' | 'traders' | 'products';

export default function AdminClient({
  reports: initialReports, traders: initialTraders, products: initialProducts
}: {
  reports: Report[]; traders: Profile[]; products: Product[];
}) {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>('reports');
  const [reports, setReports] = useState(initialReports);
  const [traders, setTraders] = useState(initialTraders);
  const [products, setProducts] = useState(initialProducts);

  const resolveReport = async (id: string, action: 'resolved' | 'dismissed') => {
    const { error } = await supabase
      .from('reports')
      .update({ status: action, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return toast.error('فشل');
    setReports((r) => r.filter((x) => x.id !== id));
    toast.success(action === 'resolved' ? 'تم الحل' : 'تم التجاهل');
  };

  const banTrader = async (id: string, banned: boolean) => {
    const { error } = await supabase
      .from('profiles').update({ is_banned: banned }).eq('id', id);
    if (error) return toast.error('فشل');
    setTraders((t) => t.map((x) => (x.id === id ? { ...x, is_banned: banned } : x)));
    toast.success(banned ? 'تم الحظر' : 'تم رفع الحظر');
  };

  const verifyTrader = async (id: string, verified: boolean) => {
    const { error } = await supabase
      .from('profiles').update({ is_verified: verified }).eq('id', id);
    if (error) return toast.error('فشل');
    setTraders((t) => t.map((x) => (x.id === id ? { ...x, is_verified: verified } : x)));
    toast.success(verified ? '✅ تم التوثيق' : 'تم إلغاء التوثيق');
  };

  const banProduct = async (id: string) => {
    const { error } = await supabase
      .from('products').update({ status: 'banned' }).eq('id', id);
    if (error) return toast.error('فشل');
    setProducts((p) => p.filter((x) => x.id !== id));
    toast.success('تم حظر المنتج');
  };

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'reports',  label: 'البلاغات', icon: Flag,    count: reports.length },
    { key: 'traders',  label: 'التجار',   icon: Users,   count: traders.length },
    { key: 'products', label: 'المنتجات', icon: Package, count: products.length }
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
          <p className="text-sm text-gray-500">إدارة البلاغات، التجار، والمنتجات</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap ${
              tab === t.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
            {!!t.count && (
              <span className="bg-gray-100 text-gray-600 text-xs px-1.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <EmptyBox text="لا توجد بلاغات معلقة" />
          ) : reports.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-sm">
                    {r.product?.name ?? 'منتج محذوف'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    بلاغ من: {r.reporter?.full_name ?? 'مجهول'} • {timeAgo(r.created_at)}
                  </div>
                </div>
                <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                  {r.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2 mb-3">
                {r.reason}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => resolveReport(r.id, 'resolved')}
                  className="flex-1 bg-green-600 text-white text-xs py-2 rounded-lg flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> حل
                </button>
                <button
                  onClick={() => resolveReport(r.id, 'dismissed')}
                  className="flex-1 bg-gray-200 text-gray-700 text-xs py-2 rounded-lg flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> تجاهل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'traders' && (
        <div className="space-y-3">
          {traders.length === 0 ? (
            <EmptyBox text="لا يوجد تجار" />
          ) : traders.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-lg">
                {t.full_name?.charAt(0) ?? '؟'}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm flex items-center gap-1">
                  {t.full_name}
                  {t.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-brand-600" />}
                  {t.is_banned && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded">محظور</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {t.phone} • {t.state} • ⭐ {Number(t.rating_avg).toFixed(1)}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => verifyTrader(t.id, !t.is_verified)}
                  title="توثيق"
                  className={`p-2 rounded-lg ${
                    t.is_verified ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <BadgeCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => banTrader(t.id, !t.is_banned)}
                  title={t.is_banned ? 'رفع الحظر' : 'حظر'}
                  className={`p-2 rounded-lg ${
                    t.is_banned ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-3">
          {products.length === 0 ? (
            <EmptyBox text="لا توجد منتجات" />
          ) : products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl">
                {p.emoji ?? '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{p.name}</div>
                <div className="text-xs text-gray-500">
                  {p.trader_name} • {p.price} {p.currency} • {timeAgo(p.created_at)}
                </div>
              </div>
              <button
                onClick={() => banProduct(p.id)}
                className="p-2 rounded-lg bg-red-50 text-red-600"
                title="حظر"
              >
                <Ban className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl border p-10 text-center text-gray-500 text-sm">
      {text}
    </div>
  );
}
