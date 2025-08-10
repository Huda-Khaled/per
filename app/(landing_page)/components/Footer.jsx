import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      
      

        <div className="border-t border-gray-800  pt-6 text-center mb-2">
          <p className="text-gray-500 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} جميع الحقوق محفوظة لشركة روز ستار للعطور
          </p>
        </div>
      
    </footer>
  );
}