# CLAUDE.md — Portfólio Marcelo Henrique

## 1. Visão Geral do Projeto
Site de portfólio de Marcelo Henrique, product designer, para apresentar estudos de caso a recrutadores.

Público principal: recrutadores, hiring managers e profissionais de UX avaliando a contratação de um profissional de produto.

O site precisa remover dúvidas sobre:
- Se Marcelo é a pessoa certa para a vaga
- Se ele tem as habilidades técnicas exigidas
- Se ele tem a maturidade e a experiência necessárias
- Se seu nível de UX/UI está adequado ao cargo

## 2. Stack Tecnológica
Como é um site de leitura — sem login, sem dado dinâmico de usuário — a stack mais simples que ainda escala bem é:

- **Estrutura:** Astro (gera HTML estático, ideal pra sites de conteúdo, zero JS por padrão)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Biblioteca de componentes:** nenhuma externa — componentes próprios em `src/components`, seguindo o design system do Figma
- **Animação/interação:** GSAP + ScrollTrigger para animações disparadas por scroll (parallax, reveals, transições entre seções), carregado só nos componentes que precisam via `<script>` do Astro — não infla o resto do site. Adicionar Lenis se quiser o efeito de scroll suave visto em referências como landonorris.com/on-track
- **Gestão de estado:** nenhuma (site estático); usar estado local só se algum componente interativo (ex: filtro de cases) precisar
- **Testes:** TypeScript strict como primeira camada + Playwright só se necessário checagem visual automatizada
- **Build:** Vite (embutido no Astro)
- **Backend/dados:** nenhum — conteúdo dos cases em Markdown/MDX versionado no próprio repo
- **Deploy:** Vercel

Evite frameworks como Next.js ou React puro a menos que surja necessidade real de interatividade pesada — para um portfólio isso é complexidade desnecessária. GSAP não exige React: funciona direto com JS/TS num componente `.astro`, então dá pra ter animações no nível do landonorris.com/on-track sem trocar de framework.

## 3. Arquitetura
Mapa completo de páginas e estrutura de cada uma: `@ARCHITECTURE.md`. Consulte esse arquivo antes de criar ou alterar qualquer página — não invente rota ou seção que não esteja lá.

**Diretórios principais:**
- `src/pages/` — rotas do site (home, cada estudo de caso, sobre)
- `src/components/ui/` — componentes de apresentação reutilizáveis (botão, card, tag)
- `src/components/case-study/` — componentes específicos de estudo de caso (hero, seção de contexto, galeria)
- `src/content/case-studies/` — conteúdo em MDX de cada case
- `src/layouts/` — layouts compartilhados (página padrão, layout de case study)
- `public/` — assets estáticos (imagens exportadas do Figma, favicon)

**Fluxo de dados:** conteúdo MDX → layout → página renderizada estaticamente no build. Sem chamadas de API em runtime.

**Regras de inserção:**
- Use `src/components/ui` para componentes de apresentação reutilizáveis
- Use `src/components/case-study` para UI específica de estudo de caso
- Novo conteúdo de case sempre em `src/content/case-studies/`, nunca hardcoded dentro de componentes
- Mantenha chamadas externas (se houver, ex: formulário de contato) fora dos componentes de apresentação
- Crie um `.env` apenas se algum serviço externo for adicionado (analytics, formulário, etc.)

## 4. Convenções de Codificação
- Use TypeScript estritamente; evite `any` — prefira tipos inferidos ou interfaces explícitas
- Prefira componentes funcionais
- Prefira exportações nomeadas, exceto para arquivos de rota (`.astro` em `src/pages`)
- Use async/await em vez de promises encadeadas
- Mantenha componentes com menos de 200 linhas, a menos que seja justificado
- Extraia lógica repetida para helpers em `src/lib/`
- Prefira nomes de variáveis descritivos em vez de abreviações
- Adicione comentários apenas quando a intenção não for óbvia
- Não deixe código morto ou blocos comentados

## 5. Regras de UI e Design
Valores exatos de cor, tipografia, espaçamento e padrões de movimento: `@DESIGN.md`. Fonte original: Figma "Meu portfólio novo" (figma.com/design/TA8pAlmQhTcGRQ4CHUyZpx). Se um valor não estiver em DESIGN.md, consulte o Figma via MCP antes de aproximar ou inventar.

- Estilo visual, espaçamento, tipografia e uso de componentes devem seguir exatamente os tokens definidos no Figma
- Responsividade: todo componente precisa funcionar em mobile, tablet e desktop, seguindo os breakpoints definidos no Figma
- Acessibilidade: contraste mínimo AA, todo elemento interativo navegável por teclado, imagens de case study com alt text descritivo
- Se o valor exato de um token não estiver disponível, pare e pergunte — não crie um valor "parecido"
- Padrões de interação (o que anima, quando dispara, direção, duração) devem estar documentados no Figma (prototype/notas) ou descritos por você antes da implementação — não deixe o Claude "inventar" timing e easing de animação sem referência

## 6. Conteúdo e Redação
- Use o texto exatamente como está nas telas do Figma, sem exceção — não parafraseie, não "melhore", não resuma
- Se o texto do Figma estiver incompleto ou com placeholder, sinalize antes de inventar conteúdo
- Mantenha a hierarquia de headings igual ao definido em `@DESIGN.md`: `h2` é exclusivo do nome do case na lista da Home, `h3` abre a página de um case, `h4` titula as seções internas do case — não usar `h2` dentro da própria página do case

## 7. Testes e Qualidade
Ajustei seu exemplo original: como o projeto é estático e sem lógica de negócio pesada, testes unitários extensivos seriam overhead. Se no futuro entrar um formulário de contato ou algo com lógica real, essa seção pode crescer.

Antes de considerar uma tarefa concluída:
- Rode a verificação de tipos
- Rode a verificação de lint
- Rode o build (`astro build`) e confirme que não quebra

Regras de teste:
- Não adicione testes unitários para componentes de apresentação simples
- Adicione teste (ou checagem manual documentada) só se algum componente tiver lógica real (filtro, busca, formulário)
- Verifique responsividade visualmente em pelo menos 3 breakpoints a cada mudança de UI
- Se um formulário de contato for adicionado no futuro, testar estados vazio, carregando e erro

## 8. Regras de Posicionamento de Arquivos e Componentes
- Componente usado em mais de um lugar → `src/components/ui/`
- Componente usado só dentro de um estudo de caso → `src/components/case-study/`
- Antes de criar um componente novo, procure se já existe algo parecido em `src/components/`
- Só crie uma abstração (componente genérico, helper) depois que o mesmo padrão se repetir 2x ou mais — não abstraia na primeira ocorrência
- Nomeie arquivos de componente em PascalCase (`CaseStudyHero.astro`), helpers em camelCase (`formatDate.ts`)

## 9. Regras de Segurança
- Rotas de case study usam sempre o slug genérico definido em `@ARCHITECTURE.md` (`case-study-1`, `case-study-2`, ...) — nunca o nome do case na URL, mesmo que pareça mais "amigável"
- Não altere a estrutura de URLs das páginas de case study sem avisar antes — os links já estão em uso em candidaturas e no LinkedIn
- Não remova nem reescreva texto de case study sem confirmar antes — é conteúdo estratégico de carreira, não copy genérico
- Nunca deixe chave de API, token ou credencial hardcoded no código — sempre via `.env`, com `.env` no `.gitignore`
- Preserve alt text e atributos de acessibilidade em qualquer refatoração de componente
- Sinalize antes de qualquer mudança estrutural grande (reorganizar pastas, trocar framework, mudar sistema de estilização)
