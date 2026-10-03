export const CATEGORY_EMOJIS: Record<string, string> = {
  food: '🌾', vegetables: '🥬', meat: '🥩', medicine: '💊',
  clothing: '👕', electronics: '📱', construction: '🧱',
  cars: '🚗', other: '📦'
};

export const CATEGORY_COLORS: Record<string, string> = {
  food: 'from-amber-50 to-amber-100',
  vegetables: 'from-green-50 to-green-100',
  meat: 'from-red-50 to-red-100',
  medicine: 'from-blue-50 to-blue-100',
  clothing: 'from-purple-50 to-purple-100',
  electronics: 'from-cyan-50 to-cyan-100',
  construction: 'from-orange-50 to-orange-100',
  cars: 'from-slate-50 to-slate-100',
  other: 'from-gray-50 to-gray-100'
};

export const PRODUCT_SUGGESTIONS: { label: string; emoji: string }[] = [
  { label: 'سكر', emoji: '🍬' }, { label: 'دقيق', emoji: '🌾' },
  { label: 'زيت', emoji: '🛢️' }, { label: 'أرز', emoji: '🍚' },
  { label: 'عدس', emoji: '🫘' }, { label: 'بصل', emoji: '🧅' },
  { label: 'طماطم', emoji: '🍅' }, { label: 'بطاطس', emoji: '🥔' },
  { label: 'لحم', emoji: '🥩' }, { label: 'دجاج', emoji: '🍗' },
  { label: 'سمك', emoji: '🐟' }, { label: 'لبن', emoji: '🥛' },
  { label: 'شاي', emoji: '🍵' }, { label: 'قهوة', emoji: '☕' },
  { label: 'موز', emoji: '🍌' }, { label: 'برتقال', emoji: '🍊' },
  { label: 'مانجو', emoji: '🥭' }, { label: 'بطيخ', emoji: '🍉' },
  { label: 'خبز', emoji: '🍞' }, { label: 'عسل', emoji: '🍯' },
  { label: 'تمر', emoji: '🌴' }, { label: 'فول', emoji: '🫘' },
  { label: 'سمسم', emoji: '🌰' }, { label: 'صابون', emoji: '🧼' },
  { label: 'ملابس', emoji: '👕' }, { label: 'حذاء', emoji: '👟' },
  { label: 'جوال', emoji: '📱' }, { label: 'شاحن', emoji: '🔌' },
  { label: 'أسمنت', emoji: '🧱' }, { label: 'حديد', emoji: '⛓️' },
  { label: 'بنزين', emoji: '⛽' }, { label: 'غاز', emoji: '🔥' }
];

export function getProductEmoji(product: {
  emoji?: string | null;
  category_slug?: string | null;
}): string {
  if (product.emoji) return product.emoji;
  if (product.category_slug && CATEGORY_EMOJIS[product.category_slug]) {
    return CATEGORY_EMOJIS[product.category_slug];
  }
  return '📦';
}
