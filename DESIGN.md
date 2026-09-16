---
colors:
  neutral-50: "#FAF9F7"
  neutral-100: "#EFEEEC"
  neutral-200: "#D9D8D6"
  neutral-400: "#959492"
  neutral-500: "#757473"
  neutral-700: "#444342"
  neutral-800: "#2D2C2B"
  neutral-900: "#1F1E1D"
  neutral-950: "#0F0E0D"
  brand-500: "#B67C3A"
  background-light: "{colors.neutral-50}"
  background-dark: "{colors.neutral-950}"
  foreground-on-light: "{colors.neutral-900}"
  foreground-on-dark: "{colors.neutral-50}"
  muted: "{colors.neutral-400}"
  border-light: "{colors.neutral-100}"
  border-dark: "{colors.neutral-800}"
  accent: "{colors.brand-500}"

fonts:
  primary: "Figtree"
  primary-weights: [400, 600, 700]
  logo: "Greed Standard-TRIAL"
  logo-note: "fonte de licença comercial/trial, usada exclusivamente no '.' e 'M.' do logotipo — confirmar licença antes de ir pra produção e definir uma fonte de fallback"

typography:
  desktop:
    display:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 96px
      lineHeight: 1.2
    h1:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 72px
      lineHeight: 1.1
    h2:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 64px
      lineHeight: 1.2
    h3:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 40px
      lineHeight: 1.3
    h4:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 32px
      lineHeight: 1.3
    lead:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 40px
      lineHeight: 1.5
      letterSpacing: -1px
    body:
      fontFamily: Figtree
      fontWeight: 400
      fontSize: 20px
      lineHeight: 1.5
    body-bold:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 20px
      lineHeight: 1.4
    overline:
      fontFamily: Figtree
      fontWeight: 400
      fontSize: 20px
      lineHeight: 1.5
      letterSpacing: 2px
    caption:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 14px
      lineHeight: 1.5
    tag:
      fontFamily: Figtree
      fontWeight: 400
      fontSize: 16px
      lineHeight: 1.5
    button:
      fontFamily: Figtree
      fontWeight: 600
      fontSize: 16px
      lineHeight: 1
    nav-link:
      fontFamily: Figtree
      fontWeight: 600
      fontSize: 16px
      lineHeight: 1
    link-button:
      fontFamily: Figtree
      fontWeight: 400
      fontSize: 16px
      lineHeight: 1
    logo:
      fontFamily: "Greed Standard-TRIAL"
      fontWeight: 500
      fontSize: 40px
      lineHeight: 1
  mobile:
    display:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 48px
      lineHeight: 1.2
    h1:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 40px
      lineHeight: 1.1
    h2:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 32px
      lineHeight: 1.2
    h3:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 28px
      lineHeight: 1.3
    h4:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 20px
      lineHeight: 1.3
    lead:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 20px
      lineHeight: 1.5
      letterSpacing: -1px
    body:
      fontFamily: Figtree
      fontWeight: 400
      fontSize: 16px
      lineHeight: 1.5
    body-bold:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 16px
      lineHeight: 1.5
    overline:
      fontFamily: Figtree
      fontWeight: 400
      fontSize: 14px
      lineHeight: 1.5
      letterSpacing: 2px
    caption:
      fontFamily: Figtree
      fontWeight: 700
      fontSize: 12px
      lineHeight: 1.3
    tag:
      fontFamily: Figtree
      fontWeight: 400
      fontSize: 13px
      lineHeight: 1.5
    button:
      fontFamily: Figtree
      fontWeight: 600
      fontSize: 16px
      lineHeight: 1
    nav-link:
      fontFamily: Figtree
      fontWeight: 600
      fontSize: 14px
      lineHeight: 1
    link-button:
      fontFamily: Figtree
      fontWeight: 400
      fontSize: 14px
      lineHeight: 1.5

spacing:
  xs: 4px
  sm: 8px
  sm-plus: 12px
  md: 16px
  md-plus: 20px
  lg: 24px
  xl: 32px
  2xl: 40px
  3xl: 48px
  4xl: 64px
  5xl: 80px
  6xl: 96px

rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 32px
  card: 20px
  full: 999px

elevation:
  sm: "0px 4px 4.75px rgba(0,0,0,0.10)"

breakpoints:
  mobile: 375px
  tablet: 768px
  desktop: 1440px
  wide: 1440px
  tablet-note: "não existe frame de tablet desenhado no Figma — 768px é um valor padrão de mercado, não confirmado"
  wide-note: "pedido direto do usuário (não vem do Figma) — a partir de 1440px a margem lateral de página cresce de {spacing.5xl} (80px) para 120px, mas SÓ nas páginas de case study. A Home fica sempre em 80px em qualquer largura (pedido explícito do usuário). ContatoSection ('Vamos conversar?') também fica sempre em 80px, mesmo dentro de uma página de case."

components:
  nav-pill:
    backgroundColor: "{colors.background-light}"
    border: "1px solid {colors.border-light}"
    rounded: "{rounded.lg}"
    elevation: "{elevation.sm}"
  nav-link-idle-on-light:
    textColor: "{colors.neutral-700}"
  nav-link-idle-on-dark:
    textColor: "{colors.neutral-100}"
  language-toggle-active:
    backgroundColor: "{colors.neutral-900}"
    textColor: "{colors.background-light}"
    rounded: "{rounded.sm}"
  language-toggle-inactive:
    textColor: "{colors.neutral-700}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.neutral-100}"
    rounded: "{rounded.full}"
    padding: "13px 23px 11px"
  tag-pill:
    backgroundColor: "{colors.neutral-900}"
    textColor: "{colors.neutral-100}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  case-cover-image-desktop:
    rounded: "{rounded.xl}"
  case-cover-image-mobile:
    rounded: "{rounded.lg}"
  hypothesis-card:
    backgroundColor: "{colors.neutral-100}"
    rounded: "{rounded.card}"
    padding: "24px 28px"
  badge-status:
    backgroundColor: "{colors.neutral-200}"
    textColor: "{colors.neutral-500}"
    rounded: "{rounded.full}"
    padding: "5px 12px"
---

# Design System — Portfólio Marcelo Henrique

## Como preencher e manter
Extraído via Figma MCP dos 5 frames de referência (Início Desktop/Mobile, Menu Mobile, Case Yogha Desktop/Mobile) do arquivo "Meu portfólio novo". Sempre que novas telas forem adicionadas ao Figma, extraia os tokens novos e atualize este arquivo — nunca deixe o Claude aproximar um valor que não esteja aqui.
Referenciado pelo CLAUDE.md via `@DESIGN.md`.

## Overview / Brand & Style
Site editorial e denso em conteúdo, com contraste forte entre seções claras (`{colors.background-light}`) e escuras (`{colors.background-dark}`). Tom sóbrio e confiante — tipografia grande faz o trabalho visual, com pouquíssimo elemento decorativo. A cor de destaque (`{colors.accent}`) aparece com moderação, quase como pontuação.

## Colors
Fundo claro `{colors.background-light}` e texto escuro `{colors.foreground-on-light}` nas seções de abertura (hero, sobre). Fundo escuro `{colors.background-dark}` e texto claro `{colors.foreground-on-dark}` nas seções de prova/conteúdo (lista de cases, trajetória, footer).
`{colors.accent}` é reservado para: o ponto final de "Marcelo Henrique.", palavras-chave dentro de parágrafos de destaque, e o botão CTA principal — nunca como fundo de tag ou elemento decorativo.
`{colors.muted}` cobre texto secundário (datas, metadados). Bordas usam `{colors.border-light}` em fundo claro e `{colors.border-dark}` em fundo escuro.

## Typography
Escala tem conjunto **desktop** e **mobile** separado — use sempre a variante certa por breakpoint, nunca escale um valor desktop no mobile por conta própria.
- `h1` é exclusivo do nome/headline principal da Home
- `h2` é exclusivo do nome do case dentro da lista "Cases Selecionados" — nunca usar dentro da própria página do case
- `h3` abre a página de um case (o título/resultado do case)
- `h4` titula as seções internas do case (Problema, Restrições, Pesquisa, Decisão, etc.)
- `lead` é o parágrafo de destaque da seção Sobre
- `overline` é o rótulo em caixa alta acima de cada seção (ex: "CASES SELECIONADOS", "SOBRE")
- `logo` usa a fonte `{fonts.logo}` — nunca aplicar essa fonte em outro lugar
- `caption` (desktop 14px e mobile 12px) é **bold** (pedido explícito do usuário — desvio do peso original do Figma, que era Regular/400) — vale em toda ocorrência do estilo, em qualquer página do site

## Layout & Spacing
Margens de página: `{spacing.5xl}` (80px) no desktop (1280px+), `{spacing.md-plus}` (20px) no mobile — isso vale pra HOME em qualquer largura (pedido explícito do usuário: a Home nunca passa de 80px). Só as páginas de CASE STUDY crescem pra 120px a partir de `{breakpoints.wide}` (1440px+); dentro delas, a seção `ContatoSection` ("Vamos conversar?") é a exceção que não cresce, fica sempre em 80px.
Espaço entre as seções da página de case study (Hero, Metadados, Problema, Restrições, Pesquisa, Decisão, MVP, Outcome, "O que eu faria diferente", Contato): `{spacing.6xl}` (96px) — valor literal extraído do frame Figma "Case Yogha [Web]" (node 242:813, gap do container raiz). Gap entre título e conteúdo de uma seção: `{spacing.lg}` a `{spacing.xl}`.
Nunca usar um valor de espaçamento fora da escala definida.

## Elevation & Depth
Só existe um nível de elevação no sistema (`{elevation.sm}`), usado nos elementos flutuantes sobre imagem (navbar, seletor de idioma). Não inventar um segundo nível sem necessidade real.

## Shapes
`{rounded.sm}` (8px) para itens de navegação e botões pequenos. `{rounded.md}` (12px) para ícones/botões mobile. `{rounded.lg}` (16px) para cards e imagens mobile. `{rounded.xl}` (32px) para imagens de capa de case no desktop. `{rounded.full}` para tags e o botão CTA principal.

## Components
- **nav-pill**: contêiner flutuante da navbar desktop — fundo claro, borda sutil, elevação `sm`
- **button-primary** ("Vamos conversar"): único botão sólido do sistema — fundo `{colors.accent}`, formato pílula
- **tag-pill**: badge de categoria do case — sempre neutro (fundo `neutral-900`, texto `neutral-100`), nunca colorido por categoria
- **case-cover-image**: imagem de capa do case, `rounded.xl` no desktop e `rounded.lg` no mobile
- **language-toggle**: PT/EN — segmento ativo com fundo escuro sólido, inativo sem fundo
- **hypothesis-card**: card da seção "Pesquisa" de um case (uma por hipótese testada) — fundo `neutral-100`, `rounded.card` (20px), rótulo "HIPÓTESE N" + `badge-status` no topo
- **badge-status**: pill de status dentro do `hypothesis-card` (ex: "VALIDADA"/"REFUTADA") — fundo `neutral-200`, texto `neutral-500`, tipografia `caption`

*(novos componentes entram aqui conforme forem extraídos de novas telas do Figma — sempre com estado idle + hover + disabled quando existir)*

## Do's and Don'ts
- Use `{colors.accent}` só em pontuação de destaque, palavras-chave em texto corrido, e no `button-primary` — nunca como fundo decorativo ou de tag
- `tag-pill` é sempre neutro — não crie uma cor por categoria de tag
- Alterne fundo claro/escuro por seção conforme o padrão já estabelecido — nunca texto escuro sobre fundo escuro ou claro sobre claro
- `h2` é exclusivo da lista de cases na Home; dentro da página de um case, a hierarquia começa em `h3`
- A fonte do logotipo (`{fonts.logo}`) nunca aparece fora do "M." da marca
- Não invente um novo nível de elevação, raio de borda ou espaçamento fora do que está listado aqui — se a tela de referência não define algo, pare e pergunte
