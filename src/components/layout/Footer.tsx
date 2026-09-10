import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin } from 'lucide-react';
import { CLINIC_WHATSAPP } from '../../config/constants';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
    <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
  </svg>
);

const instagramUrl = 'https://www.instagram.com/ferrer.innovareclinic/';
const mapsUrl = 'https://maps.app.goo.gl/RvmhuYSCxpSChk228?g_st=ic';

export const Footer = () => {
  return (
    <footer className="bg-clinic-bg border-t border-clinic-border/60 py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1.35fr_0.8fr_1fr] md:items-start">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="inline-block mb-4">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Ferrer Innovare Clinic"
                className="w-[132px] md:w-[150px] h-auto object-contain"
              />
            </Link>
            <p className="text-clinic-textSecondary font-light text-xs leading-relaxed max-w-[260px]">
              Cuidado, técnica e excelência em estética avançada.
            </p>
          </div>

          <nav aria-label="Navegação do rodapé" className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-base text-clinic-textPrimary mb-4">Navegação</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[12px] text-clinic-textSecondary">
              <Link to="/" className="hover:text-clinic-goldDark transition-colors">Início</Link>
              <Link to="/dra-patricia" className="hover:text-clinic-goldDark transition-colors">Sobre mim</Link>
              <Link to="/#tratamentos" className="hover:text-clinic-goldDark transition-colors">Tratamentos</Link>
              <Link to="/#contato" className="hover:text-clinic-goldDark transition-colors">Contato</Link>
            </div>
          </nav>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-base text-clinic-textPrimary mb-4">Contato</h3>
            <div className="flex flex-col gap-3 text-[12px] text-clinic-textSecondary">
              <a href={`https://wa.me/${CLINIC_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-clinic-goldDark transition-colors">
                <WhatsAppIcon className="w-3.5 h-3.5" />
                WhatsApp: (11) 94274-9623
              </a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-clinic-goldDark transition-colors">
                <Instagram className="w-3.5 h-3.5" strokeWidth={1.2} />
                @ferrer.innovareclinic
              </a>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 hover:text-clinic-goldDark transition-colors">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={1.2} />
                <span>Rua Professor Irineu Chaluppe, 95 — Itapevi, SP</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-clinic-border flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left text-[10px] text-clinic-textSecondary font-light">
          <p>© 2026 Ferrer Innovare Clinic. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <Link to="/politica-de-privacidade" className="hover:text-clinic-goldDark transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
