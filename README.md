# 🇸🇩 Sudan Market — بورصة أسعار السودان

منصة خفيفة (بدون صور — إيموجي فقط) لعرض أسعار المنتجات من التجار مباشرة.

## ✨ الميزات

- 🔐 مصادقة كاملة (Supabase Auth)
- 🛡️ RLS مُحكم (كل تاجر يدير منتجاته فقط)
- 🔎 بحث + فلترة (تصنيف، ولاية)
- 📊 لوحة تاجر بإحصائيات (مشاهدات + نقرات واتساب)
- 👑 لوحة أدمن (بلاغات + توثيق + حظر)
- 📱 PWA يعمل أوفلاين (IndexedDB + Service Worker)
- 🔄 Realtime (الجميع يرى الجديد فوراً)
- 💱 تحويل عملات تلقائي (SDG/USD/SAR)
- ⭐ نظام تقييمات
- 🚨 نظام بلاغات
- 🪶 خفيف جداً (بدون صور)

## 🛠️ التقنيات

| الطبقة | التقنية |
|---|---|
| الواجهة | Next.js 14 (App Router) |
| اللغة | TypeScript |
| التنسيق | Tailwind CSS |
| قاعدة البيانات | Supabase (PostgreSQL) |
| المصادقة | Supabase Auth |
| الأوفلاين | IndexedDB + Service Worker |
| الاختبارات | Playwright |

## 🚀 التشغيل

### 1. المتطلبات
- Node.js 18+
- حساب Supabase

### 2. التثبيت

```bash
git clone https://github.com/YOUR_USERNAME/sudan-market.git
cd sudan-market
npm install
