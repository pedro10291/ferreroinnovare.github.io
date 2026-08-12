export interface Patient {
  id: string;
  full_name: string;
  social_name?: string | null;
  birth_date?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  cpf?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  profession?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  notes?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Anamnesis {
  id: string;
  patient_id: string;
  relevant_diseases?: string | null;
  allergies?: string | null;
  medications?: string | null;
  previous_procedures?: string | null;
  professional_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientRecord {
  id: string;
  patient_id: string;
  record_date: string;
  procedure_name?: string | null;
  professional_name?: string | null;
  evolution_notes?: string | null;
  internal_notes?: string | null;
  appointment_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientSummary {
  data: Patient[];
  count: number;
}
