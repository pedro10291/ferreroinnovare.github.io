import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../../services/supabase';
import { Skeleton } from '../../../components/ui/Skeleton';

export const HeroEditorial = () => {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_content')
          .single();

        if (data) {
          setContent(data.value);
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroContent();
  }, []);

  return (
    <section className="relative min-h-[75vh] bg-clinic-bg pt-28 pb-16 flex items-center overflow-hidden">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col-reverse md:flex-row items-center gap-16 lg:gap-24">
          
          {/* Text Content (Left Side) */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {isLoading ? (
                <div className="mb-8">
                  <Skeleton className="h-20 w-3/4 mb-4" />
                </div>
              ) : (
                <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] font-serif text-clinic-textPrimary mb-8">
                  {content?.title || (
                    <>
                      Naturalidade.<br/>
                      Ciência.<br/>
                      <span className="italic font-light text-clinic-goldDark">Elegância.</span>
                    </>
                  )}
                </h1>
              )}
              
              {isLoading ? (
                <div className="mb-12">
                  <Skeleton className="h-16 w-full max-w-md" />
                </div>
              ) : (
                <p className="text-lg text-clinic-textSecondary font-light leading-relaxed max-w-md mb-12">
                  {content?.subtitle || 'Resultados sem exageros. Uma abordagem médica dedicada a realçar a sua natureza com absoluta exclusividade.'}
                </p>
              )}
              
              <div>
                <a
                  href="#contato"
                  className="inline-flex items-center justify-center h-14 px-10 bg-clinic-textPrimary text-white text-sm font-medium tracking-widest uppercase transition-colors duration-500 hover:bg-clinic-goldDark"
                  style={{ borderRadius: '16px' }}
                >
                  Agendar Avaliação
                </a>
              </div>
            </motion.div>
          </div>

          {/* Editorial Portrait (Right Side) */}
          <div className="w-full md:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="relative aspect-[3/4] w-full max-w-[460px] mx-auto md:ml-auto md:mr-0"
            >
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-none" />
              ) : content?.imageUrl ? (
                <img 
                  src={content.imageUrl} 
                  alt="Dra. Patrícia Ferrer" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-clinic-surface flex flex-col items-center justify-center p-8 text-center border border-clinic-border">
                  <div className="w-12 h-[1px] bg-clinic-border mb-6"></div>
                  <p className="font-serif text-2xl text-clinic-textSecondary mb-2">Dra. Patrícia</p>
                  <p className="text-xs uppercase tracking-widest text-clinic-textSecondary/60">Retrato Oficial (3:4)</p>
                  <div className="w-12 h-[1px] bg-clinic-border mt-6"></div>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
