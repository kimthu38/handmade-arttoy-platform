import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ArtToy Market — Handmade & Art Toy Marketplace',
    template: '%s | ArtToy Market',
  },
  description:
    'Discover and shop unique handmade goods and art toys from independent artists and studios.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'ArtToy Market',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <QueryProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
