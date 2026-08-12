import React from 'react';
import { Phone, Mail, Map, Navigation } from 'lucide-react';

export const LocationSection = () => {
  return (
    <section id="como-chegar" className="bg-clinic-surface border-t border-clinic-border py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="w-full lg:w-4/12 flex flex-col justify-center">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary mb-8">Como Chegar</h2>
            
            <div className="mb-8">
              <p className="font-serif text-xl text-clinic-textPrimary mb-4">Ferrer Innovare Clinic</p>
              <p className="text-sm text-clinic-textSecondary font-light leading-relaxed mb-6">
                Rua Professor Irineu Chaluppe, 95<br />
                2º andar — Jardim Itapevi<br />
                Itapevi — SP, 06653-180
              </p>
              
              <div className="space-y-3">
                <a href="tel:+5511942749623" className="text-sm text-clinic-textSecondary font-light flex items-center gap-3 hover:text-clinic-gold transition-colors w-fit">
                  <Phone className="w-4 h-4 text-clinic-gold" />
                  (11) 94274-9623
                </a>
                <a href="mailto:contato@ferrerinnovare.com.br" className="text-sm text-clinic-textSecondary font-light flex items-center gap-3 hover:text-clinic-gold transition-colors w-fit">
                  <Mail className="w-4 h-4 text-clinic-gold" />
                  contato@ferrerinnovare.com.br
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Rua+Professor+Irineu+Chaluppe,+95,+Itapevi+-+SP" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 px-6 border border-clinic-border bg-clinic-bg text-clinic-textPrimary text-[11px] font-semibold tracking-widest uppercase transition-colors hover:bg-[#EFE8E2]"
              >
                <Map className="w-4 h-4 mr-3" />
                Google Maps
              </a>
              <a 
                href="https://waze.com/ul?q=Rua%20Professor%20Irineu%20Chaluppe,%2095,%20Itapevi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 px-6 border border-clinic-border bg-clinic-bg text-clinic-textPrimary text-[11px] font-semibold tracking-widest uppercase transition-colors hover:bg-[#EFE8E2]"
              >
                <Navigation className="w-4 h-4 mr-3" />
                Waze
              </a>
            </div>
          </div>
          
          <div className="w-full lg:w-8/12 aspect-square sm:aspect-[21/9] lg:aspect-auto lg:h-[400px] bg-clinic-border overflow-hidden">
            <iframe 
              src="https://maps.google.com/maps?q=Rua%20Professor%20Irineu%20Chaluppe,%2095,%20Itapevi%20-%20SP&t=&z=16&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale-[0.5] contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};
