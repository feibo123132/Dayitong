import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CurrentActivity } from './CurrentActivity';

type CarouselItem = 
  | {
      id: number;
      type: 'component';
      component: React.ReactNode;
      image?: never;
      imageUrl?: never;
      textColor?: never;
      title?: never;
      subtitle?: never;
      href?: never;
    }
  | {
      id: number;
      type?: never;
      component?: never;
      image: string;
      imageUrl?: string;
      textColor: string;
      title?: string;
      subtitle?: string;
      href?: string;
    };

const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    id: 1,
    image: 'bg-gradient-to-r from-pink-300 to-rose-400',
    imageUrl: `${import.meta.env.BASE_URL}images/home/carousel-4-2.png`,
    textColor: 'text-white',
    href: 'beginner-benefits.html'
  },
  {
    id: 2,
    image: 'bg-gradient-to-r from-amber-200 to-orange-400',
    imageUrl: `${import.meta.env.BASE_URL}images/home/carousel-2.png`,
    textColor: 'text-white',
    title: '',
    subtitle: ''
  },
  {
    id: 3,
    type: 'component',
    component: <CurrentActivity />
  }
];

export const HomeCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = CAROUSEL_ITEMS[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCurrentItemClick = () => {
    if (!currentItem.href) {
      return;
    }
    window.location.assign(`${import.meta.env.BASE_URL}${currentItem.href}`);
  };

  return (
    <div className="relative w-full h-40 rounded-3xl overflow-hidden shadow-sm">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 w-full h-full`}
        >
          {currentItem.type === 'component' ? (
            currentItem.component
          ) : (
            <div 
              className={`w-full h-full ${currentItem.image} flex flex-col justify-center px-6 ${currentItem.href ? 'cursor-pointer' : ''}`}
              onClick={handleCurrentItemClick}
            >
              {currentItem.imageUrl && (
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.title ?? 'carousel image'}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="relative z-10">
                <h2 className={`text-xl font-bold ${currentItem.textColor}`}>{currentItem.title}</h2>
                <p className={`mt-1 text-sm opacity-90 ${currentItem.textColor}`}>{currentItem.subtitle}</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/10 text-white/70 backdrop-blur-[2px] hover:bg-black/20 hover:text-white transition-all active:scale-90"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/10 text-white/70 backdrop-blur-[2px] hover:bg-black/20 hover:text-white transition-all active:scale-90"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
        {CAROUSEL_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white shadow-sm' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
