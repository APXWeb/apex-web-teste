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

  // Fundo interativo: rede de particulas ligadas por linhas finas.
  // Elas se movem sozinhas, se afastam de leve quando o cursor chega perto
  // e ficam fixas atras de todo o conteudo da pagina.
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    const pointer = { x: -9999, y: -9999, active: false };
    let width = 0;
    let height = 0;
    let particles = [];
    let running = false;
    let rafId = null;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.min(140, Math.max(55, Math.round((width * height) / 12000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 1.2,
        perto: 0,
      }));
    }

    function drawParticles() {
      ctx.clearRect(0, 0, width, height);
      const linkDist = 150;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.perto = 0;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          const radius = 170;
          if (dist < radius && dist > 0.01) {
            const force = (1 - dist / radius) * 0.6;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
            // as particulas perto do cursor ficam um pouco mais nitidas,
            // para a reacao ficar visivel sem precisar de um brilho no fundo
            p.perto = 1 - dist / radius;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.min(Math.max(p.x, 0), width);
        p.y = Math.min(Math.max(p.y, 0), height);

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const realce = 1 + Math.max(p.perto, q.perto) * 1.6;
            ctx.strokeStyle = `rgba(125, 179, 255, ${0.3 * (1 - dist / linkDist) * realce})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + p.perto * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(173, 208, 255, ${Math.min(1, 0.8 + p.perto * 0.2)})`;
        ctx.fill();
      }
    }

    function loop() {
      if (!running) return;
      drawParticles();
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      running = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function setPointer(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }

    window.addEventListener('pointermove', setPointer, { passive: true });
    window.addEventListener('pointerdown', setPointer, { passive: true });
    document.addEventListener('pointerleave', () => { pointer.active = false; });

    let canvasResizeScheduled = false;
    window.addEventListener('resize', () => {
      if (canvasResizeScheduled) return;
      canvasResizeScheduled = true;
      setTimeout(() => { resizeCanvas(); canvasResizeScheduled = false; }, 150);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    resizeCanvas();
    start();
  }
})();
