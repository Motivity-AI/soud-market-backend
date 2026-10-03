'use client';
import { Search, X } from 'lucide-react';
import { STATES, type Category } from '@/lib/types';

export default function Filters({
  q, setQ, category, setCategory, state, setState, categories
}: {
  q: string; setQ: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  state: string; setState: (v: string) => void;
  categories: Category[];
}) {
  const hasFilter = q || category || state;

  return (
    <div className="bg-white rounded-2xl border p-4 lg:sticky lg:top-20 z-30">
      <div className="relative mb-3">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن منتج، تاجر، أو سوق..."
          className="w-full pr-11 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border rounded-xl text-sm"
        >
          <option value="">كل التصنيفات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.icon} {c.name_ar}</option>
          ))}
        </select>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border rounded-xl text-sm"
        >
          <option value="">كل الولايات</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {hasFilter && (
        <button
          onClick={() => { setQ(''); setCategory(''); setState(''); }}
          className="mt-3 text-xs text-brand-700 hover:underline flex items-center gap-1"
        >
          <X className="w-3 h-3" /> مسح الفلاتر
        </button>
      )}
    </div>
  );
}
