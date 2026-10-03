import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import NetworkStatus from '@/components/NetworkStatus';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic', 'latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'بورصة أسعار السودان | أسعار الجملة والتجزئة',
  description: 'منصة سودانية لعرض أسعار المنتجات المتاحة من التجار مباشرة، تواصل فوري عبر واتساب.',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    title: 'بورصة أسعار السودان',
    description: 'أسعار المنتجات من التجار مباشرة',
    locale: 'ar_SD',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#158049',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <Header />
        <NetworkStatus />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        <ServiceWorkerRegistrar />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}
