-- Migration: Adiciona tabela gallery e bucket images
-- Essa migration foca apenas na infraestrutura mínima para a Galeria, sem alterar as tabelas clínicas.

-- 1. Tabela gallery
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na tabela gallery
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas para garantir idempotência
DROP POLICY IF EXISTS "Gallery is viewable by everyone" ON public.gallery;
DROP POLICY IF EXISTS "Gallery can be inserted by authenticated admin/staff" ON public.gallery;
DROP POLICY IF EXISTS "Gallery can be deleted by authenticated admin/staff" ON public.gallery;

-- Policy de Leitura (Pública)
CREATE POLICY "Gallery is viewable by everyone" 
    ON public.gallery 
    FOR SELECT 
    USING (true);

-- Policy de Inserção (Apenas Admin/Staff)
CREATE POLICY "Gallery can be inserted by authenticated admin/staff" 
    ON public.gallery 
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'staff') 
            AND active = true
        )
    );

-- Policy de Exclusão (Apenas Admin/Staff)
CREATE POLICY "Gallery can be deleted by authenticated admin/staff" 
    ON public.gallery 
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'staff') 
            AND active = true
        )
    );


-- 2. Storage Bucket 'images'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images', 
    'images', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Limpar policies antigas do Storage para garantir idempotência
DROP POLICY IF EXISTS "Images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Images can be uploaded by authenticated admin/staff" ON storage.objects;
DROP POLICY IF EXISTS "Images can be deleted by authenticated admin/staff" ON storage.objects;

-- Policies do Storage (Bucket images)

-- Policy de Leitura (Pública)
CREATE POLICY "Images are viewable by everyone" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'images');

-- Policy de Inserção (Apenas Admin/Staff)
CREATE POLICY "Images can be uploaded by authenticated admin/staff" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'images' AND 
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'staff') 
            AND active = true
        )
    );

-- Policy de Exclusão (Apenas Admin/Staff)
CREATE POLICY "Images can be deleted by authenticated admin/staff" 
    ON storage.objects 
    FOR DELETE 
    USING (
        bucket_id = 'images' AND 
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'staff') 
            AND active = true
        )
    );
