'use client';
import Link from 'next/link';
import { MapPin, Package, Store, BadgeCheck, Eye, Clock, Flame } from 'lucide-react';
import { formatPrice, timeAgo, waLink, isNew } from '@/lib/utils';
import { getProductEmoji, CATEGORY_COLORS } from '@/lib/emojis';
import type { Product } from '@/lib/types';

export default function ProductCard({ p }: { p: Product }) {
  const emoji = getProductEmoji(p);
  const gradient = CATEGORY_COLORS[p.category_slug ?? 'other'] ?? CATEGORY_COLORS.other;

  return (
    <div className="bg-white rounded-2xl border hover:shadow-lg transition-shadow p-4 flex flex-col">
      <div className="flex items-start gap-3">
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl shrink-0`}
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/product/${p.id}`}>
            <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-brand-700">
              {p.name}
            </h3>
          </Link>
          {p.category_name && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 mt-1">
              <span>{p.category_icon ?? '📦'}</span>
              {p.category_name}
            </span>
          )}
          {isNew(p.created_at) && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mr-1">
              <Flame className="w-3 h-3" /> جديد
            </span>
          )}
        </div>
        {p.trader_verified && (
          <BadgeCheck className="w-5 h-5 text-brand-600 shrink-0" title="موثّق" />
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-brand-700">
          {formatPrice(p.price, p.currency)}
        </span>
        <span className="text-xs text-gray-500">/ {p.unit}</span>
      </div>

      <div className="mt-2 space-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          <span>متوفر: <b>{p.qty} {p.unit}</b></span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>{p.state}{p.market ? ` — ${p.market}` : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5" />
          <span>{p.trader_name}</span>
          {!!p.trader_rating && (
            <span className="text-amber-500">★ {Number(p.trader_rating).toFixed(1)}</span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {timeAgo(p.created_at)}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> {p.views_count}
        </span>
      </div>

      <a
        href={waLink(p.trader_phone ?? '', p.name)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => { fetch(`/api/products/${p.id}/click`, { method: 'POST' }).catch(() => {}); }}
        className="mt-3 bg-[#25D366] hover:bg-[#1fb457] text-white text-sm font-semibold text-center py-2.5 rounded-xl"
      >
        💬 تواصل واتساب
      </a>
    </div>
  );
}
