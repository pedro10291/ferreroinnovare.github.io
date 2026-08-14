import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../../services/supabase';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';
import { CLINIC_WHATSAPP } from '../../../config/constants';

const contactSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  phone: z.string().min(10, 'Telefone é obrigatório'),
  interest: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const BookingSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Save to Supabase
      const { error } = await supabase.from('contacts').insert([{
        name: data.name,
        phone: data.phone,
        interest: data.interest,
        message: 'Contato via formulário minimalista',
      }]);
      if (error) throw error;
      
      // 2. Format WhatsApp Message
      const phone = CLINIC_WHATSAPP;
      const text = `Olá! Meu nome é ${data.name}. Gostaria de agendar uma avaliação.${data.interest ? ` Tenho interesse em: ${data.interest}.` : ''}`;
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      
      // 3. Reset and Redirect
      reset();
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Ocorreu um erro. Por favor, tente novamente ou entre em contato diretamente pelo WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contato" className="bg-clinic-surface border-t border-clinic-border/60 py-24 md:py-32 flex flex-col justify-center">
      <div className="max-w-[800px] mx-auto px-6 sm:px-8 w-full">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-clinic-gold/50"></div>
            <span className="uppercase tracking-[0.2em] text-[10px] md:text-xs font-semibold text-clinic-goldDark">Agendamento</span>
            <div className="w-12 h-[1px] bg-clinic-gold/50"></div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif text-clinic-textPrimary mb-6">
            Dê o primeiro <span className="italic text-clinic-goldDark">passo.</span>
          </h2>
          <p className="text-sm md:text-base text-clinic-textSecondary font-light max-w-md mx-auto leading-relaxed">
            Preencha seus dados para continuar o agendamento através do nosso atendimento exclusivo no WhatsApp.
          </p>
        </div>

        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md mx-auto">
            <Input 
              placeholder="Seu nome completo"
              {...register('name')}
              error={errors.name?.message}
              className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors duration-300 placeholder:text-clinic-textSecondary/40 font-light text-sm"
            />
            <Input 
              placeholder="Seu WhatsApp (com DDD)"
              {...register('phone')}
              error={errors.phone?.message}
              className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors duration-300 placeholder:text-clinic-textSecondary/40 font-light text-sm"
            />
            <Input 
              placeholder="Procedimento de interesse (Opcional)"
              {...register('interest')}
              className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors duration-300 placeholder:text-clinic-textSecondary/40 font-light text-sm"
            />
            
            <div className="pt-8 text-center">
              <Button 
                type="submit" 
                isLoading={isSubmitting}
                className="w-full h-14 px-10 bg-clinic-textPrimary hover:bg-clinic-goldDark text-white text-[11px] uppercase tracking-[0.25em] font-semibold transition-colors duration-300 rounded-none shadow-sm"
              >
                Continuar pelo WhatsApp
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
