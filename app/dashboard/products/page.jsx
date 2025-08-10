'use client';

import { useState, useEffect } from 'react';
import ProductsList from './components/ProductsList';
import { createSupabaseClient } from '../../../lib/supabaseClient';

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    recentProducts: 0
  });
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // تتبع تغيرات حجم الشاشة
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // جلب إحصائيات المنتجات
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const supabase = createSupabaseClient();
        
        // جلب إجمالي المنتجات
        const { data: totalData, error: totalError } = await supabase
          .from('products')
          .select('id', { count: 'exact' });
          
        // جلب المنتجات المضافة في آخر 7 أيام
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const { data: recentData, error: recentError } = await supabase
          .from('products')
          .select('id', { count: 'exact' })
          .gte('created_at', lastWeek.toISOString());
        
        if (!totalError && !recentError) {
          setStats({
            totalProducts: totalData.length,
            recentProducts: recentData.length
          });
        }
      } catch (error) {
        console.error('Error fetching product stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 sm:pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">إدارة المنتجات</h1>
            <p className="text-sm sm:text-base text-gray-500 font-normal">
              إدارة وتنظيم منتجات متجرك بسهولة
            </p>
          </div>
          
          {/* ملخص الإحصائيات */}
          <div className="flex flex-row gap-3 sm:gap-4">
            <div className="bg-white rounded-lg shadow-sm p-3 text-center min-w-[100px]">
              <p className="text-sm text-gray-500">إجمالي المنتجات</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {isLoading ? (
                  <span className="inline-block h-7 w-12 bg-gray-200 rounded animate-pulse"></span>
                ) : stats.totalProducts}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 text-center min-w-[100px]">
              <p className="text-sm text-gray-500">المضاف حديثاً</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {isLoading ? (
                  <span className="inline-block h-7 w-12 bg-gray-200 rounded animate-pulse"></span>
                ) : stats.recentProducts}
              </p>
            </div>
          </div>
        </div>
        
        {/* شريط التنقل الفرعي (اختياري) */}
        {windowWidth >= 640 && (
          <div className="flex overflow-x-auto py-1 border-b border-gray-100 mb-2 hide-scrollbar">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600 mr-4 whitespace-nowrap">
              جميع المنتجات
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 mr-4 whitespace-nowrap">
              منتجات نشطة
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 mr-4 whitespace-nowrap">
              نفذت الكمية
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap">
              مسودات
            </button>
          </div>
        )}
        
        {/* قائمة المنتجات */}
        <ProductsList />
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