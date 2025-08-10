"use client";
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ServiceItem = ({ title, children, icon, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="border-b border-gray-200 py-3 sm:py-4">
      <button 
        className="flex justify-between items-center w-full text-right cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-300 rounded p-1 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-black-700">{title}</h3>
        <span className="text-primary-600 flex-shrink-0 mr-2">
          {isOpen ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-2 sm:mt-3 text-gray-700 text-right leading-relaxed">
          <div className="text-sm sm:text-base space-y-2 pr-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Services() {
  return (
    <section id='Services' className="py-8 sm:py-10 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10 text-slate-950">خدماتنا</h2>
        
        <div className="max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto bg-white shadow-md rounded-lg p-4 sm:p-5 md:p-6">
          <ServiceItem title="ضمان الجودة" initialOpen={true}>
            <p>نفخر بتقديم منتجات أصلية 100% مضمونة الجودة. جميع العطور مختومة بشكل أصلي ومستوردة مباشرة من الشركات المصنعة، مما يضمن لكم الحصول على أفضل تجربة عطرية ممكنة.</p>
          </ServiceItem>
          
          <ServiceItem title="ضمان استعادة الأموال">
            <p>ثقتكم تهمنا - في حال لم تكن راضياً عن العطر، يمكنك إعادته في غضون 7 أيام من تاريخ الاستلام واسترداد قيمة مشترياتك بالكامل شرط الحفاظ على العبوة بحالتها الأصلية دون فتح الختم.</p>
          </ServiceItem>
          
          <ServiceItem title="الدفع عند الاستلام">
            <p>نوفر لك خيار الدفع نقداً عند استلام طلبك لتجربة تسوق سلسة وآمنة.</p>
          </ServiceItem>
          
          <ServiceItem title="التوصيل السريع">
            <p>نقدم خدمة توصيل فائقة السرعة لعملائنا الكرام، حيث نضمن وصول طلبك خلال 24-48 ساعة داخل المدن الرئيسية و3-5 أيام للمناطق البعيدة. خدمة التوصيل السريع متاحة على مدار الساعة لضمان راحتك.</p>
          </ServiceItem>
          
          <ServiceItem title="إرجاع مجاني">
            <p>إذا لم يلبِ المنتج توقعاتك، نوفر خدمة إرجاع مجانية وسهلة. يمكنك التواصل مع فريق خدمة العملاء عبر البريد الإلكتروني أو الاتصال على الرقم <a href="tel:+96598572697" className="font-bold text-rose-600 inline-block hover:underline ltr" dir="ltr">+965 9857 2697</a> ليساعدك في إجراءات الإرجاع بكل سهولة.</p>
          </ServiceItem>
          
          <ServiceItem title="استشارات عطرية مجانية">
            <p>يسعدنا تقديم استشارات عطرية مجانية من خبراء العطور لدينا. سواء كنت تبحث عن عطر للمناسبات الخاصة أو للاستخدام اليومي، سيساعدك فريقنا في العثور على العطر المثالي الذي يعكس شخصيتك وأسلوبك.</p>
          </ServiceItem>
        </div>
      </div>
    </section>
  );
}