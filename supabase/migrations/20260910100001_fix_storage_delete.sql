-- MIGRATION 2: Correção do DELETE indiscriminado no bucket images e na tabela gallery

-- 1. Restringir DELETE na tabela public.gallery
DROP POLICY IF EXISTS "Gallery can be deleted by authenticated admin/staff" ON public.gallery;

CREATE POLICY "Gallery can be deleted by clinic admin" 
    ON public.gallery 
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' AND 
        public.is_clinic_admin()
    );

-- 2. Restringir DELETE no storage.objects para o bucket 'images'
DROP POLICY IF EXISTS "Images can be deleted by authenticated admin/staff" ON storage.objects;

CREATE POLICY "Images can be deleted by clinic admin" 
    ON storage.objects 
    FOR DELETE 
    USING (
        bucket_id = 'images' AND 
        auth.role() = 'authenticated' AND 
        public.is_clinic_admin()
    );
