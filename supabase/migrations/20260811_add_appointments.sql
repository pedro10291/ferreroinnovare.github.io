-- FASE 2.6: FOUNDATION DA AGENDA

-- 1. Habilitar extensão btree_gist para bloqueio de conflitos temporais
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Criação da Tabela appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    procedure_id UUID NULL REFERENCES public.procedures(id) ON DELETE SET NULL,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED')),
    notes TEXT,
    cancellation_reason TEXT,
    rescheduled_to UUID NULL REFERENCES public.appointments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON public.appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- 4. Constraint de Concorrência (EXCLUDE) - Previne choque de horários do mesmo profissional
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS prevent_overlapping_appointments;
ALTER TABLE public.appointments ADD CONSTRAINT prevent_overlapping_appointments
EXCLUDE USING GIST (
    professional_id WITH =,
    tsrange(
        scheduled_at AT TIME ZONE 'UTC',
        (scheduled_at AT TIME ZONE 'UTC') + make_interval(mins => duration_minutes),
        '[)'
    ) WITH &&
) WHERE (status = 'SCHEDULED');

-- 5. Modificação Controlada em patient_records
ALTER TABLE public.patient_records ADD COLUMN IF NOT EXISTS appointment_id UUID NULL REFERENCES public.appointments(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_patient_records_appointment_id ON public.patient_records(appointment_id);

-- 6. Triggers de Timestamp e Máquina de Estados
CREATE OR REPLACE FUNCTION public.tr_update_appointment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_appointments_timestamp ON public.appointments;
CREATE TRIGGER update_appointments_timestamp
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.tr_update_appointment_timestamp();


CREATE OR REPLACE FUNCTION public.tr_protect_appointment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Bloqueios contra retrocesso de status irreversíveis
    IF OLD.status = 'COMPLETED' AND NEW.status != 'COMPLETED' THEN
        RAISE EXCEPTION 'Não é permitido alterar o status de um agendamento já concluído.';
    END IF;
    
    IF OLD.status = 'CANCELLED' AND NEW.status != 'CANCELLED' THEN
        RAISE EXCEPTION 'Não é permitido alterar o status de um agendamento cancelado.';
    END IF;
    
    IF OLD.status = 'NO_SHOW' AND NEW.status != 'NO_SHOW' THEN
        RAISE EXCEPTION 'Não é permitido alterar o status de uma falta (no-show).';
    END IF;
    
    IF OLD.status = 'RESCHEDULED' AND NEW.status != 'RESCHEDULED' THEN
        RAISE EXCEPTION 'Não é permitido alterar o status de um agendamento reagendado.';
    END IF;
    
    -- Validação das transições permitidas a partir de SCHEDULED
    IF OLD.status = 'SCHEDULED' AND NEW.status NOT IN ('COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED', 'SCHEDULED') THEN
        RAISE EXCEPTION 'Transição de status inválida a partir de SCHEDULED.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_appointment_status ON public.appointments;
CREATE TRIGGER protect_appointment_status
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.tr_protect_appointment_status();

-- 7. Habilitar RLS e Policies
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and Admin can SELECT appointments" ON public.appointments;
CREATE POLICY "Staff and Admin can SELECT appointments" 
ON public.appointments FOR SELECT TO authenticated USING (public.is_clinic_staff());

-- INSERT, UPDATE e DELETE diretos são negados para manter o fluxo estritamente via RPCs
DROP POLICY IF EXISTS "Staff and Admin can INSERT appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff and Admin can UPDATE appointments" ON public.appointments;
-- Delete is strictly denied implicitly for appointments

-- 8. RPCs Transacionais (Security Definer)

-- 8.1 Create Appointment
CREATE OR REPLACE FUNCTION public.create_appointment(
    p_patient_id UUID,
    p_procedure_id UUID,
    p_professional_id UUID,
    p_scheduled_at TIMESTAMPTZ,
    p_duration_minutes INTEGER,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_new_id UUID;
BEGIN
    IF NOT public.is_clinic_staff() THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.patients WHERE id = p_patient_id) THEN RAISE EXCEPTION 'Paciente inválido.'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_professional_id AND role IN ('admin', 'staff') AND active = true) THEN RAISE EXCEPTION 'Profissional inválido ou inativo.'; END IF;
    
    INSERT INTO public.appointments (
        patient_id, procedure_id, professional_id, scheduled_at, duration_minutes, notes, created_by
    ) VALUES (
        p_patient_id, p_procedure_id, p_professional_id, p_scheduled_at, p_duration_minutes, p_notes, auth.uid()
    ) RETURNING id INTO v_new_id;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8.2 Cancel Appointment
CREATE OR REPLACE FUNCTION public.cancel_appointment(p_appointment_id UUID, p_reason TEXT)
RETURNS VOID AS $$
DECLARE
    v_status TEXT;
BEGIN
    IF NOT public.is_clinic_staff() THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
    IF p_reason IS NULL OR trim(p_reason) = '' THEN RAISE EXCEPTION 'Motivo do cancelamento é obrigatório.'; END IF;
    
    SELECT status INTO v_status FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Agendamento não encontrado.'; END IF;
    IF v_status != 'SCHEDULED' THEN RAISE EXCEPTION 'Apenas agendamentos SCHEDULED podem ser cancelados.'; END IF;
    
    UPDATE public.appointments 
    SET status = 'CANCELLED', cancellation_reason = p_reason, cancelled_at = NOW(), cancelled_by = auth.uid()
    WHERE id = p_appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8.3 Mark No Show
CREATE OR REPLACE FUNCTION public.mark_appointment_no_show(p_appointment_id UUID)
RETURNS VOID AS $$
DECLARE
    v_status TEXT;
BEGIN
    IF NOT public.is_clinic_staff() THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
    
    SELECT status INTO v_status FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Agendamento não encontrado.'; END IF;
    IF v_status != 'SCHEDULED' THEN RAISE EXCEPTION 'Apenas agendamentos SCHEDULED podem ser marcados como falta.'; END IF;
    
    UPDATE public.appointments SET status = 'NO_SHOW', updated_at = NOW() WHERE id = p_appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8.4 Complete Appointment (Atomic conversion + patient_record creation)
CREATE OR REPLACE FUNCTION public.complete_appointment(
    p_appointment_id UUID,
    p_evolution_notes TEXT,
    p_internal_notes TEXT
)
RETURNS UUID AS $$
DECLARE
    v_app public.appointments%ROWTYPE;
    v_proc_name TEXT;
    v_prof_name TEXT;
    v_record_id UUID;
BEGIN
    IF NOT public.is_clinic_staff() THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
    
    SELECT * INTO v_app FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Agendamento não encontrado.'; END IF;
    IF v_app.status != 'SCHEDULED' THEN RAISE EXCEPTION 'Apenas agendamentos SCHEDULED podem ser concluídos.'; END IF;
    
    IF v_app.procedure_id IS NOT NULL THEN
        SELECT title INTO v_proc_name FROM public.procedures WHERE id = v_app.procedure_id;
    END IF;
    
    SELECT full_name INTO v_prof_name FROM public.profiles WHERE id = v_app.professional_id;
    
    -- O trigger cuidará de bloquear se houvesse erro, mas validamos antes.
    UPDATE public.appointments 
    SET status = 'COMPLETED', completed_at = NOW(), completed_by = auth.uid()
    WHERE id = p_appointment_id;
    
    -- Forçar erro transacional caso o preenchimento dos campos falhe por constraints da tabela
    INSERT INTO public.patient_records (
        patient_id, appointment_id, procedure_name, professional_name, evolution_notes, internal_notes
    ) VALUES (
        v_app.patient_id, p_appointment_id, v_proc_name, v_prof_name, p_evolution_notes, p_internal_notes
    ) RETURNING id INTO v_record_id;
    
    RETURN v_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8.5 Reschedule Appointment
CREATE OR REPLACE FUNCTION public.reschedule_appointment(
    p_appointment_id UUID,
    p_new_scheduled_at TIMESTAMPTZ,
    p_new_duration_minutes INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_old_app public.appointments%ROWTYPE;
    v_new_id UUID;
BEGIN
    IF NOT public.is_clinic_staff() THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
    
    SELECT * INTO v_old_app FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Agendamento não encontrado.'; END IF;
    IF v_old_app.status != 'SCHEDULED' THEN RAISE EXCEPTION 'Apenas agendamentos SCHEDULED podem ser reagendados.'; END IF;
    
    -- Inserir novo (ativa a EXCLUDE constraint contra choque de horário atomica/sincronamente)
    INSERT INTO public.appointments (
        patient_id, procedure_id, professional_id, scheduled_at, duration_minutes, notes, created_by
    ) VALUES (
        v_old_app.patient_id, v_old_app.procedure_id, v_old_app.professional_id, p_new_scheduled_at, p_new_duration_minutes, v_old_app.notes, auth.uid()
    ) RETURNING id INTO v_new_id;
    
    -- Desativar o antigo (marca como reagendado referenciando o novo ID)
    UPDATE public.appointments 
    SET status = 'RESCHEDULED', rescheduled_to = v_new_id, updated_at = NOW()
    WHERE id = p_appointment_id;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 9. Securing the RPCs via Grants
REVOKE EXECUTE ON FUNCTION public.create_appointment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_appointment TO authenticated;

REVOKE EXECUTE ON FUNCTION public.cancel_appointment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_appointment TO authenticated;

REVOKE EXECUTE ON FUNCTION public.mark_appointment_no_show FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_appointment_no_show TO authenticated;

REVOKE EXECUTE ON FUNCTION public.complete_appointment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_appointment TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reschedule_appointment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reschedule_appointment TO authenticated;
