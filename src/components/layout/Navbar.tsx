import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase';
import { Procedure } from '../../types/procedure';

const normalizeText = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const SYNONYMS: Record<string, string[]> = {
  'preenchimento': ['preenchimento-labial', 'preenchimento-olheiras', 'preenchimento-mandibula', 'perfiloplastia', 'harmonizacao-facial'],
  'preenchimentos': ['preenchimento-labial', 'preenchimento-olheiras', 'preenchimento-mandibula', 'perfiloplastia', 'harmonizacao-facial'],
  'botox': ['toxina-botulinica', 'rejuvenescimento-facial'],
  'botulínica': ['toxina-botulinica'],
  'botulinica': ['toxina-botulinica'],
  'rugas': ['toxina-botulinica', 'rejuvenescimento-facial', 'fios-de-pdo'],
  'marcas': ['toxina-botulinica', 'rejuvenescimento-facial'],
  'expressao': ['toxina-botulinica'],
  'labios': ['preenchimento-labial'],
  'labial': ['preenchimento-labial'],
  'boca': ['preenchimento-labial'],
  'colageno': ['bioestimulador-de-colageno', 'fios-de-pdo'],
  'bioestimulador': ['bioestimulador-de-colageno'],
  'olheira': ['preenchimento-olheiras'],
  'olheiras': ['preenchimento-olheiras'],
  'papada': ['lipo-papada'],
  'lipo': ['lipo-papada'],
  'gluteos': ['gluteos'],
  'bumbum': ['gluteos'],
  'tatuagem': ['despigmentacao-tatuagem', 'despigmentacao-de-tatuagem'],
  'sobrancelha': ['despigmentacao-de-sobrancelha', 'remocao-micropigmentacao', 'micropigmentacao'],
  'micropigmentacao': ['remocao-micropigmentacao', 'micropigmentacao'],
  'limpeza': ['limpeza-de-pele'],
  'cravos': ['limpeza-de-pele'],
  'acne': ['limpeza-de-pele'],
  'mandibula': ['preenchimento-mandibula'],
  'queixo': ['preenchimento-mandibula', 'perfiloplastia'],
  'vasinhos': ['secagem-de-vasinhos'],
  'varizes': ['secagem-de-vasinhos'],
  'perfil': ['perfiloplastia', 'perfiloplastia-harmonizacao-do-perfil-sem-cirurgia'],
  'perfiloplastia': ['perfiloplastia', 'perfiloplastia-harmonizacao-do-perfil-sem-cirurgia'],
  'harmonizacao': ['harmonizacao-facial', 'perfiloplastia'],
  'capilar': ['rejuvenescimento-capilar'],
  'cabelo': ['rejuvenescimento-capilar'],
  'queda': ['rejuvenescimento-capilar'],
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if ((isOpen || isSearchOpen) && navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSearchOpen(false);
      }
    };
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if ((isOpen || isSearchOpen) && event.key === 'Escape') {
        setIsOpen(false);
        setIsSearchOpen(false);
      }
    };

    if (isOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);

      if (procedures.length === 0) {
        const fetchProcedures = async () => {
          try {
            const { data } = await supabase
              .from('procedures')
              .select('id, title, slug, short_description, description, category, benefits, indication')
              .eq('active', true)
              .order('display_order', { ascending: true });
            if (data) {
              setProcedures(data as Procedure[]);
            }
          } catch (err) {
            console.error('Erro ao carregar procedimentos para busca:', err);
          }
        };
        fetchProcedures();
      }
    }
  }, [isSearchOpen, procedures.length]);

  const filteredProcedures = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return [];

    const matchingSynonymSlugs: string[] = [];
    Object.entries(SYNONYMS).forEach(([key, slugs]) => {
      const normKey = normalizeText(key);
      if (normKey.includes(q) || q.includes(normKey)) {
        matchingSynonymSlugs.push(...slugs);
      }
    });

    return procedures.filter((p) => {
      const title = normalizeText(p.title || '');
      const slug = normalizeText(p.slug || '');
      const slugClean = slug.replace(/-/g, ' ');
      const desc = normalizeText(p.short_description || p.description || '');
      const category = normalizeText(p.category || '');
      const indication = normalizeText(p.indication || '');
      const benefits = (p.benefits || []).map(normalizeText).join(' ');

      if (
        title.includes(q) ||
        slug.includes(q) ||
        slugClean.includes(q) ||
        desc.includes(q) ||
        category.includes(q) ||
        indication.includes(q) ||
        benefits.includes(q)
      ) {
        return true;
      }
      if (matchingSynonymSlugs.includes(p.slug)) {
        return true;
      }
      return false;
    }).slice(0, 6);
  }, [searchQuery, procedures]);

  const handleProcedureSelect = (procedure: Procedure) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/agendar?procedimento=${encodeURIComponent(procedure.slug)}`);
  };

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Sobre mim', path: '/dra-patricia' },
    { name: 'Tratamentos', path: '/#tratamentos' },
    { name: 'Contato', path: '/#contato' },
  ];

  return (
    <nav ref={navRef} className="fixed w-full z-50 bg-clinic-bg/95 backdrop-blur-md border-b border-clinic-border/60 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-[70px] md:h-[90px]">
          
          {/* Left Side: Logo + Nav Links */}
          <div className="flex items-center gap-10 lg:gap-16">
            <Link to="/" className="flex items-center w-[120px] md:w-[220px] shrink-0 transition-opacity duration-300 hover:opacity-90">
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Ferrer Innovare Clinic" 
                className="w-full h-auto object-contain"
              />
              <span className="hidden font-serif text-2xl font-medium tracking-wide text-clinic-textPrimary">
                Ferrer Innovare Clinic
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (location.hash && link.path.includes(location.hash));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`transition-colors duration-300 text-[11px] font-semibold tracking-[0.2em] uppercase ${
                      isActive ? 'text-clinic-goldDark' : 'text-clinic-textSecondary hover:text-clinic-textPrimary'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Right Side Desktop: Search + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (isOpen) setIsOpen(false);
              }}
              className="text-clinic-textPrimary hover:text-clinic-gold transition-colors p-2.5 focus:outline-none flex items-center justify-center"
              aria-label="Buscar procedimento"
              title="Buscar procedimento"
            >
              {isSearchOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Search className="h-5 w-5" strokeWidth={1.5} />}
            </button>

            <Link
              to="/agendar"
              className="bg-clinic-textPrimary text-white px-8 h-12 flex items-center justify-center rounded-none text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-clinic-goldDark transition-colors duration-300"
            >
              Agendar Avaliação
            </Link>
          </div>

          {/* Right Side Mobile: [LOGOTIPO] ... [LUPA] [HAMBURGER] */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (isOpen) setIsOpen(false);
              }}
              className="text-clinic-textPrimary transition-colors focus:outline-none p-2"
              aria-label="Buscar procedimento"
            >
              {isSearchOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Search className="h-6 w-6" strokeWidth={1.5} />}
            </button>
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                if (isSearchOpen) setIsSearchOpen(false);
              }}
              className="text-clinic-textPrimary transition-colors focus:outline-none p-2"
              aria-label="Menu principal"
            >
              {isOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Area Compacta de Pesquisa (Abaixo do Header) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="bg-[#FCFBF9] border-t border-clinic-border/60 shadow-sm overflow-hidden"
          >
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-4 space-y-3">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-clinic-gold pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar procedimento..."
                  className="w-full bg-clinic-bg border border-clinic-border/60 pl-10 pr-10 py-3 text-xs md:text-sm text-clinic-textPrimary placeholder:text-clinic-textSecondary/50 font-light focus:outline-none focus:border-clinic-gold transition-colors rounded-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 text-clinic-textSecondary hover:text-clinic-textPrimary p-1"
                    aria-label="Limpar busca"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Lista de Resultados */}
              {searchQuery.trim() !== '' && (
                <div className="pt-2 pb-1 border-t border-clinic-border/30 max-h-72 overflow-y-auto space-y-2">
                  {filteredProcedures.length > 0 ? (
                    filteredProcedures.map((proc) => (
                      <button
                        key={proc.id}
                        onClick={() => handleProcedureSelect(proc)}
                        className="w-full text-left p-3 hover:bg-clinic-surface/60 transition-colors flex items-center justify-between group border border-transparent hover:border-clinic-border/40"
                      >
                        <div className="space-y-1 pr-4">
                          <h4 className="text-xs md:text-sm font-serif font-medium text-clinic-textPrimary group-hover:text-clinic-gold transition-colors">
                            {proc.title}
                          </h4>
                          {proc.short_description && (
                            <p className="text-[11px] text-clinic-textSecondary font-light line-clamp-1">
                              {proc.short_description}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-semibold tracking-widest text-clinic-gold shrink-0 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Agendar <span className="font-light text-sm">→</span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-clinic-textSecondary font-light italic">
                      Não encontramos esse procedimento.
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-clinic-bg border-b border-clinic-border overflow-hidden"
          >
            <div className="px-6 pt-4 pb-8 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-serif text-clinic-textPrimary hover:text-clinic-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-clinic-border">
                <Link
                  to="/agendar"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-clinic-textPrimary text-white px-6 py-4 rounded-none text-xs font-semibold tracking-widest uppercase hover:bg-clinic-gold transition-colors"
                >
                  Agendar Avaliação
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

