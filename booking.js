/**
 * booking.js - Lógica do Portal de Agendamento (Paciente)
 * Ferrer Innovare Clinic
 * 
 * Implementa a jornada de agendamento em etapas utilizando localStorage
 * para compartilhar dados em tempo real com o Painel Admin, incluindo a
 * política de sinal de 50% para reserva de horários e a Roleta de Indicações (PLG).
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // RECEPÇÃO DE INDICAÇÃO (BÔNUS VIP)
  // ==========================================================================
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('indicacao')) {
    const promoOverlay = document.createElement('div');
    promoOverlay.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; z-index: 10000; background-color: #596854; color: #FFFFFF; text-align: center; padding: 14px 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); display: flex; justify-content: space-between; align-items: center; animation: fadeIn 0.5s ease; border-bottom: 2px solid #C8A97E;">
        <div style="flex: 1; text-align: left;">
          <strong style="font-family: 'Outfit', sans-serif; font-size: 15px; letter-spacing: 0.5px; display: block;">CONVITE VIP RECEBIDO</strong>
          <span style="font-family: 'Inter', sans-serif; font-size: 13px; opacity: 0.95;">Para ativar o código, conclua um agendamento.</span>
        </div>
        <button id="close-promo" style="background: none; border: none; color: #FFFFFF; font-size: 26px; cursor: pointer; padding: 0 10px; transition: all 0.2s;">&times;</button>
      </div>
    `;
    document.body.appendChild(promoOverlay);
    
    document.getElementById('close-promo').addEventListener('click', () => {
      promoOverlay.style.opacity = '0';
      setTimeout(() => promoOverlay.remove(), 300);
    });
  }

  // ==========================================================================
  // ESTADO DO APLICATIVO (INTEGRAÇÃO LOCALSTORAGE)
  // ==========================================================================

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

  let services = JSON.parse(localStorage.getItem('ferrer_services')) || defaultServices;
  let professionals = JSON.parse(localStorage.getItem('ferrer_professionals')) || defaultProfessionals;
  let appointments = JSON.parse(localStorage.getItem('ferrer_appointments')) || [];
  let patients = JSON.parse(localStorage.getItem('ferrer_patients')) || [];

  if (!localStorage.getItem('ferrer_services')) localStorage.setItem('ferrer_services', JSON.stringify(services));
  if (!localStorage.getItem('ferrer_professionals')) localStorage.setItem('ferrer_professionals', JSON.stringify(professionals));

  let bookingState = {
    step: 1,
    serviceId: null,
    professionalId: null,
    date: null,
    time: null,
    patientName: '',
    patientPhone: '',
    alergias: '',
    medicamentos: ''
  };

  // ==========================================================================
  // ELEMENTOS DO DOM
  // ==========================================================================
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressContainer = document.getElementById('progress-bar-container');
  const panels = document.querySelectorAll('.step-panel');
  
  // Elementos Passo 1
  const servicesCatalog = document.getElementById('services-catalog');

  // Elementos Passo 2
  const professionalsGrid = document.getElementById('professionals-select-grid');
  const bookingDateInput = document.getElementById('booking-date');
  const timeSlotsContainer = document.getElementById('time-slots-container');
  const btnNextStep2 = document.getElementById('btn-next-step-2');

  // Elementos Passo 3
  const patientForm = document.getElementById('patient-form');
  const patientNameInput = document.getElementById('patient-name');
  const patientPhoneInput = document.getElementById('patient-phone');
  const anamneseAlergiasInput = document.getElementById('anamnese-alergias');
  const anamneseMedicamentosInput = document.getElementById('anamnese-medicamentos');

  // Elementos Passo 4 (Resumo)
  const summaryServiceName = document.getElementById('summary-service-name');
  const summaryServiceDetails = document.getElementById('summary-service-details');
  const summaryProfAvatar = document.getElementById('summary-prof-avatar');
  const summaryProfName = document.getElementById('summary-prof-name');
  const summaryDate = document.getElementById('summary-date');
  const summaryTime = document.getElementById('summary-time');
  const summaryPatientName = document.getElementById('summary-patient-name');
  const summaryPatientPhone = document.getElementById('summary-patient-phone');
  const summaryTotalPrice = document.getElementById('summary-total-price');
  const summaryDepositPrice = document.getElementById('summary-deposit-price');
  const policyAgreementCheckbox = document.getElementById('policy-agreement');
  const btnSubmitBooking = document.getElementById('btn-submit-booking');

  // Elementos Passo 5 (Sucesso)
  const successDepositVal = document.getElementById('success-deposit-val');
  const btnCopyPix = document.getElementById('btn-copy-pix');
  const btnRestartBooking = document.getElementById('btn-restart-booking');
  
  // Elementos da Roleta (Clube VIP)
  const appNavBtns = document.querySelectorAll('.app-nav-btn');
  const mainTabPanels = document.querySelectorAll('.main-tab-panel');
  const wheelRotationBox = document.getElementById('wheel-rotation-box');
  const wheelLockOverlay = document.getElementById('wheel-lock-overlay');
  const btnReferWhatsapp = document.getElementById('btn-refer-whatsapp');
  const btnSpinWheel = document.getElementById('btn-spin-wheel');
  const rouletteCanvas = document.getElementById('roulette-canvas');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // Configurar data mínima como "hoje"
  const todayStr = new Date().toISOString().split('T')[0];
  bookingDateInput.min = todayStr;

  // ==========================================================================
  // SISTEMA DE NOTIFICAÇÕES (TOAST)
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

  // ==========================================================================
  // NAVEGAÇÃO ENTRE ABAS PRINCIPAIS (AGENDAMENTO VS CLUBE VIP)
  // ==========================================================================
  appNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      appNavBtns.forEach(b => b.classList.remove('active'));
      mainTabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetTabId = btn.getAttribute('data-tab');
      document.getElementById(targetTabId).classList.add('active');

      if (targetTabId === 'tab-vip') {
        drawRoulette();
      }
    });
  });

  // ==========================================================================
  // NAVEGAÇÃO ENTRE ETAPAS DE AGENDAMENTO (SPA)
  // ==========================================================================
  window.goToStep = function(stepNumber) {
    if (stepNumber < 0 || stepNumber > 5) return;

    bookingState.step = stepNumber;

    panels.forEach(p => p.classList.remove('active'));
    document.getElementById(`step-${stepNumber}`).classList.add('active');

    if (stepNumber === 0 || stepNumber === 5) {
      progressContainer.style.display = 'none';
    } else {
      progressContainer.style.display = 'flex';
      
      progressSteps.forEach(stepEl => {
        const step = parseInt(stepEl.getAttribute('data-step'), 10);
        stepEl.classList.remove('active', 'completed');

        if (step === stepNumber) {
          stepEl.classList.add('active');
        } else if (step < stepNumber) {
          stepEl.classList.add('completed');
        }
      });
    }

    if (stepNumber === 1) {
      renderCatalog();
    } else if (stepNumber === 2) {
      renderProfessionals();
      updateNextStep2Button();
    } else if (stepNumber === 4) {
      renderSummary();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================================================
  // PASSO 1: RENDERIZAR CATÁLOGO DE SERVIÇOS
  // ==========================================================================
  function renderCatalog() {
    servicesCatalog.innerHTML = '';
    const activeServices = services.filter(s => s.isActive);

    if (activeServices.length === 0) {
      servicesCatalog.innerHTML = '<p class="select-prompt">De momento, a clínica não possui tratamentos online ativos.</p>';
      return;
    }

    activeServices.forEach(s => {
      const card = document.createElement('div');
      card.className = 'patient-service-card';
      
      const formattedPrice = s.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      card.innerHTML = `
        <div class="service-main-info">
          <h3 class="service-name">${s.name}</h3>
          <span class="service-price">${formattedPrice}</span>
        </div>
        <div class="service-meta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Duração: ${s.durationMinutes} min</span>
        </div>
        <button class="btn btn-primary btn-book-service" data-id="${s.id}">
          Agendar Tratamento
        </button>
      `;

      card.querySelector('.btn-book-service').addEventListener('click', () => {
        bookingState.serviceId = s.id;
        bookingState.professionalId = null;
        bookingState.time = null;
        goToStep(2);
      });

      servicesCatalog.appendChild(card);
    });
  }

  // ==========================================================================
  // PASSO 2: PROFISSIONAL, DATA E HORÁRIO
  // ==========================================================================
  
  function renderProfessionals() {
    professionalsGrid.innerHTML = '';

    professionals.forEach(p => {
      const initials = p.name ? p.name.charAt(0).toUpperCase() : 'P';
      const isActive = bookingState.professionalId === p.id;
      const isEligible = p.allowedServices.includes(bookingState.serviceId);

      const card = document.createElement('div');
      card.className = `prof-option-card ${isActive ? 'active' : ''} ${isEligible ? 'eligible' : 'disabled'}`;
      
      let badgeHtml = '';
      if (isEligible) {
        badgeHtml = `<span class="badge-recommended">✨ Indicada</span>`;
      } else {
        badgeHtml = `<span class="badge-unavailable">Indisponível</span>`;
      }

      card.innerHTML = `
        <div class="avatar">${initials}</div>
        <h4>${p.name}</h4>
        <span class="prof-specialty">${p.specialty || 'Especialista'}</span>
        ${badgeHtml}
      `;

      if (isEligible) {
        card.addEventListener('click', () => {
          bookingState.professionalId = p.id;
          bookingState.time = null;
          
          document.querySelectorAll('.prof-option-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');

          generateTimeSlots();
          updateNextStep2Button();
        });
      }

      professionalsGrid.appendChild(card);
    });
  }

  function generateTimeSlots() {
    timeSlotsContainer.innerHTML = '';

    if (!bookingDateInput.value) {
      timeSlotsContainer.innerHTML = '<p class="select-prompt">Escolha uma data para ver os horários.</p>';
      return;
    }

    // Se nenhuma profissional estiver selecionada, mas houver profissionais elegíveis para o serviço,
    // nós pré-selecionamos a primeira profissional elegível automaticamente!
    if (!bookingState.professionalId) {
      const eligibleProfs = professionals.filter(p => p.allowedServices.includes(bookingState.serviceId));
      if (eligibleProfs.length > 0) {
        bookingState.professionalId = eligibleProfs[0].id;
        renderProfessionals();
      } else {
        timeSlotsContainer.innerHTML = '<p class="select-prompt">Sem profissionais disponíveis para este procedimento.</p>';
        return;
      }
    }

    bookingState.date = bookingDateInput.value;

    // Horários fictícios premium sugeridos
    const availableSlots = [
      '09:00', '10:30', '14:00', '15:30', '17:00'
    ];

    // Verificar se é domingo para simular calendário lotado (Lista de Espera)
    const isSunday = new Date(bookingDateInput.value + 'T00:00:00').getDay() === 0;
    const takenTimes = appointments
      .filter(app => app.professionalId === bookingState.professionalId && app.date === bookingState.date && app.status !== 'cancelado')
      .map(app => app.time);

    // Se for domingo ou todos os horários estiverem ocupados
    const isFullyBooked = isSunday || availableSlots.every(time => takenTimes.includes(time));

    const waitingListContainer = document.getElementById('waiting-list-inline-container');
    const waitingFormFields = document.getElementById('waiting-list-form-fields');
    const btnToggleWaitingForm = document.getElementById('btn-toggle-waiting-form');

    if (isFullyBooked) {
      timeSlotsContainer.style.display = 'none';
      if (waitingListContainer) {
        waitingListContainer.style.display = 'block';
      }
      if (btnToggleWaitingForm) {
        btnToggleWaitingForm.disabled = false;
        btnToggleWaitingForm.textContent = 'Entrar na Lista de Espera';
        btnToggleWaitingForm.style.backgroundColor = '';
        btnToggleWaitingForm.style.color = '';
      }
      bookingState.time = null;
      updateNextStep2Button();
    } else {
      timeSlotsContainer.style.display = 'grid';
      if (waitingListContainer) {
        waitingListContainer.style.display = 'none';
        waitingFormFields.style.display = 'none';
      }

      availableSlots.forEach(time => {
        const isTaken = takenTimes.includes(time);
        const isSelected = bookingState.time === time;

        const slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.className = `time-slot ${isSelected ? 'active selected' : ''}`;
        slotBtn.textContent = time;

        if (isTaken) {
          slotBtn.disabled = true;
          slotBtn.style.opacity = '0.3';
          slotBtn.style.cursor = 'not-allowed';
          slotBtn.title = 'Horário Ocupado';
        } else {
          slotBtn.addEventListener('click', () => {
            bookingState.time = time;
            
            document.querySelectorAll('.time-slot').forEach(btn => btn.classList.remove('active', 'selected'));
            slotBtn.classList.add('active', 'selected');

            updateNextStep2Button();
          });
        }

        timeSlotsContainer.appendChild(slotBtn);
      });
    }
  }

  bookingDateInput.addEventListener('change', () => {
    bookingState.time = null;
    generateTimeSlots();
    updateNextStep2Button();
  });

  // Lógica da Lista de Espera Inline
  const btnToggleWaitingForm = document.getElementById('btn-toggle-waiting-form');
  const waitingFormFields = document.getElementById('waiting-list-form-fields');
  const btnSubmitWaiting = document.getElementById('btn-submit-waiting');
  const waitingNameInput = document.getElementById('waiting-name');
  const waitingPhoneInput = document.getElementById('waiting-phone');

  if (btnToggleWaitingForm && waitingFormFields) {
    btnToggleWaitingForm.addEventListener('click', () => {
      if (waitingFormFields.style.display === 'none' || !waitingFormFields.style.display) {
        waitingFormFields.style.display = 'block';
        btnToggleWaitingForm.textContent = 'Fechar Formulário';
      } else {
        waitingFormFields.style.display = 'none';
        btnToggleWaitingForm.textContent = 'Entrar na Lista de Espera';
      }
    });
  }

  if (btnSubmitWaiting) {
    btnSubmitWaiting.addEventListener('click', () => {
      const nameVal = waitingNameInput.value.trim();
      const phoneVal = waitingPhoneInput.value.trim();

      if (!nameVal) {
        showToast('Por favor, informe seu nome.', 'error');
        waitingNameInput.style.borderColor = '#C05C5C';
        return;
      } else {
        waitingNameInput.style.borderColor = '';
      }

      if (!phoneVal) {
        showToast('Por favor, informe seu WhatsApp.', 'error');
        waitingPhoneInput.style.borderColor = '#C05C5C';
        return;
      } else {
        waitingPhoneInput.style.borderColor = '';
      }

      // Salvar na lista de espera local
      let waitingList = JSON.parse(localStorage.getItem('ferrer_waiting_list')) || [];
      waitingList.push({
        id: `wait-${Date.now()}`,
        name: nameVal,
        phone: phoneVal,
        serviceId: bookingState.serviceId,
        date: bookingDateInput.value,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('ferrer_waiting_list', JSON.stringify(waitingList));

      // Notificar sucesso
      showToast('Inscrito com sucesso na Lista de Espera!', 'success');
      
      // Ocultar formulário e desabilitar botão com check visual
      waitingFormFields.style.display = 'none';
      if (btnToggleWaitingForm) {
        btnToggleWaitingForm.disabled = true;
        btnToggleWaitingForm.textContent = '✓ Cadastro Realizado com Sucesso';
        btnToggleWaitingForm.style.backgroundColor = '#5F8F75';
        btnToggleWaitingForm.style.color = '#FFFFFF';
      }
      
      // Limpar inputs
      waitingNameInput.value = '';
      waitingPhoneInput.value = '';
    });
  }

  function updateNextStep2Button() {
    const isStep2Valid = bookingState.professionalId && bookingState.date && bookingState.time;
    btnNextStep2.disabled = !isStep2Valid;
  }

  btnNextStep2.addEventListener('click', () => {
    goToStep(3);
  });

  // ==========================================================================
  // PASSO 3: IDENTIFICAÇÃO E ANAMNESE (FORMULÁRIO)
  // ==========================================================================
  
  let alergiaSim = false;
  let medicamentoSim = false;

  const toggleAlergias = document.querySelectorAll('#toggle-alergias .btn-toggle');
  toggleAlergias.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleAlergias.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      alergiaSim = btn.dataset.val === 'sim';
      if (alergiaSim) {
        anamneseAlergiasInput.style.display = 'block';
        anamneseAlergiasInput.focus();
      } else {
        anamneseAlergiasInput.style.display = 'none';
        anamneseAlergiasInput.value = '';
      }
    });
  });

  const toggleMed = document.querySelectorAll('#toggle-medicamentos .btn-toggle');
  toggleMed.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleMed.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      medicamentoSim = btn.dataset.val === 'sim';
      if (medicamentoSim) {
        anamneseMedicamentosInput.style.display = 'block';
        anamneseMedicamentosInput.focus();
      } else {
        anamneseMedicamentosInput.style.display = 'none';
        anamneseMedicamentosInput.value = '';
      }
    });
  });

  patientForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = patientNameInput.value.trim();
    const phone = patientPhoneInput.value.trim();
    const alergias = anamneseAlergiasInput.value.trim();
    const medicamentos = anamneseMedicamentosInput.value.trim();

    let isValid = true;

    if (!name) {
      setInputState(patientNameInput, false);
      isValid = false;
    } else {
      setInputState(patientNameInput, true);
    }

    if (!phone) {
      setInputState(patientPhoneInput, false);
      isValid = false;
    } else {
      setInputState(patientPhoneInput, true);
    }

    if (!isValid) return;

    bookingState.patientName = name;
    bookingState.patientPhone = phone;
    bookingState.alergias = alergiaSim ? (alergias ? `Sim (${alergias})` : 'Sim') : 'Não';
    bookingState.medicamentos = medicamentoSim ? (medicamentos ? `Sim (${medicamentos})` : 'Sim') : 'Não';

    goToStep(4);
  });

  function setInputState(inputEl, isValid) {
    const group = inputEl.closest('.form-group');
    if (isValid) {
      group.classList.remove('invalid');
    } else {
      group.classList.add('invalid');
    }
  }

  [patientNameInput, patientPhoneInput].forEach(input => {
    input.addEventListener('input', () => {
      setInputState(input, true);
    });
  });

  // ==========================================================================
  // PASSO 4: RESUMO E CONFIRMAÇÃO DO AGENDAMENTO (POLÍTICA DE SINAL)
  // ==========================================================================
  
  function renderSummary() {
    const s = services.find(srv => srv.id === bookingState.serviceId);
    const p = professionals.find(prof => prof.id === bookingState.professionalId);

    // Procedimento
    summaryServiceName.textContent = s ? s.name : '';
    summaryServiceDetails.textContent = `Duração: ${s ? s.durationMinutes : ''} min`;

    // Profissional
    summaryProfName.textContent = p ? p.name : '';
    summaryProfAvatar.textContent = p ? p.name.charAt(0).toUpperCase() : 'P';

    // Data/Hora
    const [year, month, day] = bookingState.date.split('-');
    summaryDate.textContent = `${day}/${month}/${year}`;
    summaryTime.textContent = bookingState.time;

    // Paciente
    summaryPatientName.textContent = bookingState.patientName;
    summaryPatientPhone.textContent = bookingState.patientPhone;

    // Anamnese
    const sumAnamneseDiv = document.getElementById('summary-anamnese');
    const sumAlergias = document.getElementById('summary-alergias');
    const sumMedicamentos = document.getElementById('summary-medicamentos');

    if (sumAnamneseDiv) {
      sumAnamneseDiv.style.display = 'block';
      sumAlergias.textContent = bookingState.alergias;
      sumMedicamentos.textContent = bookingState.medicamentos;
    }

    // Preços
    const totalPriceVal = s ? s.price : 0;
    const depositPriceVal = totalPriceVal * 0.5;

    summaryTotalPrice.textContent = totalPriceVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    summaryDepositPrice.textContent = depositPriceVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    policyAgreementCheckbox.checked = false;
    btnSubmitBooking.disabled = true;
  }

  // Trava de acordo político
  policyAgreementCheckbox.addEventListener('change', () => {
    btnSubmitBooking.disabled = !policyAgreementCheckbox.checked;
  });

  // Confirmar agendamento final
  btnSubmitBooking.addEventListener('click', () => {
    const s = services.find(srv => srv.id === bookingState.serviceId);
    const totalPriceVal = s ? s.price : 0;
    const depositPriceVal = totalPriceVal * 0.5;

    // 1. Cadastrar paciente no banco local
    let existingPatient = patients.find(p => p.phone === bookingState.patientPhone);
    if (existingPatient) {
      existingPatient.referralPoints += 5;
    } else {
      patients.push({
        name: bookingState.patientName,
        phone: bookingState.patientPhone,
        referralPoints: 10
      });
    }

    // 2. Salvar agendamento
    const newAppointment = {
      id: `app-${Date.now()}`,
      patientName: bookingState.patientName,
      patientPhone: bookingState.patientPhone,
      serviceId: bookingState.serviceId,
      professionalId: bookingState.professionalId,
      date: bookingState.date,
      time: bookingState.time,
      status: 'confirmado',
      anamnese: {
        alergias: bookingState.alergias,
        medicamentos: bookingState.medicamentos
      }
    };

    appointments.push(newAppointment);

    localStorage.setItem('ferrer_appointments', JSON.stringify(appointments));
    localStorage.setItem('ferrer_patients', JSON.stringify(patients));

    // Exibir valor na tela de sucesso
    successDepositVal.textContent = depositPriceVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // 3. Atualizar link do WhatsApp
    const serviceName = s ? s.name : '';
    const pEl = professionals.find(prof => prof.id === bookingState.professionalId);
    const profName = pEl ? pEl.name : '';
    const dateParts = bookingState.date.split('-');
    const brDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : bookingState.date;

    const whatsappNumber = '5511999999999'; // Número fictício do WhatsApp Business da clínica
    const messageText = `Olá! Gostaria de confirmar meu agendamento na *Ferrer Innovare Clinic*:%0A%0A- *Cliente:* ${encodeURIComponent(bookingState.patientName)}%0A- *Procedimento:* ${encodeURIComponent(serviceName)}%0A- *Especialista:* ${encodeURIComponent(profName)}%0A- *Data/Hora:* ${encodeURIComponent(brDate)} às ${encodeURIComponent(bookingState.time)}%0A%0AAguardando instruções para o envio do comprovante do sinal (50%).`;
    const btnWhatsappConfirm = document.getElementById('btn-whatsapp-confirm');
    if (btnWhatsappConfirm) {
      btnWhatsappConfirm.href = `https://wa.me/${whatsappNumber}?text=${messageText}`;
    }

    showToast('Pedido de agendamento registrado!', 'success');
    goToStep(5);
  });

  // ==========================================================================
  // PASSO 5: TELA DE SUCESSO & COPIAR PIX
  // ==========================================================================

  btnCopyPix.addEventListener('click', () => {
    const pixKey = document.getElementById('pix-key-value').textContent;
    navigator.clipboard.writeText(pixKey)
      .then(() => {
        showToast('Chave CNPJ copiada com sucesso!', 'success');
      })
      .catch(() => {
        showToast('Erro ao copiar chave PIX.', 'error');
      });
  });

  btnRestartBooking.addEventListener('click', () => {
    bookingState = {
      step: 0,
      serviceId: null,
      professionalId: null,
      date: null,
      time: null,
      patientName: '',
      patientPhone: '',
      alergias: '',
      medicamentos: ''
    };
    
    patientForm.reset();
    bookingDateInput.value = '';
    policyAgreementCheckbox.checked = false;
    btnSubmitBooking.disabled = true;
    
    goToStep(0);
  });


  // ==========================================================================
  // 🎡 GESTÃO DA ROLETA (CLUBE VIP)
  // ==========================================================================

  const premios = ['Peeling Facial', 'Massagem Relax', '10% OFF Botox', 'Limpeza de Pele', 'Tente Novamente', 'OFF Preenchimento'];
  const numSlices = premios.length;
  const sliceArc = (2 * Math.PI) / numSlices;
  
  let rouletteUnlocked = false;
  let isSpinning = false;
  let accumulatedRotation = 0; // guarda rotação para giros subsequentes

  function drawRoulette() {
    if (!rouletteCanvas) return;
    const ctx = rouletteCanvas.getContext('2d');
    const cx = rouletteCanvas.width / 2;
    const cy = rouletteCanvas.height / 2;
    const r = cx - 12;

    ctx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);

    for (let i = 0; i < numSlices; i++) {
      const angle = i * sliceArc;
      
      // Desenha a fatia
      ctx.beginPath();
      ctx.arc(cx, cy, r, angle, angle + sliceArc);
      ctx.lineTo(cx, cy);
      
      // Cores alternadas da paleta Ferrer Clinic
      ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#FAF7F2';
      ctx.fill();

      // Borda da fatia
      ctx.strokeStyle = '#EFEBE5';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Desenhar o texto do prêmio rotacionado
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + sliceArc / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#3E362E';
      ctx.font = 'bold 11px Inter';
      ctx.fillText(premios[i], r - 15, 0);
      ctx.restore();
    }

    // Desenhar círculo interno decorativo (Peg central em Nude/Gold)
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, 2 * Math.PI);
    ctx.fillStyle = '#C8A97E';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Lógica de Indicação via WhatsApp (Desbloqueio)
  btnReferWhatsapp.addEventListener('click', () => {
    // 1. Gerar link dinâmico garantindo que funcione de qualquer domínio/host
    const baseUrl = window.location.href.split('?')[0]; // Limpa query string anterior se houver
    const shareUrl = `${baseUrl}?indicacao=true`;
    const msg = `Olá! Agendei um procedimento na Ferrer Innovare Clinic. Conheça os tratamentos e agende o seu também para liberarmos nossos bônus VIP: ${shareUrl}`;
    
    // 2. Atualizar o link no milissegundo do clique
    btnReferWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;

    if (rouletteUnlocked) return;

    // Desbloquear estado
    rouletteUnlocked = true;

    // Parar animação de rotação infinita
    wheelRotationBox.classList.remove('rotate-slow');
    // Forçar rotação estática em 0 para preparar física
    wheelRotationBox.style.transform = 'rotate(0deg)';

    // Ocultar overlay de cadeado com animação
    wheelLockOverlay.classList.add('unlocked');

    // Habilitar botão de giro
    btnSpinWheel.disabled = false;

    showToast('Indicação enviada! Roleta destravada com sucesso.', 'success');
  });

  // Física de Giro da Roleta
  btnSpinWheel.addEventListener('click', () => {
    if (isSpinning || !rouletteUnlocked) return;
    
    isSpinning = true;
    btnSpinWheel.disabled = true;
    btnReferWhatsapp.style.pointerEvents = 'none';
    btnReferWhatsapp.style.opacity = '0.5';

    // 1. Sortear prêmio (Garantir que NUNCA caia no "Tente Novamente" - índice 4)
    let indiceSorteado;
    do {
      indiceSorteado = Math.floor(Math.random() * premios.length);
    } while (premios[indiceSorteado] === 'Tente Novamente');

    // 2. Calcular matemática exata (Corrigindo o offset de 90 graus do Canvas)
    // O Canvas desenha o grau 0 na posição de 3 horas (direita).
    // O ponteiro da roleta está na posição de 12 horas (topo), que equivale a 270 graus (ou -90).
    // O centro da primeira fatia (índice 0) está em 30 graus.
    // Para alinhar a fatia ao topo: 270 - 30 = 240 graus de offset base.
    const anguloPorFatia = 360 / premios.length;
    const anguloPremio = indiceSorteado * anguloPorFatia;
    
    // Rotações extras (ex: 5 voltas) e aplicar
    const totalSpins = 5;
    
    // A rotação total é acumulada + voltas completas + offset do topo (240) - ângulo do prêmio
    accumulatedRotation = (Math.ceil(accumulatedRotation / 360) * 360) + (totalSpins * 360) + 240 - anguloPremio;

    // 3. Aplicar transição CSS do giro
    wheelRotationBox.style.transition = 'transform 4.5s cubic-bezier(0.1, 0.8, 0.1, 1)';
    wheelRotationBox.style.transform = `rotate(${accumulatedRotation}deg)`;

    // 4. Executar pós-giro via evento transitionend para precisão total
    wheelRotationBox.addEventListener('transitionend', function onSpinEnd() {
      // Remover listener para não disparar múltiplas vezes
      wheelRotationBox.removeEventListener('transitionend', onSpinEnd);
      
      isSpinning = false;
      const premioGanho = premios[indiceSorteado];
      
      // Mostrar Toast luxuoso de parabéns
      showToast(`Parabéns! Você ganhou: "${premioGanho}"!`, 'success');

      // Notificar cupom de resgate se não for "Tente Novamente"
      if (premioGanho !== 'Tente Novamente') {
        setTimeout(() => {
          showToast(`Resgate na recepção com o código: VIP-${Math.floor(Math.random()*9000)+1000}`, 'success');
        }, 1500);
      }

      // Travar a roleta novamente após o uso da indicação
      setTimeout(() => {
        rouletteUnlocked = false;
        btnSpinWheel.disabled = true;
        btnReferWhatsapp.style.pointerEvents = 'auto';
        btnReferWhatsapp.style.opacity = '1';
        
        // Colocar cadeado de volta
        wheelLockOverlay.classList.remove('unlocked');
        wheelRotationBox.classList.add('rotate-slow');
      }, 4000);
    });
  });

  // ==========================================================================
  // CARROSSEL DA VITRINE (PASSO 0)
  // ==========================================================================
  const carouselImages = document.querySelectorAll('.carousel-img');
  const carouselDots = document.querySelectorAll('.carousel-dots .dot');
  let currentSlide = 0;
  const slideInterval = 4000; // 4 segundos

  function showSlide(index) {
    carouselImages.forEach(img => img.classList.remove('active'));
    carouselDots.forEach(dot => dot.classList.remove('active'));
    
    if (carouselImages[index]) carouselImages[index].classList.add('active');
    if (carouselDots[index]) carouselDots[index].classList.add('active');
  }

  function nextSlide() {
    if (carouselImages.length === 0) return;
    currentSlide = (currentSlide + 1) % carouselImages.length;
    showSlide(currentSlide);
  }

  let carouselTimer = setInterval(nextSlide, slideInterval);

  carouselDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      clearInterval(carouselTimer);
      currentSlide = idx;
      showSlide(currentSlide);
      carouselTimer = setInterval(nextSlide, slideInterval);
    });
  });

  // Ação de iniciar agendamento
  const btnStartBooking = document.getElementById('btn-start-booking');
  if (btnStartBooking) {
    btnStartBooking.addEventListener('click', () => {
      goToStep(1);
    });
  }




  // Inicialização do Portal
  goToStep(0);

});
