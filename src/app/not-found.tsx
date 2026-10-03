import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <div className="text-7xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h1>
      <p className="text-gray-500 mb-6">ربما حُذف المنتج أو الرابط غير صحيح</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-3 rounded-xl"
      >
        <Home className="w-4 h-4" /> العودة للرئيسية
      </Link>
    </div>
  );
}
