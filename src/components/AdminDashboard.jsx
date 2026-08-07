/* Template Mestre Ferrer Innovare - Todos os direitos estruturais reservados a Pedro Coutinho. É proibida a replicação do código-fonte estrutural. O cliente detém apenas a titularidade do domínio, dados e conteúdo textual inserido. */

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ListPlus, 
  Plus, 
  Search, 
  Lock, 
  LogOut, 
  X, 
  Check, 
  Edit, 
  Trash2, 
  Award,
  Eye,
  EyeOff
} from "lucide-react";
import { themeConfig } from "../config/theme.config";

// Componente do Painel Administrativo
export default function AdminDashboard({ onNavigateToClient }) {
  // ==========================================
  // ESTADOS DE LOGIN / AUTENTICAÇÃO
  // ==========================================
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("ferrer_admin_logged_in") === "true"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // ==========================================
  // ESTADOS DO PAINEL
  // ==========================================
  const [activeTab, setActiveTab] = useState("agenda"); // 'agenda' | 'services' | 'team' | 'marketing' | 'waiting'
  const [toasts, setToasts] = useState([]);

  // Bancos de dados locais sincronizados com LocalStorage
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [waitingList, setWaitingList] = useState([]);

  // Filtros da Agenda
  const [filterDate, setFilterDate] = useState("");
  const [filterProf, setFilterProf] = useState("");

  // Modais de Criação/Edição
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ title: "", msg: "", action: null });

  // Formulário de Novo/Editar Agendamento
  const [bookingForm, setBookingForm] = useState({
    id: null,
    patientName: "",
    patientPhone: "",
    serviceId: "",
    professionalId: "",
    date: "",
    time: "",
    alergias: "",
    medicamentos: ""
  });

  // Formulário de Novo/Editar Serviço
  const [serviceForm, setServiceForm] = useState({
    id: null,
    name: "",
    price: "",
    durationMinutes: ""
  });

  // Formulário de Novo Profissional (Equipe)
  const [teamForm, setTeamForm] = useState({
    name: "",
    specialty: "",
    allowedServices: [] // array de serviceIds
  });

  // ==========================================
  // CARREGAMENTO DOS DADOS DO LOCALSTORAGE
  // ==========================================
  useEffect(() => {
    if (!isAuthenticated) return;

    // Carregar todas as massas de dados
    const loadLocalStorageData = () => {
      setServices(JSON.parse(localStorage.getItem("ferrer_services")) || themeConfig.defaultServices);
      setProfessionals(JSON.parse(localStorage.getItem("ferrer_professionals")) || themeConfig.defaultProfessionals);
      setAppointments(JSON.parse(localStorage.getItem("ferrer_appointments")) || []);
      setPatients(JSON.parse(localStorage.getItem("ferrer_patients")) || []);
      setWaitingList(JSON.parse(localStorage.getItem("ferrer_waiting_list")) || []);
    };

    loadLocalStorageData();

    // Listener para quando o cliente faz um agendamento em outra aba
    const handleStorageChange = (e) => {
      if (
        [
          "ferrer_appointments", 
          "ferrer_patients", 
          "ferrer_services", 
          "ferrer_professionals", 
          "ferrer_waiting_list"
        ].includes(e.key)
      ) {
        loadLocalStorageData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isAuthenticated]);

  // ==========================================
  // METODOS AUXILIARES
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

  const openConfirmModal = (title, msg, action) => {
    setConfirmData({ title, msg, action });
    setIsConfirmOpen(true);
  };

  const triggerConfirmAction = () => {
    if (confirmData.action) confirmData.action();
    setIsConfirmOpen(false);
  };

  // ==========================================
  // LOGICA DE AUTENTICAÇÃO
  // ==========================================
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Validação simples solicitada: senha 'admin'
    // TODO: CLIENTE - EDITAR LOGIN E SENHA DE ACESSO DO PAINEL AQUI
    if (password === "admin") {
      sessionStorage.setItem("ferrer_admin_logged_in", "true");
      setIsAuthenticated(true);
      setLoginError(false);
      showToast("Acesso administrativo liberado!", "success");
    } else {
      setLoginError(true);
      showToast("Senha administrativa incorreta.", "error");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ferrer_admin_logged_in");
    setIsAuthenticated(false);
    showToast("Sessão administrativa encerrada.", "success");
  };

  // ==========================================
  // CÁLCULO DE KPIS DO DASHBOARD
  // ==========================================
  const getDashboardKPIs = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayAppsCount = appointments.filter(
      (app) => app.date === todayStr && app.status !== "cancelado"
    ).length;

    // Faturamento bruto projetado (apenas confirmados)
    const revenue = appointments
      .filter((app) => app.status !== "cancelado")
      .reduce((sum, app) => {
        const srv = services.find((s) => s.id === app.serviceId);
        return sum + (srv ? srv.price : 0);
      }, 0);

    // Ocupação da semana corrente
    const now = new Date();
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyAppsCount = appointments.filter((app) => {
      if (app.status === "cancelado") return false;
      const appDate = new Date(app.date + "T00:00:00");
      return appDate >= startOfWeek && appDate <= endOfWeek;
    }).length;

    const capacity = 35; // Capacidade padrão de 35 slots por semana
    const weeklyOccupancy = Math.min(100, Math.round((weeklyAppsCount / capacity) * 100));

    return {
      todayAppsCount,
      weeklyOccupancy,
      revenue,
      waitingLeadsCount: waitingList.length,
      appointmentsCount: appointments.filter((app) => app.status !== "cancelado").length,
      retentionRate: 85 // valor fictício padrão do protótipo
    };
  };

  const kpis = getDashboardKPIs();

  // ==========================================
  // AÇÕES - COMPROMISSOS (AGENDA)
  // ==========================================
  const handleSaveAppointment = (e) => {
    e.preventDefault();
    if (!bookingForm.patientName || !bookingForm.patientPhone || !bookingForm.serviceId || !bookingForm.professionalId || !bookingForm.date || !bookingForm.time) {
      showToast("Preencha todos os campos obrigatórios (*).", "error");
      return;
    }

    let updatedAppointments = [...appointments];
    
    if (bookingForm.id) {
      // Edição
      const index = updatedAppointments.findIndex((app) => app.id === bookingForm.id);
      if (index !== -1) {
        updatedAppointments[index] = {
          ...updatedAppointments[index],
          patientName: bookingForm.patientName,
          patientPhone: bookingForm.patientPhone,
          serviceId: bookingForm.serviceId,
          professionalId: bookingForm.professionalId,
          date: bookingForm.date,
          time: bookingForm.time,
          anamnese: {
            alergias: bookingForm.alergias || "Nenhuma",
            medicamentos: bookingForm.medicamentos || "Nenhum"
          }
        };
        showToast("Agendamento editado com sucesso!", "success");
      }
    } else {
      // Novo
      const newApp = {
        id: `app-${Date.now()}`,
        patientName: bookingForm.patientName,
        patientPhone: bookingForm.patientPhone,
        serviceId: bookingForm.serviceId,
        professionalId: bookingForm.professionalId,
        date: bookingForm.date,
        time: bookingForm.time,
        status: "confirmado",
        anamnese: {
          alergias: bookingForm.alergias || "Nenhuma",
          medicamentos: bookingForm.medicamentos || "Nenhum"
        }
      };
      updatedAppointments.push(newApp);

      // Pontuar paciente se já existe, senão criar
      let updatedPatients = [...patients];
      const patientIndex = updatedPatients.findIndex((p) => p.phone === bookingForm.patientPhone);
      if (patientIndex !== -1) {
        updatedPatients[patientIndex].referralPoints += 5;
      } else {
        updatedPatients.push({
          name: bookingForm.patientName,
          phone: bookingForm.patientPhone,
          referralPoints: 10
        });
      }
      localStorage.setItem("ferrer_patients", JSON.stringify(updatedPatients));
      setPatients(updatedPatients);

      showToast("Novo agendamento registrado com sucesso!", "success");
    }

    localStorage.setItem("ferrer_appointments", JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
    setIsBookingModalOpen(false);
  };

  const handleCancelAppointment = (id) => {
    openConfirmModal(
      "Cancelar Agendamento",
      "Tem certeza que deseja cancelar este compromisso de forma permanente?",
      () => {
        const updated = appointments.map((app) => {
          if (app.id === id) return { ...app, status: "cancelado" };
          return app;
        });
        localStorage.setItem("ferrer_appointments", JSON.stringify(updated));
        setAppointments(updated);
        showToast("Agendamento cancelado com sucesso.", "success");
      }
    );
  };

  const handleOpenEditBooking = (app) => {
    setBookingForm({
      id: app.id,
      patientName: app.patientName,
      patientPhone: app.patientPhone,
      serviceId: app.serviceId,
      professionalId: app.professionalId,
      date: app.date,
      time: app.time,
      alergias: app.anamnese?.alergias || "",
      medicamentos: app.anamnese?.medicamentos || ""
    });
    setIsBookingModalOpen(true);
  };

  const handleOpenNewBooking = () => {
    setBookingForm({
      id: null,
      patientName: "",
      patientPhone: "",
      serviceId: "",
      professionalId: "",
      date: "",
      time: "",
      alergias: "",
      medicamentos: ""
    });
    setIsBookingModalOpen(true);
  };

  // Filtrar lista de agendamentos na tabela
  const filteredAppointments = appointments.filter((app) => {
    const matchDate = filterDate ? app.date === filterDate : true;
    const matchProf = filterProf ? app.professionalId === filterProf : true;
    return matchDate && matchProf;
  });

  // ==========================================
  // AÇÕES - SERVIÇOS (CRUD)
  // ==========================================
  const handleSaveService = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(serviceForm.price);
    const durationNum = parseInt(serviceForm.durationMinutes, 10);

    if (!serviceForm.name || isNaN(priceNum) || isNaN(durationNum) || durationNum < 1) {
      showToast("Por favor, preencha todos os campos corretamente.", "error");
      return;
    }

    let updatedServices = [...services];

    if (serviceForm.id) {
      // Editar
      const index = updatedServices.findIndex((s) => s.id === serviceForm.id);
      if (index !== -1) {
        updatedServices[index] = {
          ...updatedServices[index],
          name: serviceForm.name,
          price: priceNum,
          durationMinutes: durationNum
        };
        showToast("Procedimento estético atualizado!", "success");
      }
    } else {
      // Novo
      const newService = {
        id: `srv-${Date.now()}`,
        name: serviceForm.name,
        price: priceNum,
        durationMinutes: durationNum,
        isActive: true
      };
      updatedServices.push(newService);
      showToast("Procedimento estético criado com sucesso!", "success");
    }

    localStorage.setItem("ferrer_services", JSON.stringify(updatedServices));
    setServices(updatedServices);
    setIsServiceModalOpen(false);
  };

  const handleToggleServiceStatus = (id) => {
    const updated = services.map((s) => {
      if (s.id === id) return { ...s, isActive: !s.isActive };
      return s;
    });
    localStorage.setItem("ferrer_services", JSON.stringify(updated));
    setServices(updated);
    showToast("Status do procedimento estético alternado.", "success");
  };

  const handleDeleteService = (id) => {
    openConfirmModal(
      "Excluir Procedimento",
      "Tem certeza que deseja excluir este procedimento da clínica permanentemente?",
      () => {
        const updated = services.filter((s) => s.id !== id);
        localStorage.setItem("ferrer_services", JSON.stringify(updated));
        setServices(updated);
        showToast("Procedimento excluído com sucesso.", "success");
      }
    );
  };

  // ==========================================
  // AÇÕES - EQUIPE (PROFISSIONAIS)
  // ==========================================
  const handleSaveProfessional = (e) => {
    e.preventDefault();
    if (!teamForm.name.trim() || !teamForm.specialty.trim()) {
      showToast("Nome e especialidade são obrigatórios.", "error");
      return;
    }

    const newProf = {
      id: `prof-${Date.now()}`,
      name: teamForm.name.trim(),
      specialty: teamForm.specialty.trim(),
      allowedServices: teamForm.allowedServices
    };

    const updated = [...professionals, newProf];
    localStorage.setItem("ferrer_professionals", JSON.stringify(updated));
    setProfessionals(updated);
    
    // Reset form
    setTeamForm({ name: "", specialty: "", allowedServices: [] });
    showToast("Profissional cadastrado na equipe com sucesso!", "success");
  };

  const handleDeleteProfessional = (id) => {
    openConfirmModal(
      "Remover Membro da Equipe",
      "Deseja realmente remover esta profissional do quadro operacional da clínica?",
      () => {
        const updated = professionals.filter((p) => p.id !== id);
        localStorage.setItem("ferrer_professionals", JSON.stringify(updated));
        setProfessionals(updated);
        showToast("Profissional removida com sucesso.", "success");
      }
    );
  };

  const handleToggleServiceForTeam = (serviceId) => {
    setTeamForm((prev) => {
      const exists = prev.allowedServices.includes(serviceId);
      const updated = exists 
        ? prev.allowedServices.filter((id) => id !== serviceId)
        : [...prev.allowedServices, serviceId];
      return { ...prev, allowedServices: updated };
    });
  };

  // ==========================================
  // AÇÕES - MARKETING & PONTOS
  // ==========================================
  const handleModifyPoints = (phone, amount) => {
    const updated = patients.map((p) => {
      if (p.phone === phone) {
        return { ...p, referralPoints: Math.max(0, p.referralPoints + amount) };
      }
      return p;
    });
    localStorage.setItem("ferrer_patients", JSON.stringify(updated));
    setPatients(updated);
    showToast("Carteira de pontos do paciente atualizada!", "success");
  };

  // ==========================================
  // AÇÕES - LISTA DE ESPERA
  // ==========================================
  const handleDeleteWaitingLead = (id) => {
    openConfirmModal(
      "Remover Lead",
      "Deseja remover este lead da lista de espera?",
      () => {
        const updated = waitingList.filter((w) => w.id !== id);
        localStorage.setItem("ferrer_waiting_list", JSON.stringify(updated));
        setWaitingList(updated);
        showToast("Lead removido com sucesso.", "success");
      }
    );
  };

  const handleConvertWaitingToBooking = (lead) => {
    setBookingForm({
      id: null,
      patientName: lead.name,
      patientPhone: lead.phone,
      serviceId: lead.serviceId || "",
      professionalId: "",
      date: lead.date || "",
      time: "",
      alergias: "",
      medicamentos: ""
    });
    setIsBookingModalOpen(true);
    
    // Remover do waiting list
    const updatedWaiting = waitingList.filter((w) => w.id !== lead.id);
    localStorage.setItem("ferrer_waiting_list", JSON.stringify(updatedWaiting));
    setWaitingList(updatedWaiting);
  };

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  
  // RENDERIZA TELA DE LOGIN SE NÃO AUTENTICADO
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans text-[#3E362E] px-5">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 border border-[#EFEBE5] shadow-[0_8px_30px_rgba(62,54,46,0.02)]">
          <div className="text-center mb-6">
            <h1 className="font-serif font-bold text-xl">{themeConfig.brand.fullName}</h1>
            <p className="text-xs text-[#7F7368] font-medium tracking-wide uppercase mt-1">Acesso Restrito - Equipe</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#7F7368] mb-1">Usuário</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8A97E]"
                autoComplete="username"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#7F7368] mb-1">Senha</label>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8A97E] pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#7F7368] hover:text-[#3E362E] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-[11px] text-[#C05C5C] font-semibold text-center mt-1">
                🔒 Acesso Negado: Credenciais inválidas.
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-[#C8A97E] hover:bg-[#B8996E] text-white py-3 rounded-xl text-xs font-semibold tracking-wider transition-all active:scale-[0.98] mt-2 shadow-sm"
            >
              Entrar
            </button>
          </form>
          
          <div className="mt-6 text-center border-t border-[#EFEBE5] pt-4">
            <button 
              onClick={onNavigateToClient}
              className="text-[#C8A97E] hover:underline text-[11px] font-semibold"
            >
              Voltar ao Agendamento Paciente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDERIZA DASHBOARD ADMINISTRATIVO COMPLETO
  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] font-sans text-[#3E362E] flex flex-col md:flex-row">
      
      {/* SIDEBAR FIXED (Desktop) */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#EFEBE5] flex flex-col shrink-0">
        <div className="p-5 border-b border-[#EFEBE5] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#C8A97E] text-white flex items-center justify-center font-bold text-sm">
            {themeConfig.brand.initials}
          </div>
          <div>
            <h2 className="font-serif font-bold text-sm leading-none">{themeConfig.brand.name}</h2>
            <span className="text-[10px] text-[#7F7368] font-bold uppercase tracking-wider">Clinic Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "agenda", label: "Agenda", icon: Calendar },
            { id: "services", label: "Serviços", icon: ListPlus },
            { id: "team", label: "Equipe", icon: Users },
            { id: "marketing", label: "Marketing VIP", icon: Award },
            { id: "waiting", label: "Lista de Espera", icon: TrendingUp }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive 
                    ? "bg-[#C8A97E] text-white shadow-sm font-bold" 
                    : "text-[#7F7368] hover:bg-[#FDFBF7] hover:text-[#3E362E]"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#EFEBE5] space-y-2">
          <button 
            onClick={onNavigateToClient}
            className="w-full border border-[#EFEBE5] hover:bg-black/5 text-[#7F7368] hover:text-[#3E362E] py-2 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all"
          >
            Portal de Paciente
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full bg-[#C05C5C]/10 text-[#C05C5C] hover:bg-[#C05C5C]/20 py-2 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut size={12} />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL (DASHBOARD) */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl">
        
        {/* Header Superior */}
        <header className="flex justify-between items-center pb-6 border-b border-[#EFEBE5] mb-6">
          <div>
            <h1 className="font-serif font-semibold text-2xl text-[#3E362E] capitalize">
              {activeTab === "waiting" ? "Lista de Espera" : activeTab === "marketing" ? "Campanhas VIP" : activeTab}
            </h1>
            <p className="text-xs text-[#7F7368] mt-0.5">Visão administrativa e de monitoramento Ferrer Innovare.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-white bg-[#5F8F75] py-1 px-2.5 rounded-full">
              Sessão Equipe
            </span>
          </div>
        </header>

        {/* ------------------------------------------- */}
        {/* ABA: AGENDA & DASHBOARD (KPIs)              */}
        {/* ------------------------------------------- */}
        {activeTab === "agenda" && (
          <section className="space-y-8 animate-fadeIn">
            {/* Cards de KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#EFEBE5] shadow-sm flex items-center gap-4">
                <div className="p-3 bg-[#C8A97E]/10 rounded-xl text-[#C8A97E]">
                  <Calendar size={20} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7F7368] block">Agendamentos Hoje</span>
                  <strong className="text-xl text-[#3E362E]">{kpis.todayAppsCount}</strong>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFEBE5] shadow-sm flex items-center gap-4">
                <div className="p-3 bg-[#C8A97E]/10 rounded-xl text-[#C8A97E]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7F7368] block">Ocupação da Semana</span>
                  <strong className="text-xl text-[#3E362E]">{kpis.weeklyOccupancy}%</strong>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFEBE5] shadow-sm flex items-center gap-4">
                <div className="p-3 bg-[#C8A97E]/10 rounded-xl text-[#C8A97E]">
                  <Users size={20} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7F7368] block">Leads na Espera</span>
                  <strong className="text-xl text-[#3E362E]">{kpis.waitingLeadsCount}</strong>
                </div>
              </div>
            </div>

            {/* Faturamento */}
            <div className="bg-white p-5 rounded-2xl border border-[#EFEBE5] shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-[#5F8F75]/10 rounded-xl text-[#5F8F75]">
                  <DollarSign size={22} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7F7368] block">Faturamento Projetado (Ativos)</span>
                  <strong className="text-2xl text-[#3E362E]">{formatCurrency(kpis.revenue)}</strong>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#7F7368] block">Total Consultas</span>
                <strong className="text-lg text-[#3E362E]">{kpis.appointmentsCount}</strong>
              </div>
            </div>

            {/* Listagem da Agenda */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-serif font-semibold text-lg text-[#3E362E]">Compromissos Agendados</h3>
                <button 
                  onClick={handleOpenNewBooking}
                  className="bg-[#C8A97E] hover:bg-[#B8996E] text-white py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus size={14} />
                  <span>Novo Agendamento</span>
                </button>
              </div>

              {/* Filtros */}
              <div className="bg-white p-4 rounded-xl border border-[#EFEBE5] flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-[10px] font-bold text-[#7F7368] mb-1">Filtrar por Data</label>
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#C8A97E]"
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-[10px] font-bold text-[#7F7368] mb-1">Filtrar Profissional</label>
                  <select 
                    value={filterProf}
                    onChange={(e) => setFilterProf(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#C8A97E]"
                  >
                    <option value="">Todas</option>
                    {professionals.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {(filterDate || filterProf) && (
                  <button 
                    onClick={() => { setFilterDate(""); setFilterProf(""); }}
                    className="border border-[#EFEBE5] hover:bg-black/5 py-1.5 px-4 rounded-lg text-xs font-semibold transition-all"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>

              {/* Tabela de Agendamentos */}
              <div className="bg-white rounded-xl border border-[#EFEBE5] overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FDFBF7] border-b border-[#EFEBE5] text-[#7F7368]">
                      <th className="p-4 font-semibold uppercase tracking-wider">Paciente</th>
                      <th className="p-4 font-semibold uppercase tracking-wider">Contato</th>
                      <th className="p-4 font-semibold uppercase tracking-wider">Procedimento</th>
                      <th className="p-4 font-semibold uppercase tracking-wider">Especialista</th>
                      <th className="p-4 font-semibold uppercase tracking-wider">Data / Hora</th>
                      <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEBE5]">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#7F7368] font-medium">
                          Nenhum agendamento registrado para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((app) => {
                        const srv = services.find((s) => s.id === app.serviceId);
                        const prof = professionals.find((p) => p.id === app.professionalId);
                        const dateBR = app.date.split("-").reverse().join("/");

                        return (
                          <tr key={app.id} className={app.status === "cancelado" ? "opacity-45 bg-[#FAF7F2]/50 line-through" : "hover:bg-[#FAF7F2]/30"}>
                            <td className="p-4 font-semibold text-[#3E362E]">{app.patientName}</td>
                            <td className="p-4 text-[#7F7368]">{app.patientPhone}</td>
                            <td className="p-4">
                              <span className="font-serif font-medium">{srv?.name || "Desconhecido"}</span>
                              {srv && <span className="block text-[10px] text-[#C8A97E] font-bold">{formatCurrency(srv.price)}</span>}
                            </td>
                            <td className="p-4 text-[#7F7368] font-medium">{prof?.name || "Desconhecida"}</td>
                            <td className="p-4 font-medium">{dateBR} às {app.time}</td>
                            <td className="p-4">
                              <span className={`py-1 px-2.5 rounded-full text-[9px] font-bold ${
                                app.status === "cancelado" 
                                  ? "bg-[#C05C5C]/15 text-[#C05C5C]" 
                                  : "bg-[#5F8F75]/15 text-[#5F8F75]"
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {app.status !== "cancelado" && (
                                <div className="flex justify-center gap-1">
                                  <button 
                                    onClick={() => handleOpenEditBooking(app)}
                                    className="p-1.5 hover:bg-[#FAF7F2] rounded-lg text-[#C8A97E] transition-colors"
                                    title="Editar"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleCancelAppointment(app.id)}
                                    className="p-1.5 hover:bg-[#C05C5C]/10 rounded-lg text-[#C05C5C] transition-colors"
                                    title="Cancelar"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------- */}
        {/* ABA: SERVIÇOS (CRUD)                        */}
        {/* ------------------------------------------- */}
        {activeTab === "services" && (
          <section className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="font-serif font-semibold text-lg text-[#3E362E]">Gestão de Procedimentos</h2>
              <button 
                onClick={() => {
                  setServiceForm({ id: null, name: "", price: "", durationMinutes: "" });
                  setIsServiceModalOpen(true);
                }}
                className="bg-[#C8A97E] hover:bg-[#B8996E] text-white py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus size={14} />
                <span>Novo Tratamento</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div key={srv.id} className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all ${
                  srv.isActive ? "border-[#EFEBE5]" : "border-[#EFEBE5] opacity-50 bg-[#FAF7F2]/40"
                }`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif font-semibold text-sm text-[#3E362E]">{srv.name}</h3>
                      <span className={`py-0.5 px-2 rounded text-[8px] font-bold ${
                        srv.isActive ? "bg-[#5F8F75]/15 text-[#5F8F75]" : "bg-[#C05C5C]/15 text-[#C05C5C]"
                      }`}>
                        {srv.isActive ? "Ativo" : "Pausado"}
                      </span>
                    </div>
                    <p className="text-xs text-[#7F7368] mb-4">Duração: {srv.durationMinutes} min</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#EFEBE5] pt-4 mt-2">
                    <strong className="text-sm text-[#C8A97E]">{formatCurrency(srv.price)}</strong>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setServiceForm({ id: srv.id, name: srv.name, price: srv.price, durationMinutes: srv.durationMinutes });
                          setIsServiceModalOpen(true);
                        }}
                        className="py-1 px-2 border border-[#EFEBE5] hover:bg-[#FDFBF7] text-xs font-medium rounded-lg text-[#7F7368]"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleToggleServiceStatus(srv.id)}
                        className={`py-1 px-2 border text-xs font-medium rounded-lg ${
                          srv.isActive 
                            ? "border-[#C05C5C]/20 hover:bg-[#C05C5C]/5 text-[#C05C5C]" 
                            : "border-[#5F8F75]/20 hover:bg-[#5F8F75]/5 text-[#5F8F75]"
                        }`}
                      >
                        {srv.isActive ? "Pausar" : "Ativar"}
                      </button>
                      <button 
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-1 hover:bg-[#C05C5C]/10 rounded-lg text-[#C05C5C]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------- */}
        {/* ABA: EQUIPE                                 */}
        {/* ------------------------------------------- */}
        {activeTab === "team" && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Cadastro Novo */}
            <div className="bg-white border border-[#EFEBE5] rounded-2xl p-5 shadow-sm space-y-4 h-fit">
              <h3 className="font-serif font-semibold text-sm text-[#3E362E]">Cadastrar Profissional</h3>
              <form onSubmit={handleSaveProfessional} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#7F7368] mb-1">Nome Completo *</label>
                  <input 
                    type="text" 
                    value={teamForm.name}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Dra. Patricia Santana"
                    className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7F7368] mb-1">Especialidade *</label>
                  <input 
                    type="text" 
                    value={teamForm.specialty}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, specialty: e.target.value }))}
                    placeholder="Ex: Rejuvenescimento Facial"
                    className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7F7368] mb-1">Procedimentos Autorizados</label>
                  <div className="max-h-[160px] overflow-y-auto border border-[#EFEBE5] rounded-lg p-2.5 space-y-2 bg-[#FDFBF7]">
                    {services.map((srv) => {
                      const checked = teamForm.allowedServices.includes(srv.id);
                      return (
                        <label key={srv.id} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={checked}
                            onChange={() => handleToggleServiceForTeam(srv.id)}
                            className="accent-[#C8A97E] h-3.5 w-3.5 rounded border-[#EFEBE5]"
                          />
                          <span className="line-clamp-1">{srv.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#C8A97E] hover:bg-[#B8996E] text-white py-2 rounded-lg text-xs font-semibold tracking-wide transition-all"
                >
                  Salvar na Equipe
                </button>
              </form>
            </div>

            {/* Listagem Equipe */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-serif font-semibold text-sm text-[#3E362E]">Membros da Equipe</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {professionals.map((prof) => (
                  <div key={prof.id} className="bg-white border border-[#EFEBE5] rounded-2xl p-5 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#C8A97E] text-white rounded-full flex items-center justify-center font-serif text-lg font-bold">
                      {prof.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-[#3E362E] truncate pr-1">{prof.name}</h4>
                        <button 
                          onClick={() => handleDeleteProfessional(prof.id)}
                          className="text-[#C05C5C] hover:text-[#C05C5C]/80 transition-colors p-0.5 rounded"
                          title="Remover"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-[#7F7368] font-medium leading-none mb-3">{prof.specialty}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {prof.allowedServices.map((sid) => {
                          const s = services.find((srv) => srv.id === sid);
                          return s ? (
                            <span key={sid} className="bg-[#C8A97E]/10 text-[#C8A97E] text-[8px] font-bold px-1.5 py-0.5 rounded">
                              {s.name.split(" ")[0]}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------- */}
        {/* ABA: MARKETING & FIDELIDADE                 */}
        {/* ------------------------------------------- */}
        {activeTab === "marketing" && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Box Regras */}
            <div className="bg-white border border-[#EFEBE5] rounded-2xl p-5 shadow-sm space-y-4 h-fit">
              <h3 className="font-serif font-semibold text-sm text-[#3E362E]">Campanhas e Fidelidade</h3>
              <p className="text-xs text-[#7F7368] leading-relaxed">
                Gestão de pontos acumulados por indicação de amigos para a Ferrer Innovare Clinic.
              </p>
              <div className="bg-[#C8A97E]/10 border border-[#C8A97E]/20 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#C8A97E] block">Regra Ativa</span>
                <strong className="text-xs text-[#3E362E] block mt-1">Indicação de Sucesso</strong>
                <span className="text-[11px] text-[#7F7368]">{`+${themeConfig.marketing.referralPointsValue} pontos na carteira do paciente.`}</span>
              </div>
            </div>

            {/* Listagem Carteira Clientes */}
            <div className="md:col-span-2 bg-white rounded-xl border border-[#EFEBE5] overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FDFBF7] border-b border-[#EFEBE5] text-[#7F7368]">
                    <th className="p-4 font-semibold uppercase tracking-wider">Paciente</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">Telefone</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">Pontos Acumulados</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-center">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE5]">
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#7F7368]">
                        Nenhum cliente cadastrado no sistema ainda.
                      </td>
                    </tr>
                  ) : (
                    patients.map((pat) => (
                      <tr key={pat.phone} className="hover:bg-[#FAF7F2]/30">
                        <td className="p-4 font-semibold text-[#3E362E]">{pat.name}</td>
                        <td className="p-4 text-[#7F7368]">{pat.phone}</td>
                        <td className="p-4">
                          <span className="font-bold text-sm text-[#C8A97E]">{pat.referralPoints} pts</span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button 
                              onClick={() => handleModifyPoints(pat.phone, 10)}
                              className="border border-[#5F8F75]/35 hover:bg-[#5F8F75]/5 text-[#5F8F75] py-1 px-2 rounded-lg text-[9px] font-bold"
                            >
                              +10 pts
                            </button>
                            <button 
                              onClick={() => handleModifyPoints(pat.phone, -10)}
                              className="border border-[#C05C5C]/35 hover:bg-[#C05C5C]/5 text-[#C05C5C] py-1 px-2 rounded-lg text-[9px] font-bold"
                            >
                              -10 pts
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ------------------------------------------- */}
        {/* ABA: LISTA DE ESPERA (LEADS)                */}
        {/* ------------------------------------------- */}
        {activeTab === "waiting" && (
          <section className="bg-white rounded-xl border border-[#EFEBE5] overflow-x-auto shadow-sm animate-fadeIn">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-[#EFEBE5] text-[#7F7368]">
                  <th className="p-4 font-semibold uppercase tracking-wider">Paciente</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">WhatsApp</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Procedimento de Interesse</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Data Desejada</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE5]">
                {waitingList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#7F7368]">
                      Nenhum lead aguardando na lista de espera.
                    </td>
                  </tr>
                ) : (
                  waitingList.map((lead) => {
                    const srv = services.find((s) => s.id === lead.serviceId);
                    const dateBR = lead.date ? lead.date.split("-").reverse().join("/") : "Não informada";
                    return (
                      <tr key={lead.id} className="hover:bg-[#FAF7F2]/30">
                        <td className="p-4 font-semibold text-[#3E362E]">{lead.name}</td>
                        <td className="p-4 text-[#7F7368]">{lead.phone}</td>
                        <td className="p-4 font-serif font-medium">{srv?.name || "Qualquer procedimento"}</td>
                        <td className="p-4 font-semibold text-[#3E362E]">{dateBR}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleConvertWaitingToBooking(lead)}
                              className="bg-[#5F8F75] hover:bg-[#5F8F75]/85 text-white py-1 px-2.5 rounded-lg text-[9px] font-bold"
                            >
                              Agendar
                            </button>
                            <button
                              onClick={() => handleDeleteWaitingLead(lead.id)}
                              className="border border-[#C05C5C]/35 hover:bg-[#C05C5C]/5 text-[#C05C5C] py-1 px-2 rounded-lg text-[9px] font-bold"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </section>
        )}

      </main>

      {/* ==========================================================================
         SISTEMA DE MODAIS NATIVOS COM DESIGN LUXO
         ========================================================================== */}
      
      {/* 1. MODAL: AGENDAMENTO (CRIAR E EDITAR) */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-5 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#EFEBE5] shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-[#EFEBE5] mb-4">
              <h2 className="font-serif font-semibold text-base text-[#3E362E]">
                {bookingForm.id ? "Editar Agendamento" : "Novo Agendamento"}
              </h2>
              <button 
                onClick={() => setIsBookingModalOpen(false)}
                className="text-[#7F7368] hover:text-[#3E362E] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">Nome do Paciente *</label>
                <input 
                  type="text" 
                  value={bookingForm.patientName}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Nome completo do cliente"
                  className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">WhatsApp *</label>
                <input 
                  type="tel" 
                  value={bookingForm.patientPhone}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, patientPhone: e.target.value }))}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">Procedimento *</label>
                  <select 
                    value={bookingForm.serviceId}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, serviceId: e.target.value }))}
                    className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                    required
                  >
                    <option value="">Selecione...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">Especialista *</label>
                  <select 
                    value={bookingForm.professionalId}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, professionalId: e.target.value }))}
                    className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                    required
                  >
                    <option value="">Selecione...</option>
                    {professionals.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">Data *</label>
                  <input 
                    type="date" 
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">Horário *</label>
                  <input 
                    type="time" 
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                    required
                  />
                </div>
              </div>

              <div className="border border-[#EFEBE5] p-3 rounded-xl space-y-2 bg-[#FDFBF7]">
                <span className="text-[10px] font-bold text-[#7F7368] block uppercase">Ficha Anamnese Simplificada</span>
                <div>
                  <label className="block text-[9px] font-semibold text-[#7F7368] mb-0.5">Alergias conhecidas</label>
                  <input 
                    type="text" 
                    value={bookingForm.alergias}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, alergias: e.target.value }))}
                    placeholder="Ex: Nenhuma, Dipirona"
                    className="w-full bg-white border border-[#EFEBE5] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-[#7F7368] mb-0.5">Uso de medicamentos</label>
                  <input 
                    type="text" 
                    value={bookingForm.medicamentos}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, medicamentos: e.target.value }))}
                    placeholder="Ex: Nenhum"
                    className="w-full bg-white border border-[#EFEBE5] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 border border-[#EFEBE5] hover:bg-black/5 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#C8A97E] hover:bg-[#B8996E] text-white py-2.5 rounded-xl text-xs font-semibold"
                >
                  Confirmar Horário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: SERVIÇO (CRIAR E EDITAR) */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-5 z-50 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 border border-[#EFEBE5] shadow-lg">
            <div className="flex justify-between items-center pb-4 border-b border-[#EFEBE5] mb-4">
              <h2 className="font-serif font-semibold text-base text-[#3E362E]">
                {serviceForm.id ? "Editar Tratamento" : "Novo Tratamento"}
              </h2>
              <button 
                onClick={() => setIsServiceModalOpen(false)}
                className="text-[#7F7368] hover:text-[#3E362E] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">Nome do Procedimento *</label>
                <input 
                  type="text" 
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Toxina Botulínica (Testa e Olhos)"
                  className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">Preço Sugerido (R$) *</label>
                  <input 
                    type="number" 
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#7F7368] mb-1">Duração Média (min) *</label>
                  <input 
                    type="number" 
                    value={serviceForm.durationMinutes}
                    onChange={(e) => setServiceForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                    placeholder="45"
                    className="w-full bg-[#FDFBF7] border border-[#EFEBE5] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8A97E]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsServiceModalOpen(false)}
                  className="flex-1 border border-[#EFEBE5] hover:bg-black/5 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#C8A97E] hover:bg-[#B8996E] text-white py-2.5 rounded-xl text-xs font-semibold"
                >
                  Salvar Tratamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL CONFIRMAÇÃO PERSONALIZADO */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[1.5px] flex items-center justify-center p-5 z-[60] animate-fadeIn">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 border border-[#EFEBE5] text-center shadow-lg">
            <div className="w-10 h-10 bg-[#C05C5C]/10 text-[#C05C5C] rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
              !
            </div>
            <h3 className="font-serif font-bold text-sm text-[#3E362E] mb-1">{confirmData.title}</h3>
            <p className="text-xs text-[#7F7368] leading-relaxed mb-4">{confirmData.msg}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 border border-[#EFEBE5] hover:bg-black/5 py-2 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button 
                onClick={triggerConfirmAction}
                className="flex-1 bg-[#C05C5C] hover:bg-[#C05C5C]/90 text-white py-2 rounded-xl text-xs font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS NOTIFICAÇÕES */}
      <div className="fixed bottom-6 right-6 w-full max-w-sm px-5 flex flex-col gap-2 z-50">
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

    </div>
  );
}
