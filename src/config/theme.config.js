/* Template Mestre Ferrer Innovare - Todos os direitos estruturais reservados a Pedro Coutinho. É proibida a replicação do código-fonte estrutural. O cliente detém apenas a titularidade do domínio, dados e conteúdo textual inserido. */

// Configurações Globais do Template Mestre - Ferrer Innovare Clinic
// Edite os valores abaixo para reconfigurar a marca, cores, equipe ou serviços para novos clientes.

export const themeConfig = {
  // Configurações de Identidade Visual e Textos
  brand: {
    name: "Ferrer Innovare",
    fullName: "Ferrer Innovare Clinic",
    slogan: "Saúde e Estética de Luxo",
    description: "Um conceito exclusivo em tratamentos estéticos de alto padrão para realçar sua melhor versão. Tecnologia avançada e atendimento personalizado.",
    expertise: "Com a expertise de Dra. Patrícia Santana, Luana Paula e Shaiane Santos.",
    initials: "FI",
    logoCircleColor: "#C8A97E", // Ouro/Nude
  },

  // Contatos e Redes Sociais
  // TODO: CLIENTE - INSERIR LINK DO NOVO DOMÍNIO OU REDES SOCIAIS AQUI
  contact: {
    whatsapp: "5511999999999", // Colocar número real para redirecionamento
    instagram: "https://www.instagram.com/ferrer.innovareclinic",
    mapsUrl: "https://maps.app.goo.gl/RvmhuYSCxpSChk228?g_st=ic",
    locationName: "Itapevi - SP",
  },

  // Configurações do Sistema Financeiro e Políticas
  billing: {
    pixKey: "00.000.000/0001-00", // Chave CNPJ padrão
    depositPercentage: 0.50, // Sinal de 50% para reserva de horários
  },

  // Lista Padrão de Serviços Ofertados na Clínica
  defaultServices: [
    { id: 'srv-1', name: 'Toxina Botulínica (Botox)', price: 1200.00, durationMinutes: 45, isActive: true },
    { id: 'srv-2', name: 'Preenchimento Labial', price: 1500.00, durationMinutes: 60, isActive: true },
    { id: 'srv-3', name: 'Fios de PDO Faciais', price: 2200.00, durationMinutes: 90, isActive: true },
    { id: 'srv-4', name: 'Limpeza de Pele Premium', price: 350.00, durationMinutes: 75, isActive: true },
    { id: 'srv-5', name: 'Micropigmentação Labial', price: 800.00, durationMinutes: 120, isActive: true },
    { id: 'srv-6', name: 'Micropigmentação Esfumada', price: 900.00, durationMinutes: 120, isActive: true }
  ],

  // Lista Padrão de Profissionais da Clínica
  defaultProfessionals: [
    { id: 'prof-1', name: 'Dra. Patrícia Santana', specialty: 'Rejuvenescimento Facial', allowedServices: ['srv-1', 'srv-2', 'srv-3'] },
    { id: 'prof-2', name: 'Luana Paula', specialty: 'Micropigmentadora', allowedServices: ['srv-5', 'srv-6'] },
    { id: 'prof-3', name: 'Shaiane Santos', specialty: 'Esteticista Especialista', allowedServices: ['srv-4'] }
  ],

  // Configuração do Clube VIP e da Roleta de Prêmios (Marketing)
  marketing: {
    premios: [
      'Peeling Facial', 
      'Massagem Relax', 
      '10% OFF Botox', 
      'Limpeza de Pele', 
      'Tente Novamente', // O algoritmo pula este prêmio para agradar o cliente
      'OFF Preenchimento'
    ],
    referralPointsValue: 10, // Pontos concedidos por nova indicação
  },

  // Paleta de Cores do Tema (reutilizada no tailwind.config.js e layouts inline)
  colors: {
    bg: "#FDFBF7",             // Off-White Quente
    surface: "#FFFFFF",        // Branco Puro para Cards
    surfaceHover: "#FAF7F2",  // Off-white para estados de hover
    gold: "#C8A97E",           // Nude/Bege Ouro
    goldHover: "#B8996E",      // Dourado escuro para hover
    textPrimary: "#3E362E",    // Marrom Escuro
    textSecondary: "#7F7368",  // Marrom Suporte
    border: "#EFEBE5",         // Bordas quentes
    success: "#5F8F75",        // Verde Oliva
    danger: "#C05C5C",         // Vermelho Terracota
  }
};
