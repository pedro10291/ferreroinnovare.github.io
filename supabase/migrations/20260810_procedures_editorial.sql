-- Migration: 20260810_procedures_editorial.sql
-- Description: Editorial structure for Procedures

CREATE TABLE IF NOT EXISTS procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    image TEXT,
    category TEXT,
    benefits TEXT[],
    how_it_works TEXT[],
    pre_care TEXT[],
    post_care TEXT[],
    important_information TEXT[],
    contraindications TEXT[],
    duration TEXT,
    sessions TEXT,
    interval TEXT,
    price NUMERIC,
    price_label TEXT,
    maintenance TEXT,
    result TEXT,
    indication TEXT,
    cta_label TEXT DEFAULT 'Agendar avaliação',
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns safely if the table already existed
DO $$
BEGIN
    BEGIN ALTER TABLE procedures ADD COLUMN short_description TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN description TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN image TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN category TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN benefits TEXT[]; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN how_it_works TEXT[]; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN pre_care TEXT[]; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN post_care TEXT[]; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN important_information TEXT[]; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN contraindications TEXT[]; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN duration TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN sessions TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN interval TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN price NUMERIC; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN price_label TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN maintenance TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN result TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN indication TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN cta_label TEXT DEFAULT 'Agendar avaliação'; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN active BOOLEAN DEFAULT true; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD COLUMN display_order INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE procedures ADD CONSTRAINT procedures_slug_key UNIQUE (slug); EXCEPTION WHEN others THEN NULL; END;
END $$;

-- Enable RLS and create policy (idempotent)
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    CREATE POLICY "Public Read Access for Procedures" ON procedures FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- Inserir os 10 procedimentos com base nas diretrizes editoriais.
-- Campos de duração, preço, sessões e contraindicações preenchidos apenas com NULL já que o conteúdo real exato é opcional.
INSERT INTO procedures (
    title, slug, short_description, description, benefits, pre_care, post_care, important_information, display_order
) VALUES 
(
    'Remoção de Micropigmentação', 
    'remocao-micropigmentacao', 
    'Despigmentação segura e gradual de sobrancelhas para correção de design ou clareamento de pigmentos antigos.',
    'Procedimento especializado na remoção ou clareamento de pigmentos indesejados da sobrancelha, utilizando tecnologia que quebra as partículas de tinta sem danificar a pele circundante, permitindo que o corpo as elimine naturalmente.',
    ARRAY['Correção de assimetrias e cores indesejadas', 'Preparo da pele para novos procedimentos', 'Processo seguro que preserva os pelos naturais', 'Recuperação gradual da naturalidade'],
    ARRAY['Evitar exposição solar na área tratada', 'Não utilizar ácidos ou clareadores na região', 'Comparecer com a pele limpa e sem maquiagem'],
    ARRAY['Não manipular as crostas', 'Utilizar protetor solar rigorosamente', 'Aplicar apenas pomadas recomendadas pela profissional', 'Evitar calor excessivo (saunas, banhos muito quentes)'],
    ARRAY['Os resultados variam conforme a profundidade, tempo e cor do pigmento original.', 'Múltiplas sessões podem ser necessárias para o clareamento total.'],
    1
),
(
    'Despigmentação de Tatuagem', 
    'despigmentacao-tatuagem', 
    'Clareamento progressivo e seguro de tatuagens indesejadas, focado na integridade da pele.',
    'A despigmentação de tatuagem atua diretamente nas partículas de tinta, fragmentando-as para que o sistema imunológico as elimine. O tratamento é focado em clarear o desenho gradualmente mantendo a saúde da pele.',
    ARRAY['Clareamento eficaz de diversos pigmentos', 'Preservação da integridade estrutural da pele', 'Sessões personalizadas conforme a tinta', 'Recuperação progressiva da estética natural'],
    ARRAY['Proteger a área tratada do sol', 'Informar o uso de medicações contínuas', 'Manter a pele bem hidratada nos dias anteriores'],
    ARRAY['Evitar exposição solar na área', 'Não coçar ou arrancar as crostas', 'Evitar piscinas e mar durante a cicatrização inicial', 'Seguir a rotina de cuidados tópicos recomendada'],
    ARRAY['Tatuagens amadoras e profissionais respondem de forma diferente.', 'Cores mais claras podem exigir maior número de sessões.'],
    2
),
(
    'Harmonização Facial', 
    'harmonizacao-facial', 
    'Equilíbrio, proporção e naturalidade, respeitando as características individuais e únicas de cada rosto.',
    'Um planejamento estético global focado em realçar a beleza natural. A Harmonização Facial analisa proporções, simetria e necessidades individuais, combinando diferentes técnicas para devolver volume, contorno e suavidade ao rosto.',
    ARRAY['Realce dos traços naturais', 'Reposição de volumes faciais perdidos', 'Melhora da simetria e proporção', 'Resultados elegantes e discretos'],
    ARRAY['Suspender uso de anticoagulantes (se autorizado pelo médico)', 'Evitar consumo de álcool 24h antes', 'Informar o uso de ácidos e medicações'],
    ARRAY['Não massagear a região tratada', 'Evitar exercícios físicos intensos nas primeiras 24h', 'Não deitar de bruços no primeiro dia', 'Evitar calor excessivo (sol, saunas)'],
    ARRAY['O resultado é construído de forma gradual.', 'O planejamento é totalmente individualizado; o que se aplica a um paciente pode não ser o indicado para outro.'],
    3
),
(
    'Perfiloplastia', 
    'perfiloplastia', 
    'Alinhamento e harmonia do perfil facial, equilibrando proporções entre nariz, lábios e mento.',
    'Procedimento que avalia e equilibra o rosto visto de perfil. Através do preenchimento estratégico, é possível alinhar as proporções do nariz, lábios e queixo (mento), resultando em um perfil muito mais elegante e simétrico.',
    ARRAY['Melhora da harmonia do perfil', 'Projeção adequada do mento (queixo)', 'Alinhamento não cirúrgico do nariz', 'Equilíbrio labial na visão lateral'],
    ARRAY['Evitar uso de anti-inflamatórios e AAS', 'Comunicar histórico de alergias ou preenchimentos prévios', 'Estar com a pele limpa e íntegra'],
    ARRAY['Evitar manipular as áreas tratadas', 'Dormir de barriga para cima nos primeiros dias', 'Evitar uso de maquiagem nas primeiras 12h', 'Aplicar gelo com proteção, caso orientado'],
    ARRAY['Procedimento minimamente invasivo, sem cortes.', 'Resultados podem variar de acordo com as proporções anatômicas naturais do paciente.'],
    4
),
(
    'Micropigmentação de Sobrancelhas', 
    'micropigmentacao', 
    'Design personalizado e implantação de pigmento para realçar e corrigir o formato das sobrancelhas com extrema naturalidade.',
    'Técnica que visa redefinir, preencher e dar formato às sobrancelhas de maneira natural e harmônica com o formato do rosto, utilizando pigmentos específicos implantados na camada superficial da pele.',
    ARRAY['Correção de falhas e assimetrias', 'Design projetado para as medidas do seu rosto', 'Efeito natural (técnica fio a fio ou shadow)', 'Praticidade no dia a dia'],
    ARRAY['Não remover os pelos da sobrancelha na semana anterior', 'Evitar exposição solar excessiva', 'Suspender o uso de ácidos na região da testa e olhos'],
    ARRAY['Evitar sol direto durante a fase de cicatrização', 'Não molhar a região nas primeiras horas (conforme orientação)', 'Não arrancar as casquinhas de cicatrização', 'Evitar vapor e transpiração excessiva nos primeiros dias'],
    ARRAY['A cor clareia gradualmente cerca de 30% após a cicatrização.', 'Um retoque costuma ser necessário após 30 a 45 dias.'],
    5
),
(
    'Fios de PDO', 
    'fios-de-pdo', 
    'Bioestimulação profunda de colágeno e sustentação dos tecidos para um rosto mais firme e rejuvenescido.',
    'Tratamento que utiliza fios absorvíveis de Polidioxanona (PDO) inseridos sob a pele. Eles promovem um efeito de tração (lifting não cirúrgico) e/ou atuam como potentes bioestimuladores, aumentando a produção natural de colágeno.',
    ARRAY['Estímulo contínuo de colágeno', 'Efeito lifting sutil e natural', 'Melhora da flacidez e qualidade da pele', 'Fios 100% biocompatíveis e absorvíveis'],
    ARRAY['Informar sobre preenchimentos prévios na região', 'Evitar anti-inflamatórios e anticoagulantes (sob orientação)', 'Pele deve estar livre de infecções ativas'],
    ARRAY['Evitar expressões faciais exageradas nos primeiros dias', 'Evitar exercícios físicos de impacto', 'Não massagear o rosto', 'Dormir com a barriga para cima por pelo menos uma semana'],
    ARRAY['Os resultados de colágeno começam a se tornar mais evidentes após 30 a 60 dias.', 'A duração dos efeitos pode variar.'],
    6
),
(
    'Limpeza de Pele Profissional', 
    'limpeza-de-pele', 
    'Higienização profunda, desobstrução de poros e renovação celular para uma pele iluminada e saudável.',
    'Mais do que uma extração, um verdadeiro tratamento facial. A limpeza de pele profissional remove cravos, miliuns e impurezas profundas, renovando o tecido e preparando a pele para absorver melhor os ativos de skincare.',
    ARRAY['Desobstrução e refinamento dos poros', 'Controle da oleosidade e prevenção da acne', 'Remoção profunda de impurezas e células mortas', 'Pele mais macia, uniforme e luminosa'],
    ARRAY['Evitar o uso de ácidos esfoliantes 48h antes', 'Informar sobre o uso de Roacutan ou sensibilizantes', 'Evitar bronzeamento recente'],
    ARRAY['Usar protetor solar rigorosamente', 'Evitar maquiagem nas primeiras 12h a 24h', 'Não esfoliar a pele nos dias seguintes', 'Utilizar os hidratantes calmantes recomendados'],
    ARRAY['Recomendado a cada 30 ou 45 dias para manutenção da saúde da pele.'],
    7
),
(
    'Toxina Botulínica', 
    'toxina-botulinica', 
    'Tratamento para suavizar linhas de expressão, proporcionando um rosto descansado sem perder a naturalidade dos movimentos.',
    'Através do relaxamento seletivo de músculos faciais específicos, a Toxina Botulínica atenua rugas dinâmicas (como pés de galinha e marcas na testa), prevenindo a formação de rugas estáticas profundas.',
    ARRAY['Suavização eficaz das linhas de expressão', 'Prevenção de novas marcas', 'Aparência facial mais descansada e leve', 'Preservação da expressão natural (sem efeito congelado)'],
    ARRAY['Evitar uso de AAS e anticoagulantes', 'Informar gravidez ou doenças neuromusculares', 'Estar com a pele saudável no local da aplicação'],
    ARRAY['Não deitar ou abaixar a cabeça nas 4 primeiras horas', 'Não massagear ou esfregar a área tratada', 'Evitar atividades físicas intensas no primeiro dia', 'Não usar maquiagem pesada ou chapéu apertado logo após'],
    ARRAY['O resultado inicia-se em média após 3 a 5 dias, com pico em 15 dias.', 'Cada organismo metaboliza a toxina em tempos diferentes.'],
    8
),
(
    'Remoção de Verrugas', 
    'remocao-de-verrugas', 
    'Tratamento seguro e preciso para a eliminação de pequenas lesões benignas e sinais indesejados.',
    'Remoção estética e cuidadosa de verrugas e acrocórdons. O procedimento é realizado com técnica precisa para garantir conforto, recuperação rápida e o melhor resultado estético possível na cicatrização.',
    ARRAY['Melhora imediata da estética local', 'Alívio de incômodos causados pelo atrito', 'Procedimento rápido e minimamente invasivo', 'Foco na qualidade da cicatrização'],
    ARRAY['Avaliação prévia para confirmar a natureza benigna da lesão', 'Pele limpa e sem produtos irritantes', 'Informar tendência a queloides'],
    ARRAY['Manter a região limpa e seca', 'Não arrancar a crosta protetora (casquinha)', 'Evitar exposição solar na lesão em cicatrização', 'Aplicar pomada cicatrizante se recomendado'],
    ARRAY['Nem todo sinal pode ser removido no consultório estético; a avaliação clínica é fundamental.'],
    9
),
(
    'Preenchimento Labial', 
    'preenchimento-labial', 
    'Hidratação, contorno e volume sob medida para lábios harmônicos, sensuais e naturalmente elegantes.',
    'Utilizando ácido hialurônico, o preenchimento labial devolve a estrutura, o contorno e a hidratação dos lábios. O planejamento respeita a anatomia individual para evitar exageros e entregar lábios sutis e atraentes.',
    ARRAY['Melhora do contorno e definição labial', 'Hidratação profunda ("gloss effect")', 'Correção de assimetrias sutis', 'Volume ajustado ao perfil e desejo da paciente'],
    ARRAY['Evitar medicamentos que afinam o sangue (sob liberação)', 'Evitar consumir bebidas alcoólicas na véspera', 'Informar histórico de Herpes Labial'],
    ARRAY['Evitar bebidas e alimentos muito quentes no primeiro dia', 'Não pressionar ou massagear os lábios', 'Evitar exercícios físicos intensos nas primeiras 24h', 'Dormir com a cabeça ligeiramente elevada'],
    ARRAY['É normal ocorrer leve inchaço e vermelhidão nos primeiros dias.', 'Se houver histórico de herpes, pode ser recomendada profilaxia.'],
    10
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    benefits = EXCLUDED.benefits,
    pre_care = EXCLUDED.pre_care,
    post_care = EXCLUDED.post_care,
    important_information = EXCLUDED.important_information,
    display_order = EXCLUDED.display_order;
