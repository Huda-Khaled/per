'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../../lib/store';

export default function ProductClient({ product }) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const addToCart = useCartStore(state => state.addToCart);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert('✅ تم إضافة المنتج للسلة');
  };

  const goToCart = () => {
    router.push('/cart');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
      {/* باقي الـ JSX نفسه بس بدون loading states */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* نفس المحتوى */}
      </div>
    </div>
  );
}