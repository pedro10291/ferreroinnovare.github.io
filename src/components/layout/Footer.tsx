import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { CLINIC_WHATSAPP } from '../../config/constants';

const instagramUrl = 'https://www.instagram.com/ferrer.innovareclinic/';
const mapsUrl = 'https://maps.app.goo.gl/RvmhuYSCxpSChk228?g_st=ic';

export const Footer = () => {
  return (
    <footer className="bg-clinic-surface border-t border-clinic-border py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1.35fr_0.8fr_1fr] md:items-start">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/logo-ferrer-compact.png"
                alt="Ferrer Innovare Clinic"
                className="w-[132px] md:w-[150px] h-auto object-contain"
                onError={(event) => {
                  const image = event.target as HTMLImageElement;
                  image.src = '/logo.png';
                }}
              />
            </Link>
            <p className="text-clinic-textSecondary font-light text-xs leading-relaxed max-w-[260px]">
              Exclusividade e excelência em dermatologia e estética avançada.
            </p>
          </div>

          <nav aria-label="Navegação do rodapé" className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-base text-clinic-textPrimary mb-4">Navegação</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[12px] text-clinic-textSecondary">
              <Link to="/" className="hover:text-clinic-goldDark transition-colors">Início</Link>
              <Link to="/dra-patricia" className="hover:text-clinic-goldDark transition-colors">A Clínica</Link>
              <Link to="/#tratamentos" className="hover:text-clinic-goldDark transition-colors">Tratamentos</Link>
              <Link to="/#contato" className="hover:text-clinic-goldDark transition-colors">Contato</Link>
            </div>
          </nav>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-base text-clinic-textPrimary mb-4">Contato</h3>
            <div className="flex flex-col gap-3 text-[12px] text-clinic-textSecondary">
              <a href={`https://wa.me/${CLINIC_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-clinic-goldDark transition-colors">
                <FaWhatsapp className="w-3.5 h-3.5" />
                WhatsApp: (11) 94274-9623
              </a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-clinic-goldDark transition-colors">
                <Instagram className="w-3.5 h-3.5" strokeWidth={1.5} />
                @ferrer.innovareclinic
              </a>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 hover:text-clinic-goldDark transition-colors">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={1.5} />
                <span>Rua Professor Irineu Chaluppe, 95 — Itapevi, SP</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-clinic-border flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left text-[10px] text-clinic-textSecondary font-light">
          <p>© 2026 Ferrer Innovare Clinic. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <Link to="/privacidade" className="hover:text-clinic-goldDark transition-colors">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-clinic-goldDark transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
