import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, Mail, Map, Navigation } from 'lucide-react';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-clinic-surface border-t border-clinic-border pt-16 md:pt-24 pb-8 md:pb-12">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap gap-12 lg:gap-8 mb-16 md:mb-24 justify-between">
          
          {/* COLUNA 1 — MARCA */}
          <div className="w-full md:w-[45%] lg:w-3/12 flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="inline-block mb-6 md:mb-8">
              <img 
                src="/logo-ferrer-compact.png" 
                alt="Ferrer Innovare Clinic" 
                className="w-[130px] md:w-[160px] lg:w-[170px] h-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('logo-ferrer-compact.png')) {
                    target.src = '/logo.png';
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            </Link>
            <p className="text-clinic-textSecondary font-light text-sm leading-relaxed max-w-[280px]">
              Exclusividade e excelência em dermatologia e estética avançada.
            </p>
          </div>

          {/* COLUNA 2 — NAVEGAÇÃO */}
          <div className="w-full md:w-[45%] lg:w-2/12 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-lg text-clinic-textPrimary mb-6 md:mb-8">Navegação</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-clinic-textSecondary hover:text-clinic-goldDark transition-colors text-[13px] tracking-wide">Início</Link></li>
              <li><Link to="/dra-patricia" className="text-clinic-textSecondary hover:text-clinic-goldDark transition-colors text-[13px] tracking-wide">A Clínica</Link></li>
              <li><Link to="/#tratamentos" className="text-clinic-textSecondary hover:text-clinic-goldDark transition-colors text-[13px] tracking-wide">Tratamentos</Link></li>
              <li><Link to="/#contato" className="text-clinic-textSecondary hover:text-clinic-goldDark transition-colors text-[13px] tracking-wide">Contato</Link></li>
            </ul>
          </div>

          {/* COLUNA 3 — ATENDIMENTO */}
          <div className="w-full md:w-[45%] lg:w-4/12 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-lg text-clinic-textPrimary mb-6 md:mb-8">Atendimento</h3>
            <div className="space-y-4">
              <p className="text-clinic-textSecondary font-light text-[13px] leading-relaxed">
                Rua Professor Irineu Chaluppe, 95<br />
                2º andar — Jardim Itapevi<br />
                Itapevi — SP
              </p>
              <div className="pt-2">
                <a href="tel:+5511942749623" className="block text-clinic-textPrimary font-medium text-sm mb-1 hover:text-clinic-goldDark transition-colors">
                  (11) 94274-9623
                </a>
                <p className="text-clinic-textSecondary font-light text-xs italic">
                  Atendimento pelo WhatsApp
                </p>
              </div>
            </div>
          </div>

          {/* COLUNA 4 — REDES SOCIAIS */}
          <div className="w-full md:w-[45%] lg:w-3/12 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-lg text-clinic-textPrimary mb-6 md:mb-8">Redes Sociais</h3>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <a 
                href="https://instagram.com/ferrerinnovare" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-clinic-border text-clinic-textSecondary hover:border-[#C98B84] hover:text-[#C98B84] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </a>
              <a 
                href="https://wa.me/5511942749623" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-clinic-border text-clinic-textSecondary hover:border-[#C98B84] hover:text-[#C98B84] transition-all duration-300"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-[18px] h-[18px]" />
              </a>
              <a 
                href="https://tiktok.com/@ferrerinnovare" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-clinic-border text-clinic-textSecondary hover:border-[#C98B84] hover:text-[#C98B84] transition-all duration-300"
                aria-label="TikTok"
              >
                <FaTiktok className="w-[17px] h-[17px]" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-clinic-border flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[11px] text-clinic-textSecondary tracking-wide font-light">
            &copy; 2026 Ferrer Innovare Clinic. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 text-[11px] text-clinic-textSecondary font-light">
            <Link to="/privacidade" className="hover:text-clinic-goldDark transition-colors">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-clinic-goldDark transition-colors">Termos de Uso</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
};
