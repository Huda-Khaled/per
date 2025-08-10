import ProductCard from './ProductCard';

export default function ProductGrid({ products, title = "منتجاتنا المميزة" }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section id='ProductGrid' className="py-8 sm:py-10 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10">
          {title}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">لا توجد منتجات متاحة حالياً</p>
          </div>
        )}
      </div>
    </section>
  );
}