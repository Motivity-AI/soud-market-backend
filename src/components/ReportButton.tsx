'use client';
import { useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ReportButton({ productId }: { productId: string }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return toast.error('اكتب سبب البلاغ');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('يجب تسجيل الدخول');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('reports').insert({
      product_id: productId,
      reporter_id: user.id,
      reason: reason.trim()
    });

    setLoading(false);
    if (error) return toast.error('فشل الإرسال');
    toast.success('✅ تم إرسال البلاغ — شكراً لك');
    setReason('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
      >
        <Flag className="w-3.5 h-3.5" /> إبلاغ
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-5 max-w-md w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">إبلاغ عن المنتج</h3>
          <button onClick={() => setOpen(false)} className="text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <textarea
          value={reason} onChange={(e) => setReason(e.target.value)}
          rows={3} placeholder="اذكر سبب البلاغ: محتوى مخالف، سعر مزيف، تاجر وهمي..."
          className="w-full px-3 py-2 border rounded-xl text-sm mb-3"
        />
        <button
          onClick={submit} disabled={loading}
          className="w-full bg-red-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          إرسال البلاغ
        </button>
      </div>
    </div>
  );
}
