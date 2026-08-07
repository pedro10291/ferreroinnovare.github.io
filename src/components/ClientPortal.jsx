/* Template Mestre Ferrer Innovare - Todos os direitos estruturais reservados a Pedro Coutinho. É proibida a replicação do código-fonte estrutural. O cliente detém apenas a titularidade do domínio, dados e conteúdo textual inserido. */

import React, { useState, useEffect, useRef } from "react";
import { 
  Instagram, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Check, 
  Copy, 
  ChevronRight, 
  Phone, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  Gift
} from "lucide-react";
import { themeConfig } from "../config/theme.config";
import LuckyWheel from "./LuckyWheel";

// Componente do Portal do Cliente
export default function ClientPortal({ onNavigateToAdmin }) {
  // ==========================================
  // ESTADOS DO PORTAL
  // ==========================================
  const [activeTab, setActiveTab] = useState("booking"); // 'booking' | 'vip'
  const [step, setStep] = useState(0); // 0 a 5
  
  // Dados dinâmicos carregados do localStorage
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  // Estado do formulário de agendamento
  const [bookingState, setBookingState] = useState({
    serviceId: null,
    professionalId: null,
    date: "",
    time: null,
    patientName: "",
    patientPhone: "",
    hasAlergia: false,
    alergiasDetails: "",
    hasMedicamentos: false,
    medicamentosDetails: "",
    policyAgreement: false
  });

  // Estado do carrossel da vitrine
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselImages = ["/foto1.jpg", "/foto2.jpg", "/foto3.jpg"]; // TODO: ALTERAR LOGO/FOTOS DO CLIENTE AQUI

  // Estado da Lista de Espera Inline
  const [waitingName, setWaitingName] = useState("");
  const [waitingPhone, setWaitingPhone] = useState("");
  const [isWaitingFormOpen, setIsWaitingFormOpen] = useState(false);
  const [waitingListRegistered, setWaitingListRegistered] = useState(false);

  // Sistema de Toasts (Notificações)
  const [toasts, setToasts] = useState([]);

  // Ref para auto-scroll nas trocas de etapa
  const appWrapperRef = useRef(null);

  // ==========================================
  // CARREGAR DADOS E SINCRONIZAR
  // ==========================================
  useEffect(() => {
    // Inicializar localStorage caso não existam chaves
    if (!localStorage.getItem("ferrer_services")) {
      localStorage.setItem("ferrer_services", JSON.stringify(themeConfig.defaultServices));
    }
    if (!localStorage.getItem("ferrer_professionals")) {
      localStorage.setItem("ferrer_professionals", JSON.stringify(themeConfig.defaultProfessionals));
    }
    if (!localStorage.getItem("ferrer_appointments")) {
      localStorage.setItem("ferrer_appointments", JSON.stringify([]));
    }
    if (!localStorage.getItem("ferrer_patients")) {
      localStorage.setItem("ferrer_patients", JSON.stringify([]));
    }

    setServices(JSON.parse(localStorage.getItem("ferrer_services")) || []);
    setProfessionals(JSON.parse(localStorage.getItem("ferrer_professionals")) || []);
    setAppointments(JSON.parse(localStorage.getItem("ferrer_appointments")) || []);
    setPatients(JSON.parse(localStorage.getItem("ferrer_patients")) || []);

    // Listener para mudanças no localStorage de outras abas (Ex: Admin)
    const handleStorageChange = (e) => {
      if (e.key === "ferrer_services") setServices(JSON.parse(e.newValue) || []);
      if (e.key === "ferrer_professionals") setProfessionals(JSON.parse(e.newValue) || []);
      if (e.key === "ferrer_appointments") setAppointments(JSON.parse(e.newValue) || []);
      if (e.key === "ferrer_patients") setPatients(JSON.parse(e.newValue) || []);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Timer do Carrossel (Vitrine)
  useEffect(() => {
    if (step !== 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [step]);

  // Scroll para o topo ao mudar de etapa
  const goToStep = (targetStep) => {
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==========================================
  // FUNÇÕES AUXILIARES / NOTIFICAÇÃO
  // ==========================================
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  // ==========================================
  // LÓGICA DE AGENDAMENTO (PASSO A PASSO)
  // ==========================================

  // Passo 1: Seleção de Procedimento
  const handleSelectService = (serviceId) => {
    setBookingState((prev) => ({
      ...prev,
      serviceId,
      professionalId: null, // Resetar seleção de profissional ao trocar serviço
      time: null
    }));
    goToStep(2);
  };

  // Passo 2: Geração de Horários
  const activeServices = services.filter((s) => s.isActive);
  const selectedServiceObj = services.find((s) => s.id === bookingState.serviceId);
  const eligibleProfessionals = professionals.filter((p) => 
    p.allowedServices.includes(bookingState.serviceId)
  );

  // Pre-selecionar profissional se houver apenas um elegível
  useEffect(() => {
    if (step === 2 && !bookingState.professionalId && eligibleProfessionals.length > 0) {
      setBookingState((prev) => ({
        ...prev,
        professionalId: eligibleProfessionals[0].id
      }));
    }
  }, [step, bookingState.serviceId]);

  // Sugestão de horários premium
  const timeSlots = ["09:00", "10:30", "14:00", "15:30", "17:00"];

  // Verificar se o dia selecionado é domingo (simula folga da clínica)
  const isSunday = bookingState.date 
    ? new Date(bookingState.date + "T00:00:00").getDay() === 0 
    : false;

  // Filtrar horários ocupados por outros agendamentos ativos da profissional
  const takenTimes = appointments
    .filter(
      (app) => 
        app.professionalId === bookingState.professionalId && 
        app.date === bookingState.date && 
        app.status !== "cancelado"
    )
    .map((app) => app.time);

  const isFullyBooked = isSunday || (bookingState.date && timeSlots.every((time) => takenTimes.includes(time)));

  // Cadastro na Lista de Espera
  const handleSubmitWaitingList = () => {
    if (!waitingName.trim() || !waitingPhone.trim()) {
      showToast("Por favor, preencha todos os campos obrigatórios.", "error");
      return;
    }

    const currentWaiting = JSON.parse(localStorage.getItem("ferrer_waiting_list")) || [];
    const newLead = {
      id: `wait-${Date.now()}`,
      name: waitingName,
      phone: waitingPhone,
      serviceId: bookingState.serviceId,
      date: bookingState.date,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem("ferrer_waiting_list", JSON.stringify([...currentWaiting, newLead]));
    setWaitingListRegistered(true);
    setIsWaitingFormOpen(false);
    showToast("Sua solicitação foi salva na Lista de Espera!", "success");
  };

  // Passo 3: Validação de Anamnese e Dados
  const handleAnamneseSubmit = (e) => {
    e.preventDefault();
    if (!bookingState.patientName.trim() || !bookingState.patientPhone.trim()) {
      showToast("Nome e WhatsApp são obrigatórios.", "error");
      return;
    }
    goToStep(4);
  };

  // Passo 4: Confirmação e sinal PIX
  const handleConfirmBooking = () => {
    if (!bookingState.policyAgreement) {
      showToast("Você precisa concordar com a política de sinal de 50%.", "error");
      return;
    }

    const totalPrice = selectedServiceObj ? selectedServiceObj.price : 0;
    
    // Atualiza cadastro do paciente local
    let updatedPatients = [...patients];
    const patientIndex = updatedPatients.findIndex((p) => p.phone === bookingState.patientPhone);
    if (patientIndex !== -1) {
      updatedPatients[patientIndex].referralPoints += 5; // ganha pontos por agendamento
    } else {
      updatedPatients.push({
        name: bookingState.patientName,
        phone: bookingState.patientPhone,
        referralPoints: 10
      });
    }

    // Registra o agendamento
    const newApp = {
      id: `app-${Date.now()}`,
      patientName: bookingState.patientName,
      patientPhone: bookingState.patientPhone,
      serviceId: bookingState.serviceId,
      professionalId: bookingState.professionalId,
      date: bookingState.date,
      time: bookingState.time,
      status: "confirmado",
      anamnese: {
        alergias: bookingState.hasAlergia ? `Sim (${bookingState.alergiasDetails})` : "Não",
        medicamentos: bookingState.hasMedicamentos ? `Sim (${bookingState.medicamentosDetails})` : "Não"
      }
    };

    const newAppointments = [...appointments, newApp];
    
    localStorage.setItem("ferrer_appointments", JSON.stringify(newAppointments));
    localStorage.setItem("ferrer_patients", JSON.stringify(updatedPatients));

    setAppointments(newAppointments);
    setPatients(updatedPatients);

    showToast("Solicitação de agendamento registrada com sucesso!", "success");
    goToStep(5);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(themeConfig.billing.pixKey)
      .then(() => showToast("Chave CNPJ do PIX copiada!", "success"))
      .catch(() => showToast("Erro ao copiar chave PIX.", "error"));
  };

  const handleRestart = () => {
    setBookingState({
      serviceId: null,
      professionalId: null,
      date: "",
      time: null,
      patientName: "",
      patientPhone: "",
      hasAlergia: false,
      alergiasDetails: "",
      hasMedicamentos: false,
      medicamentosDetails: "",
      policyAgreement: false
    });
    setWaitingName("");
    setWaitingPhone("");
    setWaitingListRegistered(false);
    goToStep(0);
  };

  // Montar link do WhatsApp para envio do comprovante
  const getWhatsAppLink = () => {
    const serviceName = selectedServiceObj ? selectedServiceObj.name : "";
    const professionalName = professionals.find((p) => p.id === bookingState.professionalId)?.name || "";
    const formattedDate = bookingState.date.split("-").reverse().join("/");

    const text = `Olá! Gostaria de confirmar meu agendamento na *${themeConfig.brand.fullName}*:\n\n- *Cliente:* ${bookingState.patientName}\n- *Procedimento:* ${serviceName}\n- *Especialista:* ${professionalName}\n- *Data/Hora:* ${formattedDate} às ${bookingState.time}\n\nAguardando instruções para o envio do comprovante do sinal (50%).`;
    return `https://wa.me/${themeConfig.contact.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  // ==========================================
  // RENDERIZAÇÃO DE TELAS (MOBILE WRAPPER)
  // ==========================================
  return (
    <div ref={appWrapperRef} className="w-full max-w-[500px] bg-[#FDFBF7] flex flex-col min-h-screen relative shadow-[0_0_40px_rgba(62,54,46,0.02)] border-x border-[#EFEBE5] pb-6 font-sans text-[#3E362E]">
      
      {/* Cabeçalho Principal do App */}
      <header className="bg-white px-5 pt-5 pb-3 border-b border-[#EFEBE5] text-center sticky top-0 z-40">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: themeConfig.brand.logoCircleColor }}>
            {themeConfig.brand.initials}
          </div>
          <div className="text-left">
            <h1 className="font-serif font-semibold text-lg leading-tight tracking-wide">{themeConfig.brand.name}</h1>
            <p className="text-xs text-[#7F7368] font-medium tracking-wider uppercase">{themeConfig.brand.slogan}</p>
          </div>
        </div>

        {/* Menu Superior - Abas */}
        <nav className="flex bg-[#FDFBF7] p-1 rounded-xl border border-[#EFEBE5]">
          <button 
            onClick={() => setActiveTab("booking")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === "booking" 
                ? "bg-white text-[#3E362E] shadow-sm font-bold" 
                : "text-[#7F7368] hover:text-[#3E362E]"
            }`}
          >
            Agendamento
          </button>
          <button 
            onClick={() => setActiveTab("vip")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === "vip" 
                ? "bg-white text-[#3E362E] shadow-sm font-bold" 
                : "text-[#7F7368] hover:text-[#3E362E]"
            }`}
          >
            Clube VIP 🎡
          </button>
        </nav>
      </header>

      {/* ------------------------------------------- */}
      {/* CONTEÚDO PRINCIPAL - ABA DE AGENDAMENTO     */}
      {/* ------------------------------------------- */}
      {activeTab === "booking" && (
        <div className="flex-1 flex flex-col">
          
          {/* Barra de Progresso do Agendamento */}
          {step > 0 && step < 5 && (
            <div className="flex justify-between px-5 py-4 bg-white border-b border-[#EFEBE5]">
              {[
                { num: 1, label: "Serviço" },
                { num: 2, label: "Data/Hora" },
                { num: 3, label: "Anamnese" },
                { num: 4, label: "Confirmar" }
              ].map((s) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center flex-1 relative">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${
                      isActive 
                        ? "bg-[#C8A97E] text-white border-[#C8A97E]" 
                        : isCompleted 
                        ? "bg-[#5F8F75] text-white border-[#5F8F75]" 
                        : "bg-white text-[#7F7368] border-[#EFEBE5]"
                    }`}>
                      {isCompleted ? "✓" : s.num}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium transition-all duration-300 ${
                      isActive ? "text-[#3E362E] font-semibold" : "text-[#7F7368]"
                    }`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* container etapas */}
          <div className="flex-1 px-5 py-6">
            
            {/* ETAPA 0: VITRINE DE ENTRADA */}
            {step === 0 && (
              <section className="animate-fadeIn">
                {/* Carrossel de fotos */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-sm bg-white">
                  {carouselImages.map((src, idx) => (
                    <img 
                      key={src}
                      src={src} 
                      alt={`Clinica Ferrer ${idx + 1}`} 
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        idx === currentSlide ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))}
                  {/* Indicadores de bolinha do carrossel */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {carouselImages.map((_, idx) => (
                      <span 
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentSlide ? "bg-[#C8A97E] w-5" : "bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Info Text */}
                <div className="text-center">
                  <span className="text-xs font-semibold tracking-wider text-[#C8A97E] uppercase block mb-2">
                    {themeConfig.brand.fullName}
                  </span>
                  <h2 className="font-serif text-2xl font-normal leading-tight text-[#3E362E] mb-3">
                    {themeConfig.brand.description}
                  </h2>
                  <p className="text-xs text-[#7F7368] font-medium leading-relaxed mb-6">
                    {themeConfig.brand.expertise}
                  </p>

                  <button 
                    onClick={() => goToStep(1)}
                    className="w-full bg-[#C8A97E] hover:bg-[#B8996E] active:scale-[0.98] text-white py-4 px-6 rounded-xl font-semibold tracking-wide shadow-md transition-all duration-300"
                  >
                    Agendar Meu Horário
                  </button>

                  {/* Rodapé da Vitrine */}
                  <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-[#EFEBE5]">
                    <a href={themeConfig.contact.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#7F7368] hover:text-[#3E362E] transition-colors">
                      <Instagram size={14} className="text-[#C8A97E]" />
                      <span>@ferrer.innovareclinic</span>
                    </a>
                    <a href={themeConfig.contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#7F7368] hover:text-[#3E362E] transition-colors">
                      <MapPin size={14} className="text-[#C8A97E]" />
                      <span>{themeConfig.contact.locationName}</span>
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* ETAPA 1: CATÁLOGO DE SERVIÇOS */}
            {step === 1 && (
              <section className="animate-fadeIn">
                <div className="mb-6">
                  <h2 className="font-serif text-xl font-semibold text-[#3E362E]">Selecione o Procedimento</h2>
                  <p className="text-xs text-[#7F7368] mt-1">Escolha um de nossos tratamentos exclusivos para iniciar seu agendamento.</p>
                </div>

                <div className="space-y-4">
                  {activeServices.length === 0 ? (
                    <p className="text-center text-xs text-[#7F7368] py-8">De momento, a clínica não possui tratamentos online ativos.</p>
                  ) : (
                    activeServices.map((s) => (
                      <div key={s.id} className="bg-white border border-[#EFEBE5] rounded-2xl p-5 shadow-[0_4px_20px_rgba(62,54,46,0.02)] hover:border-[#C8A97E] transition-all duration-300 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-base text-[#3E362E] font-serif pr-2">{s.name}</h3>
                          <span className="font-semibold text-base text-[#C8A97E] whitespace-nowrap">{formatCurrency(s.price)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#7F7368] mb-4">
                          <Clock size={12} />
                          <span>Duração: {s.durationMinutes} min</span>
                        </div>
                        <button 
                          onClick={() => handleSelectService(s.id)}
                          className="w-full bg-[#C8A97E] hover:bg-[#B8996E] text-white py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 active:scale-[0.99]"
                        >
                          Agendar Tratamento
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* ETAPA 2: PROFISSIONAL E DATA/HORA */}
            {step === 2 && (
              <section className="animate-fadeIn">
                <div className="mb-6">
                  <h2 className="font-serif text-xl font-semibold text-[#3E362E]">Profissional & Horário</h2>
                  <p className="text-xs text-[#7F7368] mt-1">Escolha a especialista de sua preferência e o horário desejado.</p>
                </div>

                {/* Seleção de Profissional */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase text-[#7F7368] tracking-wider mb-3">Selecione a Especialista</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {professionals.map((p) => {
                      const isEligible = p.allowedServices.includes(bookingState.serviceId);
                      const isSelected = bookingState.professionalId === p.id;
                      const initials = p.name ? p.name.split(" ").pop() ? p.name.charAt(0) : "P" : "P";

                      return (
                        <button
                          key={p.id}
                          disabled={!isEligible}
                          onClick={() => setBookingState((prev) => ({ ...prev, professionalId: p.id, time: null }))}
                          className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all duration-300 ${
                            isSelected 
                              ? "border-[#C8A97E] bg-white shadow-md ring-1 ring-[#C8A97E]/30" 
                              : isEligible 
                              ? "border-[#EFEBE5] bg-white hover:border-[#C8A97E]/60" 
                              : "border-[#EFEBE5]/60 bg-[#FDFBF7]/40 opacity-40 cursor-not-allowed"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 text-white bg-[#C8A97E]/60 ${
                            isSelected ? "bg-[#C8A97E]" : ""
                          }`}>
                            {initials}
                          </div>
                          <h4 className="text-[11px] font-semibold text-[#3E362E] line-clamp-1 leading-tight">{p.name}</h4>
                          <span className="text-[9px] text-[#7F7368] mt-0.5 line-clamp-1">{p.specialty}</span>
                          {isSelected && isEligible && (
                            <span className="text-[9px] font-bold text-[#5F8F75] mt-1.5">✓ Selecionada</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seleção da Data */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase text-[#7F7368] tracking-wider mb-3">Escolha o Dia</h3>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={bookingState.date}
                      onChange={(e) => setBookingState((prev) => ({ ...prev, date: e.target.value, time: null }))}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-white border border-[#EFEBE5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C8A97E] focus:ring-1 focus:ring-[#C8A97E]/30 text-[#3E362E] font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Seleção de Horários / Lista de Espera */}
                <div className="mb-8">
                  <h3 className="text-xs font-semibold uppercase text-[#7F7368] tracking-wider mb-3">Horários Disponíveis</h3>
                  
                  {!bookingState.date ? (
                    <p className="text-xs text-center text-[#7F7368] py-4 bg-white rounded-xl border border-[#EFEBE5]">
                      Selecione uma data para ver os horários.
                    </p>
                  ) : isFullyBooked ? (
                    /* LISTA DE ESPERA INLINE */
                    <div className="bg-white p-5 rounded-xl border border-[#C8A97E]/20 text-center">
                      <p className="text-xs font-medium text-[#3E362E] mb-3">Nenhum horário disponível para esta data.</p>
                      
                      {!waitingListRegistered ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsWaitingFormOpen(!isWaitingFormOpen)}
                            className="w-full border border-[#C8A97E] text-[#C8A97E] hover:bg-[#C8A97E]/5 py-2.5 rounded-lg text-xs font-semibold transition-all"
                          >
                            {isWaitingFormOpen ? "Fechar Formulário" : "Entrar na Lista de Espera"}
                          </button>

                          {isWaitingFormOpen && (
                            <div className="mt-4 pt-4 border-t border-[#EFEBE5] text-left space-y-3 animate-fadeIn">
                              <div>
                                <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">Nome Completo *</label>
                                <input 
                                  type="text" 
                                  value={waitingName}
                                  onChange={(e) => setWaitingName(e.target.value)}
                                  placeholder="Digite seu nome completo" 
                                  className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">WhatsApp *</label>
                                <input 
                                  type="tel" 
                                  value={waitingPhone}
                                  onChange={(e) => setWaitingPhone(e.target.value)}
                                  placeholder="(11) 99999-9999" 
                                  className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                                />
                              </div>
                              <button 
                                type="button" 
                                onClick={handleSubmitWaitingList}
                                className="w-full bg-[#C8A97E] hover:bg-[#B8996E] text-white py-2 rounded-lg text-xs font-semibold tracking-wider transition-all"
                              >
                                Garantir Meu Lugar na Fila
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="bg-[#5F8F75]/10 text-[#5F8F75] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
                          ✓ Cadastro Realizado com Sucesso
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((time) => {
                        const isTaken = takenTimes.includes(time);
                        const isSelected = bookingState.time === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={isTaken}
                            onClick={() => setBookingState((prev) => ({ ...prev, time }))}
                            className={`py-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                              isSelected 
                                ? "bg-[#C8A97E] text-white shadow-sm ring-1 ring-[#C8A97E]/30" 
                                : isTaken 
                                ? "bg-[#EFEBE5]/30 text-[#7F7368]/40 border border-[#EFEBE5]/40 line-through cursor-not-allowed" 
                                : "bg-white text-[#3E362E] border border-[#EFEBE5] hover:border-[#C8A97E]"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Ações Inferiores */}
                <div className="flex gap-3 pt-4 border-t border-[#EFEBE5]">
                  <button 
                    onClick={() => goToStep(1)} 
                    className="flex-1 border border-[#EFEBE5] hover:bg-black/5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all"
                  >
                    Voltar
                  </button>
                  <button 
                    disabled={!bookingState.professionalId || !bookingState.date || !bookingState.time}
                    onClick={() => goToStep(3)}
                    className="flex-1 bg-[#C8A97E] hover:bg-[#B8996E] disabled:bg-[#EFEBE5] disabled:text-[#7F7368]/50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
                  >
                    Avançar
                  </button>
                </div>
              </section>
            )}

            {/* ETAPA 3: IDENTIFICAÇÃO E ANAMNESE */}
            {step === 3 && (
              <section className="animate-fadeIn">
                <div className="mb-6">
                  <h2 className="font-serif text-xl font-semibold text-[#3E362E]">Ficha de Identificação</h2>
                  <p className="text-xs text-[#7F7368] mt-1">Por favor, preencha seus dados para garantirmos um atendimento personalizado e seguro.</p>
                </div>

                <form onSubmit={handleAnamneseSubmit} className="space-y-4">
                  <div className="bg-white border border-[#EFEBE5] rounded-2xl p-5 space-y-4 shadow-sm">
                    <div>
                      <label className="block text-xs font-semibold text-[#3E362E] mb-1.5">Nome Completo *</label>
                      <input 
                        type="text" 
                        value={bookingState.patientName}
                        onChange={(e) => setBookingState((prev) => ({ ...prev, patientName: e.target.value }))}
                        className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8A97E] text-[#3E362E] font-medium"
                        placeholder="Digite seu nome completo"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-[#3E362E] mb-1.5">WhatsApp *</label>
                      <input 
                        type="tel" 
                        value={bookingState.patientPhone}
                        onChange={(e) => setBookingState((prev) => ({ ...prev, patientPhone: e.target.value }))}
                        className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8A97E] text-[#3E362E] font-medium"
                        placeholder="Ex: (11) 99999-9999"
                        required
                      />
                    </div>

                    {/* Perguntas Médicas / Anamnese */}
                    <div className="border-t border-[#EFEBE5] pt-4 mt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7F7368] mb-3">Anamnese Rápida</h4>
                      
                      <div className="space-y-4">
                        {/* Alergias */}
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-[#3E362E]">Possui algum tipo de alergia?</label>
                          <div className="flex bg-[#FDFBF7] p-1 rounded-lg border border-[#EFEBE5] max-w-[150px]">
                            <button
                              type="button"
                              onClick={() => setBookingState((prev) => ({ ...prev, hasAlergia: true }))}
                              className={`flex-1 py-1 text-xs rounded font-semibold transition-all ${
                                bookingState.hasAlergia ? "bg-[#C8A97E] text-white shadow-sm" : "text-[#7F7368]"
                              }`}
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setBookingState((prev) => ({ ...prev, hasAlergia: false, alergiasDetails: "" }))}
                              className={`flex-1 py-1 text-xs rounded font-semibold transition-all ${
                                !bookingState.hasAlergia ? "bg-[#C8A97E] text-white shadow-sm" : "text-[#7F7368]"
                              }`}
                            >
                              Não
                            </button>
                          </div>
                          {bookingState.hasAlergia && (
                            <textarea
                              value={bookingState.alergiasDetails}
                              onChange={(e) => setBookingState((prev) => ({ ...prev, alergiasDetails: e.target.value }))}
                              className="w-full bg-white border border-[#EFEBE5] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E] mt-2 animate-fadeIn"
                              placeholder="Especifique: Látex, Dipirona, Corantes..."
                              rows={2}
                            />
                          )}
                        </div>

                        {/* Medicamentos */}
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-[#3E362E]">Faz uso de algum medicamento contínuo?</label>
                          <div className="flex bg-[#FDFBF7] p-1 rounded-lg border border-[#EFEBE5] max-w-[150px]">
                            <button
                              type="button"
                              onClick={() => setBookingState((prev) => ({ ...prev, hasMedicamentos: true }))}
                              className={`flex-1 py-1 text-xs rounded font-semibold transition-all ${
                                bookingState.hasMedicamentos ? "bg-[#C8A97E] text-white shadow-sm" : "text-[#7F7368]"
                              }`}
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setBookingState((prev) => ({ ...prev, hasMedicamentos: false, medicamentosDetails: "" }))}
                              className={`flex-1 py-1 text-xs rounded font-semibold transition-all ${
                                !bookingState.hasMedicamentos ? "bg-[#C8A97E] text-white shadow-sm" : "text-[#7F7368]"
                              }`}
                            >
                              Não
                            </button>
                          </div>
                          {bookingState.hasMedicamentos && (
                            <textarea
                              value={bookingState.medicamentosDetails}
                              onChange={(e) => setBookingState((prev) => ({ ...prev, medicamentosDetails: e.target.value }))}
                              className="w-full bg-white border border-[#EFEBE5] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E] mt-2 animate-fadeIn"
                              placeholder="Especifique: Anticoagulantes, anti-inflamatórios..."
                              rows={2}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => goToStep(2)} 
                      className="flex-1 border border-[#EFEBE5] hover:bg-black/5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all"
                    >
                      Voltar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-[#C8A97E] hover:bg-[#B8996E] text-white py-3 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
                    >
                      Revisar Agendamento
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* ETAPA 4: RESUMO E CONFIRMAÇÃO */}
            {step === 4 && (
              <section className="animate-fadeIn">
                <div className="mb-6">
                  <h2 className="font-serif text-xl font-semibold text-[#3E362E]">Revisão do Agendamento</h2>
                  <p className="text-xs text-[#7F7368] mt-1">Confirme os detalhes e concorde com a política de sinal para finalizar.</p>
                </div>

                <div className="bg-white border border-[#EFEBE5] rounded-2xl p-5 shadow-sm space-y-4 mb-6 text-sm">
                  {/* Procedimento */}
                  <div className="flex items-start gap-3.5 pb-4 border-b border-[#EFEBE5]">
                    <div className="p-2.5 bg-[#C8A97E]/10 rounded-lg text-[#C8A97E]">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7F7368]">Procedimento Escolhido</span>
                      <h3 className="font-semibold text-sm text-[#3E362E] font-serif">{selectedServiceObj?.name}</h3>
                      <p className="text-xs text-[#7F7368]">Duração: {selectedServiceObj?.durationMinutes} minutos</p>
                    </div>
                  </div>

                  {/* Especialista */}
                  <div className="flex items-center gap-3.5 pb-4 border-b border-[#EFEBE5]">
                    <div className="w-10 h-10 rounded-full bg-[#C8A97E] text-white flex items-center justify-center font-bold text-sm">
                      {professionals.find((p) => p.id === bookingState.professionalId)?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7F7368] block">Especialista</span>
                      <strong className="text-xs text-[#3E362E]">{professionals.find((p) => p.id === bookingState.professionalId)?.name}</strong>
                    </div>
                  </div>

                  {/* Data & Hora */}
                  <div className="pb-4 border-b border-[#EFEBE5]">
                    <span className="text-[10px] uppercase font-bold text-[#7F7368] block">Data & Horário Reservados</span>
                    <p className="text-xs text-[#3E362E] mt-0.5">
                      <strong className="font-semibold">{bookingState.date.split("-").reverse().join("/")}</strong> às <strong className="font-semibold">{bookingState.time}</strong>
                    </p>
                  </div>

                  {/* Paciente e Anamnese */}
                  <div className="pb-4 border-b border-[#EFEBE5]">
                    <span className="text-[10px] uppercase font-bold text-[#7F7368] block">Dados do Paciente</span>
                    <strong className="text-xs text-[#3E362E] block mt-0.5">{bookingState.patientName}</strong>
                    <span className="text-xs text-[#7F7368] block">{bookingState.patientPhone}</span>
                    <div className="bg-[#FDFBF7] border border-[#EFEBE5] rounded-lg p-2.5 mt-2 text-[11px] text-[#7F7368] space-y-1">
                      <p><strong>Alergia:</strong> {bookingState.hasAlergia ? `Sim (${bookingState.alergiasDetails})` : "Não"}</p>
                      <p><strong>Medicamentos:</strong> {bookingState.hasMedicamentos ? `Sim (${bookingState.medicamentosDetails})` : "Não"}</p>
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#7F7368] block">Valores e Condições</span>
                    <div className="flex justify-between text-xs text-[#3E362E]">
                      <span>Valor Total:</span>
                      <span className="font-semibold">{formatCurrency(selectedServiceObj ? selectedServiceObj.price : 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#C8A97E] bg-[#C8A97E]/5 p-2 rounded-lg font-bold border border-[#C8A97E]/10">
                      <span>Sinal para Reserva (50%):</span>
                      <span>{formatCurrency(selectedServiceObj ? selectedServiceObj.price * themeConfig.billing.depositPercentage : 0)}</span>
                    </div>
                    
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={bookingState.policyAgreement}
                          onChange={(e) => setBookingState((prev) => ({ ...prev, policyAgreement: e.target.checked }))}
                          className="mt-0.5 accent-[#C8A97E] h-4 w-4 rounded border-[#EFEBE5] focus:ring-0"
                        />
                        <span className="text-[10px] leading-relaxed text-[#7F7368] font-medium">
                          Concordo em realizar o pagamento do sinal de 50% via PIX para garantir meu horário.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => goToStep(3)} 
                    className="flex-1 border border-[#EFEBE5] hover:bg-black/5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all"
                  >
                    Voltar
                  </button>
                  <button 
                    disabled={!bookingState.policyAgreement}
                    onClick={handleConfirmBooking}
                    className="flex-1 bg-[#C8A97E] hover:bg-[#B8996E] disabled:bg-[#EFEBE5] disabled:text-[#7F7368]/50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </section>
            )}

            {/* ETAPA 5: TELA DE SUCESSO */}
            {step === 5 && (
              <section className="animate-fadeIn text-center py-4">
                <div className="w-16 h-16 bg-[#5F8F75]/10 text-[#5F8F75] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 size={32} />
                </div>
                
                <h2 className="font-serif text-xl font-bold text-[#3E362E] mb-2">Solicitação Realizada!</h2>
                <p className="text-xs text-[#7F7368] px-4 leading-relaxed mb-6">
                  Seu horário foi pré-reservado. Conclua os passos do sinal para a ativação definitiva.
                </p>

                {/* Botão Confirmação WhatsApp */}
                <a 
                  href={getWhatsAppLink()} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white py-4.5 px-6 rounded-xl font-bold tracking-wide shadow-md transition-all duration-300 flex items-center justify-center gap-2 mb-6 text-xs uppercase"
                >
                  <Phone size={16} />
                  <span>Confirmar Agendamento no WhatsApp</span>
                </a>

                {/* Box de Pagamento do Sinal */}
                <div className="bg-white border border-[#EFEBE5] rounded-2xl p-5 text-left mb-6 space-y-4">
                  <span className="text-[10px] uppercase font-bold text-[#7F7368] block pb-2 border-b border-[#EFEBE5]">
                    Pagamento do Sinal via PIX
                  </span>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#7F7368]">Valor a Transferir (50%):</span>
                    <strong className="text-base font-bold text-[#C8A97E]">
                      {formatCurrency(selectedServiceObj ? selectedServiceObj.price * themeConfig.billing.depositPercentage : 0)}
                    </strong>
                  </div>
                  
                  <div className="bg-[#FDFBF7] border border-[#EFEBE5] p-3.5 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-[#7F7368] block">Chave CNPJ da Clínica:</span>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono font-bold text-[#3E362E]">{themeConfig.billing.pixKey}</code>
                      <button 
                        onClick={handleCopyPix}
                        className="border border-[#C8A97E] text-[#C8A97E] hover:bg-[#C8A97E]/5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
                      >
                        <Copy size={10} /> Copiar Chave
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] leading-relaxed text-[#7F7368] text-center">
                    Após efetuar a transferência, envie o comprovante para o nosso WhatsApp para ativação imediata do seu horário.
                  </p>
                </div>

                <button 
                  onClick={handleRestart}
                  className="w-full bg-[#C8A97E] hover:bg-[#B8996E] text-white py-3.5 rounded-xl text-xs font-semibold tracking-wider transition-all"
                >
                  Fazer Outro Agendamento
                </button>
              </section>
            )}

          </div>

        </div>
      )}

      {/* ------------------------------------------- */}
      {/* CONTEÚDO PRINCIPAL - ABA DO CLUBE VIP       */}
      {/* ------------------------------------------- */}
      {activeTab === "vip" && (
        <div className="flex-1 px-5 py-6">
          <div className="text-center mb-6">
            <h2 className="font-serif text-xl font-semibold text-[#3E362E]">Fidelidade & Prêmios</h2>
            <p className="text-xs text-[#7F7368] mt-1">Libere giros na roleta a cada amiga que concluir um agendamento através da sua indicação!</p>
          </div>

          {/* Componente Roleta React com física de giros */}
          <LuckyWheel showToast={showToast} />

          {/* Como Funciona */}
          <div className="bg-white border border-[#EFEBE5] rounded-2xl p-5 text-center mt-6 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-semibold text-[#3E362E]">Como funciona?</h3>
            <p className="text-[11px] text-[#7F7368] leading-relaxed text-left space-y-1.5">
              1. Clique no botão de indicação acima para compartilhar o link no WhatsApp.<br />
              2. Ao enviar, o cadeado será aberto e a roleta irá parar o giro infinito.<br />
              3. Clique em <strong>Girar Roleta</strong> e concorra a prêmios luxuosos da nossa clínica!
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------- */}
      {/* CONTAINER DE TOASTS DOURADOS                */}
      {/* ------------------------------------------- */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[450px] px-5 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`py-3 px-4 rounded-xl shadow-md border text-xs font-semibold flex items-center justify-between gap-3 animate-slideIn ${
              toast.type === "error" 
                ? "bg-[#C05C5C]/10 border-[#C05C5C]/25 text-[#C05C5C]" 
                : "bg-[#5F8F75]/10 border-[#5F8F75]/25 text-[#5F8F75]"
            }`}
          >
            <span>{toast.message}</span>
            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-base font-normal leading-none opacity-60 hover:opacity-100 transition-opacity"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* ------------------------------------------- */}
      {/* FOOTER DA APLICAÇÃO                         */}
      {/* ------------------------------------------- */}
      <footer className="mt-auto px-5 py-4 border-t border-[#EFEBE5] text-center bg-white flex justify-between items-center text-[10px] text-[#7F7368]">
        <span>© 2026 {themeConfig.brand.name}</span>
        <button 
          onClick={onNavigateToAdmin}
          className="text-[#C8A97E] hover:underline font-bold"
        >
          Acesso Restrito
        </button>
      </footer>

    </div>
  );
}
