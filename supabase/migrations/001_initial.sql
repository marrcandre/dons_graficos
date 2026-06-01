-- Migration: 001_initial.sql
-- Criação das tabelas, RLS e trigger de primeiro login

-- ============================================================
-- Tabela: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY,           -- mesmo id do auth.users
  name        text,
  email       text,
  photo_url   text,
  gp          text,
  age         integer,
  role        text NOT NULL DEFAULT 'user',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Usuário pode ler e atualizar apenas o próprio perfil; admin pode tudo
CREATE POLICY "own profile" ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "update own profile" ON users FOR UPDATE
  USING (id = auth.uid());

-- ============================================================
-- Tabela: responses
-- ============================================================
CREATE TABLE IF NOT EXISTS responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  name            text NOT NULL,
  email           text,
  gp              text,
  age             integer,
  created_at      timestamptz NOT NULL DEFAULT now(),
  question_order  integer[],
  answers         integer[],          -- valores 0–3, indexados por question_id original (0–134)
  scores          jsonb,              -- { "0": 12, "1": 9, ... }
  ai_analysis     text,
  email_sent      boolean NOT NULL DEFAULT false,
  is_public       boolean NOT NULL DEFAULT true
);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: verifica se o usuário atual é admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
  LANGUAGE sql SECURITY DEFINER
  AS $$
    SELECT EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    );
  $$;

-- SELECT: público se is_public=true (UUID é a segurança), ou dono, ou admin
CREATE POLICY "public or own or admin" ON responses FOR SELECT
  USING (is_public = true OR user_id = auth.uid() OR is_admin());

-- INSERT: qualquer usuário autenticado
CREATE POLICY "insert authenticated" ON responses FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: apenas admin (editar ai_analysis, setar email_sent)
CREATE POLICY "admin update" ON responses FOR UPDATE
  USING (is_admin());

-- ============================================================
-- Trigger: criar perfil em users no primeiro login Google
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, photo_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Realtime: habilitar para responses (para AiAnalysis.vue)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE responses;
