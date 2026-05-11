/* ═══════════════════════════════════════════════════════════════
   THE RAW STUDIOS — main.js  v5  (White/Black/Orange Theme)
   GSAP · Swiper · Musical Interactions
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
    <line x1="22" y1="13" x2="200" y2="13" stroke="currentColor" stroke-width="0.85" opacity="0.70"/>
    <line x1="22" y1="22" x2="200" y2="22" stroke="currentColor" stroke-width="0.85" opacity="0.70"/>
    <line x1="22" y1="31" x2="200" y2="31" stroke="currentColor" stroke-width="0.85" opacity="0.70"/>
    <line x1="22" y1="40" x2="200" y2="40" stroke="currentColor" stroke-width="0.85" opacity="0.70"/>
    <line x1="22" y1="49" x2="200" y2="49" stroke="currentColor" stroke-width="0.85" opacity="0.70"/>
    <line x1="22" y1="13" x2="22" y2="49" stroke="currentColor" stroke-width="1.8" opacity="0.70"/>
    <text x="0"   y="51" font-family="serif" font-size="46" fill="currentColor" opacity="0.90">${clef}</text>
    <text x="65"  y="${ys[0]}" font-family="serif" font-size="17" fill="currentColor">${pick()}</text>
    <text x="110" y="${ys[1]}" font-family="serif" font-size="15" fill="currentColor">${pick()}</text>
    <text x="152" y="${ys[2]}" font-family="serif" font-size="17" fill="currentColor">${pick()}</text>
  </svg>`;
}

/* ── Cursor Staff SVG ────────────────────────────────────────── */
function makeCursorStaff() {
  const div = document.createElement('div');
  div.className = 'cursor-note';
  div.style.cssText = `display:inline-block; line-height:1;`;
  div.innerHTML = `<svg viewBox="0 0 60 28" width="60" height="28" xmlns="http://www.w3.org/2000/svg" style="display:block">
    <line x1="8" y1="8"  x2="60" y2="8"  stroke="rgba(255,98,0,0.7)" stroke-width="0.9"/>
    <line x1="8" y1="14" x2="60" y2="14" stroke="rgba(255,98,0,0.7)" stroke-width="0.9"/>
    <line x1="8" y1="20" x2="60" y2="20" stroke="rgba(255,98,0,0.7)" stroke-width="0.9"/>
    <text x="0" y="23" font-family="serif" font-size="26" fill="rgba(255,98,0,0.85)">𝄞</text>
    <text x="30" y="${[10,16,22][Math.floor(Math.random()*3)]}" font-family="serif" font-size="12" fill="rgba(255,98,0,0.7)">♪</text>
  </svg>`;
  return div;
}

/* ── Full-screen Page Loader ──────────────────────────────────── */
(function setupPageLoader() {
  const loader = document.getElementById('trs-loader');
  if (!loader) return;

  /* After 1.4s (loader animation done), fade out */
  const hideLoader = () => {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.55,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.style.display = 'none';
        loader.remove();
      }
    });
  };

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 200);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 200));
    /* Fallback: force hide after 2.5s even if load event is slow */
    setTimeout(hideLoader, 2500);
  }
})();

/* ── Page Transition ─────────────────────────────────────────── */
(function setupPageTransition() {
  const ov = document.createElement('div');
  ov.id = 'pageTransition';
  document.body.appendChild(ov);
  gsap.fromTo(ov, { scaleY:1, transformOrigin:'top' }, { scaleY:0, duration:0.7, ease:'power3.inOut', delay:0.1 });
  document.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (!h || h.startsWith('#') || h.startsWith('tel:') || h.startsWith('mailto:') || h.startsWith('http') || a.target) return;
    a.addEventListener('click', e => {
      if (a.type === 'submit') return;
      e.preventDefault();
      ov.style.transformOrigin = 'bottom';
      gsap.fromTo(ov, { scaleY:0 }, { scaleY:1, duration:0.5, ease:'power3.inOut', onComplete:() => location.href = h });
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

/* ── Cursor Musical Note Trail ───────────────────────────────── */
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

/* ── Click Ripple ────────────────────────────────────────────── */
(function setupClickRipple() {
  document.addEventListener('click', e => {
    if (e.target.closest('a,button,input,textarea,select,label')) return;
    const rip = document.createElement('div');
    rip.className = 'click-ripple';
    rip.style.cssText = `left:${e.clientX}px;top:${e.clientY}px`;
    document.body.appendChild(rip);
    gsap.fromTo(rip, { scale:0, opacity:0.8 }, { scale:3, opacity:0, duration:0.8, ease:'power2.out', onComplete:() => rip.remove() });

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
        { opacity:0, x:Math.cos(rad)*dist, y:Math.sin(rad)*dist, scale:0.5,
          duration:0.9 + idx * 0.08, ease:'power2.out', delay:idx * 0.04, onComplete:() => ni.remove() }
      );
    });
  });
})();

/* ── Global Floating Notes ───────────────────────────────────── */
(function setupGlobalNotes() {
  const layer = document.createElement('div');
  layer.id = 'globalNoteLayer';
  document.body.appendChild(layer);
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('span');
    el.textContent = NOTE_CHARS[i % NOTE_CHARS.length];
    el.style.fontSize = rnd(10, 30) + 'px';
    layer.appendChild(el);
    gsap.set(el, {
      x: rnd(0, window.innerWidth),
      y: rnd(0, Math.max(document.body.scrollHeight, 2000)),
      opacity: 0,
      rotation: rnd(-35, 35)
    });
    gsap.to(el, {
      y: `-=${rnd(120, 400)}`,
      x: `+=${rnd(-90, 90)}`,
      opacity: rnd(0.03, 0.08),
      rotation: `+=${rnd(-22, 22)}`,
      duration: rnd(14, 32),
      repeat: -1, yoyo: true, delay: rnd(0, 14), ease:'sine.inOut'
    });
  }
})();

/* ── Staff Notation Layers ───────────────────────────────────── */
(function setupStaffLayers() {
  document.querySelectorAll('.staff-layer').forEach(layer => {
    for (let i = 0; i < 6; i++) {
      const frag = document.createElement('div');
      frag.className = 'staff-fragment';
      frag.innerHTML = makeStaffSVG();
      const w = rnd(110, 200);
      frag.style.cssText = `
        position:absolute;
        left:${rnd(-5, 92)}%;
        top:${rnd(-8, 82)}%;
        width:${w}px;
        height:${Math.round(w * 0.35)}px;
        color:rgba(0,0,0,0.06);
        pointer-events:none;
      `;
      layer.appendChild(frag);
      gsap.fromTo(frag,
        { opacity:0, y:rnd(18,50), rotation:rnd(-20,20) },
        { opacity:rnd(0.04,0.10), y:`-=${rnd(28,70)}`, rotation:`+=${rnd(-10,10)}`,
          duration:rnd(10,24), repeat:-1, yoyo:true, delay:rnd(0,9), ease:'sine.inOut' }
      );
    }
  });
})();

/* ── Navbar Scroll Effect ────────────────────────────────────── */
(function setupNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  ScrollTrigger.create({
    start: 60,
    onEnter:     () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled')
  });
})();

/* ── Floating Orbs Parallax ──────────────────────────────────── */
function setupFloatingOrbs() {
  const hero = document.getElementById('hero-section');
  if (!hero || window.innerWidth < 768) return;
  const orb1 = hero.querySelector('.orb-1');
  const orb2 = hero.querySelector('.orb-2');
  const orb3 = hero.querySelector('.orb-3');
  if (!orb1 || !orb2 || !orb3) return;

  const q1  = gsap.quickTo(orb1, 'x', { duration:2.5, ease:'power1.out' });
  const q1y = gsap.quickTo(orb1, 'y', { duration:2.5, ease:'power1.out' });
  const q2  = gsap.quickTo(orb2, 'x', { duration:3.2, ease:'power1.out' });
  const q2y = gsap.quickTo(orb2, 'y', { duration:3.2, ease:'power1.out' });
  const q3  = gsap.quickTo(orb3, 'x', { duration:2.0, ease:'power1.out' });
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

  const pc = document.getElementById('heroParticles');
  if (pc) {
    for (let i = 0; i < 22; i++) {
      const n = document.createElement('span');
      n.className = 'music-note-float';
      n.textContent = NOTE_CHARS[i % NOTE_CHARS.length];
      pc.appendChild(n);
      gsap.set(n, { x:rnd(0, window.innerWidth), y:rnd(80, window.innerHeight), fontSize:rnd(14,48), opacity:0, rotation:rnd(-35,35) });
      gsap.to(n, {
        y:`-=${rnd(200,540)}`, x:`+=${rnd(-110,110)}`,
        opacity:rnd(0.04,0.18), rotation:`+=${rnd(-30,30)}`,
        duration:rnd(6,18), repeat:-1, yoyo:true, delay:rnd(0,10), ease:'sine.inOut'
      });
    }
  }

  setupTextSplit();
  setupFloatingOrbs();

  const tl = gsap.timeline({ delay:0.35, defaults:{ ease:'power3.out' } });
  tl.to('.hero-badge',       { opacity:1, y:0, duration:0.7 })
    .to('.gsap-brand',       { opacity:1, scale:1, duration:1.1, ease:'back.out(1.5)' }, '-=0.3')
    .to('.hero-title',       { opacity:1, y:0, duration:0.8 }, '-=0.6')
    .to('.hero-subtitle',    { opacity:1, y:0, duration:0.7 }, '-=0.5')
    .to('.hero-ctas',        { opacity:1, y:0, duration:0.7 }, '-=0.4')
    .to('.hero-scroll-hint', { opacity:1, y:0, duration:0.6 }, '-=0.3');

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
          span.style.cssText = 'display:inline-block; overflow:hidden; vertical-align:bottom;';
          const inner = document.createElement('span');
          inner.textContent = word;
          inner.style.cssText = 'display:inline-block; transform:translateY(40px); opacity:0;';
          span.appendChild(inner);
          titleEl.appendChild(span);
        }
      });
    } else {
      titleEl.appendChild(node.cloneNode(true));
    }
  });
  const wordInners = titleEl.querySelectorAll('span > span');
  gsap.to(wordInners, { y:0, opacity:1, duration:0.65, ease:'power3.out', stagger:0.09, delay:0.95 });
}

/* ── Horizontal Scroll Reveal ────────────────────────────────── */
function setupHorizontalScrollReveal() {
  gsap.utils.toArray('.gsap-reveal[data-dir="left"]').forEach(el => {
    gsap.fromTo(el,
      { opacity:0, x:-80 },
      { opacity:1, x:0, duration:1, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 86%', once:true } }
    );
  });
  gsap.utils.toArray('.gsap-reveal[data-dir="right"]').forEach(el => {
    gsap.fromTo(el,
      { opacity:0, x:80 },
      { opacity:1, x:0, duration:1, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 86%', once:true } }
    );
  });
}

/* ── Section Parallax ────────────────────────────────────────── */
function setupSectionParallax() {
  gsap.utils.toArray('.float-orb').forEach((orb, i) => {
    const speed = 0.3 + i * 0.12;
    gsap.to(orb, {
      y: `-=${120 * speed}`, ease:'none',
      scrollTrigger:{ trigger: orb.closest('section') || document.body, start:'top bottom', end:'bottom top', scrub:1.5 }
    });
  });
}

/* ── About Page Notes ────────────────────────────────────────── */
(function setupAboutNotes() {
  const c = document.getElementById('aboutNotes');
  if (!c) return;
  for (let i = 0; i < 12; i++) {
    const n = document.createElement('span');
    n.className = 'music-note-float';
    n.textContent = NOTE_CHARS[i % 6];
    c.appendChild(n);
    gsap.set(n, { x:rnd(0, window.innerWidth), y:rnd(0, 300), fontSize:rnd(14,36), opacity:0 });
    gsap.to(n, { y:`-=${rnd(100,260)}`, opacity:rnd(0.05,0.16), rotation:rnd(-22,22), duration:rnd(4,10), repeat:-1, yoyo:true, delay:rnd(0,4), ease:'sine.inOut' });
  }
})();

/* ── Scroll-Triggered Reveals ─────────────────────────────────── */
(function setupScrollReveals() {
  gsap.utils.toArray('.gsap-reveal').forEach(el => {
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
    const fv  = { opacity:0, x:dir==='left'?-60:dir==='right'?60:0, y:(!dir||dir==='up')?40:0 };
    gsap.fromTo(el, { ...fv }, { opacity:1, x:0, y:0, duration:0.9, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 88%', once:true } });
  });

  gsap.utils.toArray('.gsap-stat').forEach((el, i) => {
    gsap.to(el, { opacity:1, y:0, duration:0.7, delay:i*0.12, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 90%', once:true } });
  });

  gsap.utils.toArray('.gsap-footer').forEach((el, i) => {
    gsap.to(el, { opacity:1, y:0, duration:0.7, delay:i*0.08, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 95%', once:true } });
  });

  setupHorizontalScrollReveal();
})();

/* ── Stat Counter ────────────────────────────────────────────── */
(function setupCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.target || 0);
    const suffix = el.dataset.suffix || '';
    let counted = false, lastMilestone = 0;
    ScrollTrigger.create({ trigger:el, start:'top 85%', once:true, onEnter:() => {
      if (counted) return; counted = true;
      const obj = { val:0 };
      gsap.to(obj, {
        val: target, duration:2.4, ease:'power2.out',
        onUpdate: function() {
          const v = Math.ceil(obj.val);
          el.textContent = target >= 1000 ? v.toLocaleString('en-IN') + suffix : v + suffix;
          const pct = obj.val / target;
          const milestone = Math.floor(pct * 10);
          if (milestone > lastMilestone && milestone < 10) {
            lastMilestone = milestone;
            gsap.fromTo(el, { scale:1.18 }, { scale:1, duration:0.22, ease:'back.out(2)' });
          }
        },
        onComplete: () => {
          el.textContent = target >= 1000 ? target.toLocaleString('en-IN') + suffix : target + suffix;
          gsap.fromTo(el, { scale:1.12 }, { scale:1, duration:0.3, ease:'elastic.out(1,0.5)' });
        }
      });
    }});
  });
})();

/* ── 3D Card Tilt ────────────────────────────────────────────── */
(function setupCardTilt() {
  if (window.innerWidth < 768) return;
  document.querySelectorAll('.course-card').forEach(card => {
    let innerGlow = card.querySelector('.card-inner-glow');
    if (!innerGlow) {
      innerGlow = document.createElement('div');
      innerGlow.className = 'card-inner-glow';
      innerGlow.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;transition:background 0.3s;background:transparent;';
      card.appendChild(innerGlow);
    }
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top)  / r.height;
      gsap.to(card, { rotateX:-(y-0.5)*14, rotateY:(x-0.5)*14, transformPerspective:1200, duration:0.4, ease:'power2.out' });
      innerGlow.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,98,0,0.07), transparent 60%)`;
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
  });
})();

/* ── Stat Card Glow ──────────────────────────────────────────── */
(function setupGlowPulse() {
  gsap.utils.toArray('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => gsap.to(card, { boxShadow:'0 20px 60px rgba(255,255,255,0.18)', duration:0.3 }));
    card.addEventListener('mouseleave', () => gsap.to(card, { boxShadow:'none', duration:0.4 }));
  });
})();

/* ── Instructor Photo Ring Speed-up on Hover ─────────────────── */
(function setupAvatarHover() {
  document.querySelectorAll('.instructor-card').forEach(card => {
    const ring = card.querySelector('.instructor-photo-ring');
    if (!ring) return;
    card.addEventListener('mouseenter', () => { ring.style.animationDuration = '0.7s'; });
    card.addEventListener('mouseleave', () => { ring.style.animationDuration = '4s'; });
  });
})();

/* ── CTA Banner Parallax ─────────────────────────────────────── */
(function setupCTAParallax() {
  document.querySelectorAll('.cta-banner').forEach(el => {
    const glow = el.querySelector('.cta-banner-glow');
    if (!glow) return;
    gsap.to(glow, { y:-40, ease:'none', scrollTrigger:{ trigger:el, start:'top bottom', end:'bottom top', scrub:true } });
  });
})();

/* ── Video Card Hover ────────────────────────────────────────── */
(function setupVideoCardHover() {
  document.querySelectorAll('.video-card').forEach(card => {
    const ov = card.querySelector('.video-overlay');
    if (!ov) return;
    card.addEventListener('mouseenter', () => gsap.to(ov, { background:'rgba(0,0,0,0.18)', duration:0.3 }));
    card.addEventListener('mouseleave', () => gsap.to(ov, { background:'rgba(0,0,0,0.42)', duration:0.3 }));
  });
})();

/* ── Review Card hover note ──────────────────────────────────── */
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

/* ── Waveform bars on stats section ─────────────────────────── */
(function setupWaveformBars() {
  const section = document.querySelector('.stats-section');
  if (!section) return;
  const wrap = document.createElement('div');
  wrap.className = 'waveform-deco';
  wrap.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 26; i++) {
    const b = document.createElement('div');
    b.className = 'wf-bar';
    b.style.cssText = `--dly:${(i * 0.07).toFixed(2)}s;--h:${rnd(10,46)}px`;
    wrap.appendChild(b);
  }
  section.appendChild(wrap);
})();

/* ── Gallery item lightbox hint ──────────────────────────────── */
(function setupGalleryHover() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mouseenter', () => gsap.to(item, { scale:1.02, duration:0.3, ease:'power2.out' }));
    item.addEventListener('mouseleave', () => gsap.to(item, { scale:1, duration:0.4, ease:'power2.inOut' }));
  });
})();

/* ── Section Parallax (on window load) ───────────────────────── */
(function() {
  window.addEventListener('load', () => {
    setupSectionParallax();
    ScrollTrigger.refresh();
  });
})();

/* ── Gallery Lightbox ────────────────────────────────────────── */
(function setupGalleryLightbox() {
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  if (!items.length) return;

  const images = items.map(item => item.querySelector('img')?.src).filter(Boolean);
  let current = 0;

  const overlay = document.createElement('div');
  overlay.id = 'galleryLightbox';
  overlay.innerHTML = `
    <button class="glb-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
    <button class="glb-prev"  aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>
    <div class="glb-img-wrap"><img class="glb-img" src="" alt="Gallery"/></div>
    <button class="glb-next"  aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>
    <div class="glb-counter"></div>
  `;
  document.body.appendChild(overlay);

  const glbImg     = overlay.querySelector('.glb-img');
  const glbCounter = overlay.querySelector('.glb-counter');

  function showAt(idx) {
    current = (idx + images.length) % images.length;
    glbImg.src = images[current];
    glbCounter.textContent = `${current + 1} / ${images.length}`;
  }
  function open(idx) {
    showAt(idx);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  items.forEach((item, idx) => item.addEventListener('click', () => open(idx)));
  overlay.querySelector('.glb-close').addEventListener('click', close);
  overlay.querySelector('.glb-prev').addEventListener('click', () => showAt(current - 1));
  overlay.querySelector('.glb-next').addEventListener('click', () => showAt(current + 1));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  showAt(current - 1);
    if (e.key === 'ArrowRight') showAt(current + 1);
  });
})();

/* ── Contact Form input focus animations ─────────────────────── */
(function setupContactForm() {
  document.querySelectorAll('.trs-input-field').forEach(input => {
    input.addEventListener('focus', () => {
      const wrap = input.closest('.trs-input-wrap');
      if (wrap) gsap.to(wrap, { borderColor:'rgba(255,98,0,0.70)', duration:0.3 });
    });
    input.addEventListener('blur', () => {
      const wrap = input.closest('.trs-input-wrap');
      if (wrap) gsap.to(wrap, { borderColor:'rgba(0,0,0,0.12)', duration:0.3 });
    });
  });
})();

/* ── Footer Form → WhatsApp ──────────────────────────────────── */
(function setupFooterFormToWhatsApp() {
  const form = document.getElementById('footerForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name  = (form.querySelector('[name="firstName"]')?.value || '').trim();
    const phone = (form.querySelector('[name="phone"]')?.value    || '').trim();
    const email = (form.querySelector('[name="email"]')?.value    || '').trim();
    const msg   = (form.querySelector('[name="message"]')?.value  || '').trim();

    const waText = [
      `Hello! I found your contact from The Raw Studios website.`,
      ``,
      `*Name:* ${name}`,
      `*Phone:* ${phone}`,
      `*Email:* ${email}`,
      msg ? `*Message:* ${msg}` : '',
      ``,
      `I would like to know more about your courses and timings. Please guide me!`
    ].filter(Boolean).join('\n');

    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Opening WhatsApp...'; }

    setTimeout(() => {
      window.open(`https://api.whatsapp.com/send/?phone=919754444450&text=${encodeURIComponent(waText)}`, '_blank', 'noopener,noreferrer');
      form.reset();
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> Send Message'; }
    }, 500);
  });
})();

/* ── Label Page: Video card click-to-play ────────────────────── */
(function setupVideoCards() {
  document.querySelectorAll('.video-card').forEach((card, i) => {
    const videoId   = card.dataset.videoid;
    const thumb     = document.getElementById('thumb-' + i);
    const iframeWrap = document.getElementById('iframe-' + i);
    if (!thumb || !iframeWrap || !videoId) return;

    card.addEventListener('mouseenter', () => {
      const btn = card.querySelector('.play-btn');
      if (btn) gsap.to(btn, { scale:1.15, duration:0.3, ease:'back.out(2)' });
    });
    card.addEventListener('mouseleave', () => {
      const btn = card.querySelector('.play-btn');
      if (btn) gsap.to(btn, { scale:1, duration:0.3 });
    });

    thumb.addEventListener('click', () => {
      gsap.to(thumb, {
        opacity:0, scale:1.05, duration:0.3, ease:'power2.in',
        onComplete: () => {
          thumb.style.display = 'none';
          iframeWrap.style.display = 'block';
          iframeWrap.innerHTML = `<iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="video-iframe"
          ></iframe>`;
          gsap.from(iframeWrap, { opacity:0, scale:0.95, duration:0.4, ease:'power2.out' });
        }
      });
    });
  });
})();

/* ── Courses Page: filter tabs ───────────────────────────────── */
(function setupCourseFilter() {
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const courseItems = document.querySelectorAll('.course-item');
  if (!filterBtns.length || !courseItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      courseItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        if (show) {
          item.style.display = 'block';
          gsap.to(item, { opacity:1, scale:1, duration:0.4, ease:'back.out(1.2)' });
        } else {
          gsap.to(item, { opacity:0, scale:0.8, duration:0.3, ease:'power2.in',
            onComplete: () => { item.style.display = 'none'; } });
        }
      });
    });
  });
})();

/* ── Contact Form → WhatsApp redirect on submit ──────────────── */
(function setupFormToWhatsApp() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name    = (form.querySelector('[name="firstName"]')?.value || '').trim();
    const phone   = (form.querySelector('[name="phone"]')?.value    || '').trim();
    const email   = (form.querySelector('[name="email"]')?.value    || '').trim();
    const course  = (form.querySelector('[name="message"]')?.value  || '').trim();

    const msg = [
      `Hello! I found your contact from The Raw Studios website.`,
      ``,
      `*Name:* ${name}`,
      `*Phone:* ${phone}`,
      `*Email:* ${email}`,
      course ? `*Course Interested In:* ${course}` : '',
      ``,
      `I would like to know more about your courses and timings. Please guide me!`
    ].filter(Boolean).join('\n');

    const waURL = `https://api.whatsapp.com/send/?phone=919754444450&text=${encodeURIComponent(msg)}`;

    /* Button loading animation */
    const btn = form.querySelector('.btn-submit-big');
    if (btn) {
      const txt = btn.querySelector('.btn-text');
      const ldr = btn.querySelector('.btn-loading');
      if (txt) txt.style.display = 'none';
      if (ldr) ldr.style.display = 'inline';
      btn.disabled = true;
    }

    /* Brief delay so user sees the animation, then open WhatsApp */
    setTimeout(() => {
      window.open(waURL, '_blank', 'noopener,noreferrer');
      /* Re-enable button after opening */
      if (btn) {
        setTimeout(() => {
          const txt = btn.querySelector('.btn-text');
          const ldr = btn.querySelector('.btn-loading');
          if (txt) txt.style.display = 'inline';
          if (ldr) ldr.style.display = 'none';
          btn.disabled = false;
        }, 1500);
      }
    }, 600);
  });
})();
