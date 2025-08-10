import '../globals.css';
import { Inter } from 'next/font/google';
import Header from './components/Header';
import Footer from './components/Footer';
import PromoBanner from './components/PromoBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rose Star Perfumes',
  description: 'Luxury perfumes at affordable prices',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="rtl">
      <body className={inter.className}>
        <PromoBanner message="احصل على أي منتج مقابل 7 دينار كويتي فقط" messageEn="Get any product for 7 Kuwaiti dinars" />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}