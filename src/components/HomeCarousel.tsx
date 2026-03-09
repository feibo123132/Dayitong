import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const CAROUSEL_ITEMS = [
  {
    id: 1,
    image: 'bg-gradient-to-r from-pink-300 to-rose-400',
    imageUrl: `${import.meta.env.BASE_URL}images/home/carousel-4-2.png`,
    textColor: 'text-white',
    href: 'beginner-benefits.html'
  },
  {
    id: 2,
    image: 'bg-gradient-to-r from-jieyou-mint to-teal-400',
    imageUrl: `${import.meta.env.BASE_URL}images/home/carousel-4-4.png`,
    textColor: 'text-white',
    href: 'points-reward.html'
  },
  {
    id: 3,
    title: '积分兑换上新',
    subtitle: '限量吉他拨片',
    image: 'bg-gradient-to-r from-orange-300 to-red-400',
    textColor: 'text-white'
  }
];

export const HomeCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = CAROUSEL_ITEMS[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 5000);
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
          className={`absolute inset-0 ${currentItem.image} flex flex-col justify-center px-6 ${currentItem.href ? 'cursor-pointer' : ''}`}
          onClick={handleCurrentItemClick}
          role={currentItem.href ? 'button' : undefined}
          tabIndex={currentItem.href ? 0 : undefined}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && currentItem.href) {
              event.preventDefault();
              handleCurrentItemClick();
            }
          }}
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
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
        {CAROUSEL_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
