import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../services/supabase';
import { Skeleton } from '../../../components/ui/Skeleton';

export const Gallery = () => {
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('order_index', { ascending: true })
          .limit(6); // Show 6 images in an elegant grid

        if (data && data.length > 0) {
          setImages(data);
        } else {
          setImages(Array(6).fill(null));
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <section id="galeria" className="py-24 md:py-32 lg:py-40 bg-clinic-surface">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-serif text-clinic-goldDark/30">03</span>
              <div className="w-12 h-[1px] bg-clinic-gold"></div>
              <span className="uppercase tracking-widest text-xs font-semibold text-clinic-goldDark">Portfólio</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-serif text-clinic-textPrimary mb-6">
              Nossa <span className="italic text-clinic-goldDark">Galeria</span>
            </h2>
            <p className="text-lg text-clinic-textSecondary font-light">
              Momentos, detalhes e resultados que refletem o nosso compromisso com a beleza em sua forma mais pura.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden md:block"
          >
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest font-semibold text-clinic-gold hover:text-clinic-textPrimary transition-colors flex items-center gap-2">
              Siga no Instagram
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
          </motion.div>
        </div>

        {/* Masonry-style Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
          {images.map((img, index) => (
            <motion.div
              key={img?.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: (index % 3) * 0.1 }}
              className="break-inside-avoid"
            >
              <div className={`relative overflow-hidden bg-clinic-bg border border-clinic-border ${index % 2 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}>
                {isLoading || !img ? (
                  <Skeleton className="w-full h-full rounded-none" />
                ) : img.image_url ? (
                  <img 
                    src={img.image_url} 
                    alt={img.caption || "Galeria Ferrer Innovare"} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-8 h-[1px] bg-clinic-border mb-4"></div>
                    <span className="text-xs uppercase tracking-widest text-clinic-textSecondary">Foto</span>
                    <div className="w-8 h-[1px] bg-clinic-border mt-4"></div>
                  </div>
                )}
                
                {/* Subtle Hover Overlay */}
                {img && img.image_url && (
                  <div className="absolute inset-0 bg-clinic-textPrimary/0 hover:bg-clinic-textPrimary/10 transition-colors duration-500"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 md:hidden text-center">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest font-semibold text-clinic-gold hover:text-clinic-textPrimary transition-colors inline-flex items-center gap-2">
            Siga no Instagram
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </a>
        </div>
      </div>
    </section>
  );
};
