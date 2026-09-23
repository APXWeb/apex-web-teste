---
name: APX Web
description: Estúdio de produto digital. As interfaces reais dos projetos são o conteúdo do site.
colors:
  graphite: "#0a0a0b"
  graphite-1: "#111113"
  graphite-2: "#18181b"
  graphite-3: "#212125"
  line: "rgb(255 255 255 / 0.08)"
  line-2: "rgb(255 255 255 / 0.14)"
  line-3: "rgb(255 255 255 / 0.22)"
  ink: "#ededef"
  ink-2: "#a1a1aa"
  ink-3: "#818189"
  brand-blue: "#0062ff"
  brand-blue-hover: "#1a5ff0"
  brand-blue-press: "#0053d9"
  brand-blue-text: "#6ea0ff"
  on-brand: "#ffffff"
  status-real: "#3dd68c"
  status-conceitual: "#f5b544"
  status-demonstracao: "#9b9ba4"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.5rem, 4.1vw, 3.75rem)"
    fontWeight: 560
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline-lg:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.375rem, 1.5rem + 3.4vw, 4.25rem)"
    fontWeight: 560
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.45rem + 2.1vw, 3.25rem)"
    fontWeight: 560
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 1.2rem + 0.6vw, 1.75rem)"
    fontWeight: 560
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title-sm:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"ss01\" on"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  "10": "128px"
  section: "clamp(6rem, 3.5rem + 9vw, 11rem)"
  gutter: "clamp(1.25rem, 0.6rem + 2.8vw, 2.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.on-brand}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.brand-blue-hover}"
  button-primary-active:
    backgroundColor: "{colors.brand-blue-press}"
  button-secondary:
    backgroundColor: "{colors.graphite-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.graphite-3}"
  button-sm:
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "36px"
  link-arrow:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  status-pill:
    backgroundColor: "{colors.graphite-2}"
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  chip:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
    height: "36px"
  input:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    height: "44px"
  frame:
    backgroundColor: "{colors.graphite-1}"
    rounded: "{rounded.lg}"
  frame-bar:
    backgroundColor: "{colors.graphite-1}"
    height: "32px"
    padding: "0 16px"
  panel:
    backgroundColor: "{colors.graphite-1}"
    rounded: "{rounded.lg}"
    padding: "24px"
  composer:
    backgroundColor: "{colors.graphite-1}"
    rounded: "{rounded.xl}"
    padding: "clamp(1.5rem, 1rem + 1.5vw, 2rem)"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "36px"
  showcase-tab-active:
    backgroundColor: "{colors.graphite-1}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px 12px"
---

# Design System: APX Web

## Overview

**Creative North Star: "A Bancada de Produto"**

O site da APX é uma bancada onde o trabalho fica exposto e ligado. É o padrão da categoria, na régua de Linear/Vercel, Stripe e Rauno/Emil, executado sem ironia: grafite neutro, tinta quase branca, linhas finíssimas e um único azul de marca. O protagonista é a interface real de cada projeto, sempre dentro de uma moldura de navegador ou de celular. A tipografia, as linhas e as superfícies só existem para enquadrar essa prova.

A densidade é de produto, não de agência. As seções respiram (bloco vertical de 96 a 176px), mas dentro delas a informação é compacta: legendas de 13px, metadados em cinza, listas separadas por linhas de 1px em vez de cartões com ícone. A profundidade vem de camadas tonais do grafite e de contornos internos de 1px. Sombra real aparece apenas nas molduras de interface, que são objetos. O movimento é curto, com ease-out forte. Imagens entram com revelação por clip-path e a vitrine troca slides com dissolução e leve desfoque.

O que o sistema recusa, por decisão do usuário: o template de agência (aurora azul, cards de ícone, dois botões grandes lado a lado, marquee genérico), brilho, gradiente decorativo e vidro sem função.

**Key Characteristics:**
- Grafite neutro sem tom azulado, com quatro degraus de superfície e três de linha.
- Um único acento, o azul da marca, reservado para a ação principal, o foco e as seleções.
- Pontos de status de 6px (real, conceitual, demonstração) como a única cor semântica.
- Geist em todo o texto; Geist Mono só para dados, código e numeração.
- Molduras de navegador e de celular como o recipiente-assinatura do trabalho.
- Contornos internos de 1px no lugar de bordas; sombra só em objetos.
- Movimento com ease-out (0.23, 1, 0.32, 1), UI em até 300ms, e tudo desliga com `prefers-reduced-motion`.

## Colors

Uma paleta monocromática de grafite com um único azul elétrico de marca e três pontos de status.

### Primary
- **Azul APX** (brand-blue): o fundo da ação principal (WhatsApp), o preenchimento do logo e a cor da seleção de texto (a 40%). Ao passar o mouse ele desce para brand-blue-hover e, ao pressionar, para brand-blue-press.
- **Azul APX em texto** (brand-blue-text): o mesmo azul clareado para ter contraste sobre o grafite. Aparece no anel de foco, no check do chip selecionado, no contorno de item em destaque e no texto de destaque. O azul cheio nunca é usado como cor de texto.

### Tertiary (status)
- **Verde Real** (status-real): ponto de projeto real e o ponto pulsante de "Agenda aberta".
- **Âmbar Conceitual** (status-conceitual): ponto de projeto conceitual.
- **Cinza Demonstração** (status-demonstracao): ponto de projeto de demonstração, e o valor padrão quando nenhum status é declarado.

### Neutral
- **Grafite** (graphite): o fundo da página, o fundo dos campos e dos chips em repouso.
- **Grafite 1** (graphite-1): a superfície elevada. Aparece em molduras, barras de navegador, painéis, compositor e na aba ativa da vitrine.
- **Grafite 2** (graphite-2): o fundo do botão secundário, da pílula de status, do interior da moldura e de itens de lista dentro de painéis.
- **Grafite 3** (graphite-3): o hover do secundário, o passo selecionado do segmento, as bolinhas da barra do navegador e as bolhas de chat.
- **Linha / Linha 2 / Linha 3** (branco a 8%, 14% e 22%): divisórias e contorno de painel; contorno de moldura, botão, campo e chip; hover de contornos e sublinhados.
- **Tinta** (ink): títulos e texto principal.
- **Tinta 2** (ink-2): texto secundário, lead, links de navegação em repouso.
- **Tinta 3** (ink-3): legendas, metadados, rótulos de rodapé e placeholders.

### Named Rules
**The One Blue Rule.** O azul da marca é o único acento cromático do sistema. Ele marca a ação principal, o foco e o que está selecionado, e nada mais. Uma tela deve ter no máximo um botão azul cheio à vista.

**The Status Is Truth Rule.** Verde, âmbar e cinza significam real, conceitual e demonstração. Não são decoração: não use essas cores fora da natureza do projeto e da disponibilidade da agenda.

**The Guest Color Rule.** As cores de marca dos projetos (a cor de cada case) aparecem apenas dentro das capturas e como um filete de 2px no topo da barra da moldura de capa do case. Elas nunca tingem a interface da APX.

## Typography

**Display Font:** Geist (com ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (com ui-monospace, SFMono-Regular, Consolas), apenas para dados

**Character:** Uma única família geométrica neutra, com peso 560 e tracking negativo nos títulos, dá o tom de ferramenta de produto. O corpo usa o conjunto estilístico ss01. A Mono aparece em escala pequena, como etiqueta de dado, nunca como voz.

### Hierarchy
- **Display** (560, `clamp(2.5rem, 4.1vw, 3.75rem)` no desktop e `clamp(2.125rem, 0.9rem + 5.2vw, 4.25rem)` abaixo de 960px, 0.96, -0.04em): só o título do hero, dimensionado para caber em duas linhas na coluna.
- **Headline grande** (560, headline-lg, 1.02, -0.04em): título do case, título de contato e o nome do próximo case.
- **Headline** (560, headline, 1.05, -0.03em, máx. 18–20ch): títulos de seção.
- **Title** (560, title, 1.2, -0.03em): nome do projeto na lista de trabalho, painéis do fluxo e processo (1.375rem).
- **Title pequeno** (500, 1.0625–1.25rem, -0.015em): subtítulos de grupo, capacidades, recursos e cartões de projeto.
- **Lead** (400, lead, 1.5, cor ink-2, 38–48ch): frase de apoio sob títulos.
- **Body** (400, 1rem, 1.6, ss01): texto corrido, com medida de até 66ch.
- **Label** (500, 0.875rem): botões pequenos, navegação, nomes de campo e abas.
- **Caption** (400–500, 0.8125rem, ink-3): metadados, status, rodapé e notas.
- **Data** (Geist Mono 400, 0.6875–0.8125rem): stack técnica, numeração de etapas, horários de mensagem, cabeçalhos e corpo de código.

### Named Rules
**The Mono Is Data Rule.** Geist Mono só aparece em informação que é dado: stack, números de etapa, horários, código e contadores. Ela nunca é usada em títulos, botões ou texto corrido.

**The Sentence Case Rule.** Todo rótulo é escrito em caixa normal e sem tracking positivo. O sistema não tem texto em caixa alta espaçada.

## Layout

A página usa um contêiner de 76rem mais as margens laterais (gutter fluido de 20 a 40px). As seções têm respiro vertical fluido (`section`, de 96 a 176px) e são separadas entre si por uma linha de 1px. A cabeçalho de seção é uma grade 7/5 a partir de 960px: o título à esquerda e o lead alinhado pela base à direita.

A composição é assimétrica e baseada em frações 12. O hero usa duas colunas iguais. A lista de trabalho alterna 7/5 e 5/7 (8/4 e 4/8 a partir de 1200px), com a mídia trocando de lado. O contato e o depoimento usam 5/7 e 7/5. Os blocos de história do case usam 4/8, com um rótulo na coluna estreita. Os projetos secundários e os recursos ficam em grades de 2 e 3 colunas.

O ritmo segue uma base de 4px (de 4 a 128px). Dentro dos componentes predominam 8, 12, 16 e 24px; entre blocos, 48, 64 e 96px.

Os breakpoints são 640px (sm), 960px (md) e 1200px (lg). Abaixo de 960px, a navegação vira um menu em tela cheia, a vitrine desce para baixo do texto e o índice vira uma faixa rolável com máscara na borda. Abaixo de 640px, as ações principais ocupam a largura toda com 48px de altura e a moldura reduz o raio para 10px.

## Elevation & Depth

O sistema é plano e tonal. A profundidade vem dos quatro degraus do grafite e de contornos internos de 1px (`inset 0 0 0 1px`) em branco translúcido. Painéis, campos, chips e abas nunca têm sombra projetada. Sombras reais existem só nas molduras de interface, porque elas são objetos sobre a bancada. O cabeçalho ganha fundo grafite a 78% com desfoque de 14px só depois da rolagem, para manter a leitura sobre o conteúdo.

### Shadow Vocabulary
- **Moldura** (`box-shadow: 0 1px 0 0 rgb(255 255 255 / 0.05) inset, 0 30px 60px -30px rgb(0 0 0 / 0.75)`): moldura de navegador, com um brilho de 1px no topo e uma sombra longa e difusa por baixo.
- **Flutuante** (`box-shadow: 0 20px 40px -16px rgb(0 0 0 / 0.7)`): a moldura de celular sobreposta à de navegador.
- **Anel de foco de campo** (`box-shadow: inset 0 0 0 1px #6ea0ff, 0 0 0 3px rgb(0 98 255 / 0.25)`): campo com foco.

### Named Rules
**The Hairline Rule.** Contorno é um `inset` de 1px em branco translúcido (8%, 14% ou 22%), nunca uma borda sólida cinza. No hover, o contorno sobe um degrau.

**The Objects Cast Shadows Rule.** Só molduras de navegador e de celular projetam sombra, sempre com deslocamento e desfoque. Superfícies de interface ficam planas.

## Shapes

As formas usam raios moderados e consistentes. Molduras, painéis e cartões usam 14px (lg); o compositor de contato e o bloco de celulares do case usam 20px (xl); campos, abas e itens de lista usam 10px (md); o anel de foco usa 6px (sm). Tudo que é acionável e compacto é pílula: botões, chips, links da navegação, segmento do fluxo e pílula de status. Controles só de ícone são círculos de 36px. A moldura de celular tem raio 26px, com a tela a 21px. As bolhas de chat usam 14px com um canto de 4px apontando para o remetente. Pontos são círculos de 4 a 7px.

## Components

### Buttons
Compactos, em pílula, confiantes sem gritar.
- **Shape:** pílula (999px), 44px de altura, 36px na variante pequena e 48px de largura total no mobile.
- **Primary:** fundo azul da marca e texto branco, 15px com peso 500 e 18px de padding lateral. Ícone de 18px à esquerda quando é a ação de conversa.
- **Hover / Focus:** o fundo escurece para brand-blue-hover (200ms). Ao pressionar, o botão escala para 0.97 (120ms, ease-out). Foco: contorno de 2px em brand-blue-text com 3px de afastamento.
- **Secondary:** fundo grafite 2 com contorno interno Linha 2. No hover, sobe para grafite 3 e Linha 3.
- **Link com seta:** a ação secundária é um link de texto de 15px/500 com seta SVG de 16px, e não um segundo botão. A seta desliza 3px na direção da ação (direita, baixo ou diagonal para links externos).

### Chips
- **Style:** pílula de 36px, fundo grafite, contorno Linha 2 e texto ink-2 de 14px.
- **State:** selecionado (`aria-pressed`) recebe fundo azul a 14%, contorno azul-texto a 55%, texto ink e um check de 14px em brand-blue-text. No hover, o texto vira ink e o contorno sobe para Linha 3.

### Status
- **Style:** ponto de 6px na cor da natureza do projeto, seguido do rótulo em 13px/500 ink-2. A variante em pílula leva fundo grafite 2 e contorno Linha, com padding 4px 10px.

### Cards / Containers
- **Corner Style:** 14px (painéis, legenda de status, nota de processo, avaliação e bloco de honestidade); 20px no compositor.
- **Background:** grafite 1 sobre a página; grafite puro para uma caixa dentro de um painel (prévia da mensagem, código).
- **Shadow Strategy:** nenhuma; apenas contorno interno Linha (ver Elevation & Depth).
- **Internal Padding:** 24px (ou 24–32px fluido no compositor).
- **Listas** (capacidades, recursos): linhas separadas por divisórias de 1px, sem cartão e sem ícone.

### Inputs / Fields
- **Style:** fundo grafite, contorno interno Linha 2, raio 10px, 44px de altura mínima e texto de 16px. O rótulo fica acima em 14px/500, e "(opcional)" vem em ink-3.
- **Focus:** contorno interno azul-texto com halo externo de 3px em azul a 25%. O hover sobe o contorno para Linha 3.
- **Error:** contorno vermelho de 1px (`aria-invalid`) e mensagem em vermelho claro de 14px.

### Navigation
- **Style:** cabeçalho fixo de 64px, transparente no topo. Depois da rolagem, ganha grafite a 78%, desfoque de 14px e uma linha inferior.
- **Links:** pílulas de 36px, 14px, ink-2. No hover, texto ink e fundo grafite 2. A seção atual fica em ink.
- **CTA:** botão primário pequeno à direita.
- **Mobile:** abaixo de 960px, um botão "Menu" em pílula com ícone de duas linhas que viram X. O menu ocupa a tela em grafite, com links de 28px/560 separados por linhas, que entram com stagger de 40ms. O rodapé do menu tem o botão de WhatsApp em largura total.

### Moldura de navegador (assinatura)
O recipiente de todo o trabalho. Raio 14px, fundo grafite 1, contorno de 1px em Linha 2 (outline interno) e a sombra de moldura. A barra tem 32px (28px no mobile e em cartões), com três pontos grafite 3 de 9px e divisória Linha. A área de visualização é 16:10, com a captura ancorada no topo. No hover do projeto, o contorno sobe para Linha 3 e a imagem amplia 2% em 900ms. Na capa do case, a barra ganha um filete de 2px na cor do projeto.

### Moldura de celular
Proporção 390:844, com 5px de bezel em #1b1b1f, raio 26px, contorno Linha 2 e sombra flutuante. Na vitrine desktop, ela se sobrepõe à borda direita da moldura de navegador.

### Vitrine com índice ao vivo (assinatura)
Moldura de navegador com celular sobreposto, sobre um índice de seis abas (grade 3×2 no desktop, faixa rolável no mobile). Cada aba tem nome com ponto de status (14px/500) e tipo (13px, ink-3). A aba ativa ganha fundo grafite 1, contorno Linha e uma barra de progresso de 2px em ink, que corre durante o tempo do slide. Os slides trocam com dissolução, desfoque de 6px e escala de 1.015, a 420ms na opacidade e 700ms na escala. A vitrine pausa no hover e no foco. Um controle circular de 36px faz pausar e retomar.

### Segmento do fluxo
Trilho em pílula (grafite 1, contorno Linha, 4px de padding) com passos de 36px. O passo selecionado recebe grafite 3, contorno Linha 2 e texto ink.

### Linha de processo
Quatro etapas sobre um trilho de 1px (Linha 2) que se preenche em ink conforme a rolagem. Cada etapa tem um ponto de 7px que fica cheio ao ser alcançado, número em Geist Mono de 12px e "o que você recebe" separado por uma linha.

### Compositor de contato
Painel de 20px com chips de assunto, campos e uma prévia da mensagem. A prévia mostra uma bolha no verde escuro do WhatsApp (#0f3d2b, texto #e8f5ee) com canto de 4px embaixo à direita. Ao lado, o botão primário abre a conversa.

## Do's and Don'ts

### Do:
- **Do** coloque todo trabalho dentro da moldura de navegador (raio 14px, barra de 32px, 16:10) ou da moldura de celular (390:844).
- **Do** use o azul da marca só na ação principal, no foco e na seleção; em texto, use brand-blue-text (#6ea0ff).
- **Do** marque a natureza de cada projeto com o ponto de status de 6px: verde para real, âmbar para conceitual e cinza para demonstração.
- **Do** faça contornos como `inset 0 0 0 1px` em branco a 8%, 14% ou 22%, subindo um degrau no hover.
- **Do** use Geist Mono apenas para stack, numeração, horários e código.
- **Do** dê à ação secundária a forma de link de texto com seta, ao lado de um único botão primário.
- **Do** anime com ease-out `cubic-bezier(0.23, 1, 0.32, 1)`: 120ms para toque, 200ms para cor e 300ms para estados. Revele só imagens, com clip-path de baixo para cima; texto não anima ao rolar. Desligue tudo com `prefers-reduced-motion`.
- **Do** limite hovers a `(hover: hover) and (pointer: fine)` e dê a botões e chips a escala de 0.97 ao pressionar.

### Don't:
- **Don't** use aurora azul, gradiente decorativo, brilho ou vidro sem função; o único desfoque de fundo é o do cabeçalho rolado.
- **Don't** monte cards de serviço com ícone, dois botões grandes lado a lado nem marquee genérico.
- **Don't** use as cores de status como decoração nem as cores dos projetos na interface da APX.
- **Don't** escreva rótulos em caixa alta espaçada nem ponha sobretítulos acima dos títulos de seção.
- **Don't** aplique sombra projetada em painéis, campos, chips ou abas.
- **Don't** introduza um tom azulado no grafite nem um segundo acento cromático.
