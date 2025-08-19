import React from 'react';
import Image from 'next/image';
import { supabase } from '../../../lib/utils';
import ProductClient from './ProductClient'; // هنعمل component منفصل

// ✅ Server Component مع ISR
export const revalidate = 0; 

async function getProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
}

export default async function ProductPage({ params }) {
  const { id } = params;
  
  try {
    const product = await getProduct(id); // ✅ البيانات fresh من السيرفر
    return <ProductClient product={product} />;
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-lg font-medium text-red-600">❌ المنتج غير موجود</div>
      </div>
    );
  }
}