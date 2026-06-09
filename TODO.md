# TODO — Projeto Dons Espirituais

## Sprint 1 — Experiência do Resultado

## Sprint 1.2 — PDF Baseado na Tela

**Objetivo:** eliminar o PDF artesanal e gerar o documento diretamente a partir da tela de resultados.

### Planejamento

* [ ] Criar container exportável
* [ ] Exportar página completa usando html2canvas
* [ ] Gerar múltiplas páginas automaticamente
* [ ] Garantir boa resolução
* [ ] Remover dependência da montagem manual do PDF
* [ ] Eliminar páginas especiais de recursos
* [ ] Eliminar renderização separada da análise IA
* [ ] Eliminar renderização separada de gráfico
* [ ] Validar resultado em desktop
* [ ] Validar resultado em mobile
* [ ] Comparar tamanho final do PDF

### Limpeza

* [ ] Simplificar exportPDF()
* [ ] Reduzir código da ResultsView
* [ ] Remover código legado do PDF

---

## Sprint 1.3 — Revisão da Arquitetura da Análise IA

**Objetivo:** tornar a tela de resultados apenas uma tela de exibição.

### Fluxo ideal

Teste → Resultado → IA → E-mail → Visualização

### Tarefas

* [ ] Revisar geração automática da IA
* [ ] Verificar se a análise deve ser criada antes da abertura da tela
* [ ] Avaliar fila assíncrona
* [ ] Avaliar uso de Edge Functions desacopladas
* [ ] Evitar lógica pesada dentro da ResultsView

---

## Sprint 1.4 — Limpeza do Projeto

### Componentes

* [ ] Revisar componentes não utilizados
* [ ] Revisar imports não utilizados
* [ ] Revisar refs não utilizadas
* [ ] Revisar CSS órfão

### Frontend

* [ ] Revisar rotas não utilizadas
* [ ] Revisar páginas experimentais
* [ ] Revisar assets não utilizados

---

## Sprint 2 — Conteúdo Institucional

### Página Sobre

* [ ] História do projeto
* [ ] Objetivo do teste
* [ ] Metodologia utilizada
* [ ] Limitações do teste

### FAQ

* [ ] O que são dons espirituais?
* [ ] O teste é infalível?
* [ ] Como interpretar os resultados?
* [ ] Como desenvolver meus dons?

### Contato

* [ ] Página de contato
* [ ] Formulário
* [ ] Política de privacidade

---

## Sprint 3 — Plataforma

### Usuário

* [ ] Melhorar página "Meus Resultados"
* [ ] Permitir filtros
* [ ] Permitir busca

### Administração

* [ ] Dashboard estatístico
* [ ] Distribuição dos dons
* [ ] Evolução dos testes
* [ ] Exportação CSV

### Dados

* [ ] Revisar índices do Supabase
* [ ] Revisar políticas RLS
* [ ] Revisar logs

---

## Sprint 4 — Design System

### Identidade Visual

* [ ] Padronizar espaçamentos
* [ ] Padronizar cartões
* [ ] Padronizar títulos
* [ ] Padronizar botões

### Responsividade

* [ ] Auditoria mobile
* [ ] Auditoria tablet
* [ ] Auditoria desktop

### Acessibilidade

* [ ] Contraste
* [ ] Navegação por teclado
* [ ] Leitores de tela

---

## DevOps

### Monitoramento

* [ ] Configurar UptimeRobot
* [ ] Criar endpoint healthcheck
* [ ] Monitorar Vercel
* [ ] Monitorar Supabase

### Deploy

* [ ] Revisar variáveis de ambiente
* [ ] Revisar Edge Functions
* [ ] Revisar backups

---

## Documentação

### Projeto

* [x] Criar CHANGELOG.md
* [ ] Manter CHANGELOG atualizado
* [ ] Revisar README
* [ ] Documentar arquitetura

### IA

* [ ] Documentar prompt atual
* [ ] Documentar fluxo da análise
* [ ] Registrar versões do prompt
