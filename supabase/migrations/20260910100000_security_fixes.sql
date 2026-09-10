-- MIGRATION 1: Payload Limits Seguros (Rate Limit movido para Borda/Edge)

-- 1. Limites seguros de payload na tabela contact_requests
ALTER TABLE public.contact_requests 
DROP CONSTRAINT IF EXISTS contact_requests_message_length_check;

ALTER TABLE public.contact_requests 
ADD CONSTRAINT contact_requests_message_length_check 
CHECK (message IS NULL OR length(message) <= 2000);

ALTER TABLE public.contact_requests 
DROP CONSTRAINT IF EXISTS contact_requests_clinical_data_length_check;

ALTER TABLE public.contact_requests 
ADD CONSTRAINT contact_requests_clinical_data_length_check 
CHECK (clinical_data IS NULL OR length(clinical_data::text) <= 5000);

-- 2. Limpeza de artefatos de Rate Limit (Proteção movida para Edge Function / Turnstile)
DROP TRIGGER IF EXISTS tr_contact_requests_rate_limit_trigger ON public.contact_requests;
DROP FUNCTION IF EXISTS public.tr_contact_requests_rate_limit();
DROP TABLE IF EXISTS public.contact_rate_limits;
ALTER TABLE public.contact_requests DROP COLUMN IF EXISTS ip_address;
