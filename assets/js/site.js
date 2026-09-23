(() => {
  const WHATSAPP = '5511944815707';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const whatsappUrl = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

  // Traz uma aba para a área visível rolando só a faixa de abas, nunca a página.
  // Sem animação quando não foi o usuário: uma rolagem suave aqui cancelaria
  // a rolagem suave da página que estiver acontecendo.
  const revealTab = (list, tab, smooth = true) => {
    if (list.scrollWidth <= list.clientWidth) return;
    const target = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    list.scrollTo({ left: target, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'auto' });
  };

  /* Cabeçalho: fundo só depois de rolar ---------------------------------- */
  const header = $('#site-header');
  if (header) {
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* Menu mobile ---------------------------------------------------------- */
  const toggle = $('#nav-toggle');
  const menu = $('#mobile-menu');
  if (toggle && menu) {
    const label = $('.nav-toggle-label', toggle);
    let closeTimer;

    const setOpen = (open, { restoreFocus = true } = {}) => {
      clearTimeout(closeTimer);
      toggle.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Fechar' : 'Menu';
      document.body.classList.toggle('menu-open', open);
      if (open) {
        menu.hidden = false;
        // Espera o menu existir no layout antes de animar e mover o foco
        requestAnimationFrame(() => requestAnimationFrame(() => {
          menu.classList.add('is-open');
          $('a', menu).focus({ preventScroll: true });
        }));
      } else {
        menu.classList.remove('is-open');
        closeTimer = setTimeout(() => { menu.hidden = true; }, 320);
        if (restoreFocus) toggle.focus({ preventScroll: true });
      }
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false, { restoreFocus: false })));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
    // Mantém o foco dentro do menu aberto
    menu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const items = [toggle, ...$$('a, button', menu)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === $('a', menu)) {
        e.preventDefault();
        first.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', (e) => {
      if (e.matches && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, { restoreFocus: false });
    });
  }

  /* Link ativo no menu conforme a seção na tela --------------------------- */
  const navLinks = $$('.nav-links a[href*="#"]');
  const sections = navLinks
    .map((a) => document.getElementById(a.hash.slice(1)))
    .filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const visible = new Map();
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
      const current = sections.find((s) => visible.get(s.id));
      navLinks.forEach((a) => {
        if (current && a.hash === `#${current.id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* Revelação ao rolar ---------------------------------------------------- */
  const revealEls = $$('[data-reveal]');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    // O elemento começa todo recortado por clip-path, e o Chrome não reporta
    // interseção de algo invisível. Por isso observamos o pai.
    const targets = new Map(revealEls.map((el) => [el.parentElement, el]));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        targets.get(entry.target).classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((el, parent) => revealObserver.observe(parent));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* Vitrine do hero ------------------------------------------------------- */
  const showcase = $('[data-showcase]');
  if (showcase) {
    const tabList = $('[role="tablist"]', showcase);
    const tabs = $$('.showcase-tab', showcase);
    const slides = $$('.showcase-slide', showcase);
    const phones = $$('.showcase-phone .phone', showcase);
    const panel = $('#showcase-panel', showcase);
    const caption = $('[data-showcase-caption]', showcase);
    const link = $('[data-showcase-link]', showcase);
    const control = $('[data-showcase-toggle]', showcase);
    let index = 0;
    let stopped = reducedMotion.matches;
    let hovering = false;
    let inView = true;

    const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    const restartProgress = () => {
      showcase.classList.remove('is-playing');
      void showcase.offsetWidth; // reinicia a animação da barra
      if (!stopped) showcase.classList.add('is-playing');
    };

    const syncPaused = () => {
      showcase.classList.toggle('is-paused', hovering || !inView || document.hidden);
    };

    const select = (i, { focus = false, auto = false } = {}) => {
      index = (i + tabs.length) % tabs.length;
      const tab = tabs[index];
      tabs.forEach((t, n) => {
        t.setAttribute('aria-selected', String(n === index));
        t.tabIndex = n === index ? 0 : -1;
      });
      slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
      phones.forEach((p, n) => p.classList.toggle('is-active', n === index));
      panel.href = tab.dataset.href;
      panel.setAttribute('aria-labelledby', tab.id);
      link.href = tab.dataset.href;
      caption.innerHTML = `<strong>${escape(tab.dataset.name)}</strong><span class="status" data-status="${tab.dataset.status}">${escape(tab.dataset.statusLabel)}</span>`;
      if (focus) tab.focus({ preventScroll: true });
      revealTab(tabList, tab, !auto);
      restartProgress();
    };

    const stop = () => {
      stopped = true;
      showcase.classList.add('is-stopped');
      showcase.classList.remove('is-playing');
      control.setAttribute('aria-label', 'Retomar a troca automática');
    };

    const play = () => {
      stopped = false;
      showcase.classList.remove('is-stopped');
      control.setAttribute('aria-label', 'Pausar a troca automática');
      restartProgress();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => { select(i); stop(); });
      tab.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse' && i !== index) select(i, { auto: true });
      });
      $('.showcase-tab-bar span', tab).addEventListener('animationend', () => {
        if (!stopped && i === index) select(index + 1, { auto: true });
      });
    });

    tabList.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (e.key in keys) {
        e.preventDefault();
        select(index + keys[e.key], { focus: true });
        stop();
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        select(e.key === 'Home' ? 0 : tabs.length - 1, { focus: true });
        stop();
      }
    });

    control.addEventListener('click', () => (stopped ? play() : stop()));
    showcase.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; syncPaused(); } });
    showcase.addEventListener('pointerleave', () => { hovering = false; syncPaused(); });
    document.addEventListener('visibilitychange', syncPaused);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncPaused(); }).observe(showcase);
    }

    // Esmaece a borda da faixa de abas só enquanto ainda há abas escondidas
    const syncOverflow = () => {
      tabList.classList.toggle('has-more', tabList.scrollLeft + tabList.clientWidth < tabList.scrollWidth - 4);
    };
    tabList.addEventListener('scroll', syncOverflow, { passive: true });
    window.addEventListener('resize', syncOverflow);
    syncOverflow();

    if (stopped) stop();
    else restartProgress();
  }

  /* Etiqueta "Ver case" que acompanha o cursor --------------------------- */
  const cursorTargets = $$('[data-cursor]');
  if (cursorTargets.length && finePointer.matches && !reducedMotion.matches) {
    const label = document.createElement('div');
    label.className = 'cursor-label';
    label.setAttribute('aria-hidden', 'true');
    label.innerHTML = 'Ver case <svg><use href="#i-arrow"/></svg>';
    document.body.appendChild(label);

    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let active = false;

    const tick = () => {
      // Aproximação suave: a etiqueta segue o cursor com um pouco de atraso
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      label.style.transform = `translate3d(${cx + 14}px, ${cy + 14}px, 0)`;
      if (active || Math.abs(x - cx) > 0.5 || Math.abs(y - cy) > 0.5) raf = requestAnimationFrame(tick);
      else raf = 0;
    };

    cursorTargets.forEach((el) => {
      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        x = cx = e.clientX;
        y = cy = e.clientY;
        active = true;
        label.classList.add('is-visible');
        if (!raf) raf = requestAnimationFrame(tick);
      });
      el.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; });
      el.addEventListener('pointerleave', () => {
        active = false;
        label.classList.remove('is-visible');
      });
    });
    window.addEventListener('scroll', () => {
      if (active) { active = false; label.classList.remove('is-visible'); }
    }, { passive: true });
  }

  /* Do problema ao produto: abas ----------------------------------------- */
  const flow = $('[data-flow]');
  if (flow) {
    const tabList = $('[role="tablist"]', flow);
    const tabs = $$('[role="tab"]', flow);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    let current = 0;

    const select = (i, focus) => {
      if (i === current) return;
      current = (i + tabs.length) % tabs.length;
      tabs.forEach((t, n) => {
        t.setAttribute('aria-selected', String(n === current));
        t.tabIndex = n === current ? 0 : -1;
      });
      panels.forEach((p, n) => {
        p.hidden = n !== current;
        p.classList.toggle('is-entering', n === current && !reducedMotion.matches);
      });
      if (focus) tabs[current].focus({ preventScroll: true });
      revealTab(tabList, tabs[current]);
    };

    tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
    tabList.addEventListener('keydown', (e) => {
      const map = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      select(map[e.key], true);
    });
    panels.forEach((p) => p.addEventListener('animationend', () => p.classList.remove('is-entering')));
  }

  /* Processo: a linha avança com a rolagem ------------------------------- */
  const process = $('[data-process]');
  if (process) {
    const steps = $$('.process-step', process);
    const track = $('.process-track', process);
    let ticking = false;

    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const line = vh * 0.62;
      const rect = process.getBoundingClientRect();
      steps.forEach((s) => s.classList.toggle('is-reached', s.getBoundingClientRect().top < line));
      let progress;
      if (window.innerWidth >= 960) {
        // Em linha: a linha vai de uma etapa alcançada até a outra
        const reached = steps.filter((s) => s.classList.contains('is-reached')).length;
        progress = reached ? (reached - 1) / (steps.length - 1) : 0;
      } else {
        // Em coluna: a linha acompanha a rolagem
        progress = Math.max(0, Math.min(1, (line - rect.top) / rect.height));
      }
      track.style.setProperty('--process-progress', progress.toFixed(3));
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      track.style.setProperty('--process-progress', '1');
      steps.forEach((s) => s.classList.add('is-reached'));
    } else {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true });
          update();
        } else {
          window.removeEventListener('scroll', onScroll);
          update();
        }
      }).observe(process);
    }
  }

  /* Contato: monta a mensagem do WhatsApp -------------------------------- */
  const composer = $('#composer');
  if (composer) {
    const chips = $$('.chip', composer);
    const business = $('#composer-business', composer);
    const note = $('#composer-note', composer);
    const preview = $('#composer-message', composer);

    // Texto simples, um item por linha. Sem emoji (o redirecionamento do wa.me
    // corrompe alguns) e sem *negrito* (no campo de digitação os asteriscos
    // aparecem crus: o WhatsApp só formata depois do envio).
    const buildMessage = () => {
      const needs = chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.dataset.value);
      const name = business.value.trim();
      const extra = note.value.trim();
      const lines = ['Olá, APX! Vi o site de vocês e quero conversar sobre um projeto.'];
      if (name) lines.push('', `Meu negócio: ${name}`);
      if (needs.length) lines.push('', 'O que eu preciso:', ...needs.map((n) => `• ${n}`));
      if (extra) lines.push('', `Detalhes: ${extra}`);
      return lines.join('\n');
    };

    const render = () => { preview.textContent = buildMessage(); };

    chips.forEach((chip) => chip.addEventListener('click', () => {
      chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
      render();
    }));
    business.addEventListener('input', render);
    note.addEventListener('input', render);
    composer.addEventListener('submit', (e) => {
      e.preventDefault();
      window.open(whatsappUrl(buildMessage()), '_blank', 'noopener');
    });
    render();
  }

  /* Depoimento: sem servidor, vira mensagem no WhatsApp ------------------- */
  const review = $('#review-form');
  if (review) {
    const error = $('#review-error');
    review.addEventListener('submit', (e) => {
      e.preventDefault();
      error.hidden = true;
      if (review.elements['bot-field'].value) return;

      const fields = ['nome', 'depoimento'].map((n) => review.elements[n]);
      fields.forEach((f) => f.removeAttribute('aria-invalid'));
      const missing = fields.filter((f) => !f.value.trim());
      if (missing.length) {
        missing.forEach((f) => f.setAttribute('aria-invalid', 'true'));
        error.textContent = missing.length === 2
          ? 'Escreva seu nome e o depoimento para continuar.'
          : missing[0].name === 'nome' ? 'Escreva seu nome para continuar.' : 'Escreva o depoimento para continuar.';
        error.hidden = false;
        missing[0].focus();
        return;
      }

      const empresa = review.elements.empresa.value.trim();
      let text = `Olá! Quero deixar um depoimento sobre a APX Web.\n\nNome: ${review.elements.nome.value.trim()}`;
      if (empresa) text += `\nEmpresa: ${empresa}`;
      text += `\nDepoimento: ${review.elements.depoimento.value.trim()}`;
      window.open(whatsappUrl(text), '_blank', 'noopener');
      review.hidden = true;
      $('#review-success').hidden = false;
    });
  }
})();
