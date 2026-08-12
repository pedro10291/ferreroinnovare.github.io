import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../services/supabase';

interface GalleryImage {
  id: string;
  image_url: string;
  created_at: string;
  aspect?: string;
}

export const GallerySection = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('gallery')
          .select('id, image_url, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Atribuímos o aspect ratio para manter o efeito masonry/editorial do design original
          const formattedData = data.map((item, i) => ({
            ...item,
            aspect: i % 3 === 0 ? 'aspect-[3/4]' : i % 5 === 0 ? 'aspect-square' : 'aspect-[4/3]',
          }));
          setGalleryImages(formattedData);
        }
      } catch (err: any) {
        console.error('Erro ao carregar galeria pública:', err);
        setError('Não foi possível carregar a galeria no momento.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initialCount = isMobile ? 4 : 8;
  const visibleImages = isExpanded ? galleryImages : galleryImages.slice(0, initialCount);

  // Lightbox handlers
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const nextImage = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! + 1) % galleryImages.length);
    }
  }, [lightboxIndex, galleryImages.length]);

  const prevImage = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! - 1 + galleryImages.length) % galleryImages.length);
    }
  }, [lightboxIndex, galleryImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, nextImage, prevImage]);

  return (
    <section className="py-20 md:py-32 bg-clinic-surface border-t border-clinic-border">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-clinic-goldDark mb-4">Galeria</h2>
          <h3 className="text-3xl md:text-5xl font-serif text-clinic-textPrimary">
            Conheça a Ferrer Innovare
          </h3>
        </div>

        {error ? (
          <div className="text-center py-20 text-red-500 font-medium">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-clinic-gold border-t-transparent"></div>
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium">
            A galeria está sendo atualizada. Em breve novas fotos!
          </div>
        ) : (
          <>
            {/* Asymmetrical Grid using CSS Columns for Masonry effect */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6"
            >
              <AnimatePresence>
                {visibleImages.map((image, index) => (
                  <motion.div 
                    key={image.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="relative overflow-hidden group cursor-pointer break-inside-avoid rounded-lg"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={image.image_url}
                      alt="Galeria Ferrer Innovare"
                      loading="lazy"
                      className={`w-full ${image.aspect} object-cover bg-clinic-surface transition-transform duration-700 ease-out group-hover:scale-[1.03]`}
                    />
                    <div className="absolute inset-0 bg-clinic-dark/0 group-hover:bg-clinic-dark/20 transition-colors duration-500 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-white border border-white/50 px-6 py-2 rounded-full text-xs font-medium tracking-widest uppercase backdrop-blur-sm">
                        Ampliar
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Action Buttons */}
            <div className="mt-12 md:mt-20 flex flex-col sm:flex-row items-center justify-center gap-6">
              {!isExpanded && galleryImages.length > initialCount && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="inline-flex items-center justify-center h-14 md:h-16 px-10 md:px-12 border border-clinic-textPrimary text-clinic-textPrimary text-[12px] md:text-sm font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-clinic-textPrimary hover:text-white"
                >
                  Ver toda a galeria
                </button>
              )}
              
              <a
                href="https://instagram.com/ferrerinnovare"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 md:h-14 px-8 md:px-10 bg-clinic-textPrimary text-white text-[11px] md:text-xs font-semibold tracking-widest uppercase transition-colors duration-500 hover:bg-[#C98B84]"
              >
                <Instagram className="w-4 h-4 mr-3" />
                Siga no Instagram
              </a>
            </div>
          </>
        )}

      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && galleryImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
          >
            {/* Close Button */}
            <button 
              onClick={closeLightbox}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Fechar"
            >
              <X className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} />
            </button>

            {/* Counter */}
            <div className="absolute top-8 left-6 md:top-12 md:left-12 text-white/50 text-xs md:text-sm tracking-widest font-light">
              {lightboxIndex + 1} / {galleryImages.length}
            </div>

            {/* Prev Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" strokeWidth={1} />
            </button>

            {/* Main Image */}
            <div className="relative w-full max-w-5xl max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={galleryImages[lightboxIndex].image_url}
                alt="Galeria Ferrer Innovare"
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>

            {/* Next Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors z-10"
              aria-label="Próxima"
            >
              <ChevronRight className="w-8 h-8 md:w-12 md:h-12" strokeWidth={1} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};
