import { Suspense } from 'react';
import HeroSection from './components/HeroSection';
import ProductGrid from './components/ProductGrid';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import { supabase } from '../../lib/supabaseClient';

// Loading component for better UX during data fetching
function LoadingSection() {
  return (
    <div className="py-12 flex justify-center items-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64 w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error component for better error communication
function ErrorMessage({ message }) {
  return (
    <div className="py-12 flex justify-center items-center">
      <div className="max-w-md mx-auto bg-red-50 p-4 sm:p-6 rounded-lg border border-red-200 text-center">
        <h3 className="text-lg sm:text-xl font-medium text-red-800 mb-2">عذراً، حدث خطأ</h3>
        <p className="text-red-700">{message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

export default async function Home() {
  try {
    // جلب البيانات من جدول المنتجات
    const { data: products, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('فشل في تحميل المنتجات، يرجى المحاولة مرة أخرى لاحقاً.');
    }

    if (!products || products.length === 0) {
      console.warn('No products found');
    }

    return (
      <div className="space-y-0">
        {/* Hero Section - Always visible regardless of data */}
        <section className="w-full">
          <HeroSection />
        </section>

        {/* Product Grid with fallback loading state */}
        <section className="w-full">
          <Suspense fallback={<LoadingSection />}>
            <ProductGrid 
              products={products || []} 
              title={products?.length > 0 ? "منتجاتنا المميزة" : "لا توجد منتجات متاحة حالياً"} 
            />
          </Suspense>
        </section>

        {/* Services Section - Fixed gap for visual harmony */}
        <section className="w-full">
          <Services />
        </section>

        {/* Testimonials Section - Fixed gap for visual harmony */}
        <section className="w-full">
          <Testimonials />
        </section>
      </div>
    );
  } catch (error) {
    console.error('Home page error:', error);
    return <ErrorMessage message={error.message || 'حدث خطأ غير متوقع'} />;
  }
}