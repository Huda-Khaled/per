import Image from "next/image";
import { StarIcon } from "lucide-react";

// مكون النجوم التقييمية
function RatingStars({ rating }) {
  return (
    <div className="flex rtl">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          fill={i < rating ? "#FFC107" : "none"}
          stroke={i < rating ? "#FFC107" : "#D1D5DB"}
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ))}
    </div>
  );
}

// مكون رأي فردي
function TestimonialCard({ name, location, comment, rating, image }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 md:p-6 transition-shadow duration-300 hover:shadow-lg">
      <div className="flex items-center mb-3 sm:mb-4">
        {image && (
          <div className="ml-3 flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden relative">
              <Image 
                src={image} 
                alt={name} 
                fill 
                className="object-cover"
                sizes="(max-width: 640px) 40px, 48px"
              />
            </div>
          </div>
        )}
        <div>
          <h3 className="font-bold text-base sm:text-lg text-gray-800">{name}</h3>
          <p className="text-gray-600 text-xs sm:text-sm">{location}</p>
          <div className="mt-1">
            <RatingStars rating={rating} />
          </div>
        </div>
      </div>
      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{comment}</p>
    </div>
  );
}

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "فهد العنزي",
      location: "الكويت، العاصمة",
      rating: 5,
      comment: "تجربتي مع عطور روز ستار كانت رائعة، العطور أصلية 100% والتوصيل كان سريع جداً. أنصح الجميع بالتعامل معهم. اشتريت عطر Dior Sauvage وكان مطابق تماماً للأصلي الذي أستخدمه دائماً."
    },
    {
      id: 2,
      name: "نوف الصباح",
      location: "الكويت، حولي",
      rating: 5,
      comment: "أفضل متجر للعطور على الإطلاق! اشتريت مجموعة من العطور النسائية وكانت كلها أصلية وبأسعار منافسة. خدمة العملاء ممتازة والرد سريع على الاستفسارات. سأكرر التجربة بالتأكيد."
    },
    {
      id: 3,
      name: "عبدالله السالم",
      location: "الكويت، الجهراء",
      rating: 4,
      comment: "كنت متردداً في البداية من الشراء أونلاين، لكن بعد تجربتي مع روز ستار أصبحت أثق بهم تماماً. العطور أصلية والتغليف احترافي. التوصيل تأخر يوم واحد فقط لذلك أعطي 4 نجوم."
    },
    {
      id: 4,
      name: "سارة المطيري",
      location: "الكويت، الفروانية",
      rating: 5,
      comment: "اشتريت عطر شانيل كهدية لوالدتي وكانت سعيدة جداً به. العطر أصلي والرائحة تدوم طويلاً. أحببت أيضاً الهدية المجانية التي أرفقوها مع الطلب. خدمة ممتازة وموقع سهل الاستخدام."
    },
    {
      id: 5,
      name: "بدر الدوسري",
      location: "الكويت، مبارك الكبير",
      rating: 5,
      comment: "أتعامل مع روز ستار منذ سنتين ولم يخذلوني أبداً. جودة العطور ممتازة والأسعار معقولة مقارنة بالسوق المحلي. أقدر جداً سرعة التوصيل وجودة التغليف الذي يحافظ على العطور."
    },
    {
      id: 6,
      name: "دلال العازمي",
      location: "الكويت، الأحمدي",
      rating: 4,
      comment: "خدمة عملاء رائعة وسريعة الاستجابة. اشتريت مجموعة عطور فاخرة وكانت جميعها أصلية. الموقع سهل الاستخدام والتصفح. أنقص نجمة فقط بسبب محدودية خيارات الدفع."
    }
  ];

  return (
    <section id="Testimonials" className="py-8 sm:py-10 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10 text-rose-800">
          آراء عملائنا الكرام
        </h2>
        
        <div className="max-w-4xl mx-auto">
          {/* Grid layout that changes based on screen size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {testimonials.map(testimonial => (
              <TestimonialCard 
                key={testimonial.id} 
                {...testimonial} 
              />
            ))}
          </div>
          
          {/* Testimonial highlight callout */}
          <div className="mt-8 sm:mt-10 bg-rose-50 border border-rose-100 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-sm sm:text-base md:text-lg font-medium text-rose-800">
              انضم لأكثر من 1000 عميل سعيد بخدماتنا وجودة منتجاتنا
            </p>
            <div className="flex justify-center mt-2 sm:mt-3">
              <div className="flex rtl">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    fill="#FFC107"
                    stroke="#FFC107"
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  />
                ))}
              </div>
              <p className="mr-2 font-bold text-rose-800">4.9 / 5</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}