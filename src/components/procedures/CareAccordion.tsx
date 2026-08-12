import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, CheckCircle2 } from 'lucide-react';

interface CareAccordionProps {
  title: string;
  items: string[];
}

export const CareAccordion: React.FC<CareAccordionProps> = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <div className="border-b border-clinic-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 md:py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-clinic-gold rounded-sm transition-colors hover:text-clinic-goldDark group"
        aria-expanded={isOpen}
      >
        <span className="font-serif text-xl md:text-2xl text-clinic-textPrimary group-hover:text-clinic-goldDark transition-colors">
          {title}
        </span>
        <span className="text-clinic-textSecondary group-hover:text-clinic-goldDark transition-colors flex-shrink-0 ml-4">
          {isOpen ? <Minus className="w-5 h-5" strokeWidth={1.5} /> : <Plus className="w-5 h-5" strokeWidth={1.5} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pt-2">
              <ul className="space-y-4">
                {items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-clinic-gold mt-1 mr-3 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm md:text-base text-clinic-textSecondary font-light leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
