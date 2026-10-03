import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatPrice, timeAgo, waLink } from '@/lib/utils';
import { getProductEmoji, CATEGORY_COLORS } from '@/lib/emojis';
import { MapPin, Package, Store, Eye, BadgeCheck } from 'lucide-react';
import ReportButton from '@/components/ReportButton';
import PriceConverter from '@/components/PriceConverter';
import RatingStars from '@/components/RatingStars';
import type { Currency } from '@/lib/types';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: p } = await supabase
    .from('product_feed').select('*').eq('id', params.id).single();

  if (!p) notFound();
  await supabase.rpc('increment_views', { pid: params.id });

  const emoji = getProductEmoji(p);
  const gradient = CATEGORY_COLORS[p.category_slug ?? 'other'] ?? CATEGORY_COLORS.other;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 pb-6 border-b">
        <div
          className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-7xl shrink-0 shadow-inner`}
        >
          {emoji}
        </div>
        <div className="flex-1 text-center sm:text-right">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{p.name}</h1>
            {p.trader_verified && <BadgeCheck className="w-6 h-6 text-brand-600" />}
          </div>
          {p.category_name && (
            <span className="inline-block text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full mb-2">
              {p.category_icon} {p.category_name}
            </span>
          )}
          <div className="flex items-baseline gap-2 justify-center sm:justify-start">
            <span className="text-3xl font-extrabold text-brand-700">
              {formatPrice(p.price, p.currency)}
            </span>
            <span className="text-gray-500">/ {p.unit}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <PriceConverter price={p.price} currency={p.currency as Currency} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6 text-sm">
        <Info icon={<Package />} label="الكمية المتاحة" value={`${p.qty} ${p.unit}`} />
        <Info icon={<MapPin />} label="الموقع" value={`${p.state}${p.market ? ' — ' + p.market : ''}`} />
        <Info icon={<Store />} label="التاجر" value={p.trader_name ?? ''} />
        <Info icon={<Eye />} label="المشاهدات" value={String(p.views_count)} />
      </div>

      {!!p.trader_rating && (
        <div className="flex items-center gap-2 mb-6">
          <RatingStars value={p.trader_rating} readonly size="sm" />
          <span className="text-xs text-gray-500">
            {Number(p.trader_rating).toFixed(1)} ({p.trader_rating_count ?? 0} تقييم)
          </span>
        </div>
      )}

      {p.description && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-1 text-sm text-gray-600">الوصف</h3>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{p.description}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-400">{timeAgo(p.created_at)}</span>
        <ReportButton productId={p.id} />
      </div>

      <a
        href={waLink(p.trader_phone ?? '', p.name)}
        target="_blank" rel="noopener noreferrer"
        className="block w-full bg-[#25D366] hover:bg-[#1fb457] text-white text-center font-bold py-3.5 rounded-xl"
      >
        💬 تواصل عبر واتساب
      </a>
    </div>
  );
}

function Info({ icon, label, value }: {
  icon: React.ReactNode; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-gray-700">
      <span className="text-gray-400 w-4 h-4">{icon}</span>
      <span className="text-gray-500">{label}:</span>
      <b>{value}</b>
    </div>
  );
}
