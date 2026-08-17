-- A clínica não oferece este procedimento. Mantemos o registro histórico,
-- mas o removemos do catálogo público e de acessos diretos.
UPDATE public.procedures
SET active = false,
    updated_at = NOW()
WHERE slug = 'lipo-de-papada';
