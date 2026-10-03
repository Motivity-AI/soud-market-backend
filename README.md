# 🇸🇩 بورصة أسعار السودان

منصة خفيفة (بدون صور — إيموجي فقط) لعرض أسعار المنتجات من التجار مباشرة.

## الميزات
- 🔐 مصادقة كاملة (Supabase Auth)
- 🛡️ RLS مُحكم
- 🔎 بحث + فلترة (تصنيف، ولاية)
- 📊 لوحة تاجر بإحصائيات
- 👑 لوحة أدمن (بلاغات + توثيق + حظر)
- 📱 PWA يعمل أوفلاين (IndexedDB + Service Worker)
- 🔄 Realtime (الجميع يرى الجديد فوراً)
- 💱 تحويل عملات تلقائي (SDG/USD/SAR)
- ⭐ نظام تقييمات
- 🚨 نظام بلاغات

## التشغيل
```bash
npm install
cp .env.local.example .env.local  # ثم املأ مفاتيحك
# شغّل supabase/schema.sql في Supabase SQL Editor
npm run dev
