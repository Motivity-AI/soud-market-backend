'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { STATES } from '@/lib/types';
import toast from 'react-hot-toast';
import { Loader2, Store } from 'lucide-react';

export default function RegisterPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '', phone: '', state: 'الخرطوم' as string, city: '',
    email: '', password: ''
  });

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
            state: form.state,
            city: form.city
          },
          emailRedirectTo: `${location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      toast.success('تم التسجيل! تحقق من بريدك الإلكتروني');
      location.href = '/login';
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl border p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6 text-brand-700">
        <Store className="w-7 h-7" />
        <h1 className="text-xl font-bold">حساب تاجر جديد</h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="الاسم الكامل *">
          <input
            required value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)}
            className="in" placeholder="محمد أحمد علي"
          />
        </Field>
        <Field label="رقم الهاتف / واتساب *">
          <input
            required value={form.phone} pattern="[0-9+\s-]{9,15}"
            onChange={(e) => set('phone', e.target.value)}
            className="in" placeholder="0912345678"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="الولاية">
            <select
              value={form.state} onChange={(e) => set('state', e.target.value)}
              className="in"
            >
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="المدينة / السوق">
            <input
              value={form.city} onChange={(e) => set('city', e.target.value)}
              className="in" placeholder="أم درمان"
            />
          </Field>
        </div>
        <Field label="البريد الإلكتروني *">
          <input
            required type="email" value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className="in" placeholder="trader@example.com"
          />
        </Field>
        <Field label="كلمة المرور * (8 أحرف على الأقل)">
          <input
            required type="password" minLength={8} value={form.password}
            onChange={(e) => set('password', e.target.value)}
            className="in"
          />
        </Field>

        <button
          disabled={loading} type="submit"
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء الحساب'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-5">
        عندك حساب؟{' '}
        <Link href="/login" className="text-brand-700 font-semibold">دخول</Link>
      </p>

      <style jsx>{`
        .in { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; background: #f9fafb; outline: none; }
        .in:focus { border-color: #158049; background: #fff; box-shadow: 0 0 0 3px rgba(21,128,73,0.1); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
