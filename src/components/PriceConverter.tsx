'use client';
import { useEffect, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { convert, getRates } from '@/lib/rates';
import { formatPrice } from '@/lib/utils';
import type { Currency } from '@/lib/types';

export default function PriceConverter({
  price, currency
}: { price: number; currency: Currency }) {
  const [target, setTarget] = useState<Currency>('USD');
  const [converted, setConverted] = useState(0);

  useEffect(() => {
    const update = () => setConverted(convert(price, currency, target));
    update();
    window.addEventListener('rates-updated', update);
    return () => window.removeEventListener('rates-updated', update);
  }, [price, currency, target]);

  const options: Currency[] = ['SDG', 'USD', 'SAR'];

  return (
    <div className="bg-gray-50 rounded-xl p-3 text-sm">
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="w-4 h-4 text-brand-600" />
        <span className="text-gray-600">ما يعادل:</span>
        <span className="font-bold text-brand-700">
          {formatPrice(converted, target)}
        </span>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as Currency)}
          className="mr-auto text-xs bg-white border rounded-lg px-2 py-1"
        >
          {options.filter((o) => o !== currency).map((o) => (
            <option key={o} value={o}>
              {o === 'SDG' ? 'جنيه' : o === 'USD' ? 'دولار' : 'ريال'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
