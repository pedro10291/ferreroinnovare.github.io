import React, { useRef, useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { googleReviews, googleReviewsStats } from '../../data/reviews';

export const ReviewsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Update active dot based on scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPosition = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.children[0].clientWidth;
    // adding half card width to ensure it switches halfway through the scroll
    const newIndex = Math.round(scrollPosition / cardWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < googleReviews.length) {
      setActiveIndex(newIndex);
    }
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.children[0].clientWidth;
    scrollRef.current.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Header Stats */}
      <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
        <div className="flex items-center space-x-1 text-[#FABB05] mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-current" />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:space-x-3">
          <span className="text-3xl md:text-4xl font-serif text-clinic-textPrimary mb-1 sm:mb-0">
            {googleReviewsStats.average.toString().replace('.', ',')}
          </span>
          <div className="w-6 h-[1px] bg-clinic-border hidden sm:block"></div>
          <span className="text-xs md:text-sm font-light text-clinic-textSecondary uppercase tracking-widest mt-1">
            {googleReviewsStats.total} avaliações no Google
          </span>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="w-full relative">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 md:gap-6 pb-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {googleReviews.map((review) => (
            <div 
              key={review.id} 
              className="snap-center shrink-0 w-full max-w-full md:w-[350px] lg:w-[400px] box-border bg-clinic-surfaceHover border border-clinic-border p-6 md:p-8 flex flex-col"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-clinic-gold bg-clinic-goldDark/5 flex items-center justify-center text-clinic-goldDark font-serif text-lg mr-4 shrink-0">
                  {review.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-serif text-clinic-textPrimary text-base md:text-lg">{review.author}</p>
                  <div className="flex text-[#FABB05] mt-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-sm md:text-base text-clinic-textSecondary font-light leading-relaxed mb-6 flex-grow whitespace-pre-line italic text-left break-words">
                "{review.text}"
              </p>
              
              {review.reply && (
                <div className="mt-auto pt-5 border-t border-clinic-border/50 w-full text-left">
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-semibold text-clinic-goldDark mb-2">
                    Resposta da clínica
                  </p>
                  <p className="text-xs md:text-sm text-clinic-textSecondary font-light leading-relaxed whitespace-pre-line break-words">
                    {review.reply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center items-center space-x-3 mt-2 md:mt-4">
        {googleReviews.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              activeIndex === index 
                ? 'w-2.5 h-2.5 bg-clinic-goldDark' 
                : 'w-1.5 h-1.5 bg-clinic-border hover:bg-clinic-gold'
            }`}
            aria-label={`Ir para avaliação ${index + 1}`}
          />
        ))}
      </div>

      {/* Outbound Link */}
      <div className="mt-12">
        <a 
          href={googleReviewsStats.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-[10px] md:text-xs font-semibold tracking-widest uppercase text-clinic-textSecondary hover:text-clinic-goldDark transition-colors duration-500 group"
        >
          Ver avaliações no Google
          <span className="w-6 md:w-8 h-[1px] bg-clinic-border group-hover:bg-clinic-goldDark transition-all duration-500 group-hover:w-10"></span>
        </a>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </div>
  );
};
