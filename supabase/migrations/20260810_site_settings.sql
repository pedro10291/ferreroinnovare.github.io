-- Migration: 20260810_site_settings.sql
-- Description: Create site_settings table

CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Public Read Access for Site Settings" ON site_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO site_settings (key, value) VALUES (
    'hero_content',
    '{"title": "Dra. Patrícia Ferrer", "subtitle": "Estética Avançada e Saúde", "image_url": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80"}'::jsonb
) ON CONFLICT (key) DO NOTHING;
