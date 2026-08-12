-- FASE 1: AUTH + PROFILES + RLS BASE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT TO authenticated 
USING (auth.uid() = id);

-- Apenas admins podem atualizar perfis (ou ver todos)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- NINGUÉM pode alterar sua própria role ou active via aplicação pública (garantia)
-- Atualizações de role e active só poderão ser feitas por admins ou superadmins
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Funções Seguras de Verificação (SECURITY DEFINER com search_path = '')
CREATE OR REPLACE FUNCTION public.is_clinic_staff()
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'staff') 
    AND active = true
  ) INTO has_access;
  
  RETURN coalesce(has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';


CREATE OR REPLACE FUNCTION public.is_clinic_admin()
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND active = true
  ) INTO has_access;
  
  RETURN coalesce(has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';


-- FASE 2: PACIENTES
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    social_name TEXT,
    birth_date DATE,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    cpf TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    profession TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_full_name ON public.patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON public.patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can SELECT patients" ON public.patients FOR SELECT TO authenticated USING (public.is_clinic_staff());
CREATE POLICY "Staff can INSERT patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (public.is_clinic_staff());
CREATE POLICY "Staff can UPDATE patients" ON public.patients FOR UPDATE TO authenticated USING (public.is_clinic_staff()) WITH CHECK (public.is_clinic_staff());
CREATE POLICY "Admin can DELETE patients" ON public.patients FOR DELETE TO authenticated USING (public.is_clinic_admin());


-- FASE 3: ANAMNESE
CREATE TABLE IF NOT EXISTS public.anamnesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    relevant_diseases TEXT,
    allergies TEXT,
    medications TEXT,
    previous_procedures TEXT,
    professional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anamnesis_patient_id ON public.anamnesis(patient_id);

ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can SELECT anamnesis" ON public.anamnesis FOR SELECT TO authenticated USING (public.is_clinic_staff());
CREATE POLICY "Staff can INSERT anamnesis" ON public.anamnesis FOR INSERT TO authenticated WITH CHECK (public.is_clinic_staff());
CREATE POLICY "Staff can UPDATE anamnesis" ON public.anamnesis FOR UPDATE TO authenticated USING (public.is_clinic_staff()) WITH CHECK (public.is_clinic_staff());
CREATE POLICY "Admin can DELETE anamnesis" ON public.anamnesis FOR DELETE TO authenticated USING (public.is_clinic_admin());


-- FASE 4: HISTÓRICO DE ATENDIMENTOS (RECORDS)
CREATE TABLE IF NOT EXISTS public.patient_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    record_date TIMESTAMPTZ DEFAULT NOW(),
    procedure_name TEXT,
    professional_name TEXT,
    evolution_notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_records_patient_id ON public.patient_records(patient_id);

ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can SELECT patient_records" ON public.patient_records FOR SELECT TO authenticated USING (public.is_clinic_staff());
CREATE POLICY "Staff can INSERT patient_records" ON public.patient_records FOR INSERT TO authenticated WITH CHECK (public.is_clinic_staff());
CREATE POLICY "Staff can UPDATE patient_records" ON public.patient_records FOR UPDATE TO authenticated USING (public.is_clinic_staff()) WITH CHECK (public.is_clinic_staff());
CREATE POLICY "Admin can DELETE patient_records" ON public.patient_records FOR DELETE TO authenticated USING (public.is_clinic_admin());


-- FASE 5: DOCUMENTOS (TABELA E STORAGE)
CREATE TABLE IF NOT EXISTS public.patient_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    document_type TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_id ON public.patient_documents(patient_id);

ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can SELECT patient_documents" ON public.patient_documents FOR SELECT TO authenticated USING (public.is_clinic_staff());
CREATE POLICY "Staff can INSERT patient_documents" ON public.patient_documents FOR INSERT TO authenticated WITH CHECK (public.is_clinic_staff());
CREATE POLICY "Staff can UPDATE patient_documents" ON public.patient_documents FOR UPDATE TO authenticated USING (public.is_clinic_staff()) WITH CHECK (public.is_clinic_staff());
CREATE POLICY "Admin can DELETE patient_documents" ON public.patient_documents FOR DELETE TO authenticated USING (public.is_clinic_admin());


-- CONFIGURAÇÃO DO BUCKET PRIVADO NO STORAGE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'patient-documents', 
    'patient-documents', 
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- POLICIES DO STORAGE.OBJECTS (Totalmente explícitas)
CREATE POLICY "Staff can SELECT objects"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'patient-documents' AND public.is_clinic_staff());

CREATE POLICY "Staff can INSERT objects"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'patient-documents' AND public.is_clinic_staff());

CREATE POLICY "Staff can UPDATE objects"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'patient-documents' AND public.is_clinic_staff())
WITH CHECK (bucket_id = 'patient-documents' AND public.is_clinic_staff());

CREATE POLICY "Admin can DELETE objects"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'patient-documents' AND public.is_clinic_admin());
