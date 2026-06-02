import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from '@/components/Providers';
import Footer from '@/components/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Visitor Management System',
  description: 'Register, approve, and track visitors',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen w-full flex-col bg-slate-50 text-slate-900">
        <Providers>
          <div className="flex w-full min-w-0 flex-1 flex-col">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
