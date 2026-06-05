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
