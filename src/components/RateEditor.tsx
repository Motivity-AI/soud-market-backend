'use client';
import { useEffect, useState } from 'react';
import { getRates, setRates, fetchLiveRates, type Rates } from '@/lib/rates';
import { RefreshCw, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RateEditor() {
  const [rates, setLocalRates] = useState<Rates | null>(null);
  const [usd, setUsd] = useState('');
  const [sar, setSar] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = getRates();
    setLocalRates(r);
    setUsd(String(Math.round(1 / r.USD)));
    setSar(String(Math.round(1 / r.SAR)));
  }, []);

  const save = () => {
    const u = Number(usd);
    const s = Number(sar);
    if (!u || !s || u <= 0 || s <= 0) {
      toast.error('أدخل أسعاراً صحيحة');
      return;
    }
    setRates({ USD: 1 / u, SAR: 1 / s });
    toast.success('✅ تم حفظ أسعار الصرف');
  };

  const refresh = async () => {
    setLoading(true);
    const r = await fetchLiveRates();
    setLoading(false);
    if (r) {
      setLocalRates(r);
      setUsd(String(Math.round(1 / r.USD)));
      setSar(String(Math.round(1 / r.SAR)));
      toast.success('تم تحديث الأسعار من الإنترنت');
    } else {
      toast.error('فشل جلب الأسعار');
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-4">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-brand-600" />
        أسعار الصرف
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-20">1 دولار =</span>
          <input
            type="number" value={usd} onChange={(e) => setUsd(e.target.value)}
            className="flex-1 px-2 py-1.5 border rounded-lg" placeholder="600"
          />
          <span className="text-xs text-gray-500">ج.س</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20">1 ريال =</span>
          <input
            type="number" value={sar} onChange={(e) => setSar(e.target.value)}
            className="flex-1 px-2 py-1.5 border rounded-lg" placeholder="160"
          />
          <span className="text-xs text-gray-500">ج.س</span>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={save} className="flex-1 bg-brand-600 text-white text-sm py-2 rounded-lg">
          حفظ
        </button>
        <button
          onClick={refresh} disabled={loading}
          className="px-3 bg-gray-100 text-sm py-2 rounded-lg flex items-center gap-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {rates && (
        <p className="text-[10px] text-gray-400 mt-2">
          آخر تحديث: {new Date(rates.updatedAt).toLocaleString('ar-EG')}
        </p>
      )}
    </div>
  );
}
