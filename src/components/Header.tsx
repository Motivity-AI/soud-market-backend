'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, LogOut, PlusCircle, Store, User, Shield } from 'lucide-react';
import type { User as SUser } from '@supabase/supabase-js';

export default function Header() {
  const supabase = createClient();
  const [user, setUser] = useState<SUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: p } = await supabase
          .from('profiles').select('role').eq('id', data.user.id).single();
        setIsAdmin(p?.role === 'admin');
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    location.href = '/';
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <Store className="w-7 h-7" />
          <span className="text-lg">بورصة السودان</span>
        </Link>

        <nav className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard/new"
                className="hidden sm:flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm px-3 py-2 rounded-lg"
              >
                <PlusCircle className="w-4 h-4" /> منتج جديد
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-purple-700 hover:bg-purple-50"
                >
                  <Shield className="w-4 h-4" /> الإدارة
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <LayoutDashboard className="w-4 h-4" /> لوحتي
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm px-3 py-2 rounded-lg hover:bg-gray-100">
                دخول
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-lg"
              >
                <User className="w-4 h-4" /> حساب تاجر
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
