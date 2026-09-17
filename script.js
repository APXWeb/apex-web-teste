(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Scroll-triggered reveal animations
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay') || 0;
          entry.target.style.transitionDelay = `${delay * 90}ms`;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // Header shrink + scroll progress + active nav link + back-to-top
  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');
  const bttBar = document.getElementById('btt-bar');
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  // Sublinhado unico que desliza entre os itens do menu
  const navIndicator = document.getElementById('nav-indicator');
  const navItems = Array.from(navLinks.querySelectorAll('a:not(.nav-cta)'));
  let navHovering = false;

  function moveIndicator(el) {
    if (!navIndicator) return;
    if (!el) {
      navIndicator.style.opacity = '0';
      return;
    }
    navIndicator.style.opacity = '1';
    navIndicator.style.width = `${el.offsetWidth}px`;
    navIndicator.style.top = `${el.offsetTop + el.offsetHeight - 2}px`;
    navIndicator.style.transform = `translateX(${el.offsetLeft}px)`;
  }

  function updateIndicator() {
    if (!navIndicator) return;
    if (window.innerWidth <= 900) {
      navLinks.classList.remove('has-indicator');
      navIndicator.style.opacity = '0';
      return;
    }
    navLinks.classList.add('has-indicator');
    moveIndicator(navItems.find(a => a.classList.contains('active')) || null);
  }

  if (navIndicator) {
    navItems.forEach(a => {
      a.addEventListener('pointerenter', () => {
        if (window.innerWidth > 900) {
          navHovering = true;
          moveIndicator(a);
        }
      });
    });
    const leaveNav = () => {
      navHovering = false;
      updateIndicator();
    };
    navLinks.addEventListener('pointerleave', leaveNav);
    header.addEventListener('pointerleave', leaveNav);
    window.addEventListener('blur', leaveNav);
    window.addEventListener('resize', updateIndicator);
  }

  function onScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;

    if (bttBar) {
      const ring = 151;
      bttBar.style.strokeDashoffset = `${ring - (ring * progress) / 100}`;
    }

    header.classList.toggle('scrolled', scrollY > 20);
    backToTop.classList.toggle('show', scrollY > 600);

    let currentId = '';
    sections.forEach(section => {
      const top = section.offsetTop - 140;
      if (scrollY >= top) currentId = section.id;
    });

    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
    });

    if (!navHovering) updateIndicator();
  }

  let scrollScheduled = false;
  window.addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    setTimeout(() => { onScroll(); scrollScheduled = false; }, 50);
  });

  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  // Spotlight + borda que acende acompanhando o cursor nos cards
  if (!prefersReducedMotion) {
    document.querySelectorAll('.spec-card, .portfolio-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        card.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      });
    });

    // O preenchimento do botao nasce do ponto por onde o cursor entrou
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        const rect = btn.getBoundingClientRect();
        btn.style.setProperty('--bx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        btn.style.setProperty('--by', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      });
    });
  }

  // Formulário de depoimento: sem backend (GitHub Pages), então em vez de
  // guardar a resposta em algum servidor, montamos a mensagem e abrimos o
  // WhatsApp da APX Web já com ela pronta pra enviar.
  const APX_WHATSAPP = '5511944815707';
  const testimonialForm = document.getElementById('testimonial-form');
  if (testimonialForm) {
    testimonialForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('testimonial-error');
      errorEl.hidden = true;

      // Honeypot: bot preencheu um campo escondido do usuário -> ignora silenciosamente.
      if (testimonialForm.elements['bot-field'].value) return;

      const nome = testimonialForm.elements['nome'].value.trim();
      const empresa = testimonialForm.elements['empresa'].value.trim();
      const depoimento = testimonialForm.elements['depoimento'].value.trim();

      if (!nome || !depoimento) {
        errorEl.textContent = 'Preencha seu nome e o depoimento.';
        errorEl.hidden = false;
        return;
      }

      let mensagem = `Olá! Quero deixar um depoimento sobre a APX Web:\n\nNome: ${nome}`;
      if (empresa) mensagem += `\nEmpresa: ${empresa}`;
      mensagem += `\nDepoimento: ${depoimento}`;

      window.open(`https://wa.me/${APX_WHATSAPP}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');

      testimonialForm.hidden = true;
      document.getElementById('testimonial-success').hidden = false;
    });
  }

  // Mouse parallax on floating hero cards
  const hero = document.querySelector('.hero');
  const parallaxEls = document.querySelectorAll('[data-parallax]');

  if (hero && parallaxEls.length && !prefersReducedMotion) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const offsetX = (e.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (e.clientY - rect.top) / rect.height - 0.5;

      parallaxEls.forEach(el => {
        const strength = Number(el.getAttribute('data-parallax-strength')) || 20;
        el.style.transform = `translate(${offsetX * strength}px, ${offsetY * strength}px)`;
      });
    });

    hero.addEventListener('mouseleave', () => {
      parallaxEls.forEach(el => {
        el.style.transform = '';
      });
    });
  }

  // Titulo da home entrando palavra por palavra.
  // As classes sao adicionadas pelo JS: se o script falhar, o texto ja aparece normal.
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && !prefersReducedMotion) {
    const words = heroTitle.querySelectorAll('.word');
    heroTitle.classList.add('words-ready');
    words.forEach((word, i) => {
      word.style.transitionDelay = `${120 + i * 90}ms`;
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => heroTitle.classList.add('words-in'));
    });
  }

  // Passos do "Como Funcionamos" se desenhando conforme entram na tela
  const steps = Array.from(document.querySelectorAll('.step'));
  if (steps.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = steps.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('is-drawn'), index * 170);
        stepObserver.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    steps.forEach(step => stepObserver.observe(step));
  }

  // Cursor personalizado: ponto que acompanha na hora + anel que vem atras
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursorDot && cursorRing && hasFinePointer && !prefersReducedMotion) {
    document.documentElement.classList.add('has-cursor');

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;
    let mouseX = ringX;
    let mouseY = ringY;

    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }, { passive: true });

    (function followCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(followCursor);
    })();

    const interactive = 'a, button, input, textarea, .spec-card, .portfolio-card, .team-card, label';
    document.addEventListener('pointerover', (e) => {
      const target = e.target instanceof Element ? e.target.closest(interactive) : null;
      cursorRing.classList.toggle('is-hovering', !!target);
    });

    document.addEventListener('pointerdown', () => cursorRing.classList.add('is-pressed'));
    document.addEventListener('pointerup', () => cursorRing.classList.remove('is-pressed'));

    document.addEventListener('pointerleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('pointerenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });
  }

  // Aurora: o fundo do site. Luzes que flutuam sozinhas, seguem o cursor
  // e soltam um pulso quando a pessoa clica. O canvas e renderizado em
  // resolucao baixa e esticado pelo CSS, o que deixa os degrades suaves
  // sem custar blur.
  const aurora = document.getElementById('aurora');
  if (aurora && !prefersReducedMotion) {
    const actx = aurora.getContext('2d');
    const SCALE = 0.22;
    const BASE_COLORS = [
      [0, 98, 255],
      [32, 120, 255],
      [8, 56, 150],
      [0, 190, 255],
    ];
    const DEEP_COLORS = [
      [64, 60, 220],
      [0, 150, 220],
      [16, 40, 130],
      [0, 220, 200],
    ];

    let w = 0;
    let h = 0;
    let blobs = [];
    let pulses = [];
    let trail = [];
    let running = false;
    let rafId = null;
    const pointer = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4, weight: 0 };

    function buildBlobs() {
      blobs = BASE_COLORS.map((_, i) => ({
        index: i,
        cx: 0.2 + Math.random() * 0.6,
        cy: 0.2 + Math.random() * 0.6,
        ax: 0.16 + Math.random() * 0.2,
        ay: 0.14 + Math.random() * 0.18,
        sx: 0.04 + Math.random() * 0.06,
        sy: 0.035 + Math.random() * 0.05,
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        r: 0.42 + Math.random() * 0.3,
        a: 0.2 + Math.random() * 0.08,
      }));
    }

    function resizeAurora() {
      w = aurora.width = Math.max(1, Math.round(window.innerWidth * SCALE));
      h = aurora.height = Math.max(1, Math.round(window.innerHeight * SCALE));
    }

    function mix(a, b, t) {
      return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ];
    }

    function light(x, y, radius, color, alpha) {
      if (radius <= 0 || alpha <= 0) return;
      const [r, g, b] = color;
      const grad = actx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`);
      grad.addColorStop(0.45, `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha * 0.34})`);
      grad.addColorStop(1, `rgba(${r | 0}, ${g | 0}, ${b | 0}, 0)`);
      actx.fillStyle = grad;
      actx.beginPath();
      actx.arc(x, y, radius, 0, Math.PI * 2);
      actx.fill();
    }

    function drawAurora(now) {
      const t = now / 1000;

      // A paleta muda devagar conforme a pessoa desce a pagina
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const depth = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;

      actx.globalCompositeOperation = 'source-over';
      actx.fillStyle = '#000000';
      actx.fillRect(0, 0, w, h);
      actx.globalCompositeOperation = 'lighter';

      pointer.x += (pointer.tx - pointer.x) * 0.09;
      pointer.y += (pointer.ty - pointer.y) * 0.09;

      blobs.forEach(blob => {
        const baseX = blob.cx + Math.sin(t * blob.sx * Math.PI * 2 + blob.px) * blob.ax;
        const baseY = blob.cy + Math.cos(t * blob.sy * Math.PI * 2 + blob.py) * blob.ay;
        const pull = pointer.weight * (0.1 + blob.index * 0.035);
        const x = (baseX + (pointer.x - baseX) * pull) * w;
        const y = (baseY + (pointer.y - baseY) * pull) * h;
        const color = mix(BASE_COLORS[blob.index], DEEP_COLORS[blob.index], depth * 0.75);
        light(x, y, blob.r * w, color, blob.a);
      });

      if (pointer.weight > 0.01) {
        trail.forEach(point => { point.life -= 0.045; });
        trail = trail.filter(point => point.life > 0);
        trail.forEach(point => {
          light(point.x * w, point.y * h, (0.05 + 0.07 * point.life) * w, [130, 190, 255], 0.05 * point.life * pointer.weight);
        });
        light(pointer.x * w, pointer.y * h, 0.22 * w, mix([0, 140, 255], [0, 220, 210], depth * 0.75), 0.23 * pointer.weight);
      }

      pulses.forEach(pulse => { pulse.t += 0.018; });
      pulses = pulses.filter(pulse => pulse.t < 1);
      pulses.forEach(pulse => {
        light(pulse.x * w, pulse.y * h, (0.08 + pulse.t * 0.55) * w, [170, 215, 255], 0.28 * (1 - pulse.t));
      });
    }

    function loop(now) {
      if (!running) return;
      drawAurora(now);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    }

    window.addEventListener('pointermove', (e) => {
      pointer.tx = e.clientX / window.innerWidth;
      pointer.ty = e.clientY / window.innerHeight;
      pointer.weight = Math.min(1, pointer.weight + 0.08);
      if (trail.length < 20) trail.push({ x: pointer.x, y: pointer.y, life: 1 });
    }, { passive: true });

    window.addEventListener('pointerdown', (e) => {
      if (pulses.length < 6) {
        pulses.push({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, t: 0 });
      }
    }, { passive: true });

    document.addEventListener('pointerleave', () => { pointer.weight = 0; });

    let auroraResizeScheduled = false;
    window.addEventListener('resize', () => {
      if (auroraResizeScheduled) return;
      auroraResizeScheduled = true;
      setTimeout(() => { resizeAurora(); auroraResizeScheduled = false; }, 150);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    buildBlobs();
    resizeAurora();
    start();
  }
})();
