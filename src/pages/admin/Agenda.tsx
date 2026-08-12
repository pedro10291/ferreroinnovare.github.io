import React, { useState, useEffect, useCallback } from 'react';
import { DateNavigator } from '../../components/admin/agenda/DateNavigator';
import { ProfessionalFilter } from '../../components/admin/agenda/ProfessionalFilter';
import { AppointmentCard } from '../../components/admin/agenda/AppointmentCard';
import { AppointmentDetailsDrawer } from '../../components/admin/agenda/AppointmentDetailsDrawer';
import { CreateAppointmentDialog } from '../../components/admin/agenda/CreateAppointmentDialog';
import { CancelAppointmentDialog } from '../../components/admin/agenda/CancelAppointmentDialog';
import { CompleteAppointmentDialog } from '../../components/admin/agenda/CompleteAppointmentDialog';
import { RescheduleAppointmentDialog } from '../../components/admin/agenda/RescheduleAppointmentDialog';
import { TimeGrid } from '../../components/admin/agenda/TimeGrid';
import { appointmentsService } from '../../services/appointmentsService';
import { AppointmentWithRelations, Professional } from '../../types/appointment';
import { Button } from '../../components/ui/Button';
import { Plus, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';

export const Agenda: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs & Drawers states
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(undefined);
  
  // Local simple toast implementation
  const [toastMsg, setToastMsg] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const fetchBaseData = async () => {
    try {
      const profs = await appointmentsService.fetchProfessionals();
      setProfessionals(profs);
    } catch (err) {
      console.error("Erro ao buscar profissionais:", err);
    }
  };

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const data = await appointmentsService.fetchAppointments(dateStr, selectedProfessional);
      setAppointments(data);
    } catch (err) {
      console.error("Erro ao carregar agenda:", err);
      setError("Não foi possível carregar a agenda.");
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, selectedProfessional]);

  useEffect(() => {
    fetchBaseData();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Actions Callbacks
  const handleAppointmentClick = (app: AppointmentWithRelations) => {
    setSelectedAppointment(app);
    setIsDrawerOpen(true);
  };

  const handleActionSuccess = () => {
    // Close secondary dialogs but let Drawer open (it will be updated or closed by user)
    // Actually better to close the drawer or reload data
    setIsCancelOpen(false);
    setIsCompleteOpen(false);
    setIsRescheduleOpen(false);
    setIsDrawerOpen(false); // Fechar drawer principal após ação que altera status
    loadAppointments();
  };

  const handleNoShow = async () => {
    if (!selectedAppointment) return;
    if (window.confirm("Confirmar que a paciente não compareceu?")) {
      try {
        await appointmentsService.markAppointmentNoShow(selectedAppointment.id);
        showToast("Paciente marcada como não compareceu.", "success");
        handleActionSuccess();
      } catch (err) {
        console.error(err);
        showToast("Não foi possível realizar esta operação.", "error");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-clinic-dark">Agenda</h1>
          <p className="text-gray-500 mt-1">Gerenciamento de consultas e procedimentos</p>
        </div>
        <Button onClick={() => { setSelectedTimeSlot(undefined); setIsCreateOpen(true); }} className="w-full sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <DateNavigator currentDate={currentDate} onChange={setCurrentDate} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ProfessionalFilter 
          professionals={professionals} 
          selectedProfessionalId={selectedProfessional} 
          onChange={setSelectedProfessional} 
        />
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          {appointments.length} agendamento(s)
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50/50 p-2 sm:p-4 rounded-2xl min-h-[400px]">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white animate-pulse rounded-xl border border-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="secondary" onClick={loadAppointments}>
              <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
            </Button>
          </div>
        ) : appointments.length === 0 && selectedProfessional === 'all' ? (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-xl border border-gray-100 border-dashed">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Agenda livre</h3>
            <p className="text-gray-500 mb-6">Não há atendimentos agendados para este dia.</p>
            <Button variant="secondary" onClick={() => { setSelectedTimeSlot(undefined); setIsCreateOpen(true); }}>
              + Novo agendamento
            </Button>
          </div>
        ) : (
          <TimeGrid 
            date={currentDate} 
            appointments={appointments} 
            onSlotClick={(time) => { setSelectedTimeSlot(time); setIsCreateOpen(true); }} 
            onAppointmentClick={handleAppointmentClick} 
          />
        )}
      </div>

      {/* Drawers and Dialogs */}
      <AppointmentDetailsDrawer
        appointment={selectedAppointment}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onComplete={() => setIsCompleteOpen(true)}
        onCancel={() => setIsCancelOpen(true)}
        onNoShow={handleNoShow}
        onReschedule={() => setIsRescheduleOpen(true)}
      />

      <CreateAppointmentDialog
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setSelectedTimeSlot(undefined); }}
        onSuccess={() => {
          setIsCreateOpen(false);
          setSelectedTimeSlot(undefined);
          loadAppointments();
        }}
        showToast={showToast}
        initialDate={currentDate}
        initialTime={selectedTimeSlot}
      />

      {selectedAppointment && (
        <>
          <CancelAppointmentDialog
            appointmentId={selectedAppointment.id}
            isOpen={isCancelOpen}
            onClose={() => setIsCancelOpen(false)}
            onSuccess={handleActionSuccess}
            showToast={showToast}
          />
          <CompleteAppointmentDialog
            appointmentId={selectedAppointment.id}
            isOpen={isCompleteOpen}
            onClose={() => setIsCompleteOpen(false)}
            onSuccess={handleActionSuccess}
            showToast={showToast}
          />
          <RescheduleAppointmentDialog
            appointmentId={selectedAppointment.id}
            isOpen={isRescheduleOpen}
            onClose={() => setIsRescheduleOpen(false)}
            onSuccess={handleActionSuccess}
            showToast={showToast}
          />
        </>
      )}

      {/* Local Simple Toast */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-5">
          <div className={cn(
            "px-6 py-3 rounded-xl shadow-lg border text-sm font-medium",
            toastMsg.type === 'success' ? "bg-white border-green-200 text-green-800" : "bg-white border-red-200 text-red-800"
          )}>
            {toastMsg.msg}
          </div>
        </div>
      )}
    </div>
  );
};
