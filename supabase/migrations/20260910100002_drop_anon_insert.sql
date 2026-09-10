-- MIGRATION: Remoção do Acesso Público Direto (Cutover Final)

-- 1. Inspecionamos a policy original na migration de criação:
-- CREATE POLICY "Anon can INSERT contact_requests" ON public.contact_requests FOR INSERT TO anon ...

-- 2. Removemos a policy.
-- A partir deste momento, NINGUÉM não-autenticado pode enviar POST direto para a tabela via PostgREST.
-- Apenas a Supabase Edge Function (usando Service Role Key) poderá inserir novos registros.
DROP POLICY IF EXISTS "Anon can INSERT contact_requests" ON public.contact_requests;

-- O Frontend e o painel administrativo não quebrarão porque:
-- - O Frontend agora usa a Edge Function.
-- - O Painel usa o role `authenticated`, e a policy `Staff and Admin can SELECT/UPDATE/DELETE` continua intacta.
