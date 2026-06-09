# Changelog

Todas as alterações relevantes deste projeto serão documentadas aqui.

---

## [1.2.0] - Junho/2026 (Em desenvolvimento)

### Tela de Resultados

* Simplificação completa da tela de resultados.
* Criação da seção unificada "Desenvolvendo seus dons".
* Integração de reflexão e próximos passos em uma única experiência.
* Remoção dos componentes ReflectionGuide.
* Remoção dos componentes NextStepsSection.
* Remoção das ações administrativas da tela principal de resultados.
* Reorganização visual priorizando:

  * Top 3 dons
  * Gráfico
  * Perfil ministerial
  * Crescimento espiritual
  * Recursos

### Inteligência Artificial

* Simplificação da experiência da análise por IA.
* Inclusão do botão de atualização da análise.
* Revisão completa do prompt.
* Ajuste para linguagem mais pastoral, acolhedora e objetiva.
* Renomeação de "Perfil Ministerial" para "Análise dos Dons".

### Planejado para esta versão

* PDF baseado na própria tela de resultados.
* Limpeza arquitetural da ResultsView.
* Remoção de componentes obsoletos.

---

## [1.1.0] - Junho/2026

### Interface

* Melhorias na Home.
* Melhorias na AppBar.
* Padronização visual da interface.
* Aprimoramento da navegação.

### IA

* Diversas iterações de refinamento do prompt Gemini.
* Redução do tamanho da análise.
* Ajustes de clareza e objetividade.

### Backend

* Correções na geração da análise.
* Script de backfill das análises.
* Melhorias no fluxo de notificações por e-mail.
* Ajustes de CORS das Edge Functions.

---

## [1.0.0] - Maio/2026

### Recursos para o Usuário

* Página "Meus Resultados".
* Histórico de resultados.
* Compartilhamento de resultados.
* Exportação PDF.
* Gráfico de dons espirituais.
* Recursos complementares.
* Autoavanço do questionário.

### Administração

* Painel administrativo de respostas.

### IA

* Integração com Gemini.
* Geração automática de análises.

### Infraestrutura

* Implementação das funções:

  * generate-ai
  * notify-admin

* Organização das Edge Functions.

* Configuração Vercel SPA.

* Importação de histórico.

* Inclusão de idade, GP e data nos registros.

---

## [0.1.0] - Versão Inicial

### Funcionalidades

* Aplicação inicial do teste de dons espirituais.
* Questionário completo.
* Cálculo dos dons.
* Exibição dos resultados.
* Geração de gráficos.
* Estrutura inicial Vue.js + Supabase.
