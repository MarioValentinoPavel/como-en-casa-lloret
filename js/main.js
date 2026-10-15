// Como en Casa · Mirian & Salva
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const D = window.I18N;
  const LOCALE = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB', fr: 'fr-FR' };
  const WA = '34668504405';

  let lang = '';
  try { lang = localStorage.getItem('cec-lang') || ''; } catch (e) { /* sin almacenamiento */ }
  if (!D[lang]) { const n = (navigator.language || 'es').slice(0, 2).toLowerCase(); lang = D[n] ? n : 'es'; }
  const t = (k) => (D[lang][k] !== undefined ? D[lang][k] : D.es[k]);

  // ---------- horario (hora de Madrid) ----------
  // índice 0 = lunes; minutos desde medianoche; 25*60 = la 1:00 del día siguiente
  const HOURS = [null, [7 * 60, 25 * 60], [9 * 60, 25 * 60], [9 * 60, 25 * 60], [9 * 60, 25 * 60], [9 * 60, 25 * 60], [9 * 60, 25 * 60]];
  const fmt = (mins) => `${Math.floor(mins / 60) % 24}:${String(mins % 60).padStart(2, '0')}`;
  function madridNow() {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const g = (type) => parts.find((p) => p.type === type).value;
    return { d: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(g('weekday')), m: +g('hour') * 60 + +g('minute'), iso: `${g('year')}-${g('month')}-${g('day')}` };
  }
  function renderStatus() {
    const { d, m } = madridNow();
    const prev = (d + 6) % 7;
    const open = (HOURS[d] && m >= HOURS[d][0]) || (HOURS[prev] && m < HOURS[prev][1] - 1440);
    const el = $('#status');
    el.classList.toggle('is-open', !!open);
    let txt;
    if (open) txt = t('st.open');
    else if (HOURS[d]) txt = t('st.at').replace('{t}', fmt(HOURS[d][0]));
    else txt = t('st.monday');
    $('span', el).textContent = txt;
  }
  function renderHours() {
    const { d } = madridNow();
    const days = t('days');
    $('#horario').innerHTML = days.map((name, i) => {
      const h = HOURS[i];
      const cls = [i === d ? 'is-today' : '', h ? '' : 'is-off'].join(' ').trim();
      return `<li${cls ? ` class="${cls}"` : ''}><span>${name}</span><span>${h ? fmt(h[0]) + ' – ' + fmt(h[1]) : t('closed')}</span></li>`;
    }).join('');
  }

  // ---------- idiomas ----------
  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    $$('[data-i18n]').forEach((el) => { const v = t(el.dataset.i18n); if (typeof v === 'string') el.textContent = v; });
    $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    $$('.langs button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    $('#hint span').textContent = fine ? t('hero.hint') : t('hero.hintTouch');
    $('#aqui-list').innerHTML = t('aqui').map((x) => `<li>${x}</li>`).join('');
    renderHours();
    renderStatus();
    updateHunger(false);
    try { localStorage.setItem('cec-lang', l); } catch (e) { /* sin almacenamiento */ }
  }
  $$('.langs button').forEach((b) => b.addEventListener('click', () => { applyLang(b.dataset.lang); ScrollTrigger.refresh(); }));

  // ---------- ¿cuánta hambre traes? ----------
  let hunger = null;
  const hBtns = $$('.hambre-opts button');
  const list = $('#platos');
  const order = $$('.plato', list);
  function updateHunger(anim) {
    hBtns.forEach((b) => { b.setAttribute('aria-checked', String(b.dataset.h === hunger)); b.tabIndex = (hunger ? b.dataset.h === hunger : b === hBtns[0]) ? 0 : -1; });
    if (hunger) list.dataset.sel = hunger; else delete list.dataset.sel;
    const on = order.filter((p) => { const yes = p.dataset.h === hunger; p.classList.toggle('on', yes); return yes; });
    $('#hambre-msg').textContent = t(hunger ? 'h.m' + hunger : 'h.m0');
    if (!anim) return;
    // los platos elegidos suben al principio de la lista
    const state = window.Flip && !reduced ? Flip.getState(order) : null;
    [...on, ...order.filter((p) => !on.includes(p))].forEach((p) => list.appendChild(p));
    if (state) Flip.from(state, { duration: 0.75, ease: 'power3.inOut', onComplete: () => ScrollTrigger.refresh() });
    if (!reduced && on.length) {
      gsap.fromTo(on.map((p) => $('h3', p)), { scaleY: 0.86, scaleX: 1.05 }, { scaleY: 1, scaleX: 1, duration: 0.9, delay: 0.5, ease: 'elastic.out(1, .4)', stagger: 0.05, transformOrigin: '0% 100%', clearProps: 'transform' });
    }
  }
  hBtns.forEach((b, i) => {
    b.addEventListener('click', () => { hunger = hunger === b.dataset.h ? null : b.dataset.h; updateHunger(true); });
    b.addEventListener('keydown', (e) => {
      const k = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!k) return;
      e.preventDefault();
      const nb = hBtns[(i + k + hBtns.length) % hBtns.length];
      hunger = nb.dataset.h; updateHunger(true); nb.focus();
    });
  });

  // ---------- guárdame sitio (WhatsApp) ----------
  let people = 2;
  const out = $('#n-out');
  const setPeople = (n) => { people = Math.max(1, Math.min(20, n)); out.textContent = people; };
  $('#n-less').addEventListener('click', () => setPeople(people - 1));
  $('#n-more').addEventListener('click', () => setPeople(people + 1));
  const dayIn = $('#r-day');
  const isMonday = (iso) => new Date(iso + 'T12:00:00').getDay() === 1;
  (() => {
    const { iso } = madridNow();
    dayIn.min = iso;
    let start = new Date(iso + 'T12:00:00');
    if (start.getDay() === 1) start.setDate(start.getDate() + 1);
    dayIn.value = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  })();
  const checkDay = () => { $('#r-warn').hidden = !(dayIn.value && isMonday(dayIn.value)); };
  dayIn.addEventListener('change', checkDay);
  $('#reserva').addEventListener('submit', (e) => {
    e.preventDefault();
    checkDay();
    if (!dayIn.value || isMonday(dayIn.value)) { dayIn.focus(); return; }
    const time = $('#r-time').value;
    const day = new Date(dayIn.value + 'T12:00:00').toLocaleDateString(LOCALE[lang], { weekday: 'long', day: 'numeric', month: 'long' });
    const msg = t('msg')({
      n: people, day, time, drinks: time === 'drinks',
      where: $('input[name="where"]:checked').value,
      dog: $('#r-dog').checked, name: $('#r-name').value.trim()
    });
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  applyLang(lang);
  setInterval(renderStatus, 60000);

  // ---------- terciopelo ----------
  const hero = $('.hero');
  const heroV = new window.Velvet($('#velvet-hero'), { target: hero, reduced });
  new window.Velvet($('#velvet-dicho'), { interactive: false, still: true, dpr: 1, cell: (w) => Math.max(90, Math.min(150, w / 9)) });
  const pie = $('#pie');
  const pieV = new window.Velvet($('#velvet-pie'), { target: pie, reduced, tuftDur: 1700 });

  const smoothBtn = $('#smooth');
  hero.addEventListener('velvet:wrote', () => { smoothBtn.hidden = false; });
  smoothBtn.addEventListener('click', () => { heroV.smooth(); smoothBtn.hidden = true; });

  const helloSpot = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    return w > 900 ? { x: w * 0.7, y: h * 0.42, size: Math.min(270, w * 0.16) } : { x: w * 0.6, y: Math.max(210, h * 0.28), size: Math.min(200, w * 0.42) };
  };
  const boot = () => {
    heroV.start();
    const s = helloSpot();
    heroV.write('hola', Object.assign(s, { delay: reduced ? 0 : 1500, dur: 1700 }));
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(boot));

  // ---------- animaciones ----------
  gsap.registerPlugin(ScrollTrigger);
  if (window.Flip) gsap.registerPlugin(Flip);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  if (!reduced) {
    const tl = gsap.timeline({ delay: 0.35 });
    tl.from('.top', { opacity: 0, duration: 1, ease: 'power2.out', clearProps: 'opacity' }, 1)
      .from('.hero-title .ln > span', { yPercent: 70, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,opacity' }, 0.85)
      .from('.hero-names', { opacity: 0, x: -24, duration: 1.3, ease: 'expo.out', clearProps: 'transform,opacity' }, 1.35)
      .from('.hero-side > *', { opacity: 0, y: 26, duration: 1.1, ease: 'expo.out', stagger: 0.07, clearProps: 'transform,opacity' }, 1.25)
      .from('.hint', { opacity: 0, duration: 1.2, ease: 'power2.out', clearProps: 'opacity' }, 2.9);

    gsap.to('.hero-in', { yPercent: -10, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

    $$('[data-rise]').forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // los cojines caen, se aplastan un poco y recuperan la forma
    $$('[data-plop]').forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute('data-plop'));
      const delay = (sibs.indexOf(el) % 3) * 0.09;
      const tl2 = gsap.timeline({ delay, scrollTrigger: { trigger: el, start: 'top 92%' } });
      tl2.fromTo(el, { y: -80, opacity: 0, scaleY: 1.1, scaleX: 0.94 }, { y: 0, opacity: 1, scaleY: 1.05, scaleX: 0.97, duration: 0.5, ease: 'power2.in' })
        .to(el, { scaleY: 0.88, scaleX: 1.07, duration: 0.13, ease: 'power1.out' })
        .to(el, { scaleY: 1, scaleX: 1, duration: 1, ease: 'elastic.out(1, .36)', clearProps: 'transform,opacity' });
    });

    $$('.foto').forEach((f) => {
      gsap.fromTo($('img', f), { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.fromTo('.terr-ph img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.terr-ph', start: 'top bottom', end: 'bottom 30%', scrub: true } });
  }

  // pie: se acolcha y escribe la despedida al llegar
  let pieDone = false;
  ScrollTrigger.create({
    trigger: pie, start: 'top 75%',
    onEnter: () => {
      if (pieDone) return;
      pieDone = true;
      pieV.start();
      const w = pie.clientWidth, h = pie.clientHeight;
      pieV.write(t('f.write'), { x: w / 2, y: h * (w > 900 ? 0.3 : 0.26), size: Math.min(220, w * (w > 600 ? 0.2 : 0.18)), delay: reduced ? 0 : 900, dur: 1900 });
    }
  });

  // ---------- cabecera, barra móvil y anclas ----------
  const top = $('#top-bar'), barra = $('#barra');
  let pieIn = false;
  new IntersectionObserver(([e]) => { pieIn = e.isIntersecting; onScroll(); }).observe(pie);
  function onScroll() {
    const past = window.scrollY > hero.offsetHeight - 90;
    top.classList.toggle('is-solid', past);
    barra.classList.toggle('show', past && !pieIn);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && $(id);
    if (!el) return;
    e.preventDefault();
    const y = id === '#inicio' ? 0 : el.getBoundingClientRect().top + window.scrollY - (id === '#reserva' ? 90 : 60);
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    if (id === '#reserva') setTimeout(() => $('#n-more').focus({ preventScroll: true }), 700);
  }));
})();
