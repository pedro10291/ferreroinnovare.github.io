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
      .select('*', { count: 'exact' });

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
   * Fetches patient appointments, ordering by scheduled_at ascending to show future first.
   * To separate history from upcoming, we will do it on the client side based on status or date.
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
      .single();

    // If it fails because of zero rows, it's fine. Other errors we might want to log.
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching origin request:', error);
      return null;
    }
    return data;
  }
};
