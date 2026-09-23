---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

## Surface

Home da APX Web (`index.html`) e páginas de case (`projetos/<slug>/`). Mode: Persuade (home) / Experience (cases).

Público: donos de pequenos negócios avaliando se a APX é capaz e confiável. Ação: abrir conversa no WhatsApp. Prova: seis projetos funcionais, classificados com transparência (real, conceitual, demonstração), e um depoimento real.

Régua de acabamento escolhida pelo usuário: Linear / Vercel, Stripe, Rauno / Emil Kowalski. O usuário escolheu o padrão da categoria executado com excelência, sem ironia.

## Direction contract

THESIS: Estúdio de produto digital no padrão Linear/Vercel/Stripe. As interfaces reais dos projetos são o conteúdo principal do site. Recusa o template de agência (aurora azul, cards de ícone, dois botões grandes, marquee genérico).

OWN-WORLD: Grafite neutro (#0A0A0B), sem tom azulado. Tinta #EDEDEF, texto secundário #A1A1AA, linhas em branco a 8–14%. Um único acento: o azul da marca (#0062FF, e #4D8DFF quando aparece como texto). Pontos de status: verde = real, âmbar = conceitual, cinza = demonstração. Tipografia Geist para todo o texto e Geist Mono só para dados e metadados. Molduras de interface com borda de 1px e raio 12. Nada de brilho, gradiente decorativo ou glass sem função.

STORY: o visitante (1) vê trabalho real já na primeira tela; (2) entende que a APX faz sites *e* sistemas; (3) percorre os projetos sabendo o que cada um é; (4) entende o raciocínio problema→produto e o processo; (5) monta a própria mensagem e abre o WhatsApp.

FIRST VIEWPORT: duas colunas iguais. À esquerda, headline em duas linhas ("Ideias que constroem / o seu futuro.", frase pedida pelo usuário), uma frase de posicionamento, a ação principal compacta (WhatsApp, via compositor de contato) com um link de texto para os trabalhos e, abaixo, a linha de agenda aberta. À direita, a vitrine: moldura de navegador com a interface real de um projeto, celular sobreposto na borda direita e, abaixo, o índice dos seis projetos em grade 3×2 (nome, ponto de status e tipo), com barra de progresso na aba ativa. A legenda traz nome, natureza, pausa e "Ver case". A vitrine avança sozinha, pausa no hover/foco e troca ao passar o mouse sobre o índice. Tudo cabe em 1440×900. No mobile, a vitrine fica abaixo do texto e o índice vira faixa rolável.

FORM: padrão da categoria (canon), escolhido pelo usuário. Seed 409d4a54. Interação-assinatura: a vitrine com índice ao vivo. Gramática de movimento: ease-out forte (0.23,1,0.32,1), revelações com clip-path nas imagens, stagger de 40–60 ms e nada acima de 300 ms em elementos de UI.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
