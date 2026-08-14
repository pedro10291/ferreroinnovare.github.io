-- Migration: 20260814170000_procedures_policies.sql
-- Description: Add RLS Policies for Procedures table using existing ClinicOS Auth pattern

-- Ensure RLS is enabled
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Public read access for Landing Page (idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'procedures' AND policyname = 'Public Read Access for Procedures'
    ) THEN
        CREATE POLICY "Public Read Access for Procedures" ON public.procedures FOR SELECT USING (true);
    END IF;
END $$;

-- 2. INSERT: Only authenticated clinic admins can create procedures
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'procedures' AND policyname = 'Admin can INSERT procedures'
    ) THEN
        CREATE POLICY "Admin can INSERT procedures" ON public.procedures 
        FOR INSERT TO authenticated 
        WITH CHECK (public.is_clinic_admin());
    END IF;
END $$;

-- 3. UPDATE: Only authenticated clinic admins can update procedures
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'procedures' AND policyname = 'Admin can UPDATE procedures'
    ) THEN
        CREATE POLICY "Admin can UPDATE procedures" ON public.procedures 
        FOR UPDATE TO authenticated 
        USING (public.is_clinic_admin()) 
        WITH CHECK (public.is_clinic_admin());
    END IF;
END $$;

-- 4. DELETE: Only authenticated clinic admins can delete procedures
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'procedures' AND policyname = 'Admin can DELETE procedures'
    ) THEN
        CREATE POLICY "Admin can DELETE procedures" ON public.procedures 
        FOR DELETE TO authenticated 
        USING (public.is_clinic_admin());
    END IF;
END $$;
