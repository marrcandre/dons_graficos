# 📦 Supabase - Scripts do Projeto

Este arquivo reúne os principais scripts SQL utilizados no projeto para manutenção, correções e automações no banco de dados Supabase.

Ele serve como um “kit de emergência” e também como documentação de evolução do banco.

---

## 🔗 1. Vincular respostas antigas ao usuário (trigger automático)

Cria uma função e trigger que, ao criar um novo usuário, vincula automaticamente todas as respostas antigas com o mesmo email ao `user_id` correspondente.

### Função

```sql
CREATE OR REPLACE FUNCTION link_responses_to_user()
RETURNS TRIGGER AS $$
BEGIN

    UPDATE responses
    SET user_id = NEW.id
    WHERE user_id IS NULL
      AND LOWER(TRIM(email)) = LOWER(TRIM(NEW.email));

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;
```

### Trigger

```sql
DROP TRIGGER IF EXISTS trg_link_responses_to_user ON users;

CREATE TRIGGER trg_link_responses_to_user
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION link_responses_to_user();
```

---

## 🔧 2. Backfill manual de user_id (correção em massa)

Usado para corrigir registros antigos de responses que possuem email, mas ainda não possuem user_id.

```sql
UPDATE responses r
SET user_id = u.id
FROM users u
WHERE LOWER(TRIM(r.email)) = LOWER(TRIM(u.email))
  AND r.user_id IS NULL;
```

## 2.1 Teste antes de fazer backfill

Seleciona todas as respostas que ainda não possuem user_id, ordenadas por email.

```sql
SELECT id, name, email
FROM responses
WHERE user_id IS NULL
ORDER BY email;
```

---

## 📊 3. Listar usuários com múltiplos testes

Mostra usuários (por email) que possuem mais de um teste realizado.

```sql
SELECT
    email,
    COUNT(*) AS total_testes,
    MIN(created_at) AS primeiro_teste,
    MAX(created_at) AS ultimo_teste
FROM responses
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY total_testes DESC, ultimo_teste DESC;
```

---

## 📋 4. Listar todos os testes duplicados com detalhes

Retorna todas as respostas de usuários que possuem mais de um teste.

```sql
SELECT
    id,
    email,
    user_id,
    created_at,
    is_public,
    email_sent
FROM responses
WHERE email IN (
    SELECT email
    FROM responses
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
)
ORDER BY email, created_at DESC;
```

---

## 🧪 5. Diagnóstico de vínculo entre users e responses

Verifica se o email da tabela users está corretamente vinculado às responses.

```sql
SELECT
    r.id AS response_id,
    r.email AS response_email,
    r.user_id,
    u.id AS user_id_encontrado,
    u.email AS user_email
FROM responses r
LEFT JOIN users u
    ON LOWER(TRIM(r.email)) = LOWER(TRIM(u.email))
ORDER BY r.created_at DESC;
```

## 6. Remover usuário e associação com respostas, sem remover as respostas (caso queira manter os dados, mas desvincular do usuário):

```sql
DELETE FROM public.users
WHERE email = 'marco.mendes@ifc.edu.br';

DELETE FROM auth.users
WHERE email = 'marco.mendes@ifc.edu.br';

UPDATE responses
SET user_id = NULL
WHERE LOWER(email) = LOWER('marco.mendes@ifc.edu.br');

SELECT COUNT(*)
FROM responses
WHERE LOWER(email) = LOWER('marco.mendes@ifc.edu.br');

SELECT *
FROM responses
WHERE user_id is NULL AND
    LOWER(email) = LOWER('marco.mendes@ifc.edu.br');
```

---

## 📌 Observações importantes

- Sempre usar `LOWER(TRIM(email))` para evitar inconsistências de formatação.
- O trigger resolve apenas novos usuários.
- O backfill resolve dados antigos.
- Recomenda-se rodar o backfill após mudanças estruturais importantes no sistema.
- Esse arquivo serve como referência técnica e histórico de manutenção do banco.
