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
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <PromoBanner
          message="ضمان ٣ أيام على جميع المنتجات | عطور أصلية 100% تستر بدون كرتون"
          messageEn="3-day warranty on all products • 100% original tester perfumes without box"
        />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}