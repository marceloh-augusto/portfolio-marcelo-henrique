import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const caseStudies = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/case-studies' }),
	schema: z.object({
		displayName: z.string(),
		client: z.string().optional(),
		year: z.string().optional(),
		role: z.string().optional(),
		// Campos usados pelo preview na seção "Cases Selecionados" da Home
		// (Figma node 214:176) — texto exato de cada tela, sem paráfrase.
		category: z.string(),
		description: z.string(),
		// Tradução EN da descrição do card na Home (`data-i18n-en`, ver i18n.ts).
		descriptionEn: z.string().optional(),
		tags: z.array(z.string()),
		coverImage: z.string(),
		// object-fit da capa — o Figma usa "contain" pra Yogha (foto de
		// produto com moldura/sombra própria) e "cover" pros outros dois
		// (screenshot preenchendo o quadro todo). Default "cover".
		coverFit: z.enum(["cover", "contain"]).default("cover"),
		// Tema de fundo do bloco na faixa horizontal "Cases Selecionados"
		// (CasesSection.astro) — Figma 523:1106/1123/1155: Yogha e Cred
		// Aluga usam fundo escuro (neutral-950), Estratégia usa fundo claro
		// (neutral-100), cada um com o texto/tag invertido pra manter
		// contraste. Default "dark" (a maioria dos cases).
		cardTheme: z.enum(["dark", "light"]).default("dark"),

		// Campos usados só dentro da página do case (src/pages/cases/[slug].astro),
		// não no preview da Home. `heroHeadline` é DIFERENTE de `description`
		// de propósito — a Home mostra um resumo curto (às vezes em inglês),
		// a página do case abre com o texto completo do Figma (PT), ver
		// node 308:217 do case Yogha.
		// .optional() só porque case-study-2/3 ainda são placeholders TODO
		// sem página própria construída — todo case TERMINADO tem os dois.
		heroHeadline: z.string().optional(),
		// Imagem de capa DENTRO da página do case (Figma node 308:218) —
		// diferente de `coverImage` (usada só no card da Home, às vezes com
		// um recorte/fit distinto, ex: coverFit "contain" do Yogha).
		heroImage: z.string().optional(),
		duration: z.string().optional(),
		team: z.string().optional(),
		platform: z.string().optional(),
		contribution: z.string().optional(),

		// Traduções EN do conteúdo dinâmico acima — toggle PT/EN funcional
		// (pedido do usuário, ver src/lib/i18n.ts `data-i18n-en`). Cada
		// campo `*En` é opcional e espelha o campo PT correspondente; se
		// não existir, o texto simplesmente não muda ao trocar de idioma
		// (aceitável pra termos já em inglês, ex: nome do cliente).
		heroHeadlineEn: z.string().optional(),
		yearEn: z.string().optional(),
		durationEn: z.string().optional(),
		platformEn: z.string().optional(),
		contributionEn: z.string().optional(),

		// Tabela "Decisão" (Figma node 252:33) — estrutura fixa demais pra
		// virar prosa MDX, consumida direto pelo TradeoffTable.astro.
		decisions: z
			.array(
				z.object({
					chosen: z.string(),
					insteadOf: z.string(),
					because: z.string(),
					riskOf: z.string(),
				}),
			)
			.optional(),
		// Mesmo formato/ordem de `decisions` — tradução EN linha a linha.
		decisionsEn: z
			.array(
				z.object({
					chosen: z.string(),
					insteadOf: z.string(),
					because: z.string(),
					riskOf: z.string(),
				}),
			)
			.optional(),

		// Seção "Outcome" (Figma node 253:97) — mesma lógica do decisions.
		// As 4 tarjas de destaque com blur sobre o dashboard (314:225-228)
		// são só um efeito decorativo do Figma, sem conteúdo real — não
		// reproduzidas. O overlay escuro (`bg-black/20`) do Figma original
		// também foi removido (pedido do usuário — deixava a imagem com
		// aparência de "máscara"/hover permanente); a imagem fica limpa.
		outcomeImage: z.string().optional(),
		outcome: z
			.object({
				improved: z.array(z.string()),
				worsened: z.array(z.string()),
			})
			.optional(),
		outcomeEn: z
			.object({
				improved: z.array(z.string()),
				worsened: z.array(z.string()),
			})
			.optional(),

		// Hero com quadro próprio (Estratégia, Figma 564:560: 1200×675, imagem
		// `contain` sobre #fdfdfd). Sem esses campos, CaseHero mantém o padrão
		// do Yogha (1280/834, `cover`).
		heroAspect: z.string().optional(),
		heroFit: z.enum(["cover", "contain"]).optional(),

		// "O que foi entregue" do Estratégia (Figma 660:686): grupos com título
		// + par Antes/Depois, renderizados por BeforeAfterGroup.astro. `crop`
		// (em %) reproduz o recorte do Figma sem editar o arquivo exportado.
		deliveries: z
			.array(
				z.object({
					title: z.string(),
					titleEn: z.string().optional(),
					pairs: z.array(
						z.object({
							image: z.string(),
							imageAlt: z.string(),
							crop: z
								.object({
									width: z.number().optional(),
									height: z.number().optional(),
									left: z.number().optional(),
									top: z.number().optional(),
								})
								.optional(),
							label: z.string(),
							labelEn: z.string().optional(),
							caption: z.string(),
							captionEn: z.string().optional(),
						}),
					),
				}),
			)
			.optional(),

		// Seção "O que foi entregue (MVP)" (Figma node 292:310) — imagem do
		// fluxo + bullets ficam em frontmatter (não em prosa MDX) porque
		// dividem espaço com os vídeos abaixo, que também são dados
		// estruturados.
		mvpImage: z.string().optional(),
		mvpBullets: z.array(z.string()).optional(),
		mvpBulletsEn: z.array(z.string()).optional(),
		// Vídeos do MVP (Figma nodes 275:249/293:5 — placeholders vazios no
		// arquivo original, o usuário envia os arquivos reais depois).
		mvpVideos: z
			.array(
				z.object({
					src: z.string(),
					poster: z.string().optional(),
				}),
			)
			.optional(),

		// "O que eu faria diferente" (Figma node 308:201) — fica em
		// frontmatter (não no corpo MDX) porque, na página, essa seção
		// precisa vir DEPOIS de Decisão/MVP/Outcome (que são compostas pela
		// própria página, fora do <Content />) — mantê-la dentro do MDX
		// prenderia sua posição a antes dessas 3 seções.
		whatIWouldDoDifferently: z.array(z.string()).optional(),
		whatIWouldDoDifferentlyEn: z.array(z.string()).optional(),
	}),
});

export const collections = {
	'case-studies': caseStudies,
};
