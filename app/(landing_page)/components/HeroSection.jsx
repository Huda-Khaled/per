import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="w-full h-[500px] relative">
        <Image
          src="/images/hero-section.JPEG"
          alt="Luxury Perfumes"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20 flex flex-col justify-center items-center">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                {/* <span className="block text-gold-400">LUXURY</span> */}
                {/* <span className="block">PERFUMES</span> */}
                {/* <span className="block text-2xl md:text-3xl mt-2 font-normal">عطور فاخرة عالمية</span> */}
              </h1>
              <div className="flex justify-center">
                <Link
                  href="#ProductGrid"
                  className="bg-white text-customBlack border-2 border-white px-8 md:px-20 py-3 md:py-4 rounded-lg transition-all duration-300 font-semibold text-lg md:text-2xl shadow-lg"
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
