import { supabase } from './supabase';
import { Patient, Anamnesis, PatientRecord } from '../types/patient';
import { Appointment } from './appointmentsService';
import { ContactRequest } from './contactRequestsService';

export const patientsService = {
  /**
   * Fetches a paginated list of patients, optionally filtering by search term (name, phone, email, cpf).
   */
  async fetchPatients(
    page: number = 1,
    limit: number = 20,
    searchTerm: string = ''
  ): Promise<{ data: Patient[]; count: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('active', true);

    if (searchTerm) {
      // Usar .or para buscar em multiplas colunas
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  /**
   * Fetches a single patient by ID.
   */
  async fetchPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes a patient safely. Tries physical delete first (for clean test data),
   * falls back to soft-delete (active = false) if relationships exist.
   */
  async deletePatient(id: string): Promise<void> {
    // Pre-check for dependencies to avoid HTTP 409 Conflict
    const [
      { count: reqCount },
      { count: appCount },
      { count: recCount },
      { count: anaCount }
    ] = await Promise.all([
      supabase.from('contact_requests').select('id', { count: 'exact', head: true }).eq('converted_patient_id', id),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('patient_id', id),
      supabase.from('patient_records').select('id', { count: 'exact', head: true }).eq('patient_id', id),
      supabase.from('anamnesis').select('id', { count: 'exact', head: true }).eq('patient_id', id)
    ]);

    const hasDependencies = (reqCount && reqCount > 0) || (appCount && appCount > 0) || (recCount && recCount > 0) || (anaCount && anaCount > 0);

    if (hasDependencies) {
      throw new Error('HAS_DEPENDENCIES');
    }

    // 1. Tenta exclusão física (seguro para dados sem relacionamentos/FKs)
    const { error: deleteError } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }
  },

  /**
   * Toggles the active status of a patient (Soft Delete / Unarchive)
   */
  async togglePatientStatus(id: string, active: boolean): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .update({ active })
      .eq('id', id);
    if (error) throw error;
  },

  /**
   * Creates a new patient manually.
   */
  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetches all anamnesis versions for a patient, ordered by newest first.
   */
  async fetchPatientAnamnesis(patientId: string): Promise<Anamnesis[]> {
    const { data, error } = await supabase
      .from('anamnesis')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetches patient records (history of procedures), ordered by newest first.
   */
  async fetchPatientRecords(patientId: string): Promise<PatientRecord[]> {
    const { data, error } = await supabase
      .from('patient_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('record_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetches the patient's appointments
   */
  async fetchPatientAppointments(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        procedures ( title ),
        profiles ( full_name )
      `)
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false }); // Fetch descending, then we sort client-side for upcoming

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetches the original contact request that resulted in this patient, if any.
   */
  async fetchPatientOriginRequest(patientId: string): Promise<ContactRequest | null> {
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .eq('converted_patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // If it fails because of zero rows, it's fine. Other errors we might want to log.
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching origin request:', error);
      return null;
    }
    return data;
  }
};
