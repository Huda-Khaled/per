'use client';
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Phone, User, Menu, X } from "lucide-react";
import { useCartStore } from "../../../lib/store";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // استخدام متجر السلة للحصول على عدد المنتجات
  const cartItems = useCartStore(state => state.items);
  
  // حساب إجمالي عدد المنتجات في السلة
  const totalItemsCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  // WhatsApp number
  const whatsappNumber = "+96598572697";

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex justify-center space-x-4 lg:space-x-6 space-x-reverse flex-1">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-900 px-2 py-1 text-base lg:text-lg font-bold flex items-center transition duration-150"
            >
              الصفحة الرئيسية
            </Link>
            <Link
              href="#Services"
              className="text-gray-700 hover:text-primary-900 px-2 py-1 text-base lg:text-lg font-bold flex items-center transition duration-150"
            >
              خدماتنا
            </Link>
            <Link
              href="#Testimonials"
              className="text-gray-700 hover:text-primary-900 px-2 py-1 text-base lg:text-lg font-bold flex items-center transition duration-150"
            >
              آراء العملاء
            </Link>
          </nav>

          {/* Logo */}
          <div className="flex-shrink-0 mr-4 h-18">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Rose Star Perfumes"
                width={180}
                height={75}
                className="h-10 sm:h-12 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Right-side Icons (WhatsApp & Cart) */}
          <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
            {/* WhatsApp Icon */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group "
              aria-label="Contact via WhatsApp"
            >
              <div className="relative w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 mt-1 group-hover:text-primary-600 hidden sm:block">
                خدمة العملاء
              </span>
            </a>

            {/* Shopping Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 group"
              aria-label={`عربة التسوق (${totalItemsCount} منتج)`}
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 group-hover:text-primary-600 transition-colors mr-5" />

              {/* عداد عدد المنتجات في السلة */}
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right--1 bg-primary-600 text-white text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-gray-700 hover:text-primary-900 px-2 py-2 text-lg font-bold block"
                onClick={() => setMobileMenuOpen(false)}
              >
                الصفحة الرئيسية
              </Link>
              <Link
                href="#Services"
                className="text-gray-700 hover:text-primary-900 px-2 py-2 text-lg font-bold block"
                onClick={() => setMobileMenuOpen(false)}
              >
                خدماتنا
              </Link>
              <Link
                href="#Testimonials"
                className="text-gray-700 hover:text-primary-900 px-2 py-2 text-lg font-bold block"
                onClick={() => setMobileMenuOpen(false)}
              >
                آراء العملاء
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}