/**
 * admin.js - Lógica SPA Estática (Mockup)
 * Ferrer Innovare Clinic
 * 
 * Este arquivo implementa todo o estado da aplicação em memória (Arrays),
 * integrado com localStorage para persistência e compartilhamento em tempo
 * real com a interface de agendamento do paciente (index.html).
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // MASSA DE DADOS FICTÍCIOS (MOCK DATA COM PERSISTÊNCIA LOCAL)
  // ==========================================================================

  // Datas dinâmicas para hoje e amanhã
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Forçar atualização do localStorage para a nova equipe e especialidades (v3)
  const currentVersion = 'v3';
  if (localStorage.getItem('ferrer_mock_version') !== currentVersion) {
    localStorage.removeItem('ferrer_services');
    localStorage.removeItem('ferrer_professionals');
    localStorage.removeItem('ferrer_appointments');
    localStorage.removeItem('ferrer_patients');
    localStorage.removeItem('ferrer_stats');
    localStorage.setItem('ferrer_mock_version', currentVersion);
  }

  // Dados Padrão (carregados na primeira execução)
  const defaultServices = [
    { id: 'srv-1', name: 'Toxina Botulínica (Botox)', price: 1200.00, durationMinutes: 45, isActive: true },
    { id: 'srv-2', name: 'Preenchimento Labial', price: 1500.00, durationMinutes: 60, isActive: true },
    { id: 'srv-3', name: 'Fios de PDO Faciais', price: 2200.00, durationMinutes: 90, isActive: true },
    { id: 'srv-4', name: 'Limpeza de Pele Premium', price: 350.00, durationMinutes: 75, isActive: true },
    { id: 'srv-5', name: 'Micropigmentação Labial', price: 800.00, durationMinutes: 120, isActive: true },
    { id: 'srv-6', name: 'Micropigmentação Esfumada', price: 900.00, durationMinutes: 120, isActive: true }
  ];

  const defaultProfessionals = [
    { id: 'prof-1', name: 'Dra. Patrícia Santana', specialty: 'Rejuvenescimento Facial', allowedServices: ['srv-1', 'srv-2', 'srv-3'] },
    { id: 'prof-2', name: 'Luana Paula', specialty: 'Micropigmentadora', allowedServices: ['srv-5', 'srv-6'] },
    { id: 'prof-3', name: 'Shaiane Santos', specialty: 'Esteticista Especialista', allowedServices: ['srv-4'] }
  ];

  const defaultAppointments = [
    {
      id: 'app-1',
      patientName: 'Mariana Costa',
      patientPhone: '(11) 99888-1122',
      serviceId: 'srv-1',
      professionalId: 'prof-1',
      date: todayStr,
      time: '14:00',
      status: 'confirmado',
      anamnese: { alergias: 'Nenhuma conhecida', medicamentos: 'Nenhum' }
    },
    {
      id: 'app-2',
      patientName: 'Carolina Rezende',
      patientPhone: '(11) 97777-3344',
      serviceId: 'srv-2',
      professionalId: 'prof-1',
      date: todayStr,
      time: '16:30',
      status: 'confirmado',
      anamnese: { alergias: 'Dipirona', medicamentos: 'Anticoncepcional de uso regular' }
    },
    {
      id: 'app-3',
      patientName: 'Roberta Souza',
      patientPhone: '(11) 96666-5566',
      serviceId: 'srv-4',
      professionalId: 'prof-3',
      date: tomorrowStr,
      time: '10:00',
      status: 'confirmado',
      anamnese: { alergias: 'Látex', medicamentos: 'Nenhum' }
    }
  ];

  const defaultPatients = [
    { name: 'Mariana Costa', phone: '(11) 99888-1122', referralPoints: 15 },
    { name: 'Carolina Rezende', phone: '(11) 97777-3344', referralPoints: 25 },
    { name: 'Roberta Souza', phone: '(11) 96666-5566', referralPoints: 10 }
  ];

  const defaultStats = {
    revenue: 15400.00,
    appointmentsCount: 42,
    retentionRate: 85
  };

  // Carregar dados de localStorage ou usar padrão
  let services = JSON.parse(localStorage.getItem('ferrer_services')) || defaultServices;
  let professionals = JSON.parse(localStorage.getItem('ferrer_professionals')) || defaultProfessionals;
  let appointments = JSON.parse(localStorage.getItem('ferrer_appointments')) || defaultAppointments;
  let patients = JSON.parse(localStorage.getItem('ferrer_patients')) || defaultPatients;
  let dashboardStats = JSON.parse(localStorage.getItem('ferrer_stats')) || defaultStats;

  // Sincronizar localStorage
  const syncLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Gravações iniciais se vazias
  if (!localStorage.getItem('ferrer_services')) syncLocal('ferrer_services', services);
  if (!localStorage.getItem('ferrer_professionals')) syncLocal('ferrer_professionals', professionals);
  if (!localStorage.getItem('ferrer_appointments')) syncLocal('ferrer_appointments', appointments);
  if (!localStorage.getItem('ferrer_patients')) syncLocal('ferrer_patients', patients);
  if (!localStorage.getItem('ferrer_stats')) syncLocal('ferrer_stats', dashboardStats);

  // ==========================================================================
  // ELEMENTOS DO DOM
  // ==========================================================================

  // Navegação SPA
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.panel');
  const activeTabTitle = document.getElementById('active-tab-title');

  // KPIs
  const kpiRevenueEl = document.getElementById('kpi-revenue');
  const kpiCountEl = document.getElementById('kpi-count');
  const kpiRetentionEl = document.getElementById('kpi-retention');

  // Agenda / Filtros / Tabela
  const appointmentsTableBody = document.getElementById('appointments-list-body');
  const appointmentsEmptyState = document.getElementById('appointments-empty-state');
  const filterDateInput = document.getElementById('filter-date');
  const filterProfessionalSelect = document.getElementById('filter-professional');
  const clearFiltersBtn = document.getElementById('btn-clear-filters');

  // Serviços Grid
  const servicesGrid = document.getElementById('services-grid');
  const servicesEmptyState = document.getElementById('services-empty-state');

  // Equipe Form / Grid
  const teamForm = document.getElementById('team-form');
  const teamNameInput = document.getElementById('team-name');
  const teamAllowedServicesContainer = document.getElementById('team-allowed-services');
  const teamGrid = document.getElementById('team-grid');
  const teamEmptyState = document.getElementById('team-empty-state');

  // Marketing Tabela
  const patientsListBody = document.getElementById('patients-list-body');
  const patientsEmptyState = document.getElementById('patients-empty-state');

  // Lista de Espera Tabela
  const waitingListBody = document.getElementById('waiting-list-body');
  const waitingEmptyState = document.getElementById('waiting-empty-state');

  // Novos KPIs de Dashboard
  const kpiTodayAppointments = document.getElementById('kpi-today-appointments');
  const kpiWeekOccupancy = document.getElementById('kpi-week-occupancy');
  const kpiWaitingLeads = document.getElementById('kpi-waiting-leads');

  // Modais e Diálogos
  const bookingModal = document.getElementById('booking-modal');
  const bookingForm = document.getElementById('booking-form');
  const bookingServiceSelect = document.getElementById('booking-service');
  const bookingProfessionalSelect = document.getElementById('booking-professional');
  
  const serviceModal = document.getElementById('service-modal');
  const serviceModalTitle = document.getElementById('service-modal-title');
  const serviceForm = document.getElementById('service-form');
  const serviceEditIdInput = document.getElementById('service-edit-id');
  const serviceNameInput = document.getElementById('service-name');
  const servicePriceInput = document.getElementById('service-price');
  const serviceDurationInput = document.getElementById('service-duration');

  const confirmDialog = document.getElementById('confirm-dialog');
  const confirmDialogTitle = document.getElementById('confirm-dialog-title');
  const confirmDialogMessage = document.getElementById('confirm-dialog-message');
  const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
  const btnConfirmOk = document.getElementById('btn-confirm-ok');

  const toastContainer = document.getElementById('toast-container');

  // ==========================================================================
  // NOTIFICAÇÕES TOASTS E MODAIS CUSTOMIZADOS (Sem alert/confirm nativos)
  // ==========================================================================

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-close">&times;</button>
    `;

    toastContainer.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      removeToast(toast);
    });

    setTimeout(() => {
      removeToast(toast);
    }, 3000);
  }

  function removeToast(toast) {
    toast.style.animation = 'toast-fade-out 0.25s forwards';
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }

  let confirmCallback = null;

  function showConfirmModal(title, message, onConfirm) {
    confirmDialogTitle.textContent = title;
    confirmDialogMessage.textContent = message;
    confirmCallback = onConfirm;
    confirmDialog.showModal();
  }

  btnConfirmCancel.addEventListener('click', () => {
    confirmDialog.close();
    confirmCallback = null;
  });

  btnConfirmOk.addEventListener('click', () => {
    if (confirmCallback) {
      confirmCallback();
    }
    confirmDialog.close();
    confirmCallback = null;
  });

  // ==========================================================================
  // NAVEGAÇÃO SPA (TABS)
  // ==========================================================================
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      const targetPanelId = tab.getAttribute('data-target');
      
      document.querySelectorAll(`[data-target="${targetPanelId}"]`).forEach(t => t.classList.add('active'));
      document.getElementById(targetPanelId).classList.add('active');

      const labelText = tab.querySelector('span').textContent;
      activeTabTitle.textContent = labelText;

      // Se mudar para a aba Agenda ou Marketing, reler do localStorage para ver atualizações feitas pelo cliente
      if (targetPanelId === 'panel-agenda') {
        appointments = JSON.parse(localStorage.getItem('ferrer_appointments')) || defaultAppointments;
        patients = JSON.parse(localStorage.getItem('ferrer_patients')) || defaultPatients;
        renderAppointments();
      } else if (targetPanelId === 'panel-marketing') {
        patients = JSON.parse(localStorage.getItem('ferrer_patients')) || defaultPatients;
        renderPatients();
      } else if (targetPanelId === 'panel-waiting-list') {
        renderWaitingList();
      }
    });
  });

  // Escuta atualizações de outras janelas/abas para sincronização imediata
  window.addEventListener('storage', (e) => {
    if (e.key === 'ferrer_appointments') {
      appointments = JSON.parse(e.newValue) || [];
      renderAppointments();
      updateKPIs();
    } else if (e.key === 'ferrer_services') {
      services = JSON.parse(e.newValue) || [];
      renderServices();
    } else if (e.key === 'ferrer_professionals') {
      professionals = JSON.parse(e.newValue) || [];
      renderTeam();
    } else if (e.key === 'ferrer_patients') {
      patients = JSON.parse(e.newValue) || [];
      renderPatients();
    } else if (e.key === 'ferrer_stats') {
      dashboardStats = JSON.parse(e.newValue) || defaultStats;
      updateKPIs();
    } else if (e.key === 'ferrer_waiting_list') {
      renderWaitingList();
      updateKPIs();
    }
  });

  // ==========================================================================
  // RENDERIZADORES DE TELA E LÓGICAS DE NEGÓCIO
  // ==========================================================================

  function updateKPIs() {
    // 1. Métricas Financeiras/Desempenho Geral
    kpiRevenueEl.textContent = dashboardStats.revenue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    kpiCountEl.textContent = dashboardStats.appointmentsCount;
    kpiRetentionEl.textContent = `${dashboardStats.retentionRate}%`;

    // 2. Saúde da Clínica (Contagem Hoje, Ocupação, Leads da Lista)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayApps = appointments.filter(app => app.date === todayStr && app.status !== 'cancelado').length;
    if (kpiTodayAppointments) kpiTodayAppointments.textContent = todayApps;

    // Calcular ocupação semanal
    const now = new Date();
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // segunda-feira
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // domingo
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyApps = appointments.filter(app => {
      if (app.status === 'cancelado') return false;
      const appDate = new Date(app.date + 'T00:00:00');
      return appDate >= startOfWeek && appDate <= endOfWeek;
    }).length;

    const capacity = 35; // Capacidade padrão de 35 slots por semana
    const occupancy = Math.min(100, Math.round((weeklyApps / capacity) * 100));
    if (kpiWeekOccupancy) kpiWeekOccupancy.textContent = `${occupancy}%`;

    // Leads Lista de Espera
    const waitingList = JSON.parse(localStorage.getItem('ferrer_waiting_list')) || [];
    if (kpiWaitingLeads) kpiWaitingLeads.textContent = waitingList.length;
  }

  // ==========================================================================
  // 1. GESTÃO DE SERVIÇOS (CRUD)
  // ==========================================================================

  function renderServices() {
    servicesGrid.innerHTML = '';
    
    if (services.length === 0) {
      servicesEmptyState.style.display = 'block';
      return;
    }
    servicesEmptyState.style.display = 'none';

    services.forEach(service => {
      const card = document.createElement('div');
      card.className = `service-card ${service.isActive ? '' : 'paused'}`;
      
      const formattedPrice = service.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      card.innerHTML = `
        <div class="service-card-header">
          <h3 class="service-title">${service.name}</h3>
          <span class="badge ${service.isActive ? 'badge-active' : 'badge-paused'}">
            ${service.isActive ? 'Ativo' : 'Pausado'}
          </span>
        </div>
        <div class="service-details">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${service.durationMinutes} min</span>
          <span style="margin-left: auto;" class="service-price">${formattedPrice}</span>
        </div>
        <div class="service-actions">
          <button class="btn-card-action btn-edit" data-id="${service.id}">Editar</button>
          <button class="btn-card-action btn-pause" data-id="${service.id}">
            ${service.isActive ? 'Pausar' : 'Ativar'}
          </button>
          <button class="btn-card-action btn-delete-card" data-id="${service.id}">Excluir</button>
        </div>
      `;

      servicesGrid.appendChild(card);
    });

    renderTeamAllowedServicesCheckboxes();
    populateBookingSelects();
    attachServiceCardEvents();
  }

  document.getElementById('btn-open-service-modal').addEventListener('click', () => {
    serviceForm.reset();
    serviceEditIdInput.value = '';
    serviceModalTitle.textContent = 'Novo Tratamento';
    clearInputStates(serviceForm);
    serviceModal.showModal();
  });

  const closeServiceModal = () => {
    serviceForm.reset();
    serviceModal.close();
  };
  document.getElementById('btn-close-service-modal').addEventListener('click', closeServiceModal);
  document.getElementById('btn-cancel-service').addEventListener('click', closeServiceModal);

  serviceForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const editId = serviceEditIdInput.value;
    const name = serviceNameInput.value.trim();
    const price = parseFloat(servicePriceInput.value);
    const duration = parseInt(serviceDurationInput.value, 10);

    let isValid = true;

    if (!name) {
      setInputState(serviceNameInput, false);
      isValid = false;
    } else {
      setInputState(serviceNameInput, true);
    }

    if (isNaN(price) || price < 0) {
      setInputState(servicePriceInput, false);
      isValid = false;
    } else {
      setInputState(servicePriceInput, true);
    }

    if (isNaN(duration) || duration < 1) {
      setInputState(serviceDurationInput, false);
      isValid = false;
    } else {
      setInputState(serviceDurationInput, true);
    }

    if (!isValid) return;

    if (editId) {
      const index = services.findIndex(s => s.id === editId);
      if (index !== -1) {
        services[index].name = name;
        services[index].price = price;
        services[index].durationMinutes = duration;
        showToast('Procedimento atualizado com sucesso!', 'success');
      }
    } else {
      const newId = `srv-${Date.now()}`;
      services.push({
        id: newId,
        name,
        price,
        durationMinutes: duration,
        isActive: true
      });
      showToast('Procedimento cadastrado com sucesso!', 'success');
    }

    syncLocal('ferrer_services', services);
    renderServices();
    closeServiceModal();
  });

  function attachServiceCardEvents() {
    document.querySelectorAll('.services-grid .btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const s = services.find(srv => srv.id === id);
        if (s) {
          serviceEditIdInput.value = s.id;
          serviceNameInput.value = s.name;
          servicePriceInput.value = s.price;
          serviceDurationInput.value = s.durationMinutes;
          
          serviceModalTitle.textContent = 'Editar Tratamento';
          clearInputStates(serviceForm);
          serviceModal.showModal();
        }
      });
    });

    document.querySelectorAll('.services-grid .btn-pause').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const index = services.findIndex(srv => srv.id === id);
        if (index !== -1) {
          const current = services[index].isActive;
          services[index].isActive = !current;
          showToast(
            `Tratamento ${services[index].name} ${!current ? 'ativado' : 'pausado'} com sucesso!`, 
            'success'
          );
          syncLocal('ferrer_services', services);
          renderServices();
        }
      });
    });

    document.querySelectorAll('.services-grid .btn-delete-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const s = services.find(srv => srv.id === id);
        if (s) {
          showConfirmModal(
            'Excluir Tratamento',
            `Tem certeza que deseja remover permanentemente o procedimento "${s.name}"? Isso também removerá suas vinculações na equipe.`,
            () => {
              services = services.filter(srv => srv.id !== id);
              professionals.forEach(p => {
                p.allowedServices = p.allowedServices.filter(sId => sId !== id);
              });
              
              syncLocal('ferrer_services', services);
              syncLocal('ferrer_professionals', professionals);
              showToast('Procedimento excluído com sucesso!', 'success');
              renderServices();
              renderTeam();
            }
          );
        }
      });
    });
  }

  // ==========================================================================
  // 2. GESTÃO DE EQUIPE
  // ==========================================================================

  function renderTeamAllowedServicesCheckboxes() {
    teamAllowedServicesContainer.innerHTML = '';
    const activeServices = services.filter(s => s.isActive);
    
    if (activeServices.length === 0) {
      teamAllowedServicesContainer.innerHTML = '<p class="checkbox-placeholder">Sem serviços ativos cadastrados.</p>';
      return;
    }

    activeServices.forEach(s => {
      const label = document.createElement('label');
      label.className = 'checkbox-label';
      label.innerHTML = `
        <input type="checkbox" name="team-allowed" value="${s.id}">
        <span>${s.name}</span>
      `;
      teamAllowedServicesContainer.appendChild(label);
    });
  }

  function renderTeam() {
    teamGrid.innerHTML = '';

    if (professionals.length === 0) {
      teamEmptyState.style.display = 'block';
      return;
    }
    teamEmptyState.style.display = 'none';

    professionals.forEach(prof => {
      const initials = prof.name ? prof.name.charAt(0).toUpperCase() : 'P';
      
      let tagsHtml = '';
      const allowed = prof.allowedServices || [];
      if (allowed.length === 0) {
        tagsHtml = '<span class="badge-service-tag" style="font-style: italic; opacity: 0.5;">Nenhum procedimento autorizado</span>';
      } else {
        allowed.forEach(serviceId => {
          const s = services.find(srv => srv.id === serviceId);
          if (s) {
            tagsHtml += `<span class="badge-service-tag">${s.name}</span>`;
          }
        });
      }

      const card = document.createElement('div');
      card.className = 'team-card';
      card.innerHTML = `
        <div class="team-card-header">
          <div class="team-avatar">${initials}</div>
          <div class="team-meta">
            <h3>${prof.name}</h3>
            <span>${prof.specialty || 'Especialista'}</span>
          </div>
        </div>
        <div class="team-services-list">
          ${tagsHtml}
        </div>
        <div class="team-actions">
          <button class="btn btn-outline btn-small btn-delete-prof" data-id="${prof.id}">Remover</button>
        </div>
      `;

      teamGrid.appendChild(card);
    });

    populateBookingSelects();
    attachTeamEvents();
  }

  teamForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = teamNameInput.value.trim();
    const specialtyInput = document.getElementById('team-specialty');
    const specialty = specialtyInput ? specialtyInput.value.trim() : '';
    const checkedBoxes = teamAllowedServicesContainer.querySelectorAll('input[name="team-allowed"]:checked');
    const allowed = Array.from(checkedBoxes).map(cb => cb.value);

    let isValid = true;
    if (!name) {
      setInputState(teamNameInput, false);
      isValid = false;
    } else {
      setInputState(teamNameInput, true);
    }

    if (specialtyInput && !specialty) {
      setInputState(specialtyInput, false);
      isValid = false;
    } else if (specialtyInput) {
      setInputState(specialtyInput, true);
    }

    if (!isValid) return;

    const newId = `prof-${Date.now()}`;
    professionals.push({
      id: newId,
      name,
      specialty: specialty || 'Especialista',
      allowedServices: allowed
    });

    syncLocal('ferrer_professionals', professionals);
    showToast(`Dra. ${name.split(' ').pop()} adicionada à equipe!`, 'success');
    teamForm.reset();
    clearInputStates(teamForm);
    renderTeam();
  });

  function attachTeamEvents() {
    document.querySelectorAll('.team-grid .btn-delete-prof').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prof = professionals.find(p => p.id === id);
        if (prof) {
          showConfirmModal(
            'Remover da Equipe',
            `Tem certeza que deseja remover a especialista ${prof.name}?`,
            () => {
              professionals = professionals.filter(p => p.id !== id);
              syncLocal('ferrer_professionals', professionals);
              showToast('Profissional removida com sucesso!', 'success');
              renderTeam();
            }
          );
        }
      });
    });
  }

  // ==========================================================================
  // 3. GESTÃO DA AGENDA / DASHBOARD / MARKETING
  // ==========================================================================

  function populateBookingSelects() {
    bookingServiceSelect.innerHTML = '<option value="">Selecione...</option>';
    services.filter(s => s.isActive).forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} - ${s.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
      bookingServiceSelect.appendChild(opt);
    });

    bookingProfessionalSelect.innerHTML = '<option value="">Selecione...</option>';
    professionals.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      bookingProfessionalSelect.appendChild(opt);
    });

    const currentFilterVal = filterProfessionalSelect.value;
    filterProfessionalSelect.innerHTML = '<option value="">Todos</option>';
    professionals.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      filterProfessionalSelect.appendChild(opt);
    });
    filterProfessionalSelect.value = currentFilterVal;
  }

  function renderAppointments() {
    appointmentsTableBody.innerHTML = '';

    const filterDate = filterDateInput.value;
    const filterProf = filterProfessionalSelect.value;

    const filtered = appointments.filter(app => {
      const matchesDate = !filterDate || app.date === filterDate;
      const matchesProf = !filterProf || app.professionalId === filterProf;
      return matchesDate && matchesProf;
    });

    if (filtered.length === 0) {
      appointmentsEmptyState.style.display = 'block';
      document.getElementById('appointments-table').style.display = 'none';
      return;
    }

    appointmentsEmptyState.style.display = 'none';
    document.getElementById('appointments-table').style.display = 'table';

    filtered.forEach(app => {
      const srv = services.find(s => s.id === app.serviceId);
      const serviceName = srv ? srv.name : 'Procedimento excluído';
      
      const prof = professionals.find(p => p.id === app.professionalId);
      const profName = prof ? prof.name : 'Equipe removida';

      const [year, month, day] = app.date.split('-');
      const formattedDate = `${day}/${month}/${year}`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="client-cell">
            <span class="client-name">${app.patientName}</span>
            <button class="btn-anamnese" data-id="${app.id}">Ficha Anamnese</button>
          </div>
        </td>
        <td>${app.patientPhone}</td>
        <td><span class="badge badge-active">${serviceName}</span></td>
        <td>${profName}</td>
        <td>
          <div class="datetime-cell">
            <strong>${formattedDate}</strong>
            <span>${app.time}</span>
          </div>
        </td>
        <td>
          <span class="badge badge-status status-${app.status}">
            ${app.status === 'confirmado' ? 'Confirmado' : 'Finalizado'}
          </span>
        </td>
        <td>
          <div class="actions-cell">
            ${app.status === 'confirmado' ? `
              <button class="btn-action btn-complete" data-id="${app.id}" title="Finalizar e Faturar">✓</button>
            ` : ''}
            <button class="btn-action btn-delete" data-id="${app.id}" title="Cancelar Agendamento">✕</button>
          </div>
        </td>
      `;

      appointmentsTableBody.appendChild(tr);
    });

    attachAppointmentActions();
  }

  document.getElementById('btn-open-booking-modal').addEventListener('click', () => {
    bookingForm.reset();
    bookingModal.showModal();
  });

  const closeBookingModal = () => {
    bookingForm.reset();
    bookingModal.close();
  };
  document.getElementById('btn-close-booking-modal').addEventListener('click', closeBookingModal);
  document.getElementById('btn-cancel-booking').addEventListener('click', closeBookingModal);

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const patientName = document.getElementById('booking-patient-name').value.trim();
    const patientPhone = document.getElementById('booking-patient-phone').value.trim();
    const serviceId = bookingServiceSelect.value;
    const professionalId = bookingProfessionalSelect.value;
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const alergias = document.getElementById('booking-alergias').value.trim();
    const medicamentos = document.getElementById('booking-medicamentos').value.trim();

    if (!patientName || !patientPhone || !serviceId || !professionalId || !date || !time) {
      showToast('Por favor, preencha todos os campos obrigatórios (*)', 'error');
      return;
    }

    const existingPatient = patients.find(p => p.phone === patientPhone);
    if (existingPatient) {
      existingPatient.referralPoints += 5;
    } else {
      patients.push({
        name: patientName,
        phone: patientPhone,
        referralPoints: 10
      });
    }

    const newApp = {
      id: `app-${Date.now()}`,
      patientName,
      patientPhone,
      serviceId,
      professionalId,
      date,
      time,
      status: 'confirmado',
      anamnese: {
        alergias: alergias || 'Nenhuma informada',
        medicamentos: medicamentos || 'Nenhum informado'
      }
    };

    appointments.push(newApp);

    syncLocal('ferrer_appointments', appointments);
    syncLocal('ferrer_patients', patients);

    showToast(`Horário agendado com sucesso para ${patientName}!`, 'success');
    closeBookingModal();
    renderAppointments();
    renderPatients();
  });

  function attachAppointmentActions() {
    document.querySelectorAll('#appointments-table .btn-complete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const appIndex = appointments.findIndex(a => a.id === id);
        
        if (appIndex !== -1) {
          const app = appointments[appIndex];
          const service = services.find(s => s.id === app.serviceId);
          const price = service ? service.price : 0;

          appointments[appIndex].status = 'finalizado';

          dashboardStats.revenue += price;
          dashboardStats.appointmentsCount += 1;

          syncLocal('ferrer_appointments', appointments);
          syncLocal('ferrer_stats', dashboardStats);

          showToast(
            `Atendimento finalizado! Faturamento acrescido em ${price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
            'success'
          );

          updateKPIs();
          renderAppointments();
        }
      });
    });

    document.querySelectorAll('#appointments-table .btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const app = appointments.find(a => a.id === id);
        
        if (app) {
          showConfirmModal(
            'Cancelar Agendamento',
            `Deseja realmente cancelar a consulta de ${app.patientName} marcada para dia ${app.date.split('-').reverse().join('/')}?`,
            () => {
              appointments = appointments.filter(a => a.id !== id);
              syncLocal('ferrer_appointments', appointments);
              showToast('Agendamento cancelado com sucesso.', 'success');
              renderAppointments();
            }
          );
        }
      });
    });

    document.querySelectorAll('#appointments-table .btn-anamnese').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const app = appointments.find(a => a.id === id);
        if (app) {
          showConfirmModal(
            `Ficha de Anamnese - ${app.patientName}`,
            `Alergias: ${app.anamnese.alergias} | Uso contínuo de medicamentos: ${app.anamnese.medicamentos}`,
            () => {}
          );
        }
      });
    });
  }

  filterDateInput.addEventListener('change', renderAppointments);
  filterProfessionalSelect.addEventListener('change', renderAppointments);
  clearFiltersBtn.addEventListener('click', () => {
    filterDateInput.value = '';
    filterProfessionalSelect.value = '';
    renderAppointments();
    showToast('Filtros limpos com sucesso.', 'success');
  });

  // ==========================================================================
  // 4. MARKETING / FIDELIDADE
  // ==========================================================================

  function renderPatients() {
    patientsListBody.innerHTML = '';

    if (patients.length === 0) {
      patientsEmptyState.style.display = 'block';
      return;
    }
    patientsEmptyState.style.display = 'none';

    patients.sort((a, b) => b.referralPoints - a.referralPoints);

    patients.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${p.name}</strong></td>
        <td>${p.phone}</td>
        <td>
          <div class="points-badge">
            <span class="points-val">${p.referralPoints}</span>
            <span>Pts</span>
          </div>
        </td>
        <td>
          <button class="btn btn-outline btn-small btn-add-points" data-phone="${p.phone}" style="margin-right: 0.5rem;">
            + 10 Pts
          </button>
          <button class="btn btn-primary btn-small btn-recuperar-cliente" data-phone="${p.phone}" data-name="${p.name}">
            Recuperar Cliente
          </button>
        </td>
      `;
      patientsListBody.appendChild(tr);
    });

    attachMarketingEvents();
  }

  function attachMarketingEvents() {
    document.querySelectorAll('.btn-add-points').forEach(btn => {
      btn.addEventListener('click', () => {
        const phone = btn.getAttribute('data-phone');
        const index = patients.findIndex(p => p.phone === phone);
        if (index !== -1) {
          patients[index].referralPoints += 10;
          syncLocal('ferrer_patients', patients);
          showToast(`Indicação registrada! +10 pontos para ${patients[index].name}.`, 'success');
          renderPatients();
        }
      });
    });

    document.querySelectorAll('.btn-recuperar-cliente').forEach(btn => {
      btn.addEventListener('click', () => {
        const phone = btn.getAttribute('data-phone').replace(/\D/g, '');
        const name = btn.getAttribute('data-name');
        const message = `Olá, ${name}! Notei que já faz um tempo desde sua última sessão na Ferrer Innovare Clinic. Vamos realçar sua beleza natural novamente?`;
        const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      });
    });
  }

  // ==========================================================================
  // 5. GESTÃO DE LISTA DE ESPERA (LEADS)
  // ==========================================================================

  function renderWaitingList() {
    waitingListBody.innerHTML = '';
    const waitingList = JSON.parse(localStorage.getItem('ferrer_waiting_list')) || [];

    if (waitingList.length === 0) {
      waitingEmptyState.style.display = 'block';
      return;
    }
    waitingEmptyState.style.display = 'none';

    waitingList.forEach(item => {
      const s = services.find(srv => srv.id === item.serviceId);
      const serviceName = s ? s.name : 'Procedimento';
      const dateParts = item.date.split('-');
      const brDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : item.date;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.name}</strong></td>
        <td>${item.phone}</td>
        <td><span class="tag tag-service" style="background-color: var(--color-gold-muted); color: var(--color-gold-hover); padding: 4px 8px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 500;">${serviceName}</span></td>
        <td>${brDate}</td>
        <td>
          <button class="btn btn-outline btn-small btn-notify-waiting" data-phone="${item.phone}" data-name="${item.name}" data-service="${serviceName}" data-date="${brDate}" style="margin-right: 0.5rem;">
            Notificar WhatsApp
          </button>
          <button class="btn btn-danger btn-small btn-delete-waiting" data-id="${item.id}">
            Remover
          </button>
        </td>
      `;
      waitingListBody.appendChild(tr);
    });

    attachWaitingListEvents();
  }

  function attachWaitingListEvents() {
    document.querySelectorAll('.btn-notify-waiting').forEach(btn => {
      btn.addEventListener('click', () => {
        const phone = btn.getAttribute('data-phone').replace(/\D/g, '');
        const name = btn.getAttribute('data-name');
        const service = btn.getAttribute('data-service');
        const date = btn.getAttribute('data-date');
        const message = `Olá, ${name}! Temos ótimas notícias! Conseguimos uma vaga para você realizar seu agendamento de *${service}* no dia ${date}. Vamos confirmar seu horário?`;
        const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      });
    });

    document.querySelectorAll('.btn-delete-waiting').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        let waitingList = JSON.parse(localStorage.getItem('ferrer_waiting_list')) || [];
        waitingList = waitingList.filter(item => item.id !== id);
        localStorage.setItem('ferrer_waiting_list', JSON.stringify(waitingList));
        showToast('Lead removido da lista de espera.', 'success');
        renderWaitingList();
        updateKPIs();
      });
    });
  }

  // ==========================================================================
  // AUXILIARES DE FORMULÁRIO
  // ==========================================================================

  function setInputState(inputEl, isValid) {
    const group = inputEl.closest('.form-group');
    if (isValid) {
      group.classList.remove('invalid');
    } else {
      group.classList.add('invalid');
    }
  }

  function clearInputStates(formEl) {
    const groups = formEl.querySelectorAll('.form-group');
    groups.forEach(g => g.classList.remove('invalid'));
  }

  document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('input', () => {
      const group = element.closest('.form-group');
      if (group) group.classList.remove('invalid');
    });
  });

  // ==========================================================================
  // INICIALIZAÇÃO DO PROTOCOLO (RUN)
  // ==========================================================================
  updateKPIs();
  renderServices();
  renderTeam();
  renderAppointments();
  renderPatients();
  renderWaitingList();

});
