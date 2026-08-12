import React from 'react';
import { motion } from 'framer-motion';
import { ReviewsCarousel } from '../../../components/ui/ReviewsCarousel';

export const Reviews = () => {
  return (
    <section id="avaliacoes" className="py-24 md:py-32 bg-clinic-surface border-t border-clinic-border">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 text-center flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-12 md:mb-16"
        >
          <span className="text-[10px] md:text-xs font-semibold tracking-widest uppercase text-clinic-goldDark mb-3 md:mb-4 block">Experiências</span>
          <h2 className="text-3xl md:text-5xl font-serif text-clinic-textPrimary mb-4">
            O que nossas pacientes dizem
          </h2>
          <p className="text-sm md:text-base text-clinic-textSecondary font-light">
            A experiência de quem já passou pela Ferrer Innovare.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full max-w-4xl"
        >
          <ReviewsCarousel />
        </motion.div>

      </div>
    </section>
  );
};
