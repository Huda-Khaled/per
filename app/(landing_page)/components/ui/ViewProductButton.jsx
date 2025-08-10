import Link from 'next/link';
import { Eye } from 'lucide-react';


export default function ViewProductButton({ productId }) {
  return (
    <Link 
      href={`/product/${productId}`}
      className="
        flex items-center justify-center 
        border border-gray-300 
        px-4 py-2 
        sm:px-6 sm:py-2.5 
        md:px-8 md:py-3 
        rounded 
        text-sm sm:text-base md:text-lg 
        hover:bg-gray-50 transition 
        w-full sm:w-auto
      "
    >
      <Eye size={18} className="ml-2" />
      <span>عرض المنتج</span>
    </Link>
  );
}
