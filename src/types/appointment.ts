export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';

export interface Appointment {
  id: string;
  patient_id: string;
  procedure_id: string | null;
  professional_id: string;
  status: AppointmentStatus;
  scheduled_at: string;
  duration_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  completed_at: string | null;
  completed_by: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancel_reason: string | null;
  rescheduled_to: string | null;
}

export interface PatientSearchResult {
  id: string;
  full_name: string;
  phone: string;
  email: string;
}

export interface Professional {
  id: string;
  full_name: string;
}

export interface Procedure {
  id: string;
  title: string;
  duration_minutes?: number;
}

export interface AppointmentWithRelations extends Appointment {
  patient: {
    full_name: string;
    phone: string;
    email: string;
  };
  professional: {
    full_name: string;
  };
  procedure?: {
    title: string;
  } | null;
}
