// Gera as partes do site que dependem dos projetos.
//
// Fonte única: data/projects.json
// Saídas:
//   - index.html: blocos entre <!-- build:nome --> e <!-- /build:nome -->
//   - projetos/<slug>/index.html: uma página de case por projeto
//   - sitemap.xml
//
// Uso: node scripts/build.mjs   (Node 18+, sem dependências)

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// URL de produção: o site de teste aponta o canonical para ela.
const SITE_URL = 'https://apxweb.github.io/apex-web/';
const WHATSAPP = '5511944815707';

const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const write = (path, content) => {
  mkdirSync(dirname(join(ROOT, path)), { recursive: true });
  writeFileSync(join(ROOT, path), content);
};

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

// Troca {{chave}} pelo valor. Quem chama escapa o que for texto; HTML pronto entra como está.
const fill = (template, values) =>
  template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in values)) throw new Error(`Placeholder sem valor: ${key}`);
    return values[key];
  });

const { statuses, projects } = JSON.parse(read('data/projects.json'));

// Validação: um projeto novo com campo faltando quebra o build, não o site.
const REQUIRED = ['slug', 'name', 'status', 'type', 'summary', 'headline', 'context', 'challenge', 'approach', 'features', 'services', 'stack', 'outcome', 'note', 'live', 'images'];
for (const p of projects) {
  for (const field of REQUIRED) {
    if (p[field] === undefined || p[field] === '') throw new Error(`${p.slug || p.name}: falta o campo "${field}"`);
  }
  if (!statuses[p.status]) throw new Error(`${p.slug}: status desconhecido "${p.status}"`);
  if (!/^[a-z0-9-]+$/.test(p.slug)) throw new Error(`${p.slug}: slug deve ter só letras minúsculas, números e hífen`);
  for (const img of p.images) {
    const base = `assets/img/work/${p.slug}/${img.file}`;
    const small = img.kind === 'mobile' ? `${base}-390.webp` : `${base}-720.webp`;
    for (const file of [`${base}.webp`, small]) {
      if (!existsSync(join(ROOT, file))) throw new Error(`${p.slug}: imagem não encontrada ${file}`);
    }
  }
}

const whatsappLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const icon = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
const statusBadge = (p, pill = true) =>
  `<span class="status${pill ? ' status-pill' : ''}" data-status="${p.status}">${escapeHtml(statuses[p.status].label)}</span>`;
const frameBar = () =>
  `<div class="frame-bar" aria-hidden="true"><span class="frame-dots"><span></span><span></span><span></span></span></div>`;
// Recorte para deixar a interface legível em tamanho pequeno: zoom a partir de um ponto
const cropStyle = (image) =>
  image && image.zoom ? ` style="--zoom:${image.zoom}; --focus:${image.focus || '50% 0%'}"` : '';
const imageByFile = (p, file) => p.images.find((i) => i.file === file);

// Caminhos de imagem relativos a quem usa (home = '', case = '../../')
const img = (p, file, prefix = '') => `${prefix}assets/img/work/${p.slug}/${file}`;
const desktopImg = (p, image, { prefix = '', sizes, loading = 'lazy', alt = true } = {}) =>
  `<img src="${img(p, `${image.file}-720.webp`, prefix)}" srcset="${img(p, `${image.file}-720.webp`, prefix)} 720w, ${img(p, `${image.file}.webp`, prefix)} 1440w" sizes="${sizes}" width="1440" height="900" loading="${loading}" decoding="async" alt="${alt ? escapeHtml(image.alt) : ''}">`;
const coverImg = (p, options) => desktopImg(p, imageByFile(p, 'cover') || p.images[0], options);
const mobileImg = (p, file, { prefix = '', alt = '' } = {}) =>
  `<img src="${img(p, `${file}-390.webp`, prefix)}" srcset="${img(p, `${file}-390.webp`, prefix)} 390w, ${img(p, `${file}.webp`, prefix)} 780w" sizes="(min-width: 960px) 12rem, 30vw" width="390" height="844" loading="lazy" decoding="async" alt="${escapeHtml(alt)}">`;

// Partials -----------------------------------------------------------------
const partial = (name, ctx) =>
  fill(read(`templates/partials/${name}.html`), {
    home: ctx.home,
    homeHref: ctx.homeHref,
    footerProjects: projects
      .map((p) => `          <li><a href="${ctx.prefix}projetos/${p.slug}/">${escapeHtml(p.name)}</a></li>`)
      .join('\n'),
  }).trim();

// Home: vitrine --------------------------------------------------------------
function renderShowcase() {
  const tabs = projects
    .map(
      (p, i) => `            <button class="showcase-tab" type="button" role="tab" id="showcase-tab-${p.slug}" aria-controls="showcase-panel" aria-selected="${i === 0}"${i === 0 ? '' : ' tabindex="-1"'}
              data-name="${escapeHtml(p.name)}" data-type="${escapeHtml(p.type)}" data-status="${p.status}" data-status-label="${escapeHtml(statuses[p.status].label)}" data-href="projetos/${p.slug}/">
              <span class="showcase-tab-name"><span class="status" data-status="${p.status}"></span>${escapeHtml(p.name)}</span>
              <span class="showcase-tab-type">${escapeHtml(p.type)}</span>
              <span class="showcase-tab-bar" aria-hidden="true"><span></span></span>
            </button>`
    )
    .join('\n');

  // Slides escondidos não disparam lazy loading; carregam logo, com prioridade baixa.
  const slides = projects
    .map(
      (p, i) =>
        `              ${coverImg(p, { sizes: '(min-width: 960px) 56vw, 100vw', loading: 'eager' })
          .replace('<img ', `<img class="showcase-slide${i === 0 ? ' is-active' : ''}" fetchpriority="${i === 0 ? 'high' : 'low'}" `)}`
    )
    .join('\n');

  const phones = projects
    .map((p, i) => {
      const mobile = p.images.find((m) => m.kind === 'mobile');
      return `            <div class="phone${i === 0 ? ' is-active' : ''}">${mobileImg(p, mobile.file)}</div>`;
    })
    .join('\n');

  const first = projects[0];
  return `      <div class="showcase" data-showcase>
        <div class="showcase-visual">
          <a class="frame" id="showcase-panel" role="tabpanel" aria-labelledby="showcase-tab-${first.slug}" href="projetos/${first.slug}/" data-cursor>
            ${frameBar()}
            <div class="frame-view">
${slides}
            </div>
          </a>
          <div class="showcase-phone" aria-hidden="true">
            <div class="showcase-phone-space"></div>
${phones}
          </div>
        </div>
        <div class="showcase-index" role="tablist" aria-label="Projetos em destaque">
${tabs}
        </div>
        <div class="showcase-caption">
          <p class="showcase-caption-text" data-showcase-caption><strong>${escapeHtml(first.name)}</strong>${statusBadge(first, false)}</p>
          <div class="showcase-caption-actions">
            <button class="showcase-control" type="button" data-showcase-toggle aria-label="Pausar a troca automática">${icon('i-pause').replace('<svg', '<svg class="icon-pause"')}${icon('i-play').replace('<svg', '<svg class="icon-play"')}</button>
            <a class="link-arrow" href="projetos/${first.slug}/" data-showcase-link>Ver case ${icon('i-arrow')}</a>
          </div>
        </div>
      </div>`;
}

// Home: trabalho --------------------------------------------------------------
const FEATURED = 3;

function renderWorkRow(p) {
  const feature = imageByFile(p, p.feature) || imageByFile(p, 'cover');
  const features = p.features.slice(0, 3).map((f) => `              <li>${escapeHtml(f.title)}</li>`).join('\n');
  return `        <article class="work" aria-labelledby="work-${p.slug}">
          <a class="work-media" href="projetos/${p.slug}/" tabindex="-1" aria-hidden="true" data-cursor>
            <div class="frame" data-reveal="media">
              ${frameBar()}
              <div class="frame-view"${cropStyle(feature)}>${desktopImg(p, feature, { sizes: '(min-width: 1200px) 760px, (min-width: 960px) 58vw, 100vw', alt: false })}</div>
            </div>
          </a>
          <div class="work-info">
            <div class="work-title">
              <h3 id="work-${p.slug}"><a href="projetos/${p.slug}/">${escapeHtml(p.name)}</a></h3>
              <p class="work-meta">${statusBadge(p)}<span>${escapeHtml(p.type)}</span></p>
            </div>
            <p class="work-summary">${escapeHtml(p.summary)}</p>
            <ul class="work-features">
${features}
            </ul>
            <p class="work-stack">${p.stack.map(escapeHtml).join(' · ')}</p>
            <div class="work-links">
              <a class="link-arrow" href="projetos/${p.slug}/">Ver case ${icon('i-arrow')}<span class="sr-only"> de ${escapeHtml(p.name)}</span></a>
              <a class="link-arrow is-muted" data-dir="out" href="${p.live}" target="_blank" rel="noopener">Abrir ao vivo ${icon('i-arrow-out')}<span class="sr-only"> (${escapeHtml(p.name)}, nova aba)</span></a>
            </div>
          </div>
        </article>`;
}

function renderWorkCard(p) {
  const feature = imageByFile(p, p.feature) || imageByFile(p, 'cover');
  return `          <article class="work-card" aria-labelledby="work-${p.slug}">
            <a class="work-media" href="projetos/${p.slug}/" tabindex="-1" aria-hidden="true" data-cursor>
              <div class="frame" data-reveal="media">
                ${frameBar()}
                <div class="frame-view"${cropStyle(feature)}>${desktopImg(p, feature, { sizes: '(min-width: 960px) 380px, (min-width: 640px) 50vw, 100vw', alt: false })}</div>
              </div>
            </a>
            <div class="work-card-body">
              <div class="work-title">
                <h4 id="work-${p.slug}"><a href="projetos/${p.slug}/">${escapeHtml(p.name)}</a></h4>
                <p class="work-meta">${statusBadge(p)}<span>${escapeHtml(p.type)}</span></p>
              </div>
              <p>${escapeHtml(p.summary)}</p>
            </div>
            <div class="work-links">
              <a class="link-arrow" href="projetos/${p.slug}/">Ver case ${icon('i-arrow')}<span class="sr-only"> de ${escapeHtml(p.name)}</span></a>
              <a class="link-arrow is-muted" data-dir="out" href="${p.live}" target="_blank" rel="noopener">Ao vivo ${icon('i-arrow-out')}<span class="sr-only"> (${escapeHtml(p.name)}, nova aba)</span></a>
            </div>
          </article>`;
}

function renderWork() {
  const featured = projects.slice(0, FEATURED);
  const more = projects.slice(FEATURED);
  let html = `      <div class="work-list">
${featured.map(renderWorkRow).join('\n')}
      </div>`;
  if (more.length) {
    html += `
      <div class="work-more">
        <div class="work-more-head">
          <h3>Mais projetos</h3>
          <p>Cada um com o seu case completo.</p>
        </div>
        <div class="work-grid">
${more.map(renderWorkCard).join('\n')}
        </div>
      </div>`;
  }
  return html;
}

// Case ------------------------------------------------------------------------
function renderGallery(p) {
  const desktop = p.images.filter((i) => i.kind === 'desktop' && i.file !== 'cover');
  const mobile = p.images.filter((i) => i.kind === 'mobile');
  const P = '../../';
  const shot = (i, sizes) => `          <figure>
            <div class="frame" data-reveal="media">
              ${frameBar()}
              <div class="frame-view"><img src="${img(p, `${i.file}-720.webp`, P)}" srcset="${img(p, `${i.file}-720.webp`, P)} 720w, ${img(p, `${i.file}.webp`, P)} 1440w" sizes="${sizes}" width="1440" height="900" loading="lazy" decoding="async" alt="${escapeHtml(i.alt)}"></div>
            </div>
            <figcaption>${escapeHtml(i.caption)}</figcaption>
          </figure>`;

  const [lead, ...rest] = desktop;
  let html = lead ? shot(lead, '(min-width: 1280px) 1216px, 100vw') : '';
  if (rest.length) {
    html += `\n        <div class="gallery-pair">\n${rest.map((i) => shot(i, '(min-width: 960px) 600px, 100vw')).join('\n')}\n        </div>`;
  }
  if (mobile.length) {
    html += `
        <div class="gallery-mobile">
          <div class="gallery-mobile-copy">
            <h2>No celular também.</h2>
            <p>O layout é reorganizado para a tela pequena, não apenas encolhido. É onde a maioria das pessoas vai abrir o site.</p>
          </div>
          <div class="gallery-phones">
${mobile
  .slice(0, 2)
  .map(
    (i) => `            <figure>
              <div class="phone">${mobileImg(p, i.file, { prefix: P, alt: i.alt }).replace('sizes="(min-width: 960px) 12rem, 30vw"', 'sizes="(min-width: 960px) 13rem, 45vw"')}</div>
            </figure>`
  )
  .join('\n')}
          </div>
        </div>`;
  }
  return html;
}

function renderFeatures(p) {
  return p.features
    .map(
      (f) => `        <div class="feature">
          <h3>${escapeHtml(f.title)}</h3>
          <p>${escapeHtml(f.text)}</p>
        </div>`
    )
    .join('\n');
}

function renderCase(p, i) {
  const next = projects[(i + 1) % projects.length];
  const cover = p.images.find((m) => m.file === 'cover') || p.images[0];
  const ctx = { home: '../../', homeHref: '../../', prefix: '../../' };
  return fill(read('templates/case.html'), {
    slug: p.slug,
    name: escapeHtml(p.name),
    type: escapeHtml(p.type),
    brand: p.brand || 'var(--fg)',
    status: p.status,
    statusLabel: escapeHtml(statuses[p.status].label),
    statusDescription: escapeHtml(statuses[p.status].description),
    headline: escapeHtml(p.headline),
    summary: escapeHtml(p.summary),
    context: escapeHtml(p.context),
    challenge: escapeHtml(p.challenge),
    approach: escapeHtml(p.approach),
    outcome: escapeHtml(p.outcome),
    note: escapeHtml(p.note),
    services: escapeHtml(p.services.join(', ')),
    stack: escapeHtml(p.stack.join(' · ')),
    live: p.live,
    coverAlt: escapeHtml(cover.alt),
    siteUrl: SITE_URL,
    whatsapp: escapeHtml(whatsappLink(`Olá! Vi o projeto ${p.name} no site da APX Web e quero conversar sobre algo parecido para o meu negócio.`)),
    nextSlug: next.slug,
    nextName: escapeHtml(next.name),
    gallery: renderGallery(p),
    features: renderFeatures(p),
    header: partial('header', ctx),
    footer: partial('footer', ctx),
  });
}

// Home ------------------------------------------------------------------------
function replaceBlock(html, name, content) {
  const re = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`);
  if (!re.test(html)) throw new Error(`index.html: marcador build:${name} não encontrado`);
  return html.replace(re, `$1\n${content}\n$2`);
}

const homeCtx = { home: '', homeHref: '#', prefix: '' };
let index = read('index.html');
index = replaceBlock(index, 'header', partial('header', homeCtx));
index = replaceBlock(index, 'showcase', renderShowcase());
index = replaceBlock(index, 'work', renderWork());
index = replaceBlock(index, 'footer', partial('footer', homeCtx));
write('index.html', index);

// Remove cases de projetos que saíram do JSON
if (existsSync(join(ROOT, 'projetos'))) {
  const keep = new Set(projects.map((p) => p.slug));
  for (const dir of readdirSync(join(ROOT, 'projetos'))) {
    if (!keep.has(dir)) rmSync(join(ROOT, 'projetos', dir), { recursive: true, force: true });
  }
}
projects.forEach((p, i) => write(`projetos/${p.slug}/index.html`, renderCase(p, i)));

write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}</loc></url>
${projects.map((p) => `  <url><loc>${SITE_URL}projetos/${p.slug}/</loc></url>`).join('\n')}
</urlset>
`
);

console.log(`Build ok: home + ${projects.length} cases + sitemap.`);
