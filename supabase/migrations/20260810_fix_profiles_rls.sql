-- supabase/migrations/20260810_fix_profiles_rls.sql
-- Fase 1.1: Correção do RLS na tabela Profiles (Eliminação de Recursão)

-- 1. Remoção das policies antigas que causam recursão infinita
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 2. Refinamento de segurança nas funções (Revogar acesso público)
REVOKE EXECUTE ON FUNCTION public.is_clinic_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_clinic_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_clinic_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_clinic_staff() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_clinic_staff() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_clinic_staff() TO authenticated;

-- 3. Recriação das policies da tabela Profiles (Sem FOR ALL)

-- Staff: Pode ler o próprio profile
CREATE POLICY "Staff can SELECT own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admin: Pode listar toda a equipe
CREATE POLICY "Admin can SELECT profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_clinic_admin());

-- Admin: Pode atualizar a equipe (com proteção de auto-sabotagem)
-- A cláusula WITH CHECK garante que, se o admin estiver alterando o próprio perfil (id = auth.uid()),
-- ele é obrigado a manter role = 'admin' e active = true.
CREATE POLICY "Admin can UPDATE profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_clinic_admin())
WITH CHECK (
    public.is_clinic_admin() AND (
        id != auth.uid() OR (role = 'admin' AND active = true)
    )
);

-- 4. Proteção Absoluta contra alteração do ID
-- Um trigger BEFORE UPDATE para bloquear qualquer tentativa de modificar a chave primária
CREATE OR REPLACE FUNCTION public.prevent_profile_id_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    IF OLD.id IS DISTINCT FROM NEW.id THEN
        RAISE EXCEPTION 'Profile ID cannot be changed';
    END IF;
    RETURN NEW;
END;
$$;

-- Revogar acesso de execução direta (embora PostgREST já ignore funções que retornam TRIGGER)
REVOKE EXECUTE ON FUNCTION public.prevent_profile_id_update() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_id_update() FROM anon;

-- Abordagem idempotente: Dropa a trigger se existir antes de criar
DROP TRIGGER IF EXISTS tr_prevent_profile_id_update ON public.profiles;
CREATE TRIGGER tr_prevent_profile_id_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_id_update();
