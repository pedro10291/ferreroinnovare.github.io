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
  origin?: string;
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
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply DB filters
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

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contact requests:', error);
      throw error;
    }

    let results = data as ContactRequest[];

    // Origin Filter (Frontend side)
    if (filters?.origin && filters.origin !== 'all') {
      results = results.filter(req => {
        const d = req.clinical_data;
        if (!d || !d.origin) {
          return filters.origin === 'Não informado';
        }

        const o = d.origin;
        let originText = 'Não informado';
        
        if (o.reported_custom && o.reported_custom.trim() !== '') {
          originText = o.reported_custom;
        } else if (o.reported && o.reported !== 'Outro') {
          originText = o.reported;
        } else if (o.utm_source) {
          const s = o.utm_source.toLowerCase();
          if (s.includes('instagram')) originText = 'Instagram';
          else if (s.includes('facebook')) originText = 'Facebook';
          else if (s.includes('google')) originText = 'Google';
          else if (s.includes('tiktok')) originText = 'TikTok';
          else if (s.includes('whatsapp') || s.includes('wa.me')) originText = 'WhatsApp';
          else originText = s.charAt(0).toUpperCase() + s.slice(1);
        } else if (o.referrer) {
          try {
            const url = new URL(o.referrer);
            const host = url.hostname.toLowerCase();
            if (host.includes('instagram')) originText = 'Instagram';
            else if (host.includes('facebook')) originText = 'Facebook';
            else if (host.includes('google')) originText = 'Google';
            else if (host.includes('tiktok')) originText = 'TikTok';
            else if (host.includes('whatsapp') || host.includes('wa.me')) originText = 'WhatsApp';
            else if (host.includes('youtube') || host.includes('youtu.be')) originText = 'YouTube';
            else originText = url.hostname;
          } catch (e) {
            originText = o.referrer;
          }
        }
        
        // Normalização flexível
        const normalizedItem = originText.toLowerCase().trim();
        const normalizedFilter = filters.origin!.toLowerCase().trim();
        
        return normalizedItem.includes(normalizedFilter) || normalizedItem === normalizedFilter;
      });
    }

    const count = results.length;

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedData = results.slice(from, to);

    return {
      data: paginatedData,
      count
    };
  },

  async fetchAllMetrics() {
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*');
    if (error) throw error;
    return data as ContactRequest[];
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
