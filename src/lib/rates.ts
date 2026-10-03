'use client';

export interface Rates {
  SDG: number;
  USD: number;
  SAR: number;
  updatedAt: string;
}

const KEY = 'sudan_market_rates_v1';
const DEFAULT_RATES: Rates = {
  SDG: 1,
  USD: 1 / 600,   // 1 جنيه = 0.00166 دولار (أي 600 ج.س للدولار)
  SAR: 1 / 160,   // 1 جنيه = 0.00625 ريال (أي 160 ج.س للريال)
  updatedAt: new Date().toISOString()
};

/** قراءة الأسعار من التخزين المحلي */
export function getRates(): Rates {
  if (typeof window === 'undefined') return DEFAULT_RATES;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_RATES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_RATES;
  }
}

/** حفظ الأسعار */
export function setRates(r: Partial<Rates>) {
  if (typeof window === 'undefined') return;
  const merged: Rates = { ...getRates(), ...r, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent('rates-updated', { detail: merged }));
}

/** تحويل سعر من عملة لأخرى */
export function convert(
  amount: number,
  from: keyof Omit<Rates, 'updatedAt'>,
  to: keyof Omit<Rates, 'updatedAt'>
): number {
  if (from === to) return amount;
  const rates = getRates();
  // حوّل للجنيه أولاً ثم للعملة الهدف
  const inSDG = amount / rates[from];
  return inSDG * rates[to];
}

/** جلب أسعار الصرف من API خارجي (اختياري) */
export async function fetchLiveRates(): Promise<Rates | null> {
  try {
    const res = await fetch(
      'https://open.er-api.com/v6/latest/SDG',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const usd = 1 / (data.rates?.USD ?? 1 / 600);
    const sar = 1 / (data.rates?.SAR ?? 1 / 160);
    const rates: Rates = {
      SDG: 1,
      USD: 1 / usd,
      SAR: 1 / sar,
      updatedAt: new Date().toISOString()
    };
    setRates(rates);
    return rates;
  } catch {
    return null;
  }
}
