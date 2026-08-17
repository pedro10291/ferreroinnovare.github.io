import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin } from 'lucide-react';
import { CLINIC_WHATSAPP } from '../../config/constants';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={props.className}
    width="1em" 
    height="1em"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.452L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.449 5.487 0 9.951-4.462 9.954-9.948.002-2.656-1.03-5.153-2.906-7.03C16.447 1.74 13.951.706 11.294.706c-5.491 0-9.957 4.463-9.96 9.95-.001 1.77.475 3.497 1.38 5.04l-.995 3.637 3.733-.979zm11.233-5.106c-.309-.154-1.827-.902-2.105-1.002-.278-.1-.482-.154-.683.154-.202.308-.78.977-.956 1.181-.177.204-.354.23-.663.077-1.127-.565-1.921-1.026-2.684-2.33-.201-.345.201-.321.576-1.072.062-.124.031-.233-.016-.333-.047-.1-.482-1.16-.661-1.59-.174-.42-.365-.361-.502-.369-.13-.008-.278-.01-.427-.01-.149 0-.39.056-.595.28-.205.223-.782.763-.782 1.86 0 1.096.797 2.153.908 2.302.111.15 1.568 2.396 3.8 3.356 1.062.457 1.892.736 2.534.94.78.249 1.49.213 2.052.129.626-.094 1.828-.748 2.086-1.474.257-.725.257-1.348.18-1.474-.077-.127-.278-.203-.586-.358z" />
  </svg>
);

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
                <WhatsAppIcon className="w-3.5 h-3.5" />
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
