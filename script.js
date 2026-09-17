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
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function onScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;

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

  // Spotlight hover effect on cards
  if (!prefersReducedMotion) {
    document.querySelectorAll('[data-spotlight]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        card.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
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

  // Fundo interativo: rede de partículas que reage ao mouse/toque, fixa
  // atrás de todo o conteúdo da página.
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width, height, particles, animId;
    const pointer = { x: -9999, y: -9999, active: false };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.min(110, Math.max(45, Math.round((width * height) / 16000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 1,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      // Brilho suave seguindo o cursor
      if (pointer.active) {
        const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220);
        glow.addColorStop(0, 'rgba(0, 98, 255, 0.14)');
        glow.addColorStop(1, 'rgba(0, 98, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      const linkDist = 130;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Repulsão suave perto do cursor
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          const radius = 150;
          if (dist < radius && dist > 0.01) {
            const force = (1 - dist / radius) * 0.6;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
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
            ctx.strokeStyle = `rgba(125, 179, 255, ${0.16 * (1 - dist / linkDist)})`;
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
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(163, 200, 255, 0.55)';
        ctx.fill();
      }

      animId = requestAnimationFrame(step);
    }

    function setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    }

    window.addEventListener('pointermove', (e) => setPointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('pointerdown', (e) => setPointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('pointerleave', () => { pointer.active = false; });
    document.addEventListener('mouseleave', () => { pointer.active = false; });

    let resizeScheduled = false;
    window.addEventListener('resize', () => {
      if (resizeScheduled) return;
      resizeScheduled = true;
      setTimeout(() => { resize(); resizeScheduled = false; }, 150);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        animId = requestAnimationFrame(step);
      }
    });

    resize();
    step();
  }

  // Tilt 3D leve nos cards ao passar o mouse
  if (!prefersReducedMotion) {
    document.querySelectorAll('.spec-card, .portfolio-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateY = px * 10;
        const rotateX = -py * 10;
        card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // Botões magnéticos: seguem levemente o cursor dentro da própria área
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const px = e.clientX - rect.left - rect.width / 2;
        const py = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${px * 0.25}px, ${py * 0.25}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
})();
