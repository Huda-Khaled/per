import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",  // تحسين أداء الخط
  variable: "--font-cairo",  // للاستخدام في Tailwind كمتغير
 
});

export const metadata = {
  title: "rose star perfumes- لوحة التحكم",
  description: "rose star perfumes",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5", // تحسين العرض على الأجهزة المحمولة
  themeColor: "#ffffff", // لون السمة للمتصفحات المحمولة
  icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.className} scroll-smooth`}>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <main className="flex min-h-screen flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}