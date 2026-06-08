Segue um TODO consolidado com tudo o que definimos hoje sobre a evolução do sistema:

TODO — Roadmap de Evolução da Interface e Experiência do Usuário

Prioridade Geral

Objetivo

Transformar o sistema de um conjunto de telas funcionais em um produto consistente, profissional e centrado na experiência do usuário.

---

Sprint 1.1 — Evolução da Tela de Resultados

Objetivo

Transformar a tela de resultados no principal ponto de valor do sistema.

Reorganização da página

Primeira dobra (sem rolagem)

- [ ] Exibir nome do participante
- [ ] Exibir Top 3 dons
- [ ] Exibir gráfico completo
- [ ] Garantir que o resultado seja compreendido em poucos segundos

Segunda seção

- [ ] Exibir análise completa da IA
- [ ] Avaliar exibição recolhida/expansível

Terceira seção

- [ ] Agrupar reflexão e crescimento espiritual
- [ ] Integrar perguntas de reflexão
- [ ] Integrar próximos passos

Quarta seção

- [ ] Exibir recursos recomendados

Rodapé

- [ ] PDF
- [ ] Compartilhar
- [ ] Imprimir

---

Sprint 1.1.1 — Refatoração da ResultsView

Objetivo

Reduzir complexidade e eliminar duplicações.

Estrutura

- [ ] Criar ResultHeader.vue
- [ ] Criar ResultSummary.vue
- [ ] Criar ResultAnalysis.vue
- [ ] Criar ResultReflection.vue
- [ ] Criar ResultActions.vue

Código

- [ ] Extrair lógica de PDF
- [ ] Extrair lógica de compartilhamento
- [ ] Extrair lógica de impressão
- [ ] Reduzir responsabilidades da View principal

Organização

- [ ] Tornar a tela a principal fonte de verdade
- [ ] Reutilizar componentes entre tela e PDF
- [ ] Reduzir duplicação de conteúdo

---

Sprint 1.2 — PDF Profissional

Objetivo

Fazer o PDF refletir fielmente a experiência da página.

Avaliação

- [ ] Estudar geração do PDF diretamente a partir da página
- [ ] Avaliar abandono dos links clicáveis
- [ ] Garantir aparência próxima à tela

Conteúdo

- [ ] Top 3 dons
- [ ] Gráfico
- [ ] Resumo IA
- [ ] Análise completa
- [ ] Reflexão
- [ ] Próximos passos
- [ ] Recursos

---

Sprint Arquitetura 1.3 — Finalização do Teste

Objetivo

Centralizar todo o fluxo de encerramento do questionário.

Fluxo desejado

Questionário
→ Salvar respostas
→ Calcular resultado
→ Gerar análise IA
→ Enviar e-mail
→ Redirecionar para resultado

Refatoração

- [ ] Remover envio de e-mail da ResultsView
- [ ] Remover pós-processamentos da tela de resultado
- [ ] Criar fluxo único de finalização
- [ ] Garantir geração automática da análise IA
- [ ] Garantir envio automático da notificação

Benefícios

- [ ] Tela de resultado mais simples
- [ ] Fluxo mais natural
- [ ] Menos responsabilidades espalhadas

---

Sprint UI 2.0 — Design System

Objetivo

Padronizar toda a interface.

Componentes Base

- [ ] Criar AppPageHeader.vue
- [ ] Criar AppSection.vue
- [ ] Criar AppActionBar.vue
- [ ] Criar AppInfoCard.vue

Espaçamentos

Definir padrão global:

- [ ] XS = 8px
- [ ] SM = 16px
- [ ] MD = 24px
- [ ] LG = 32px
- [ ] XL = 48px

Tipografia

Reduzir quantidade de estilos.

Padrões:

- [ ] Título principal
- [ ] Título de seção
- [ ] Texto principal
- [ ] Texto auxiliar
- [ ] Metadados

Cards

Padronizar:

- [ ] Informativo
- [ ] Destaque
- [ ] Ação

---

Sprint UI 2.1 — Branding e Identidade Visual

Objetivo

Criar identidade visual consistente.

Símbolo Oficial

- [ ] Definir presente como símbolo oficial
- [ ] Remover estrelas e ícones alternativos
- [ ] Criar versão branca para AppBar
- [ ] Criar versão para PDF

Padronização

- [ ] Home
- [ ] Resultados
- [ ] Meus Resultados
- [ ] Admin
- [ ] PDF

Navegação

- [ ] Padronizar títulos
- [ ] Padronizar subtítulos
- [ ] Padronizar cabeçalhos

---

Sprint UI 2.2 — Revisão da Home

Objetivo

Consolidar a nova identidade visual.

Revisão

- [ ] Validar tipografia
- [ ] Validar espaçamentos
- [ ] Validar componentes reutilizáveis
- [ ] Integrar ao Design System

---

Sprint UI 2.3 — Revisão do Painel Administrativo

Objetivo

Simplificar a experiência administrativa.

Cabeçalho

- [ ] Melhorar título da página
- [ ] Adicionar subtítulo explicativo

Tabela

- [ ] Trocar texto "Análise IA" por ícone
- [ ] Trocar texto "E-mail" por ícone
- [ ] Adicionar indicadores visuais de status

Avaliar

- [ ] Remover botão Exportar
- [ ] Simplificar ações da tabela

Responsividade

- [ ] Revisar versão mobile

---

Sprint UI 2.4 — Auditoria Visual Completa

Objetivo

Garantir consistência em todo o sistema.

Revisar

- [ ] Home
- [ ] Questionário
- [ ] Resultados
- [ ] Meus Resultados
- [ ] Admin
- [ ] PDF

Verificar

- [ ] Espaçamentos
- [ ] Hierarquia visual
- [ ] Tipografia
- [ ] Ícones
- [ ] Cores
- [ ] Bordas
- [ ] Elevações

---

Critério Final de Conclusão

O sistema deve transmitir:

- Clareza
- Simplicidade
- Consistência
- Profissionalismo
- Identidade visual própria

O usuário deve reconhecer imediatamente que todas as telas pertencem ao mesmo produto, utilizando a mesma linguagem visual, os mesmos símbolos e a mesma hierarquia de informações.Isso já vira um roadmap bastante sólido para a versão 1.1 e para a futura 2.0 do projeto.

Sprint Arquitetura 3.0 — Revisão Estrutural do Projeto

Objetivo

Transformar o projeto em uma referência de arquitetura moderna utilizando:

- Vue 3
- Pinia
- Vuetify
- Supabase
- PostgreSQL
- Edge Functions
- Integração com IA
- Integração com E-mail

Além de garantir que o projeto permaneça simples de manter, evoluir e utilizar como material acadêmico.

---

Arquitetura 3.1 — Organização do Projeto

Objetivo

Revisar toda a estrutura de diretórios e responsabilidades.

Frontend

Revisar estrutura

- [ ] views
- [ ] components
- [ ] stores
- [ ] services
- [ ] composables
- [ ] data
- [ ] assets

Avaliar

- [ ] Componentes grandes demais
- [ ] Views com responsabilidades excessivas
- [ ] Código duplicado
- [ ] Componentes pouco reutilizáveis

Backend

Revisar

- [ ] Edge Functions
- [ ] Scripts auxiliares
- [ ] Estrutura Supabase
- [ ] SQLs de manutenção

Resultado esperado

Cada pasta deve possuir uma responsabilidade clara e facilmente explicável.

---

Arquitetura 3.2 — Revisão das Fronteiras Frontend × Backend

Objetivo

Garantir que cada funcionalidade esteja executando no local correto.

Perguntas para cada recurso

- Isso pertence ao frontend?
- Isso pertence ao backend?
- Isso deveria ser uma Edge Function?
- Isso deveria ser uma trigger?
- Isso deveria ser um job?

---

Revisar especificamente

Geração de PDF

- [ ] Confirmar se permanece no frontend
- [ ] Avaliar vantagens de mover para backend

Geração da análise IA

- [ ] Revisar fluxo atual
- [ ] Confirmar responsabilidade da Edge Function

Envio de e-mail

- [ ] Remover dependência da tela de resultados
- [ ] Integrar ao fluxo de finalização do teste

Compartilhamento

- [ ] Confirmar responsabilidade do frontend

Histórico

- [ ] Revisar consultas
- [ ] Revisar performance

---

Arquitetura 3.3 — Fluxo de Finalização do Teste

Objetivo

Centralizar todas as ações executadas após o questionário.

Fluxo desejado

Questionário

↓

Salvar respostas

↓

Calcular resultados

↓

Gerar análise IA

↓

Enviar notificação por e-mail

↓

Salvar informações complementares

↓

Redirecionar para resultado

---

Revisar

- [ ] Dependências espalhadas pela aplicação
- [ ] Chamadas duplicadas
- [ ] Processamentos tardios

Resultado esperado

A tela de resultados não deve executar tarefas de processamento.

Ela deve apenas exibir dados já prontos.

---

Arquitetura 3.4 — Configuração e Ambientes

Objetivo

Padronizar o gerenciamento de configurações.

Revisar

- [ ] .env.local
- [ ] .env.production
- [ ] Variáveis do Vercel
- [ ] Variáveis do Supabase

Verificar

- [ ] Variáveis duplicadas
- [ ] Variáveis não utilizadas
- [ ] Chaves expostas indevidamente

Documentar

- [ ] Finalidade de cada variável
- [ ] Ambiente onde é utilizada

---

Arquitetura 3.5 — Segurança

Objetivo

Garantir boas práticas.

Revisar

- [ ] Políticas RLS
- [ ] Permissões de usuários
- [ ] Permissões administrativas
- [ ] Edge Functions públicas
- [ ] Edge Functions protegidas

Verificar

- [ ] Exposição indevida de dados
- [ ] Acesso não autorizado
- [ ] Rotas administrativas

---

Arquitetura 3.6 — Qualidade de Código

Objetivo

Padronizar o desenvolvimento.

Criar padrões

Nomenclatura

- [ ] Componentes
- [ ] Views
- [ ] Stores
- [ ] Services
- [ ] Composables

Estrutura

- [ ] Tamanho máximo recomendado para Views
- [ ] Tamanho máximo recomendado para Components

Boas práticas

- [ ] Tratamento de erros
- [ ] Logs
- [ ] Mensagens ao usuário
- [ ] Comentários necessários

---

Arquitetura 3.7 — Performance

Objetivo

Identificar gargalos futuros.

Revisar

- [ ] Consultas ao Supabase
- [ ] Componentes pesados
- [ ] Geração de PDF
- [ ] Renderização de gráficos
- [ ] Carregamento da tela de resultados

Avaliar

- [ ] Lazy loading
- [ ] Cache
- [ ] Otimização de consultas

---

Arquitetura 3.8 — Documentação Técnica

Objetivo

Transformar o projeto em material de estudo.

Criar diagramas

- [ ] Arquitetura geral
- [ ] Fluxo do questionário
- [ ] Fluxo da análise IA
- [ ] Fluxo de autenticação
- [ ] Fluxo de envio de e-mail
- [ ] Fluxo de geração de PDF

Criar documentação

- [ ] Estrutura de diretórios
- [ ] Convenções adotadas
- [ ] Processo de deploy
- [ ] Processo de desenvolvimento local

---

Arquitetura 3.9 — Auditoria Final

Objetivo

Verificar se a arquitetura continua coerente após todas as evoluções.

Checklist

- [ ] Cada camada possui responsabilidade clara
- [ ] Frontend não executa tarefas de backend
- [ ] Backend não executa tarefas de apresentação
- [ ] Não existem dependências circulares
- [ ] Não existem componentes com responsabilidades excessivas
- [ ] Não existem duplicações relevantes

---

Critério de Conclusão

Ao final desta etapa, o projeto deverá:

- Ser facilmente compreendido por outro desenvolvedor.
- Servir como referência acadêmica para disciplinas de desenvolvimento web.
- Possuir separação clara entre frontend, backend e infraestrutura.
- Possuir documentação suficiente para onboarding de novos colaboradores.
- Estar preparado para evoluções futuras sem aumento significativo de complexidade.
Fase 4.1 — Conteúdo Institucional e Credibilidade do Projeto

Objetivo

Transformar o sistema de teste de dons espirituais em uma plataforma mais completa, oferecendo contexto, recursos de aprofundamento e canais de contato para os usuários.

---

Página "Sobre o Projeto"

Objetivo

Explicar claramente o propósito do teste e sua base teológica.

Seções

O que é este teste?

- [ ] Explicar o objetivo do questionário
- [ ] Explicar o conceito de dons espirituais
- [ ] Apresentar a proposta da ferramenta

Metodologia

- [ ] Explicar o modelo utilizado
- [ ] Informar a inspiração em C. Peter Wagner
- [ ] Explicar a escala de respostas
- [ ] Explicar como os resultados são calculados

Como interpretar os resultados

- [ ] Explicar que o resultado indica tendências
- [ ] Explicar que o teste não substitui discipulado
- [ ] Explicar a importância da confirmação comunitária

Limitações do teste

- [ ] Incluir nota sobre limitações da ferramenta
- [ ] Explicar que os dons se confirmam na prática
- [ ] Explicar que o teste é um instrumento de reflexão

---

Página "Sobre o Autor"

Objetivo

Humanizar o projeto e gerar confiança.

Conteúdo

Apresentação

- [ ] Nome do autor
- [ ] Breve biografia
- [ ] Contexto ministerial
- [ ] Contexto acadêmico

História do projeto

- [ ] Como surgiu a ideia
- [ ] Motivação para desenvolver a ferramenta
- [ ] Objetivos do projeto

Visão futura

- [ ] Próximos passos
- [ ] Evolução planejada da plataforma

---

Página "Recursos"

Objetivo

Centralizar materiais complementares.

Apostila

- [ ] Disponibilizar download
- [ ] Incluir descrição do conteúdo

Curso em vídeo

- [ ] Incluir link
- [ ] Incluir descrição

Livros recomendados

- [ ] Lista de referências principais
- [ ] Obras de C. Peter Wagner
- [ ] Outras recomendações relevantes

Materiais futuros

- [ ] Estudos
- [ ] PDFs
- [ ] Séries de ensino
- [ ] Recursos para discipulado

---

Página "Contato"

Objetivo

Permitir comunicação entre usuários e responsável pelo projeto.

Formulário

Campos

- [ ] Nome
- [ ] E-mail
- [ ] Assunto
- [ ] Mensagem

Backend

- [ ] Criar Edge Function para recebimento
- [ ] Enviar mensagem por e-mail
- [ ] Validar campos obrigatórios

Categorias

- [ ] Dúvidas
- [ ] Sugestões
- [ ] Correções
- [ ] Testemunhos
- [ ] Convites
- [ ] Outros assuntos

---

Página "Perguntas Frequentes (FAQ)"

Objetivo

Responder dúvidas recorrentes.

Perguntas iniciais

- [ ] O teste é bíblico?
- [ ] O resultado é definitivo?
- [ ] Posso fazer o teste novamente?
- [ ] Os dons mudam com o tempo?
- [ ] Como saber se o resultado está correto?
- [ ] O que fazer depois de descobrir meus dons?
- [ ] A análise por IA pode errar?
- [ ] Como a pontuação é calculada?

Evolução futura

- [ ] Adicionar perguntas recorrentes enviadas pelos usuários

---

Navegação e Menu

Objetivo

Melhorar a descoberta de conteúdo.

Revisar barra superior

Adicionar páginas institucionais:

- [ ] Início
- [ ] Meus Resultados
- [ ] Recursos
- [ ] Sobre
- [ ] Contato

Revisar navegação mobile

- [ ] Avaliar menu responsivo
- [ ] Avaliar drawer lateral

---

Integração com a Tela de Resultados

Objetivo

Conectar o usuário ao conteúdo complementar.

Adicionar links estratégicos

Após o resultado:

- [ ] Conheça mais sobre os dons espirituais
- [ ] Baixe a apostila
- [ ] Assista ao curso
- [ ] Entre em contato
- [ ] Saiba mais sobre o projeto

---

Credibilidade e Transparência

Objetivo

Aumentar confiança na ferramenta.

Adicionar informações

- [ ] Base teológica utilizada
- [ ] Autor do projeto
- [ ] Data da versão
- [ ] Histórico de atualizações

Rodapé

- [ ] Nome do projeto
- [ ] Versão atual
- [ ] Link para Sobre
- [ ] Link para Contato

---

Critério de Conclusão

Ao final desta fase, o projeto deverá:

- Possuir identidade clara.
- Explicar sua metodologia.
- Apresentar seu autor.
- Disponibilizar materiais de aprofundamento.
- Permitir contato dos usuários.
- Responder dúvidas frequentes.
- Transmitir maior credibilidade e profissionalismo.

# --- Versão antiga do TODO.md ---

# TODO - Versão 1.1 (Tela de Resultados e PDF)

## Sprint 1 - Reorganização da Tela de Resultados

### Objetivo

Melhorar a experiência do usuário, eliminando redundâncias e criando uma narrativa mais clara para a leitura do resultado.

### Tarefas

* Remover o componente `ReflectionGuide`.
* Revisar a ordem das seções da página.
* Manter o gráfico logo após os principais dons.
* Melhorar o cabeçalho do resultado.
* Revisar espaçamentos e hierarquia visual.
* Garantir que a página continue funcional para usuários, administradores e visualização de histórico.

### Estrutura desejada

1. Nome do participante
2. Data do teste
3. Top 3 dons
4. Gráfico completo
5. Resumo do perfil
6. Análise completa da IA
7. Próximos passos
8. Recursos recomendados
9. Histórico (quando aplicável)
10. Botões de ação

### Commit sugerido

refactor(frontend): reorganizar layout da página de resultados

---

## Sprint 2 - Resumo Executivo da IA

### Objetivo

Criar uma versão resumida da análise para leitura rápida.

### Tarefas

* Adicionar coluna `ai_summary` na tabela `responses`.
* Alterar a função `generate-ai`.
* Atualizar o prompt para gerar:

  * resumo executivo (3 a 5 linhas)
  * análise completa
* Exibir o resumo entre o gráfico e a análise completa.
* Atualizar scripts de geração e regeneração das análises.

### Estrutura esperada

Resumo do Perfil

"Seu perfil demonstra forte inclinação para ensino, discipulado e encorajamento de pessoas. Você tende a prosperar em ambientes onde pode desenvolver outros cristãos e ajudá-los em seu crescimento espiritual."

### Commit sugerido

feat(ai): adicionar resumo executivo aos resultados

---

## Sprint 3 - Simplificação da Geração de PDF

### Objetivo

Fazer o PDF refletir fielmente a página de resultados.

### Tarefas

* Avaliar bibliotecas como:

  * html2pdf.js
  * html2canvas + jsPDF
* Gerar o PDF diretamente a partir do conteúdo exibido na página.
* Eliminar a montagem manual das páginas do PDF.
* Garantir que o visual do PDF seja o mais próximo possível da tela.
* Testar geração em desktop e mobile.

### Benefícios esperados

* Menos código.
* Menos manutenção.
* Página e PDF sempre sincronizados.
* Menor chance de divergências futuras.

### Commit sugerido

refactor(pdf): gerar relatório diretamente da página de resultados

---

## Sprint 4 - Limpeza e Refatoração Final

### Objetivo

Remover código obsoleto após as mudanças anteriores.

### Tarefas

* Remover componentes não utilizados.
* Remover imports obsoletos.
* Revisar arquivos de dados e utilitários.
* Revisar warnings do Vue.
* Revisar warnings do Vite.
* Revisar tamanho dos componentes.
* Revisar nomes de componentes e funções.
* Atualizar documentação do projeto.

### Commit sugerido

chore(frontend): remover componentes e código obsoleto


