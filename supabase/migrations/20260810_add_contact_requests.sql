-- FASE 2.2: SOLICITAÇÕES E CONVERSÃO SEGURA

-- 1. Criação da Tabela contact_requests
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    procedure_interest TEXT,
    message TEXT,
    clinical_data JSONB,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_CONTACT', 'SCHEDULED', 'CONVERTED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    converted_patient_id UUID NULL REFERENCES public.patients(id),
    converted_at TIMESTAMPTZ NULL,
    converted_by UUID NULL REFERENCES auth.users(id)
);

-- 2. Criação de Índices
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON public.contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON public.contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_requests_phone ON public.contact_requests(phone);

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.tr_update_contact_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contact_requests_timestamp ON public.contact_requests;
CREATE TRIGGER update_contact_requests_timestamp
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW EXECUTE FUNCTION public.tr_update_contact_request_timestamp();

-- 4. Habilitação de RLS e Policies de Acesso
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- 4.1 ANON: Pode apenas inserir (solicitações que nascem limpas)
DROP POLICY IF EXISTS "Anon can INSERT contact_requests" ON public.contact_requests;
CREATE POLICY "Anon can INSERT contact_requests" 
ON public.contact_requests FOR INSERT TO anon 
WITH CHECK (
    status = 'PENDING' 
    AND converted_patient_id IS NULL 
    AND converted_at IS NULL 
    AND converted_by IS NULL
);

-- 4.2 STAFF & ADMIN: Podem ler todas as solicitações
DROP POLICY IF EXISTS "Staff and Admin can SELECT contact_requests" ON public.contact_requests;
CREATE POLICY "Staff and Admin can SELECT contact_requests" 
ON public.contact_requests FOR SELECT TO authenticated 
USING (public.is_clinic_staff());

-- 4.3 STAFF & ADMIN: Podem atualizar (o trigger abaixo impedirá atualizações maliciosas)
DROP POLICY IF EXISTS "Staff and Admin can UPDATE contact_requests" ON public.contact_requests;
CREATE POLICY "Staff and Admin can UPDATE contact_requests" 
ON public.contact_requests FOR UPDATE TO authenticated 
USING (public.is_clinic_staff()) 
WITH CHECK (public.is_clinic_staff());

-- 4.4 ADMIN: Pode deletar
DROP POLICY IF EXISTS "Admin can DELETE contact_requests" ON public.contact_requests;
CREATE POLICY "Admin can DELETE contact_requests" 
ON public.contact_requests FOR DELETE TO authenticated 
USING (public.is_clinic_admin());

-- 5. Trigger Anti-Falsificação de Conversão
CREATE OR REPLACE FUNCTION public.tr_prevent_manual_conversion()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a requisição vem diretamente da API frontend...
    IF current_user = 'authenticated' THEN
        -- Bloqueia alteração manual de status para CONVERTED
        IF NEW.status = 'CONVERTED' AND OLD.status != 'CONVERTED' THEN
            RAISE EXCEPTION 'A conversão só pode ser feita pela função convert_contact_request_to_patient.';
        END IF;
        
        -- Bloqueia a reversão de uma solicitação já convertida
        IF OLD.status = 'CONVERTED' AND NEW.status != 'CONVERTED' THEN
            RAISE EXCEPTION 'Não é permitido reverter o status de uma solicitação já convertida.';
        END IF;

        -- Torna clinical_data imutável após a conversão (Integridade Histórica)
        IF OLD.status = 'CONVERTED' AND NEW.clinical_data IS DISTINCT FROM OLD.clinical_data THEN
            RAISE EXCEPTION 'Os dados clínicos de uma solicitação convertida não podem ser alterados.';
        END IF;

        -- Bloqueia alteração manual das chaves de vínculo
        IF NEW.converted_patient_id IS DISTINCT FROM OLD.converted_patient_id OR 
           NEW.converted_by IS DISTINCT FROM OLD.converted_by OR 
           NEW.converted_at IS DISTINCT FROM OLD.converted_at THEN
            RAISE EXCEPTION 'Não é permitido alterar os dados de conversão manualmente.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_manual_conversion ON public.contact_requests;
CREATE TRIGGER prevent_manual_conversion
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW EXECUTE FUNCTION public.tr_prevent_manual_conversion();

-- 6. RPC Transacional: Conversão Segura de Request para Paciente
CREATE OR REPLACE FUNCTION public.convert_contact_request_to_patient(
    p_request_id UUID,
    p_existing_patient_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_request public.contact_requests%ROWTYPE;
    v_patient_id UUID;
    v_caller_uid UUID;
BEGIN
    v_caller_uid := auth.uid();
    IF v_caller_uid IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado.';
    END IF;

    IF NOT public.is_clinic_staff() THEN
        RAISE EXCEPTION 'Permissão negada. Apenas equipe clínica pode converter solicitações.';
    END IF;

    -- Bloqueio pessimista para evitar concorrência dupla
    SELECT * INTO v_request FROM public.contact_requests WHERE id = p_request_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitação não encontrada.';
    END IF;
    
    -- Bloqueia conversão de status inválidos
    IF v_request.status NOT IN ('PENDING', 'IN_CONTACT') THEN
        RAISE EXCEPTION 'Esta solicitação não pode ser convertida no status atual (%).', v_request.status;
    END IF;

    -- Lógica de Duplicação e Criação do Paciente
    IF p_existing_patient_id IS NOT NULL THEN
        SELECT id INTO v_patient_id FROM public.patients WHERE id = p_existing_patient_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'O paciente selecionado não existe.';
        END IF;
        
        -- Apenas atualiza a data de nascimento se o paciente ainda não tiver uma
        IF v_request.clinical_data->>'birthDate' IS NOT NULL THEN
            UPDATE public.patients 
            SET birth_date = (v_request.clinical_data->>'birthDate')::DATE 
            WHERE id = v_patient_id AND birth_date IS NULL;
        END IF;
    ELSE
        INSERT INTO public.patients (full_name, email, phone) 
        VALUES (v_request.full_name, v_request.email, v_request.phone) 
        RETURNING id INTO v_patient_id;
        
        -- Tentativa rigorosa de converter a data de nascimento (Rollback em caso de falha)
        IF v_request.clinical_data->>'birthDate' IS NOT NULL THEN
            UPDATE public.patients SET birth_date = (v_request.clinical_data->>'birthDate')::DATE WHERE id = v_patient_id;
        END IF;
    END IF;

    -- Criação da Anamnese (Versionamento Múltiplo - sempre insere nova)
    INSERT INTO public.anamnesis (
        patient_id, relevant_diseases, allergies, medications, previous_procedures, professional_notes
    ) VALUES (
        v_patient_id,
        v_request.clinical_data->>'medicalHistory',
        v_request.clinical_data->>'allergies',
        v_request.clinical_data->>'medications',
        v_request.clinical_data->>'surgeries',
        TRIM(CONCAT_WS(E'\n\n', 
            CASE WHEN v_request.clinical_data->>'habits' IS NOT NULL THEN 'Hábitos: ' || (v_request.clinical_data->>'habits') ELSE NULL END,
            CASE WHEN v_request.clinical_data->>'notes' IS NOT NULL THEN 'Observações: ' || (v_request.clinical_data->>'notes') ELSE NULL END
        ))
    );

    -- Efetiva a conversão na solicitação
    UPDATE public.contact_requests
    SET status = 'CONVERTED', converted_patient_id = v_patient_id, converted_at = NOW(), converted_by = v_caller_uid
    WHERE id = p_request_id;

    RETURN v_patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 7. Segurança de Execução da RPC (Grants/Revokes)
REVOKE EXECUTE ON FUNCTION public.convert_contact_request_to_patient(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.convert_contact_request_to_patient(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.convert_contact_request_to_patient(UUID, UUID) TO authenticated;
