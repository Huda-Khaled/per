import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="w-full h-[500px] md:h-[600px] lg:h-[700px] relative">
        <Image
          src="/images/hero-section.jpg"
          alt="Luxury Perfumes"
          fill
          className="object-containw-full h-full"
          priority
          quality={95}
          sizes="(max-width: 768px) 95vw, (max-width: 1200px) 90vw, 90vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSo2ygDRdqQV4QWcyMfJQV6KoqKMhMm9v8/4Rg3m6sBLuSWW5qf+2FlWGmWb25PBKKKMCKCtDXhH/9k="
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
          <div className="container mx-auto px-4 md:px-6 h-full">
            {/* المحتوى في الأسفل */}
            <div className="h-full flex flex-col justify-end items-center pb-8 md:pb-12 lg:pb-16">
              {/* النص الرئيسي
              <div className="text-center mb-6 md:mb-8 lg:mb-10">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                  <span className="block text-yellow-400 mb-2">LUXURY</span>
                  <span className="block mb-2">PERFUMES</span>
                  <span className="block text-lg md:text-2xl lg:text-3xl mt-4 font-normal text-gray-200">
                    عطور فاخرة عالمية
                  </span>
                </h1>
              </div> */}

              {/* الزرار */}
              <div className="flex justify-center">
                <Link
                  href="#ProductGrid"
                  className="inline-block 
                           border-2 border-white 
                           bg-white/10 backdrop-blur-sm 
                           text-white 
                           px-8 md:px-12 lg:px-16 
                           py-3 md:py-4 lg:py-5
                           rounded-lg 
                           hover:bg-white hover:text-black 
                           transition-all duration-300 
                           text-base md:text-lg lg:text-xl 
                           font-semibold
                           shadow-lg hover:shadow-xl
                           transform hover:scale-105
                           text-center"
                >
                  اطلب الآن
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
