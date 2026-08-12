import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { appointmentsService } from '../../../services/appointmentsService';

interface RescheduleAppointmentDialogProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const RescheduleAppointmentDialog: React.FC<RescheduleAppointmentDialogProps> = ({
  appointmentId,
  isOpen,
  onClose,
  onSuccess,
  showToast
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate('');
      setTime('');
      setDuration('60');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!date || !time) {
      showToast('Selecione a nova data e horário.', 'error');
      return;
    }
    
    // Convert to ISO string
    const newScheduledAt = new Date(`${date}T${time}:00`).toISOString();
    
    setIsLoading(true);
    try {
      await appointmentsService.rescheduleAppointment(appointmentId, newScheduledAt, parseInt(duration, 10));
      showToast('Agendamento reagendado com sucesso.', 'success');
      onSuccess();
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('prevent_overlapping_appointments') || error?.message?.includes('violates exclusion constraint')) {
        showToast('Este horário não está mais disponível. Escolha outro horário.', 'error');
      } else {
        showToast('Não foi possível reagendar o atendimento. Tente novamente.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-serif text-clinic-dark mb-4">Reagendar Atendimento</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" /> Nova Data *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Novo Horário *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duração (minutos) *
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow"
            >
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
              <option value="90">90 minutos</option>
              <option value="120">120 minutos</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} isLoading={isLoading} className="flex-1">
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
