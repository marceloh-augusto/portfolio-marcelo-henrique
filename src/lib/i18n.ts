import { setScrollRevealText } from "./scrollRevealEffect";

/**
 * Toggle PT/EN funcional (pedido do usuário) — traduz o texto ESTÁTICO
 * da Home (nav, Hero, Sobre, Clientes, Trajetória, Arquivo, Contato,
 * footer) no cliente, sem reload de página. Escopo combinado com o
 * usuário:
 * - Preview dos cases na Home (nome/categoria/descrição/tags, vindos do
 *   MDX) fica IGUAL nas duas línguas — description/category/tags já
 *   estão escritos em inglês no conteúdo original, e displayName é nome
 *   próprio (não se traduz), então não precisa de chave própria aqui.
 * - As páginas de case study (/cases/case-study-N) reaproveitam a nav
 *   compartilhada (mesmo tratamento desta lista) + rótulos fixos de
 *   template (metadados, títulos de seção, tabela de Decisão — ver bloco
 *   "case.*" abaixo) + o conteúdo dinâmico de cada case via o mecanismo
 *   `data-i18n-en` (ver `applyLanguage`), que fica junto do próprio MDX
 *   em vez de crescer este dicionário a cada case novo.
 *
 * Cada valor pode conter HTML (ex: os `<span>` de destaque em accent
 * color) — sempre aplicado via `innerHTML`, nunca inventa marcação nova,
 * só espelha a mesma estrutura já usada na versão em português.
 */
export type Lang = "pt" | "en";

interface Translation {
	pt: string;
	en: string;
}

export const translations: Record<string, Translation> = {
	"nav.sobre": { pt: "Sobre", en: "About" },
	"nav.contato": { pt: "Contato", en: "Contact" },
	"nav.curriculo": { pt: "Currículo", en: "Resume" },
	"nav.location": { pt: "Santa Catarina - BR", en: "Santa Catarina - Brazil" },

	"hero.role": { pt: "UX/UI & Product Designer Senior.", en: "Senior UX/UI & Product Designer." },
	"hero.scrollcue": { pt: "Role para descobrir como ↓", en: "Scroll to discover ↓" },
	"hero.tagline": {
		pt: 'Transformo <span class="text-(--color-accent)">problemas ambíguos</span> em <span class="text-(--color-accent)">decisões</span> de produto <span class="text-(--color-accent)">fundamentadas</span>, criando <span class="text-(--color-accent)">clareza, critério e direção</span> a partir de uma leitura sistêmica que conecta produto, negócio e experiência.',
		en: 'I turn <span class="text-(--color-accent)">ambiguous problems</span> into well-grounded <span class="text-(--color-accent)">product decisions</span>, bringing <span class="text-(--color-accent)">clarity, judgment, and direction</span> through a systemic view that connects product, business, and experience.',
	},
	// Frase do marquee (ScrollVelocity) — mantém o mesmo "glitch"
	// proposital do texto original em PT ("Desig quem vê", sem "para" e
	// com erro de digitação — pedido explícito do usuário em outra
	// tarefa, não é engano nosso) espelhado em inglês, pra preservar a
	// mesma sensação de repetição-com-variação.
	"hero.marquee": {
		pt: "Design para quem vê • Design para quem sente • Desig quem vê • Design para quem sente • Design para quem vive",
		en: "Design for those who see • Design for those who feel • Desig who see • Design for those who feel • Design for those who live",
	},

	"cases.overline": { pt: "CASES SELECIONADOS", en: "SELECTED CASES" },

	"sobre.overline": { pt: "SOBRE", en: "ABOUT" },
	"sobre.lead": {
		pt: "Com mais de 5 anos de experiência e formação acadêmica em UX Design e UX Research, atuo de ponta a ponta ao longo de todo o ciclo de construção e evolução de produtos digitais. Combino visão sistêmica, pesquisa, atenção ao craft, dados e objetivos de negócio para tomar decisões de design centradas no usuário e construir experiências que gerem resultados para produto e negócio.",
		en: "With over 5 years of experience and academic training in UX Design and UX Research, I work end-to-end across the entire cycle of building and evolving digital products. I combine systems thinking, research, attention to craft, data, and business goals to make user-centered design decisions and build experiences that drive results for both product and business.",
	},

	"clientes.overline": { pt: "CLIENTES E EMPRESAS", en: "CLIENTS AND COMPANIES" },

	"trajetoria.heading": { pt: "Minha trajetória", en: "My career journey" },
	"trajetoria.role.0": { pt: "UX Consultant", en: "UX Consultant" },
	"trajetoria.period.0": { pt: "2026 - Presente", en: "2026 - Present" },
	"trajetoria.role.1": { pt: "Estratégia Educacional - Product Designer", en: "Estratégia Educacional - Product Designer" },
	"trajetoria.period.1": { pt: "2024 - 2026", en: "2024 - 2026" },
	"trajetoria.role.2": { pt: "Yogha - Product Designer", en: "Yogha - Product Designer" },
	"trajetoria.period.2": { pt: "2023 - 2024", en: "2023 - 2024" },
	"trajetoria.role.3": { pt: "Oli - Product Designer", en: "Oli - Product Designer" },
	"trajetoria.period.3": { pt: "2021 - 2023", en: "2021 - 2023" },
	"trajetoria.role.4": { pt: "Designer Gráfico", en: "Graphic Designer" },
	"trajetoria.period.4": { pt: "2014 - 2021", en: "2014 - 2021" },

	"arquivo.overline": { pt: "ARQUIVO", en: "ARCHIVE" },

	"contato.heading": {
		pt: 'Vamos conversar<span class="text-(--color-accent)">?</span>',
		en: 'Let’s talk<span class="text-(--color-accent)">?</span>',
	},
	"contato.overline": { pt: "CONTATO", en: "CONTACT" },

	"footer.copyright": {
		pt: "© 2026 Marcelo Henrique · Santa Catarina — Brasil",
		en: "© 2026 Marcelo Henrique · Santa Catarina — Brazil",
	},

	// Rótulos FIXOS da página de case study (ARCHITECTURE.md define essa
	// mesma estrutura de seções pra todo case) — ficam aqui porque se
	// repetem em todo case study, ao contrário do conteúdo (texto de
	// Problema, valores de metadados, etc.), que é específico de cada
	// case e viaja com o próprio MDX via `data-i18n-en` (ver mais abaixo
	// nesse arquivo).
	"case.metadata.cliente": { pt: "CLIENTE", en: "CLIENT" },
	"case.metadata.ano": { pt: "ANO", en: "YEAR" },
	"case.metadata.papel": { pt: "PAPEL", en: "ROLE" },
	"case.metadata.duracao": { pt: "DURAÇÃO", en: "DURATION" },
	"case.metadata.time": { pt: "TIME", en: "TEAM" },
	"case.metadata.plataforma": { pt: "PLATAFORMA", en: "PLATFORM" },
	"case.metadata.contribuicao": { pt: "MINHA CONTRIBUIÇÃO", en: "MY CONTRIBUTION" },

	"case.section.problema": { pt: "Problema", en: "Problem" },
	"case.section.restricoes": { pt: "Restrições", en: "Constraints" },
	"case.section.pesquisa": { pt: "Pesquisa", en: "Research" },
	"case.section.decisao": { pt: "Decisão", en: "Decision" },
	"case.section.mvp": { pt: "O que foi entregue (MVP)", en: "What shipped (MVP)" },
	"case.section.outcome": { pt: "Outcome", en: "Outcome" },
	"case.section.diferente": { pt: "O que eu faria diferente", en: "What I'd do differently" },

	"case.decision.escolhemos": { pt: "ESCOLHEMOS", en: "WE CHOSE" },
	"case.decision.emvezde": { pt: "EM VEZ DE", en: "INSTEAD OF" },
	"case.decision.porque": { pt: "PORQUE", en: "BECAUSE" },
	"case.decision.risco": { pt: "ASSUMINDO O RISCO DE", en: "ACCEPTING THE RISK OF" },

	"case.outcome.melhorou": { pt: "O que melhorou", en: "What improved" },
	"case.outcome.piorou": { pt: "O que piorou", en: "What got worse" },
};

const STORAGE_KEY = "lang";

export function getStoredLanguage(): Lang {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === "en" || saved === "pt") return saved;
	} catch {
		// localStorage indisponível (modo privado, etc.) — cai pro padrão.
	}
	return "pt";
}

export function applyLanguage(lang: Lang): void {
	document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

	document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
		const key = el.dataset.i18n;
		if (!key) return;
		const entry = translations[key];
		if (!entry) return;

		// ScrollReveal quebra o texto em `<span class="word">` com
		// ScrollTrigger próprio por palavra — trocar via innerHTML direto
		// deixaria triggers órfãos (ver scrollRevealEffect.ts). Detecta
		// pelo atributo que o próprio ScrollReveal.astro já define.
		if (el.hasAttribute("data-scroll-reveal")) {
			setScrollRevealText(el, entry[lang]);
		} else {
			el.innerHTML = entry[lang];
		}
	});

	// Conteúdo dinâmico por case study (texto de Problema, valores de
	// metadados, linhas da tabela de Decisão, etc.) — diferente dos
	// rótulos fixos acima, esse texto é ESPECÍFICO de cada case e vive no
	// próprio MDX (`content/case-studies/*.mdx`), não faz sentido crescer
	// o dicionário global pra cada case novo. Cada elemento carrega sua
	// própria tradução em `data-i18n-en` (o PT já é o conteúdo renderizado
	// por padrão, capturado e cacheado em `data-i18n-pt-cache` na primeira
	// troca de idioma).
	document.querySelectorAll<HTMLElement>("[data-i18n-en]").forEach((el) => {
		if (el.dataset.i18nPtCache === undefined) {
			el.dataset.i18nPtCache = el.innerHTML;
		}
		const en = el.dataset.i18nEn;
		const pt = el.dataset.i18nPtCache;
		if (en === undefined || pt === undefined) return;
		el.innerHTML = lang === "en" ? en : pt;
	});

	// Caso especial: o marquee do Hero (ScrollVelocity) renderiza várias
	// CÓPIAS estáticas do mesmo texto lado a lado (pro loop infinito) —
	// não é uma única tag pra marcar com `data-i18n`, então troca todas
	// as cópias aqui mesmo em vez de generalizar o componente genérico
	// ScrollVelocity.astro pra saber sobre tradução.
	const marquee = translations["hero.marquee"];
	if (marquee) {
		document.querySelectorAll<HTMLElement>("[data-hero-marquee] [data-copy-index]").forEach((span) => {
			span.textContent = `${marquee[lang]} `;
		});
	}

	try {
		localStorage.setItem(STORAGE_KEY, lang);
	} catch {
		// localStorage indisponível — a escolha só não persiste entre reloads.
	}
}
