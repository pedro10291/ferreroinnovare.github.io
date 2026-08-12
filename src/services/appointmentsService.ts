import { supabase } from './supabase';
import { AppointmentWithRelations, PatientSearchResult, Procedure, Professional } from '../types/appointment';

export const appointmentsService = {
  // Queries (RLS handles security)
  async fetchAppointments(dateStr: string, professionalId?: string): Promise<AppointmentWithRelations[]> {
    // dateStr format: 'YYYY-MM-DD'
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    // adjust for local time if necessary, but since we store UTC, let's query the specific day in UTC boundaries or local boundaries
    // We will use local time boundary for the given date
    const start = new Date(dateStr + 'T00:00:00');
    const end = new Date(dateStr + 'T23:59:59');

    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(full_name, phone, email),
        professional:profiles(full_name),
        procedure:procedures(title)
      `)
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())
      .order('scheduled_at', { ascending: true });

    if (professionalId && professionalId !== 'all') {
      query = query.eq('professional_id', professionalId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Transform single object arrays into direct objects due to foreign keys
    return (data as any[]).map(app => ({
      ...app,
      patient: Array.isArray(app.patient) ? app.patient[0] : app.patient,
      professional: Array.isArray(app.professional) ? app.professional[0] : app.professional,
      procedure: Array.isArray(app.procedure) ? app.procedure[0] : app.procedure,
    })) as AppointmentWithRelations[];
  },

  async fetchPatients(search: string): Promise<PatientSearchResult[]> {
    if (!search || search.length < 3) return [];
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, phone, email')
      .or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
      .limit(10);
    if (error) throw error;
    return data;
  },

  async fetchProcedures(): Promise<Procedure[]> {
    const { data, error } = await supabase
      .from('procedures')
      .select('id, title, duration_minutes')
      .eq('is_active', true)
      .order('title');
    if (error) throw error;
    return data;
  },

  async fetchProfessionals(): Promise<Professional[]> {
    // Apenas admins ou equipe médica/staff autorizada a atender
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('active', true)
      .in('role', ['admin', 'staff']) // Supondo que equipe = staff ou admin
      .order('full_name');
    if (error) throw error;
    return data;
  },

  // RPC Mutations (No direct inserts/updates)
  async createAppointment(params: {
    patient_id: string;
    procedure_id: string | null;
    professional_id: string;
    scheduled_at: string;
    duration_minutes: number;
    notes?: string;
  }): Promise<string> {
    const { data, error } = await supabase.rpc('create_appointment', {
      p_patient_id: params.patient_id,
      p_procedure_id: params.procedure_id,
      p_professional_id: params.professional_id,
      p_scheduled_at: params.scheduled_at,
      p_duration_minutes: params.duration_minutes,
      p_notes: params.notes || null,
    });
    if (error) throw error;
    return data;
  },

  async cancelAppointment(appointmentId: string, reason: string): Promise<void> {
    const { error } = await supabase.rpc('cancel_appointment', {
      p_appointment_id: appointmentId,
      p_reason: reason,
    });
    if (error) throw error;
  },

  async markAppointmentNoShow(appointmentId: string): Promise<void> {
    const { error } = await supabase.rpc('mark_appointment_no_show', {
      p_appointment_id: appointmentId,
    });
    if (error) throw error;
  },

  async completeAppointment(appointmentId: string, evolutionNotes: string, internalNotes?: string): Promise<string> {
    const { data, error } = await supabase.rpc('complete_appointment', {
      p_appointment_id: appointmentId,
      p_evolution_notes: evolutionNotes,
      p_internal_notes: internalNotes || null,
    });
    if (error) throw error;
    return data; // Returns the patient_record UUID
  },

  async rescheduleAppointment(appointmentId: string, newScheduledAt: string, newDurationMinutes: number): Promise<string> {
    const { data, error } = await supabase.rpc('reschedule_appointment', {
      p_appointment_id: appointmentId,
      p_new_scheduled_at: newScheduledAt,
      p_new_duration_minutes: newDurationMinutes,
    });
    if (error) throw error;
    return data; // Returns the new appointment ID
  }
};
