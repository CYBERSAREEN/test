/* ═══════════════════════════════════════════════════════════════
   THE RAW STUDIOS — main.js  v4  (Funky Warm Light Edition)
   GSAP · Swiper · Musical Vibe Interactions
═══════════════════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

const NOTE_CHARS = ['♩','♪','♫','♬','𝄞','♭','♯','𝄢','𝄡','𝄫','𝄪'];
const rnd = gsap.utils.random;

let _cursorTrailCounter = 0;

/* ── Staff SVG factory ───────────────────────────────────────── */
function makeStaffSVG() {
  const clef = Math.random() > 0.5 ? '𝄞' : '𝄢';
  const pick  = () => NOTE_CHARS[Math.floor(Math.random() * 5)];
  const yOpts = [18, 26, 34, 42, 50];
  const ys    = [
    yOpts[Math.floor(Math.random()*5)],
    yOpts[Math.floor(Math.random()*5)],
    yOpts[Math.floor(Math.random()*5)]
  ];
  return `<svg viewBox="0 0 200 65" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <line x1="22" y1="13" x2="200" y2="13" stroke="currentColor" stroke-width="0.85" opacity="0.75"/>
    <line x1="22" y1="22" x2="200" y2="22" stroke="currentColor" stroke-width="0.85" opacity="0.75"/>
    <line x1="22" y1="31" x2="200" y2="31" stroke="currentColor" stroke-width="0.85" opacity="0.75"/>
    <line x1="22" y1="40" x2="200" y2="40" stroke="currentColor" stroke-width="0.85" opacity="0.75"/>
    <line x1="22" y1="49" x2="200" y2="49" stroke="currentColor" stroke-width="0.85" opacity="0.75"/>
    <line x1="22" y1="13" x2="22" y2="49" stroke="currentColor" stroke-width="1.8" opacity="0.75"/>
    <text x="0"   y="51" font-family="serif" font-size="46" fill="currentColor" opacity="0.95">${clef}</text>
    <text x="65"  y="${ys[0]}" font-family="serif" font-size="17" fill="currentColor">${pick()}</text>
    <text x="110" y="${ys[1]}" font-family="serif" font-size="15" fill="currentColor">${pick()}</text>
    <text x="152" y="${ys[2]}" font-family="serif" font-size="17" fill="currentColor">${pick()}</text>
  </svg>`;
}

/* ── Cursor Staff SVG (spawned every 5th trail event) ────────── */
function makeCursorStaff() {
  const div = document.createElement('div');
  div.className = 'cursor-note';
  div.style.cssText = `display:inline-block; line-height:1;`;
  div.innerHTML = `<svg viewBox="0 0 60 28" width="60" height="28" xmlns="http://www.w3.org/2000/svg" style="display:block">
    <line x1="8" y1="8"  x2="60" y2="8"  stroke="rgba(250,129,18,0.7)" stroke-width="0.9"/>
    <line x1="8" y1="14" x2="60" y2="14" stroke="rgba(250,129,18,0.7)" stroke-width="0.9"/>
    <line x1="8" y1="20" x2="60" y2="20" stroke="rgba(250,129,18,0.7)" stroke-width="0.9"/>
    <text x="0" y="23" font-family="serif" font-size="26" fill="rgba(250,129,18,0.85)">𝄞</text>
    <text x="30" y="${[10,16,22][Math.floor(Math.random()*3)]}" font-family="serif" font-size="12" fill="rgba(250,129,18,0.7)">♪</text>
  </svg>`;
  return div;
}

/* ── Page Transition ─────────────────────────────────────────── */
(function setupPageTransition() {
  const ov = document.createElement('div');
  ov.id = 'pageTransition';
  document.body.appendChild(ov);
  gsap.fromTo(ov, { scaleY:1, transformOrigin:'top' }, { scaleY:0, duration:0.8, ease:'power3.inOut', delay:0.1 });
  document.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (!h || h.startsWith('#') || h.startsWith('tel:') || h.startsWith('mailto:') || h.startsWith('http') || a.target) return;
    a.addEventListener('click', e => {
      if (a.type === 'submit') return;
      e.preventDefault();
      ov.style.transformOrigin = 'bottom';
      gsap.fromTo(ov, { scaleY:0 }, { scaleY:1, duration:0.6, ease:'power3.inOut', onComplete:() => location.href = h });
    });
  });
})();

/* ── Cursor Glow ─────────────────────────────────────────────── */
(function setupCursorGlow() {
  if (window.innerWidth < 1024) return;
  const g = document.createElement('div');
  g.className = 'cursor-glow';
  document.body.appendChild(g);
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  gsap.ticker.add(() => gsap.set(g, { x:mx, y:my }));
})();

/* ── Cursor Musical Note Trail (+ staff fragment every 5th) ──── */
(function setupCursorTrail() {
  if (window.innerWidth < 1024) return;
  let last = 0;
  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - last < 140) return;
    last = now;
    _cursorTrailCounter++;

    let n;
    if (_cursorTrailCounter % 5 === 0) {
      /* Every 5th event: spawn a small staff fragment */
      n = makeCursorStaff();
      n.style.left = e.clientX + 'px';
      n.style.top  = e.clientY + 'px';
    } else {
      n = document.createElement('span');
      n.className = 'cursor-note';
      n.textContent = NOTE_CHARS[Math.floor(Math.random() * 8)];
      n.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;font-size:${rnd(12,22)}px`;
    }

    document.body.appendChild(n);
    gsap.fromTo(n,
      { opacity:0.80, scale:1.1, y:0, x:rnd(-6,6) },
      { opacity:0, scale:0.4, y:-60, duration:1.3, ease:'power2.out', onComplete:() => n.remove() }
    );
  });
})();

/* ── Click Ripple — 3-note burst ─────────────────────────────── */
(function setupClickRipple() {
  document.addEventListener('click', e => {
    if (e.target.closest('a,button,input,textarea,select,label')) return;

    /* Main circle ripple */
    const rip = document.createElement('div');
    rip.className = 'click-ripple';
    rip.style.cssText = `left:${e.clientX}px;top:${e.clientY}px`;
    document.body.appendChild(rip);
    gsap.fromTo(rip, { scale:0, opacity:0.8 }, { scale:3, opacity:0, duration:0.8, ease:'power2.out', onComplete:() => rip.remove() });

    /* 3 notes in burst at different angles */
    const angles = [-45, 0, 45];
    angles.forEach((angle, idx) => {
      const ni = document.createElement('span');
      ni.className = 'cursor-note';
      ni.textContent = NOTE_CHARS[Math.floor(Math.random() * 5)];
      ni.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;font-size:${rnd(14,22)}px`;
      document.body.appendChild(ni);

      const rad = (angle - 90) * Math.PI / 180;
      const dist = rnd(50, 90);
      gsap.fromTo(ni,
        { opacity:1, x:0, y:0, scale:1.2 },
        {
          opacity:0,
          x: Math.cos(rad) * dist,
          y: Math.sin(rad) * dist,
          scale:0.5,
          duration:0.9 + idx * 0.08,
          ease:'power2.out',
          delay: idx * 0.04,
          onComplete:() => ni.remove()
        }
      );
    });
  });
})();

/* ── Global Floating Notes (full-page backdrop) ──────────────── */
(function setupGlobalNotes() {
  const layer = document.createElement('div');
  layer.id = 'globalNoteLayer';
  document.body.appendChild(layer);
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('span');
    el.textContent = NOTE_CHARS[i % NOTE_CHARS.length];
    el.style.fontSize = rnd(10, 34) + 'px';
    layer.appendChild(el);
    gsap.set(el, {
      x:        rnd(0, window.innerWidth),
      y:        rnd(0, Math.max(document.body.scrollHeight, 2000)),
      opacity:  0,
      rotation: rnd(-35, 35)
    });
    gsap.to(el, {
      y:        `-=${rnd(120, 400)}`,
      x:        `+=${rnd(-90, 90)}`,
      opacity:   rnd(0.03, 0.09),
      rotation: `+=${rnd(-22, 22)}`,
      duration:  rnd(14, 32),
      repeat:   -1,
      yoyo:     true,
      delay:     rnd(0, 14),
      ease:     'sine.inOut'
    });
  }
})();

/* ── Staff Notation Layers (per-section animated fragments) ──── */
(function setupStaffLayers() {
  document.querySelectorAll('.staff-layer').forEach(layer => {
    for (let i = 0; i < 7; i++) {
      const frag = document.createElement('div');
      frag.className = 'staff-fragment';
      frag.innerHTML = makeStaffSVG();
      const w = rnd(120, 210);
      frag.style.cssText = `
        position:absolute;
        left:${rnd(-5, 92)}%;
        top:${rnd(-8, 82)}%;
        width:${w}px;
        height:${Math.round(w * 0.35)}px;
        color:rgba(34,34,34,0.07);
        pointer-events:none;
      `;
      layer.appendChild(frag);
      gsap.fromTo(frag,
        { opacity:0,              y:rnd(18,50),    rotation:rnd(-20,20) },
        { opacity:rnd(0.04,0.12), y:`-=${rnd(28,70)}`, rotation:`+=${rnd(-10,10)}`,
          duration:rnd(10,24), repeat:-1, yoyo:true, delay:rnd(0,9), ease:'sine.inOut' }
      );
    }
  });
})();

/* ── Navbar Scroll Effect ─────────────────────────────────────── */
(function setupNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  ScrollTrigger.create({
    start: 80,
    onEnter:     () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled')
  });

  /* Mobile toggle */
  const toggler = nav.querySelector('.trs-toggler');
  if (toggler) {
    toggler.addEventListener('click', () => nav.classList.toggle('mobile-open'));
    /* Close when a nav link is clicked */
    nav.querySelectorAll('.trs-nav-link').forEach(l => {
      l.addEventListener('click', () => nav.classList.remove('mobile-open'));
    });
  }
})();

/* ── Floating Orbs Parallax ──────────────────────────────────── */
function setupFloatingOrbs() {
  const hero = document.getElementById('hero-section');
  if (!hero || window.innerWidth < 768) return;

  const orb1 = hero.querySelector('.orb-1');
  const orb2 = hero.querySelector('.orb-2');
  const orb3 = hero.querySelector('.orb-3');
  if (!orb1 || !orb2 || !orb3) return;

  const q1 = gsap.quickTo(orb1, 'x', { duration:2.5, ease:'power1.out' });
  const q1y = gsap.quickTo(orb1, 'y', { duration:2.5, ease:'power1.out' });
  const q2 = gsap.quickTo(orb2, 'x', { duration:3.2, ease:'power1.out' });
  const q2y = gsap.quickTo(orb2, 'y', { duration:3.2, ease:'power1.out' });
  const q3 = gsap.quickTo(orb3, 'x', { duration:2.0, ease:'power1.out' });
  const q3y = gsap.quickTo(orb3, 'y', { duration:2.0, ease:'power1.out' });

  document.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth  - 0.5);
    const cy = (e.clientY / window.innerHeight - 0.5);
    q1(cx * 40);  q1y(cy * 24);
    q2(cx * -30); q2y(cy * -18);
    q3(cx * 20);  q3y(cy * 30);
  });
}

/* ── Hero Section ─────────────────────────────────────────────── */
(function setupHero() {
  const hero = document.getElementById('hero-section');
  if (!hero) return;

  /* floating music notes in hero */
  const pc = document.getElementById('heroParticles');
  if (pc) {
    for (let i = 0; i < 26; i++) {
      const n = document.createElement('span');
      n.className = 'music-note-float';
      n.textContent = NOTE_CHARS[i % NOTE_CHARS.length];
      pc.appendChild(n);
      gsap.set(n, { x:rnd(0, window.innerWidth), y:rnd(80, window.innerHeight), fontSize:rnd(14,50), opacity:0, rotation:rnd(-35,35) });
      gsap.to(n, {
        y:`-=${rnd(200,540)}`, x:`+=${rnd(-110,110)}`,
        opacity:rnd(0.04,0.20), rotation:`+=${rnd(-30,30)}`,
        duration:rnd(6,18), repeat:-1, yoyo:true, delay:rnd(0,10), ease:'sine.inOut'
      });
    }
  }

  /* text split animation for hero title */
  setupTextSplit();

  /* floating orbs parallax */
  setupFloatingOrbs();

  /* main hero timeline */
  const tl = gsap.timeline({ delay:0.3, defaults:{ ease:'power3.out' } });
  tl.to('.hero-badge',       { opacity:1, y:0, duration:0.7 })
    .to('.gsap-brand',       { opacity:1, scale:1, duration:1.1, ease:'back.out(1.5)' }, '-=0.3')
    .to('.hero-title',       { opacity:1, y:0, duration:0.8 }, '-=0.6')
    .to('.hero-subtitle',    { opacity:1, y:0, duration:0.7 }, '-=0.5')
    .to('.hero-ctas',        { opacity:1, y:0, duration:0.7 }, '-=0.4')
    .to('.hero-scroll-hint', { opacity:1, y:0, duration:0.6 }, '-=0.3');

  /* mouse parallax on aurora */
  document.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth  - 0.5) * 24;
    const cy = (e.clientY / window.innerHeight - 0.5) * 14;
    gsap.to('.hero-bg-aurora', { x:cx, y:cy, duration:2.4, ease:'power1.out' });
  });
})();

/* ── Text Split — Hero Title ─────────────────────────────────── */
function setupTextSplit() {
  const titleEl = document.querySelector('.hero-title');
  if (!titleEl) return;

  /* Preserve inner HTML structure — only split text nodes, not span elements */
  const children = Array.from(titleEl.childNodes);
  titleEl.innerHTML = '';

  children.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/(\s+)/);
      words.forEach(word => {
        if (!word.trim()) {
          titleEl.appendChild(document.createTextNode(word));
        } else {
          const span = document.createElement('span');
          span.textContent = word;
          span.style.cssText = 'display:inline-block; overflow:hidden; vertical-align:bottom;';
          const inner = document.createElement('span');
          inner.textContent = word;
          inner.style.cssText = 'display:inline-block; transform:translateY(40px); opacity:0;';
          span.innerHTML = '';
          span.appendChild(inner);
          titleEl.appendChild(span);
        }
      });
    } else {
      /* It's an element (like .text-gradient span) — wrap its text words */
      const el = node.cloneNode(true);
      titleEl.appendChild(el);
    }
  });

  /* Animate words in on load */
  const wordInners = titleEl.querySelectorAll('span > span');
  gsap.to(wordInners, {
    y:0, opacity:1,
    duration:0.65, ease:'power3.out',
    stagger:0.09,
    delay:0.9
  });
}

/* ── Horizontal Scroll Reveal ────────────────────────────────── */
function setupHorizontalScrollReveal() {
  gsap.utils.toArray('.gsap-reveal[data-dir="left"]').forEach(el => {
    gsap.fromTo(el,
      { opacity:0, x:-80 },
      { opacity:1, x:0, duration:1, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:'top 86%', once:true } }
    );
  });
  gsap.utils.toArray('.gsap-reveal[data-dir="right"]').forEach(el => {
    gsap.fromTo(el,
      { opacity:0, x:80 },
      { opacity:1, x:0, duration:1, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:'top 86%', once:true } }
    );
  });
}

/* ── Section Parallax (float orbs depth) ─────────────────────── */
function setupSectionParallax() {
  gsap.utils.toArray('.float-orb').forEach((orb, i) => {
    const speed = 0.3 + i * 0.12;
    gsap.to(orb, {
      y: `-=${120 * speed}`,
      ease:'none',
      scrollTrigger:{
        trigger: orb.closest('section') || document.body,
        start:'top bottom', end:'bottom top',
        scrub: 1.5
      }
    });
  });
}

/* ── About Page Notes ────────────────────────────────────────── */
(function setupAboutNotes() {
  const c = document.getElementById('aboutNotes');
  if (!c) return;
  for (let i = 0; i < 14; i++) {
    const n = document.createElement('span');
    n.className = 'music-note-float';
    n.textContent = NOTE_CHARS[i % 6];
    c.appendChild(n);
    gsap.set(n, { x:rnd(0, window.innerWidth), y:rnd(0, 300), fontSize:rnd(14,38), opacity:0 });
    gsap.to(n, { y:`-=${rnd(100,270)}`, opacity:rnd(0.05,0.18), rotation:rnd(-22,22), duration:rnd(4,10), repeat:-1, yoyo:true, delay:rnd(0,4), ease:'sine.inOut' });
  }
})();

/* ── Scroll-Triggered Reveals ─────────────────────────────────── */
(function setupScrollReveals() {
  gsap.utils.toArray('.gsap-reveal').forEach(el => {
    /* Skip directional — handled separately */
    if (el.dataset.dir === 'left' || el.dataset.dir === 'right') return;
    gsap.to(el, { opacity:1, y:0, duration:0.9, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 88%', once:true } });
  });

  gsap.utils.toArray('.gsap-fade-up').forEach(el => {
    gsap.to(el, { opacity:1, y:0, duration:0.8, delay:parseFloat(el.dataset.delay||0), ease:'power3.out' });
  });

  gsap.utils.toArray('.gsap-card').forEach(card => {
    const idx = parseInt(card.dataset.index || 0);
    gsap.to(card, { opacity:1, y:0, scale:1, duration:0.7, delay:idx*0.1, ease:'back.out(1.3)',
      scrollTrigger:{ trigger:card, start:'top 90%', once:true } });
  });

  gsap.utils.toArray('.gsap-instructor').forEach(el => {
    const dir = el.dataset.dir;
    const fv  = { opacity:0, x: dir==='left'?-60:dir==='right'?60:0, y: dir && dir!=='up'?0:40 };
    gsap.fromTo(el, { ...fv }, { opacity:1, x:0, y:0, duration:0.9, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 88%', once:true } });
  });

  gsap.utils.toArray('.gsap-stat').forEach((el, i) => {
    gsap.to(el, { opacity:1, y:0, duration:0.7, delay:i*0.12, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 90%', once:true } });
  });

  gsap.utils.toArray('.gsap-footer').forEach((el, i) => {
    gsap.to(el, { opacity:1, y:0, duration:0.7, delay:i*0.08, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 95%', once:true } });
  });

  /* Horizontal reveals */
  setupHorizontalScrollReveal();
})();

/* ── Stat Counter Animation ──────────────────────────────────── */
(function setupCounters() {
  setupCounterTick();
})();

function setupCounterTick() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.target || 0);
    const suffix = el.dataset.suffix || '';
    let counted = false;
    let lastMilestone = 0;

    ScrollTrigger.create({ trigger:el, start:'top 85%', once:true, onEnter:() => {
      if (counted) return; counted = true;
      const obj = { val:0 };

      gsap.to(obj, {
        val: target,
        duration: 2.4,
        ease: 'power2.out',
        onUpdate: function() {
          const v = Math.ceil(obj.val);
          el.textContent = target >= 1000 ? v.toLocaleString('en-IN') + suffix : v + suffix;

          /* Scale pulse on each 10% milestone */
          const pct = obj.val / target;
          const milestone = Math.floor(pct * 10);
          if (milestone > lastMilestone && milestone < 10) {
            lastMilestone = milestone;
            gsap.fromTo(el,
              { scale:1.18 },
              { scale:1, duration:0.22, ease:'back.out(2)' }
            );
          }
        },
        onComplete: () => {
          el.textContent = target >= 1000 ? target.toLocaleString('en-IN') + suffix : target + suffix;
          gsap.fromTo(el, { scale:1.12 }, { scale:1, duration:0.3, ease:'elastic.out(1,0.5)' });
        }
      });
    }});
  });
}

/* ── 3D Card Tilt (enhanced with inner glow) ─────────────────── */
(function setupCardTilt() {
  if (window.innerWidth < 768) return;
  document.querySelectorAll('.course-card').forEach(card => {
    /* Ensure we have an inner glow target */
    let innerGlow = card.querySelector('.card-inner-glow');
    if (!innerGlow) {
      innerGlow = document.createElement('div');
      innerGlow.className = 'card-inner-glow';
      innerGlow.style.cssText = `
        position:absolute; inset:0; border-radius:inherit;
        pointer-events:none; z-index:0; transition:background 0.3s;
        background:transparent;
      `;
      card.appendChild(innerGlow);
    }

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top)  / r.height;
      const rx = (x - 0.5);
      const ry = (y - 0.5);

      gsap.to(card, {
        rotateX: -ry * 14,
        rotateY: rx  * 14,
        transformPerspective: 1200,
        duration: 0.4,
        ease: 'power2.out'
      });

      /* Inner mouse-follow glow */
      innerGlow.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(250,129,18,0.08), transparent 60%)`;
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX:0, rotateY:0, duration:0.6, ease:'elastic.out(1,0.5)' });
      innerGlow.style.background = 'transparent';
    });
  });
})();

/* ── Magnetic Buttons ─────────────────────────────────────────── */
(function setupMagneticButtons() {
  if (window.innerWidth < 768) return;
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width  / 2;
      const y = e.clientY - r.top  - r.height / 2;
      gsap.to(btn, { x:x*0.25, y:y*0.25, duration:0.35, ease:'power2.out' });
    });
    btn.addEventListener('mouseleave', () => gsap.to(btn, { x:0, y:0, duration:0.6, ease:'elastic.out(1,0.4)' }));
  });
})();

/* ── Reviews Swiper ──────────────────────────────────────────── */
(function setupSwiper() {
  if (!document.querySelector('.reviews-swiper')) return;
  new Swiper('.reviews-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: { delay:4500, disableOnInteraction:false, pauseOnMouseEnter:true },
    pagination: { el:'.reviews-pagination', clickable:true },
    navigation: { nextEl:'.reviews-next', prevEl:'.reviews-prev' },
    breakpoints: { 640:{ slidesPerView:2 }, 1024:{ slidesPerView:3 } },
    effect: 'slide'
  });
})();

/* ── Stat Card Glow on Hover — white glow (orange bg) ───────── */
(function setupGlowPulse() {
  gsap.utils.toArray('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => gsap.to(card, { boxShadow:'0 20px 60px rgba(255,255,255,0.18)', duration:0.3 }));
    card.addEventListener('mouseleave', () => gsap.to(card, { boxShadow:'none', duration:0.4 }));
  });
})();

/* ── Instructor Avatar Ring Speed-up ─────────────────────────── */
(function setupAvatarHover() {
  document.querySelectorAll('.instructor-card').forEach(card => {
    const ring = card.querySelector('.av-ring');
    if (!ring) return;
    card.addEventListener('mouseenter', () => { ring.style.animationDuration = '0.7s'; });
    card.addEventListener('mouseleave', () => { ring.style.animationDuration = '4s'; });
  });
})();

/* ── Active Nav Highlight by Scroll Section ──────────────────── */
(function setupActiveSectionNav() {
  const secs = document.querySelectorAll('section[id]');
  if (!secs.length) return;
  const hl = id => {
    document.querySelectorAll('.trs-nav-link').forEach(l => l.classList.remove('active'));
    const lnk = document.querySelector(`.trs-nav-link[href="/#${id}"]`);
    if (lnk) lnk.classList.add('active');
  };
  secs.forEach(s => ScrollTrigger.create({ trigger:s, start:'top 50%', end:'bottom 50%', onEnter:()=>hl(s.id), onEnterBack:()=>hl(s.id) }));
})();

/* ── CTA Banner Parallax ─────────────────────────────────────── */
(function setupCTAParallax() {
  document.querySelectorAll('.cta-banner').forEach(el => {
    const glow = el.querySelector('.cta-banner-glow');
    if (!glow) return;
    gsap.to(glow, { y:-40, ease:'none', scrollTrigger:{ trigger:el, start:'top bottom', end:'bottom top', scrub:true } });
  });
})();

/* ── Page Load Bar ───────────────────────────────────────────── */
(function setupLoadBar() {
  const bar = document.createElement('div');
  bar.id = 'pageLoader';
  document.body.prepend(bar);
  gsap.to(bar, { width:'100%', duration:0.6, ease:'power2.out',
    onComplete:() => gsap.to(bar, { opacity:0, duration:0.3, delay:0.2, onComplete:()=>bar.remove() })
  });
})();

/* ── Video Card Hover ────────────────────────────────────────── */
(function setupVideoCardHover() {
  document.querySelectorAll('.video-card').forEach(card => {
    const ov = card.querySelector('.video-overlay');
    if (!ov) return;
    card.addEventListener('mouseenter', () => gsap.to(ov, { background:'rgba(34,34,34,0.18)', duration:0.3 }));
    card.addEventListener('mouseleave', () => gsap.to(ov, { background:'rgba(34,34,34,0.45)', duration:0.3 }));
  });
})();

/* ── Review Card — spawn floating note on hover ──────────────── */
(function setupReviewCardNotes() {
  document.querySelectorAll('.review-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const n = document.createElement('span');
      n.className = 'cursor-note';
      const r = card.getBoundingClientRect();
      n.style.cssText = `left:${r.left + rnd(20, Math.max(r.width-20, 21))}px;top:${r.top + 14}px;font-size:${rnd(14,22)}px`;
      n.textContent = NOTE_CHARS[Math.floor(Math.random() * 5)];
      document.body.appendChild(n);
      gsap.fromTo(n, { opacity:0.85, scale:1.2, y:0 }, { opacity:0, scale:0.55, y:-58, duration:1.4, ease:'power2.out', onComplete:()=>n.remove() });
    });
  });
})();

/* ── Waveform bar animation on stats section entry ───────────── */
(function setupWaveformBars() {
  const section = document.querySelector('.stats-section');
  if (!section) return;

  const wrap = document.createElement('div');
  wrap.className = 'waveform-deco';
  wrap.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 28; i++) {
    const b = document.createElement('div');
    b.className = 'wf-bar';
    b.style.cssText = `--dly:${(i * 0.07).toFixed(2)}s;--h:${rnd(10,48)}px`;
    wrap.appendChild(b);
  }
  section.appendChild(wrap);
})();

/* ── Section Parallax ────────────────────────────────────────── */
(function() {
  window.addEventListener('load', () => {
    setupSectionParallax();
    ScrollTrigger.refresh();
  });
})();
