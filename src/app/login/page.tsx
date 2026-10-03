'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const supabase = createClient();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success('مرحباً بك');
    location.href = redirect;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border p-6 sm:p-8 mt-8">
      <div className="flex items-center gap-2 mb-6 text-brand-700">
        <LogIn className="w-7 h-7" />
        <h1 className="text-xl font-bold">تسجيل الدخول</h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <input
          required type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
          className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
        />
        <input
          required type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
        />
        <button
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دخول'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-5">
        ما عندك حساب؟{' '}
        <Link href="/register" className="text-brand-700 font-semibold">سجّل كتاجر</Link>
      </p>
    </div>
  );
}
