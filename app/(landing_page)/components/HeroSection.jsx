import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="w-full h-[500px] relative">
        <Image
          src="/images/hero-section.jpg"
          alt="Luxury Perfumes"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center">
          <div className="container mx-auto px-6">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {/* <span className="block text-gold-400">LUXURY</span> */}
                {/* <span className="block">PERFUMES</span> */}
                {/* <span className="block text-2xl md:text-3xl mt-2 font-normal">عطور فاخرة عالمية</span> */}
              </h1>
              <div className="w-full flex justify-center mt-96 mr-96">
                <Link
                  href="#ProductGrid"
                  className=" border border-black inline-block bg-transparent text-[#0E4526] px-20  py-3 rounded hover:bg-gray-800 transition text-center fontweight-semibold text-2xl"
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
