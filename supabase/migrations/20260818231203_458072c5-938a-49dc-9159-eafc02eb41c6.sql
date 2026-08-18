-- =========================================================
-- Cafundó — schema inicial (migração de mocks para PostgreSQL)
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

-- ---------------- matrizes ----------------
CREATE TABLE public.matrizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_brinco TEXT NOT NULL UNIQUE,
  raca TEXT NOT NULL DEFAULT 'Nelore',
  proprietario TEXT NOT NULL CHECK (proprietario IN ('Jean','Eduardo','Gustavo','Otavio')),
  data_nascimento DATE,
  status TEXT NOT NULL CHECK (status IN ('ativa','descartada','vendida','morta')),
  situacao_reprodutiva TEXT NOT NULL CHECK (situacao_reprodutiva IN ('apta','prenha','vazia','em_protocolo','descartada')),
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_matrizes_status ON public.matrizes(status);
CREATE INDEX idx_matrizes_situacao ON public.matrizes(situacao_reprodutiva);
CREATE INDEX idx_matrizes_proprietario ON public.matrizes(proprietario);
CREATE TRIGGER trg_matrizes_atualizado_em BEFORE UPDATE ON public.matrizes
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- ---------------- partos ----------------
CREATE TABLE public.partos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matriz_id UUID NOT NULL REFERENCES public.matrizes(id) ON DELETE RESTRICT,
  data_parto DATE NOT NULL,
  sexo_bezerro TEXT NOT NULL CHECK (sexo_bezerro IN ('macho','femea')),
  raca_bezerro TEXT NOT NULL,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_partos_matriz ON public.partos(matriz_id);
CREATE INDEX idx_partos_data ON public.partos(data_parto);
CREATE TRIGGER trg_partos_atualizado_em BEFORE UPDATE ON public.partos
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- ---------------- prenhezes ----------------
CREATE TABLE public.prenhezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matriz_id UUID NOT NULL REFERENCES public.matrizes(id) ON DELETE RESTRICT,
  origem TEXT NOT NULL CHECK (origem IN ('iatf','monta_natural')),
  data_confirmacao DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ativa','encerrada','perdida')),
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prenhezes_matriz ON public.prenhezes(matriz_id);
CREATE INDEX idx_prenhezes_status ON public.prenhezes(status);
CREATE UNIQUE INDEX uq_prenhez_ativa_por_matriz ON public.prenhezes(matriz_id) WHERE status = 'ativa';
CREATE TRIGGER trg_prenhezes_atualizado_em BEFORE UPDATE ON public.prenhezes
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- ---------------- protocolos_iatf ----------------
CREATE TABLE public.protocolos_iatf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data_etapa1 DATE NOT NULL,
  data_etapa2 DATE NOT NULL,
  data_etapa3 DATE NOT NULL,
  possui_repasse_touro BOOLEAN NOT NULL DEFAULT false,
  data_inicio_repasse DATE,
  data_fim_repasse DATE,
  data_prevista_diagnostico DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planejado','em_andamento','aguardando_diagnostico','finalizado')),
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_protocolos_iatf_atualizado_em BEFORE UPDATE ON public.protocolos_iatf
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- ---------------- protocolo_matrizes ----------------
CREATE TABLE public.protocolo_matrizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo_id UUID NOT NULL REFERENCES public.protocolos_iatf(id) ON DELETE CASCADE,
  matriz_id UUID NOT NULL REFERENCES public.matrizes(id) ON DELETE RESTRICT,
  etapa1_concluida BOOLEAN NOT NULL DEFAULT false,
  etapa1_data DATE,
  etapa2_concluida BOOLEAN NOT NULL DEFAULT false,
  etapa2_data DATE,
  etapa3_concluida BOOLEAN NOT NULL DEFAULT false,
  etapa3_data DATE,
  diagnostico_prenhez TEXT NOT NULL DEFAULT 'nao_avaliada' CHECK (diagnostico_prenhez IN ('prenha','vazia','nao_avaliada')),
  data_diagnostico DATE,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_protocolo_matriz UNIQUE (protocolo_id, matriz_id)
);
CREATE INDEX idx_protmat_matriz ON public.protocolo_matrizes(matriz_id);
CREATE TRIGGER trg_protocolo_matrizes_atualizado_em BEFORE UPDATE ON public.protocolo_matrizes
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- ---------------- lotes_frigorifico ----------------
CREATE TABLE public.lotes_frigorifico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data_inicio_confinamento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'em_confinamento' CHECK (status IN ('em_confinamento','finalizado')),
  observacoes TEXT,
  data_envio DATE,
  frigorifico TEXT,
  peso_total_informado NUMERIC,
  valor_recebido NUMERIC,
  media_arrobas_frigorifico NUMERIC,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_lotes_frigorifico_atualizado_em BEFORE UPDATE ON public.lotes_frigorifico
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- ---------------- lote_frigorifico_matrizes ----------------
CREATE TABLE public.lote_frigorifico_matrizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id UUID NOT NULL REFERENCES public.lotes_frigorifico(id) ON DELETE CASCADE,
  matriz_id UUID NOT NULL REFERENCES public.matrizes(id) ON DELETE RESTRICT,
  peso_inicial NUMERIC,
  peso_final NUMERIC,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_lote_matriz UNIQUE (lote_id, matriz_id)
);
CREATE INDEX idx_lotemat_lote ON public.lote_frigorifico_matrizes(lote_id);
CREATE INDEX idx_lotemat_matriz ON public.lote_frigorifico_matrizes(matriz_id);
CREATE TRIGGER trg_lote_matrizes_atualizado_em BEFORE UPDATE ON public.lote_frigorifico_matrizes
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- Impede a mesma matriz em mais de um lote aberto.
CREATE OR REPLACE FUNCTION public.check_matriz_lote_aberto()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM public.lote_frigorifico_matrizes lm
      JOIN public.lotes_frigorifico l ON l.id = lm.lote_id
     WHERE lm.matriz_id = NEW.matriz_id
       AND lm.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
       AND l.status = 'em_confinamento'
  ) THEN
    RAISE EXCEPTION 'Matriz já participa de um lote em confinamento';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_lote_matriz_unica_aberta
  BEFORE INSERT OR UPDATE OF matriz_id ON public.lote_frigorifico_matrizes
  FOR EACH ROW EXECUTE FUNCTION public.check_matriz_lote_aberto();

-- ---------------- descartes ----------------
CREATE TABLE public.descartes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matriz_id UUID NOT NULL UNIQUE REFERENCES public.matrizes(id) ON DELETE RESTRICT,
  data_descarte DATE NOT NULL,
  tipo_descarte TEXT NOT NULL DEFAULT 'individual' CHECK (tipo_descarte IN ('individual','lote')),
  motivo TEXT,
  peso NUMERIC,
  destino TEXT,
  lote_id UUID REFERENCES public.lotes_frigorifico(id) ON DELETE SET NULL,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_descartes_lote ON public.descartes(lote_id);
CREATE TRIGGER trg_descartes_atualizado_em BEFORE UPDATE ON public.descartes
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- =========================================================
-- Operações multi-tabela (transacionais)
-- =========================================================

CREATE OR REPLACE FUNCTION public.registrar_parto(
  p_matriz_id UUID,
  p_data_parto DATE,
  p_sexo_bezerro TEXT,
  p_raca_bezerro TEXT,
  p_observacoes TEXT DEFAULT NULL
)
RETURNS public.partos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parto public.partos;
BEGIN
  INSERT INTO public.partos (matriz_id, data_parto, sexo_bezerro, raca_bezerro, observacoes)
  VALUES (p_matriz_id, p_data_parto, p_sexo_bezerro, p_raca_bezerro, p_observacoes)
  RETURNING * INTO v_parto;

  UPDATE public.prenhezes
     SET status = 'encerrada'
   WHERE matriz_id = p_matriz_id AND status = 'ativa';

  UPDATE public.matrizes
     SET situacao_reprodutiva = 'apta'
   WHERE id = p_matriz_id AND status = 'ativa';

  RETURN v_parto;
END;
$$;

CREATE OR REPLACE FUNCTION public.registrar_diagnostico(
  p_participacao_id UUID,
  p_diagnostico TEXT,
  p_data DATE
)
RETURNS public.protocolo_matrizes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.protocolo_matrizes;
BEGIN
  UPDATE public.protocolo_matrizes
     SET diagnostico_prenhez = p_diagnostico,
         data_diagnostico = p_data
   WHERE id = p_participacao_id
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Participação não encontrada';
  END IF;

  IF p_diagnostico = 'prenha' THEN
    INSERT INTO public.prenhezes (matriz_id, origem, data_confirmacao, status)
    VALUES (v_row.matriz_id, 'iatf', p_data, 'ativa')
    ON CONFLICT DO NOTHING;
    UPDATE public.matrizes SET situacao_reprodutiva = 'prenha'
     WHERE id = v_row.matriz_id AND status = 'ativa';
  ELSIF p_diagnostico = 'vazia' THEN
    UPDATE public.matrizes SET situacao_reprodutiva = 'vazia'
     WHERE id = v_row.matriz_id AND status = 'ativa';
  END IF;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalizar_lote(
  p_lote_id UUID,
  p_data_envio DATE,
  p_frigorifico TEXT DEFAULT NULL,
  p_valor_recebido NUMERIC DEFAULT NULL,
  p_media_arrobas_frigorifico NUMERIC DEFAULT NULL,
  p_peso_total_informado NUMERIC DEFAULT NULL
)
RETURNS public.lotes_frigorifico
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lote public.lotes_frigorifico;
  v_membro RECORD;
BEGIN
  UPDATE public.lotes_frigorifico
     SET status = 'finalizado',
         data_envio = p_data_envio,
         frigorifico = p_frigorifico,
         valor_recebido = p_valor_recebido,
         media_arrobas_frigorifico = p_media_arrobas_frigorifico,
         peso_total_informado = p_peso_total_informado
   WHERE id = p_lote_id
  RETURNING * INTO v_lote;

  IF v_lote.id IS NULL THEN
    RAISE EXCEPTION 'Lote não encontrado';
  END IF;

  FOR v_membro IN
    SELECT * FROM public.lote_frigorifico_matrizes WHERE lote_id = p_lote_id
  LOOP
    UPDATE public.matrizes
       SET status = 'descartada', situacao_reprodutiva = 'descartada'
     WHERE id = v_membro.matriz_id;

    INSERT INTO public.descartes (matriz_id, data_descarte, tipo_descarte, destino, peso, lote_id)
    VALUES (v_membro.matriz_id, p_data_envio, 'lote', 'frigorifico', v_membro.peso_final, p_lote_id)
    ON CONFLICT (matriz_id) DO UPDATE
      SET data_descarte = EXCLUDED.data_descarte,
          tipo_descarte = 'lote',
          destino = 'frigorifico',
          peso = EXCLUDED.peso,
          lote_id = EXCLUDED.lote_id;
  END LOOP;

  RETURN v_lote;
END;
$$;

-- =========================================================
-- GRANTs + RLS
-- =========================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.matrizes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prenhezes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocolos_iatf TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocolo_matrizes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.descartes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lotes_frigorifico TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lote_frigorifico_matrizes TO anon, authenticated;
GRANT ALL ON public.matrizes, public.partos, public.prenhezes, public.protocolos_iatf,
             public.protocolo_matrizes, public.descartes, public.lotes_frigorifico,
             public.lote_frigorifico_matrizes TO service_role;

GRANT EXECUTE ON FUNCTION public.registrar_parto(UUID, DATE, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_diagnostico(UUID, TEXT, DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalizar_lote(UUID, DATE, TEXT, NUMERIC, NUMERIC, NUMERIC) TO anon, authenticated;

ALTER TABLE public.matrizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prenhezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocolos_iatf ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocolo_matrizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descartes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes_frigorifico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lote_frigorifico_matrizes ENABLE ROW LEVEL SECURITY;

-- !!! POLÍTICAS TEMPORÁRIAS DE DESENVOLVIMENTO !!!
-- Liberam acesso total enquanto a autenticação real não é implementada.
-- DEVEM ser substituídas na sprint de autenticação antes de publicar.
CREATE POLICY "TEMP dev access matrizes" ON public.matrizes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "TEMP dev access partos" ON public.partos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "TEMP dev access prenhezes" ON public.prenhezes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "TEMP dev access protocolos_iatf" ON public.protocolos_iatf FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "TEMP dev access protocolo_matrizes" ON public.protocolo_matrizes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "TEMP dev access descartes" ON public.descartes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "TEMP dev access lotes_frigorifico" ON public.lotes_frigorifico FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "TEMP dev access lote_frigorifico_matrizes" ON public.lote_frigorifico_matrizes FOR ALL USING (true) WITH CHECK (true);