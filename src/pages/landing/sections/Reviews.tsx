import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';

export const Reviews = () => {
  // Empty state for now since we don't have reviews in the database yet
  const reviews: any[] = [];

  return (
    <section id="avaliacoes" className="py-24 md:py-32 lg:py-40 bg-clinic-bg">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-[1px] bg-clinic-gold"></div>
              <span className="uppercase tracking-widest text-xs font-semibold text-clinic-goldDark">04. Depoimentos</span>
              <div className="w-12 h-[1px] bg-clinic-gold"></div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-clinic-textPrimary mb-8">
              A Palavra de Nossos <span className="italic font-light text-clinic-goldDark">Pacientes</span>
            </h2>
            <p className="text-lg text-clinic-textSecondary font-light max-w-2xl mx-auto">
              Experiências reais de quem confiou em nossa expertise para revelar sua melhor versão.
            </p>
          </motion.div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full bg-clinic-card rounded-none border border-clinic-border">
                  <CardContent className="p-10 text-center">
                    <div className="flex justify-center space-x-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-clinic-gold text-clinic-gold" />
                      ))}
                    </div>
                    <p className="text-clinic-textSecondary italic font-serif text-lg leading-relaxed mb-8">"{review.text}"</p>
                    <div className="w-12 h-[1px] bg-clinic-border mx-auto mb-4"></div>
                    <p className="text-xs uppercase tracking-widest font-semibold text-clinic-textPrimary">{review.author}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="border border-clinic-border bg-clinic-surfaceHover/50 py-24 text-center">
              <div className="w-12 h-[1px] bg-clinic-border mx-auto mb-6"></div>
              <p className="text-clinic-textSecondary font-serif italic text-xl">
                As histórias de nossos pacientes serão publicadas aqui em breve.
              </p>
              <div className="w-12 h-[1px] bg-clinic-border mx-auto mt-6"></div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
