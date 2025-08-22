import Marquee from "react-fast-marquee";

export default function PromoBanner({ message, messageEn, speed = 50 }) {
  return (
    <div className="bg-rose-600 text-white py-1.5 sm:py-2 md:py-2.5 text-center">
      <div className="container mx-auto px-4">
        <Marquee
          speed={speed}
          gradient={false}
          pauseOnHover={true}
          className="overflow-hidden"
        >
          <div className="flex items-center px-4">
            {/* النص العربي */}
            <p
              dir="rtl"
              className="text-sm sm:text-base md:text-lg font-bold whitespace-nowrap"
            >
              {message}
            </p>

            <span className="mx-2 sm:mx-3 md:mx-4 text-white opacity-70">
              |
            </span>

            {/* النص الإنجليزي */}
            <p
              dir="ltr"
              className="text-sm sm:text-base md:text-lg font-bold whitespace-nowrap"
            >
              {messageEn}
            </p>

            <span className="mx-4 sm:mx-6 md:mx-8">&bull;</span>
          </div>
        </Marquee>
      </div>
    </div>
  );
}
