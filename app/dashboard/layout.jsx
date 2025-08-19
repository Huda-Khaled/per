'use client';
import { Cairo } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import '../globals.css';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '../../lib/supabaseClient'; 

const cairo = Cairo({ 
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
});

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const supabase = createSupabaseClient(); // Uncomment and use if needed

  useEffect(() => {
  const getUserRole = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("خطأ في جلب المستخدم:", error.message);
    } else {
      console.log("دور المستخدم:", data?.user?.user_metadata?.role);
    }
  };

  getUserRole();
}, []);


  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  useEffect(() => {
    if (windowWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname, windowWidth]);

  const isActive = (path) => {
    return pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
  };

  const navLinks = [
    { href: '/dashboard', label: 'الرئيسية', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/dashboard/products', label: 'إدارة المنتجات', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { href: '/dashboard/orders', label: 'إدارة الطلبات', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    // { href: '/dashboard/customers', label: 'بيانات العملاء', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ];

  return (
    <div className={`${cairo.className} min-h-screen bg-gray-100 flex flex-col`}>
      {/* رأس الصفحة المتجاوب */}
      <header className="bg-white shadow-sm sticky top-0 z-20 lg:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800">لوحة التحكم</h1>
          <div className="relative">
            <button 
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="إعدادات الحساب"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-4 py-2 flex overflow-x-auto hide-scrollbar border-t border-gray-200">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`px-3 py-1 mx-1 whitespace-nowrap text-sm rounded-md transition-colors ${
                isActive(link.href) 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* الشريط الجانبي */}
        <aside 
          className={`${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          } fixed lg:static inset-y-0 right-0 w-64 sm:w-72 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto lg:block`}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">لوحة التحكم</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="إغلاق القائمة"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="p-4">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                      isActive(link.href) 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'hover:bg-gray-50 hover:text-gray-900 text-gray-600'
                    }`}
                    onClick={() => windowWidth < 1024 && setIsSidebarOpen(false)}
                  >
                    <svg className="h-5 w-5 ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                    </svg>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {/* قسم إضافي للإعدادات والمساعدة */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              {/* <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                الإعدادات
              </h3> */}
              {/* 
              <ul className="space-y-1">         
                <li>
                  <button onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 rounded-md hover:bg-gray-50 hover:text-gray-900 text-gray-600 transition-colors"
                  >
                    <svg className="h-5 w-5 ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>تسجيل الخروج</span>
                  </button>
                </li>
              </ul>
              */}
            </div>
          </nav>
        </aside>

        {/* القناع لإغلاق الشريط الجانبي عند النقر خارجه (على الأجهزة الصغيرة) */}
        {isSidebarOpen && windowWidth < 1024 && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}

        {/* المحتوى الرئيسي */}
        <div className="flex-1 overflow-auto">
          {/* عنوان الصفحة للشاشات الكبيرة */}
          <header className="bg-white shadow-sm hidden lg:block">
            <div className="px-6 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800">
                {navLinks.find(link => isActive(link.href))?.label || 'لوحة التحكم'}
              </h1>
              <div className="flex items-center space-x-4 space-x-reverse">
                <button 
                  className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="الإشعارات"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <button 
                  className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="إعدادات الحساب"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </header>
          {/* محتوى الصفحة */}
          <main className="p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
      {/* أنماط CSS إضافية */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

