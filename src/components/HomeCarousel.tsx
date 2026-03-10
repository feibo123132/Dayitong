﻿import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PointsRewardCard } from './PointsRewardCard';
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
    type: 'component',
    component: <PointsRewardCard />
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
