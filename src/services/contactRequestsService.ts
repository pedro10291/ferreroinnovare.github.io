import { supabase } from './supabase';

export interface ContactRequest {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  procedure_interest: string | null;
  message: string | null;
  clinical_data: any;
  status: 'PENDING' | 'IN_CONTACT' | 'SCHEDULED' | 'CONVERTED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  converted_patient_id: string | null;
  converted_at: string | null;
  converted_by: string | null;
}

export interface FetchContactRequestsFilters {
  searchTerm?: string;
  status?: string;
  procedure?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
}

export const contactRequestsService = {
  async fetchSummary() {
    // Para simplificar e evitar queries pesadas, faremos fetch apenas das contagens
    const statuses = ['PENDING', 'IN_CONTACT', 'CONVERTED', 'CANCELLED'];
    const summary: Record<string, number> = {
      PENDING: 0,
      IN_CONTACT: 0,
      CONVERTED: 0,
      CANCELLED: 0
    };

    await Promise.all(
      statuses.map(async (status) => {
        const { count, error } = await supabase
          .from('contact_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);
          
        if (!error && count !== null) {
          summary[status] = count;
        }
      })
    );
    
    return summary;
  },

  async fetchContactRequests(
    page: number = 1,
    limit: number = 20,
    filters?: FetchContactRequestsFilters
  ): Promise<PaginatedResult<ContactRequest>> {
    let query = supabase
      .from('contact_requests')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.procedure && filters.procedure !== 'all') {
      query = query.ilike('procedure_interest', `%${filters.procedure}%`);
    }

    if (filters?.searchTerm) {
      const term = `%${filters.searchTerm}%`;
      query = query.or(`full_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching contact requests:', error);
      throw error;
    }

    return {
      data: data as ContactRequest[],
      count: count || 0
    };
  },

  async updateStatus(id: string, newStatus: string): Promise<void> {
    const { error } = await supabase
      .from('contact_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  async findMatchingPatients(email?: string | null, phone?: string | null) {
    if (!email && !phone) return [];

    let orConditions = [];
    if (email) orConditions.push(`email.eq.${email}`);
    if (phone) orConditions.push(`phone.eq.${phone}`);

    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, email, phone')
      .or(orConditions.join(','));

    if (error) {
      console.error('Error finding matching patients:', error);
      throw error;
    }

    return data;
  },

  async convertRequest(requestId: string, existingPatientId?: string | null): Promise<void> {
    const { error } = await supabase.rpc('convert_contact_request_to_patient', {
      p_request_id: requestId,
      p_existing_patient_id: existingPatientId || null
    });

    if (error) {
      console.error('Error converting request:', error);
      throw error;
    }
  }
};
