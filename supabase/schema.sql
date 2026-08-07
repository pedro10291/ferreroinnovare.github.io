-- Ferrer Innovare Clinic - MVP Database Schema and RLS Policies

-- Create tables
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    procedure_desired TEXT,
    how_found_out TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.anamnesis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id),
    personal_data JSONB,
    medical_history JSONB,
    medications TEXT,
    allergies TEXT,
    surgeries TEXT,
    habits JSONB,
    notes TEXT,
    protocol_number TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    short_description TEXT,
    full_description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    phone TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Anonymous users Policies
-- Allow INSERT ONLY on contacts, patients, anamnesis
CREATE POLICY "Allow anonymous insert to patients" 
ON public.patients FOR INSERT TO anon 
WITH CHECK (true);

CREATE POLICY "Allow anonymous insert to anamnesis" 
ON public.anamnesis FOR INSERT TO anon 
WITH CHECK (true);

CREATE POLICY "Allow anonymous insert to contacts" 
ON public.contacts FOR INSERT TO anon 
WITH CHECK (true);

-- Authenticated admin policies (Full CRUD)
CREATE POLICY "Allow authenticated full CRUD on patients" 
ON public.patients FOR ALL TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full CRUD on anamnesis" 
ON public.anamnesis FOR ALL TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full CRUD on procedures" 
ON public.procedures FOR ALL TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full CRUD on gallery" 
ON public.gallery FOR ALL TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full CRUD on site_settings" 
ON public.site_settings FOR ALL TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full CRUD on contacts" 
ON public.contacts FOR ALL TO authenticated 
USING (true) WITH CHECK (true);

-- Allow anonymous SELECT on public content tables for the Landing Page
CREATE POLICY "Allow anonymous read on procedures" 
ON public.procedures FOR SELECT TO anon 
USING (is_active = true);

CREATE POLICY "Allow anonymous read on gallery" 
ON public.gallery FOR SELECT TO anon 
USING (is_active = true);

CREATE POLICY "Allow anonymous read on site_settings" 
ON public.site_settings FOR SELECT TO anon 
USING (true);
