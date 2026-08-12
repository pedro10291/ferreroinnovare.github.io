import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { X, Search, Calendar as CalendarIcon, Clock, User, CheckCircle2 } from 'lucide-react';
import { appointmentsService } from '../../../services/appointmentsService';
import { PatientSearchResult, Procedure, Professional } from '../../../types/appointment';
import { cn } from '../../../utils/cn';

interface CreateAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
  initialDate?: Date;
  initialTime?: string;
}

export const CreateAppointmentDialog: React.FC<CreateAppointmentDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  showToast,
  initialDate,
  initialTime
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data for selects
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<string>(''); // empty means "Avaliação" (null in DB)
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (initialDate) {
        setDate(initialDate.toISOString().split('T')[0]);
      }
      if (initialTime) {
        setTime(initialTime);
      }
    } else {
      resetForm();
    }
  }, [isOpen, initialDate, initialTime]);

  const loadInitialData = async () => {
    try {
      const [procs, profs] = await Promise.all([
        appointmentsService.fetchProcedures(),
        appointmentsService.fetchProfessionals()
      ]);
      setProcedures(procs);
      setProfessionals(profs);
      if (profs.length === 1) setSelectedProfessional(profs[0].id);
    } catch (err) {
      console.error(err);
      showToast('Erro ao carregar dados auxiliares.', 'error');
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedPatient(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProcedure('');
    setSelectedProfessional(professionals.length === 1 ? professionals[0].id : '');
    setDate(initialDate ? initialDate.toISOString().split('T')[0] : '');
    setTime('');
    setDuration('60');
    setNotes('');
  };

  // Search Patient debounced
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        try {
          const results = await appointmentsService.fetchPatients(searchQuery);
          setSearchResults(results);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNextStep = () => {
    if (step === 1 && !selectedPatient) {
      showToast('Selecione uma paciente primeiro.', 'error');
      return;
    }
    if (step === 2) {
      if (!selectedProfessional) {
        showToast('Selecione um profissional.', 'error');
        return;
      }
      if (!date || !time) {
        showToast('Selecione data e horário.', 'error');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleConfirm = async () => {
    if (!selectedPatient || !selectedProfessional || !date || !time) return;

    setIsLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      await appointmentsService.createAppointment({
        patient_id: selectedPatient.id,
        procedure_id: selectedProcedure || null,
        professional_id: selectedProfessional,
        scheduled_at: scheduledAt,
        duration_minutes: parseInt(duration, 10),
        notes: notes.trim() || undefined
      });
      
      showToast('Agendamento criado com sucesso.', 'success');
      onSuccess();
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('prevent_overlapping_appointments') || error?.message?.includes('violates exclusion constraint')) {
        showToast('Este horário não está mais disponível. Escolha outro horário.', 'error');
      } else {
        showToast('Não foi possível criar o agendamento. Tente novamente.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0 gap-4">
          <h2 className="text-xl font-serif text-clinic-dark font-medium">Novo Agendamento</h2>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 text-sm">
            <div className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium", step >= 1 ? "bg-clinic-gold text-white" : "bg-gray-100 text-gray-500")}>1</div>
            <div className={cn("h-px w-4", step >= 2 ? "bg-clinic-gold" : "bg-gray-200")} />
            <div className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium", step >= 2 ? "bg-clinic-gold text-white" : "bg-gray-100 text-gray-500")}>2</div>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar paciente
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedPatient(null); // Reset se buscar de novo
                    }}
                    placeholder="Nome, email ou telefone (mín. 3 letras)"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow"
                  />
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-clinic-gold border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results List */}
              {searchQuery.length >= 3 && !selectedPatient && searchResults.length > 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden shadow-inner max-h-60 overflow-y-auto">
                  {searchResults.map((patient) => (
                    <div 
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className="p-3 hover:bg-white cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{patient.full_name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>{patient.phone}</span>
                          {patient.email && <span>• {patient.email}</span>}
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" className="hidden sm:flex">
                        Selecionar
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length >= 3 && !isSearching && searchResults.length === 0 && !selectedPatient && (
                <div className="text-center p-6 text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                  Nenhuma paciente encontrada.
                </div>
              )}

              {/* Selected Patient */}
              {selectedPatient && (
                <div className="bg-green-50 rounded-xl border border-green-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{selectedPatient.full_name}</p>
                      <p className="text-xs text-green-700">{selectedPatient.phone}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="text-xs font-medium text-green-700 hover:text-green-900 underline"
                  >
                    Trocar
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Procedimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Procedimento
                  </label>
                  <select
                    value={selectedProcedure}
                    onChange={(e) => {
                      setSelectedProcedure(e.target.value);
                      const proc = procedures.find(p => p.id === e.target.value);
                      if (proc?.duration_minutes) {
                        setDuration(proc.duration_minutes.toString());
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow"
                  >
                    <option value="">Avaliação Geral (padrão)</option>
                    {procedures.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                {/* Profissional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profissional *
                  </label>
                  <select
                    value={selectedProfessional}
                    onChange={(e) => setSelectedProfessional(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow"
                  >
                    <option value="" disabled>Selecione...</option>
                    {professionals.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* Data e Hora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" /> Data *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Horário *
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duração
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow"
                    >
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                      <option value="120">120 min</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instruções ou informações adicionais importantes..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow resize-none h-24"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-end gap-3">
          {step === 1 ? (
            <Button onClick={handleNextStep} disabled={!selectedPatient} className="w-full sm:w-auto">
              Continuar
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setStep(1)} className="hidden sm:block">
                Voltar
              </Button>
              <Button 
                onClick={handleConfirm} 
                isLoading={isLoading} 
                disabled={!selectedProfessional || !date || !time}
                className="w-full sm:w-auto"
              >
                Confirmar agendamento
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
