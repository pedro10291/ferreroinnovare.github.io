import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Como funciona a primeira avaliação?",
    answer: "A primeira avaliação é um momento dedicado exclusivamente a você. Realizamos uma análise minuciosa da sua pele, discutimos suas expectativas e desenvolvemos um plano de tratamento personalizado, focado na naturalidade dos resultados."
  },
  {
    question: "Os procedimentos causam dor?",
    answer: "Priorizamos o seu conforto em todas as etapas. Utilizamos técnicas avançadas, agulhas ultrafinas e, quando necessário, anestésicos de alta qualidade para garantir uma experiência tranquila e praticamente indolor."
  },
  {
    question: "Quanto tempo duram os resultados?",
    answer: "A durabilidade varia de acordo com o procedimento, as características individuais do seu organismo e seus hábitos de vida. Durante a consulta, estabelecemos um cronograma claro de manutenção para preservar a excelência dos resultados."
  },
  {
    question: "Qual o tempo de recuperação?",
    answer: "A maioria dos nossos protocolos é 'lunch-time', permitindo o retorno imediato às atividades diárias. Fornecemos orientações pós-procedimento detalhadas para otimizar sua recuperação."
  }
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 lg:py-40 bg-clinic-surface">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-[1px] bg-clinic-gold"></div>
              <span className="uppercase tracking-widest text-xs font-semibold text-clinic-goldDark">05. FAQ</span>
              <div className="w-12 h-[1px] bg-clinic-gold"></div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-clinic-textPrimary mb-6">
              Dúvidas <span className="italic font-light text-clinic-goldDark">Frequentes</span>
            </h2>
          </motion.div>
        </div>

        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="border-b border-clinic-border"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-8 flex justify-between items-center text-left focus:outline-none group"
              >
                <span className="font-serif text-xl md:text-2xl text-clinic-textPrimary group-hover:text-clinic-goldDark transition-colors duration-500 pr-8">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-clinic-textSecondary transition-transform duration-500 shrink-0 ${openIndex === index ? 'rotate-180 text-clinic-goldDark' : ''}`} 
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-8 text-clinic-textSecondary font-light leading-relaxed text-base md:text-lg max-w-3xl">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
