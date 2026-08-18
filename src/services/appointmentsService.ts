import { supabase } from './supabase';
import { AppointmentWithRelations, PatientSearchResult, Procedure, Professional } from '../types/appointment';

export const appointmentsService = {
  // Controlled list of professionals (Não são usuários do painel)
  async fetchProfessionals(): Promise<Professional[]> {
    return [
      { id: 'patricia', full_name: 'Dra. Patrícia Santana' },
      { id: 'shaiane', full_name: 'Shaiane Santos' },
      { id: 'luana', full_name: 'Luana Paula' }
    ];
  },

  // Queries (RLS handles security)
  async fetchAppointments(dateStr: string, professionalId?: string): Promise<AppointmentWithRelations[]> {
    // dateStr format: 'YYYY-MM-DD'
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
      let profName = "";
      if (professionalId === 'patricia') profName = "Dra. Patrícia Santana";
      else if (professionalId === 'shaiane') profName = "Shaiane Santos";
      else if (professionalId === 'luana') profName = "Luana Paula";
      
      if (profName) {
        query = query.ilike('notes', `%[Profissional: ${profName}]%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Transform single object arrays into direct objects due to foreign keys
    return (data as any[]).map(app => {
      let profName = Array.isArray(app.professional) ? app.professional[0]?.full_name : app.professional?.full_name;
      let displayNotes = app.notes;
      if (app.notes) {
        const match = app.notes.match(/\[Profissional:\s*([^\]]+)\]/);
        if (match) {
           profName = match[1];
           displayNotes = app.notes.replace(/\[Profissional:\s*[^\]]+\]\n?/, '').trim();
        }
      }
      return {
        ...app,
        notes: displayNotes,
        patient: Array.isArray(app.patient) ? app.patient[0] : app.patient,
        professional: { full_name: profName },
        procedure: Array.isArray(app.procedure) ? app.procedure[0] : app.procedure,
      };
    }) as AppointmentWithRelations[];
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
      .select('id, title, duration')
      .eq('active', true)
      .order('title');
    if (error) throw error;
    
    return data.map((proc: any) => {
      let mins = 60;
      if (proc.duration) {
        const match = proc.duration.match(/(\d+)\s*(min|h|hr|hora)/i);
        if (match) {
           const val = parseInt(match[1]);
           const unit = match[2].toLowerCase();
           if (unit.startsWith('h')) {
              mins = val * 60;
           } else {
              mins = val;
           }
        }
      }
      return {
        id: proc.id,
        title: proc.title,
        duration_minutes: mins
      };
    });
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
    // Para satisfazer a Foreign Key sem criar usuários fakes, buscamos o ID do admin
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();
    const dbAdminId = profile?.id;
    if (!dbAdminId) throw new Error("Sistema: nenhum usuário administrativo encontrado para ancorar o agendamento.");

    let profName = "";
    if (params.professional_id === 'patricia') profName = "Dra. Patrícia Santana";
    else if (params.professional_id === 'shaiane') profName = "Shaiane Santos";
    else if (params.professional_id === 'luana') profName = "Luana Paula";
    
    const notesWithProf = profName ? `[Profissional: ${profName}]\n${params.notes || ''}` : params.notes;

    const { data, error } = await supabase.rpc('create_appointment', {
      p_patient_id: params.patient_id,
      p_procedure_id: params.procedure_id,
      p_professional_id: dbAdminId,
      p_scheduled_at: params.scheduled_at,
      p_duration_minutes: params.duration_minutes,
      p_notes: notesWithProf || null,
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
