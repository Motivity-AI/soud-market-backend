export function formatPrice(price: number, currency: string) {
  const symbol = { SDG: 'ج.س', USD: '$', SAR: 'ر.س' }[currency] ?? currency;
  return `${Number(price).toLocaleString('ar-EG')} ${symbol}`;
}

export function timeAgo(date: string) {
  const sec = (Date.now() - new Date(date).getTime()) / 1000;
  if (sec < 60) return 'الآن';
  if (sec < 3600) return `قبل ${Math.floor(sec / 60)} دقيقة`;
  if (sec < 86400) return `قبل ${Math.floor(sec / 3600)} ساعة`;
  if (sec < 2592000) return `قبل ${Math.floor(sec / 86400)} يوم`;
  return new Date(date).toLocaleDateString('ar-EG');
}

export function waLink(phone: string, productName: string) {
  let n = phone.replace(/\D/g, '');
  if (n.startsWith('0')) n = '249' + n.slice(1);
  else if (!n.startsWith('249')) n = '249' + n;
  const text = encodeURIComponent(
    `السلام عليكم، شفت منتج "${productName}" في بورصة السودان. هل ما زال متاحاً؟`
  );
  return `https://wa.me/${n}?text=${text}`;
}

export function cn(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

export function isNew(createdAt: string, hours = 24) {
  return (Date.now() - new Date(createdAt).getTime()) < hours * 3600 * 1000;
}
