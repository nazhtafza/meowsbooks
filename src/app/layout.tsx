import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: "Meow's Book Collection: Resensi & Evaluasi Paws",
  description:
    'Ruang kurasi dan resensi buku mendalam dengan sistem evaluasi Paws untuk pembaca reflektif.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 200px)' }}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
