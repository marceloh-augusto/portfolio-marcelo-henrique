# Arquitetura de Páginas — Portfólio Marcelo Henrique

## Como usar este arquivo
Referenciado pelo CLAUDE.md via `@ARCHITECTURE.md`. É o mapa de páginas do site: rotas, propósito de cada uma, e seções que compõem cada página. Atualize aqui **antes** de pedir pro Claude implementar uma página nova ou alterar a estrutura existente — o Claude deve consultar este arquivo, não inventar uma estrutura por conta própria.

## Árvore do site
```
Home (/)
├─ Cases        → seção na Home, com preview dos cases; cada card abre uma página de case study
│   ├─ Case Study 1 (atualmente: Yogha)
│   ├─ Case Study 2 (atualmente: Estratégia)
│   └─ Case Study 3 (atualmente: Cred Aluga)
├─ Sobre        → seção/âncora dentro da Home (confirmar se é âncora ou página dedicada)
├─ Contato      → seção/âncora dentro da Home, ou link externo (confirmar destino: mailto, WhatsApp, âncora?)
└─ Currículo    → link externo (confirmar destino: PDF, Google Drive, etc.)
```
"Cases" não é uma rota própria — é uma seção da Home que lista os cases e linka para cada página de case study. Sobre e Contato são âncoras dentro da própria Home (confirmado). Currículo continua como link externo — destino (PDF, Google Drive, etc.) ainda pendente de confirmação.

## Mapa de páginas
| Rota | Página | Objetivo |
|---|---|---|
| `/` | Home | Hero com nome/headline, seção Cases (preview dos 3 cases), Sobre resumido (âncora `#sobre`), logos de clientes, trajetória, Arquivo, Contato (âncora `#contato`) |
| `/cases/case-study-1` | Estudo de caso — atualmente **Yogha** | Hero → metadados → Problema → Restrições → Pesquisa → Decisão → MVP entregue → Outcome → O que eu faria diferente |
| `/cases/case-study-2` | Estudo de caso — atualmente **Estratégia** | mesma estrutura acima |
| `/cases/case-study-3` | Estudo de caso — atualmente **Cred Aluga** | mesma estrutura acima (ainda sem case redigido — confirmar se entra no MVP do site) |
| — | Menu Mobile (overlay, não é rota) | Navegação em tela cheia no mobile: Sobre / Cases / Currículo + bloco de contato |

## Convenção de slugs de case study
As URLs de case study usam identificador **genérico e sequencial** (`case-study-1`, `case-study-2`, ...), não o nome do case. Isso existe porque o nome do case pode mudar (o próprio case pode ser trocado, renomeado, ou reordenado) sem que isso quebre um link já compartilhado em candidatura ou LinkedIn.

O nome real de cada case fica só no conteúdo (frontmatter do MDX), nunca na URL:

| Slug (rota, fixo) | Case atual (pode mudar) |
|---|---|
| `case-study-1` | Yogha |
| `case-study-2` | Estratégia |
| `case-study-3` | Cred Aluga |

Regras:
- Ao trocar ou renomear um case, **atualize o conteúdo, nunca o slug** — a tabela acima é o único lugar que muda
- Novo case entra como `case-study-4`, `case-study-5`, etc. — nunca reaproveitando um número antigo
- Se um case for removido, não reordene os números dos que restaram — deixe o número "vago" para não confundir links antigos ainda em cache/candidaturas

## Estrutura por página
Para cada página, documente:
- **Seções (top-down)** — na ordem em que aparecem na tela
- **Dados de entrada** — de onde vem o conteúdo
- **Componentes usados** — quais componentes de `src/components/` a página consome
- **Interação** — o que anima ou reage a interação do usuário

### Exemplo — Home
- Seções: Hero (headline + CTA) → Prova social → Lista de cases (preview, linka pro slug genérico de cada um) → Sobre resumido → Footer com contato
- Dados: headline em `src/content/site-copy.ts`, lista de cases em `src/content/case-studies/*` (cada entrada de conteúdo tem `slug` e `displayName` separados)
- Componentes: `Hero`, `CaseCardPreview`, `SocialProof`, `Footer`
- Interação: scroll reveal nos cards de case (GSAP ScrollTrigger)

### Exemplo — Estudo de caso (`/cases/case-study-[n]`)
- Seções (ordem confirmada no Figma): Hero (headline + imagem de capa) → Metadados (cliente, ano, papel, duração, time, plataforma, contribuição) → Problema → Restrições → Pesquisa (com hipóteses testadas) → Decisão (tabela "Escolhemos / Invés de / Porque / Assumindo o risco de") → O que foi entregue (MVP) → Outcome (o que melhorou / o que piorou) → O que eu faria diferente
- Dados: `src/content/case-studies/case-study-[n].mdx` — o nome real do case (ex: "Yogha") vive no frontmatter (`displayName`), não no path do arquivo nem na URL
- Componentes: `CaseHero`, `CaseMetadata`, `CaseSection`, `TradeoffTable`, `ResultsList`, `HypothesisCards`, `CaseImage` (imagem clicável com recorte opcional), `BeforeAfterGroup` (pares Antes/Depois da seção "O que foi entregue" do case Estratégia)
- Variação do case 2 (Estratégia, confirmada no Figma 564:533): "Pesquisa" vem antes de "Restrições"; "O que foi entregue" usa `deliveries` (grupos com pares Antes/Depois) em vez de imagem+bullets; Outcome e "O que eu faria diferente" com 1 item viram parágrafo
- Interação: mínima — foco em leitura, sem distração

> Repita esse formato pra cada página real do seu site.

## Regras de navegação
- Toda página nova precisa ser adicionada a este arquivo antes de ser implementada
- Não crie uma rota fora deste mapa sem atualizar aqui primeiro
- Rotas de case study usam sempre o slug genérico (`case-study-N`) — nunca o nome do case. Isso já está estabelecido, não é uma decisão a ser tomada de novo a cada novo case
- Rotas já publicadas não podem mudar de padrão sem avisar — já estão linkadas em candidaturas e no LinkedIn
