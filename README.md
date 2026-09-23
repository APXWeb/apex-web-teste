# APX Web · site

Site estático (HTML, CSS e JavaScript puro) publicado no GitHub Pages.

## Estrutura

```
index.html                 home (partes marcadas com <!-- build:* --> são geradas)
projetos/<slug>/           páginas de case (geradas, não edite à mão)
portfolio-projects/<slug>/ os projetos funcionando ao vivo
assets/css/site.css        design system + estilos (tokens no topo do arquivo)
assets/js/site.js          interações (vitrine, menu, fluxo, processo, contato)
assets/img/work/<slug>/    telas de cada projeto em WebP
data/projects.json         fonte única dos projetos
templates/                 modelo do case e partes compartilhadas (cabeçalho, rodapé)
scripts/build.mjs          gera home, cases e sitemap a partir do JSON
```

`data/`, `scripts/`, `templates/` e os arquivos `.md` não são publicados (`_config.yml`).

## Adicionar um projeto

1. Coloque o projeto funcionando em `portfolio-projects/<slug>/`.
2. Salve as telas em `assets/img/work/<slug>/`, cada uma em dois tamanhos:
   - desktop (1440×900): `cover.webp` + `cover-720.webp`, `tela-1.webp` + `tela-1-720.webp`…
   - celular (780×1688): `mobile-1.webp` + `mobile-1-390.webp`…
   - imagem de compartilhamento (1200×630): `og.jpg`
3. Adicione o projeto em `data/projects.json`. A ordem do arquivo é a ordem do site: os três primeiros aparecem em destaque na home.
4. Rode `node scripts/build.mjs` (Node 18 ou mais novo, sem instalar nada).

O build para com uma mensagem clara se faltar algum campo ou imagem.

### Natureza do projeto (`status`)

Sempre diga a verdade sobre cada projeto:

- `real`: feito para um cliente de verdade.
- `conceitual`: ideia de produto da APX, sem cliente.
- `demonstracao`: negócio fictício com o sistema funcionando.

Não invente clientes, números ou depoimentos.

## Editar textos da home

Edite `index.html` direto, **fora** dos blocos `<!-- build:* -->`. Cabeçalho e rodapé ficam em `templates/partials/`. Depois rode o build.

## Testar localmente

```
python -m http.server 8123
```

Abra http://127.0.0.1:8123/.
