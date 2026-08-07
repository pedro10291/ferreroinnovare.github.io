import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-clinic-surface border-t border-clinic-border pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img 
                src="/logo.png" 
                alt="Ferrer Innovare Clinic" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-clinic-textSecondary text-sm leading-relaxed max-w-sm">
              Exclusividade e excelência em dermatologia e estética avançada.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-serif text-lg text-clinic-textPrimary mb-6">Institucional</h3>
            <ul className="space-y-4">
              <li><a href="/#sobre" className="text-clinic-textSecondary hover:text-clinic-gold transition-colors text-sm">Sobre a Clínica</a></li>
              <li><a href="/#procedimentos" className="text-clinic-textSecondary hover:text-clinic-gold transition-colors text-sm">Procedimentos</a></li>
              <li><a href="/#faq" className="text-clinic-textSecondary hover:text-clinic-gold transition-colors text-sm">Dúvidas Frequentes</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-lg text-clinic-textPrimary mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-clinic-textSecondary">
                <MapPin className="w-5 h-5 mr-3 text-clinic-gold shrink-0 mt-0.5" />
                <span>Rua Fictícia, 123 - Sala 45<br/>Bairro Nobre, SP</span>
              </li>
              <li className="flex items-center text-sm text-clinic-textSecondary">
                <Phone className="w-5 h-5 mr-3 text-clinic-gold shrink-0" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center text-sm text-clinic-textSecondary">
                <Mail className="w-5 h-5 mr-3 text-clinic-gold shrink-0" />
                <span>contato@ferrerinnovare.com.br</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-serif text-lg text-clinic-textPrimary mb-6">Redes Sociais</h3>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-clinic-border text-clinic-textPrimary hover:border-clinic-gold hover:text-clinic-gold transition-all duration-300"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-clinic-border/50 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-clinic-textSecondary mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Ferrer Innovare Clinic. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 text-xs text-clinic-textSecondary">
            <Link to="/privacidade" className="hover:text-clinic-gold transition-colors">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-clinic-gold transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
