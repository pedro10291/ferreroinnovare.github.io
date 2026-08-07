import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const DraPatricia = () => {
  return (
    <div className="min-h-screen bg-clinic-bg flex flex-col">
      <div className="flex-grow flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-2xl text-center"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-clinic-textPrimary mb-6">
            Página da <span className="italic text-clinic-goldDark">Dra. Patrícia</span>
          </h1>
          <p className="text-lg text-clinic-textSecondary font-light leading-relaxed mb-12">
            Esta página está reservada para apresentar a biografia completa, formação, especializações e filosofia profissional da Dra. Patrícia. O conteúdo será adicionado futuramente.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-4 text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary hover:text-clinic-gold transition-colors duration-500 group"
          >
            <span className="w-8 h-[1px] bg-clinic-textPrimary group-hover:bg-clinic-gold transition-colors duration-500 group-hover:w-12"></span>
            Voltar para o Início
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
