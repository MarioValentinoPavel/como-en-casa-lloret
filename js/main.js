// Mirian & Salva · Como en Casa
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const D = window.I18N, C = window.CARTA;
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const LOCALE = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB', fr: 'fr-FR' };
  const WA = '34668504405';
  const ORG = {
    HN: ['Honduras', 'Hondures', 'Honduras', 'Honduras'], BO: ['Bolivia', 'Bolívia', 'Bolivia', 'Bolivie'], PE: ['Perú', 'Perú', 'Peru', 'Pérou'],
    CO: ['Colombia', 'Colòmbia', 'Colombia', 'Colombie'], CU: ['Cuba', 'Cuba', 'Cuba', 'Cuba'], MX: ['México', 'Mèxic', 'Mexico', 'Mexique'], CA: ['Caribe', 'Carib', 'Caribbean', 'Caraïbes']
  };
  const LI = { es: 0, ca: 1, en: 2, fr: 3 };

  let lang = '';
  try { lang = localStorage.getItem('cec-lang') || ''; } catch (e) { /* sin almacenamiento */ }
  if (!D[lang]) { const n = (navigator.language || 'es').slice(0, 2).toLowerCase(); lang = D[n] ? n : 'es'; }
  const t = (k) => (D[lang][k] !== undefined ? D[lang][k] : D.es[k]);
  const money = (n) => new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: 'EUR' }).format(n);
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const joinList = (arr, w) => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' ' + w + ' ' + arr[arr.length - 1]);
  const maracuya = '<svg aria-hidden="true"><use href="#i-maracuya"/></svg>';

  // ---------- horario (hora de Madrid) ----------
  // índice 0 = lunes; minutos desde medianoche; 25*60 = la 1:00 del día siguiente
  const HOURS = [null, [7 * 60, 25 * 60], [9 * 60, 25 * 60], [9 * 60, 25 * 60], [9 * 60, 25 * 60], [9 * 60, 25 * 60], [9 * 60, 25 * 60]];
  const fmtH = (mins) => `${Math.floor(mins / 60) % 24}:${String(mins % 60).padStart(2, '0')}`;
  function madridNow() {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const g = (type) => parts.find((p) => p.type === type).value;
    return { d: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(g('weekday')), m: +g('hour') * 60 + +g('minute'), iso: `${g('year')}-${g('month')}-${g('day')}` };
  }
  function openState() {
    const { d, m } = madridNow();
    const prev = (d + 6) % 7;
    const open = !!((HOURS[d] && m >= HOURS[d][0]) || (HOURS[prev] && m < HOURS[prev][1] - 1440));
    return { open, d, next: HOURS[d] ? fmtH(HOURS[d][0]) : null };
  }
  function renderStatus() {
    const s = openState();
    const el = $('#status');
    el.classList.toggle('is-open', s.open);
    $('span', el).textContent = s.open ? t('st.open') : s.next ? t('st.at').replace('{t}', s.next) : t('st.monday');
    // el letrero del pie se enciende solo cuando está abierto
    $('#letrero-pie').classList.toggle('is-off', !s.open);
    $('#pie').style.setProperty('--g2', s.open ? 1 : 0.15);
    $('#pie-estado').textContent = s.open ? t('f.on') : s.next ? t('f.off').replace('{t}', s.next) : t('f.offMon');
  }
  function renderHours() {
    const { d } = madridNow();
    $('#horario').innerHTML = t('days').map((name, i) => {
      const h = HOURS[i];
      const cls = [i === d ? 'is-today' : '', h ? '' : 'is-off'].join(' ').trim();
      return `<li${cls ? ` class="${cls}"` : ''}><span>${name}</span><span>${h ? fmtH(h[0]) + ' – ' + fmtH(h[1]) : t('closed')}</span></li>`;
    }).join('');
  }

  // ---------- la carta ----------
  const state = { f: 'all', q: '', bread: 0 };
  const body = $('#carta-body'), catsNav = $('#cats');
  function itemDesc(it) {
    const L = lang;
    const gloss = it.g && L !== 'es' ? it.g[L] : '';
    let desc = it.d ? it.d[L] : '';
    if (it.s) desc = t('side.with').replace('{x}', joinList(it.s.map((k) => C.SIDES[k][L]), t('and')));
    if (it.k) desc = t('side.choice').replace('{x}', joinList(['F', 'S', 'E1'].map((k) => C.SIDES[k][L]), t('or')));
    return [gloss, desc].filter(Boolean).join('. ').replace(/\.\./g, '.');
  }
  function priceHTML(it) {
    if (it.p2) return `<span class="pl-price" data-p2="${it.p2.join(',')}">${money(it.p2[state.bread])}</span>`;
    const sub = it.u ? `<small>${t('unit')}</small>` : it.pp ? `<small>${t('pp')}</small>` : '';
    return `<span class="pl-price">${money(it.p)}${sub}</span>`;
  }
  function itemHTML(it, cat) {
    const tags = (it.t || []).slice();
    if (cat.id === 'infantil') tags.push('kids');
    const desc = itemDesc(it);
    const org = it.o ? ORG[it.o][LI[lang]] : '';
    const af = it.af ? `<p class="pl-af">${maracuya}<span>${esc(it.af[lang])}</span></p>` : '';
    const s = norm([it.n, it.g ? Object.values(it.g).join(' ') : '', it.d ? Object.values(it.d).join(' ') : '', desc, org].join(' '));
    const img = it.img ? `<img class="pl-img" src="assets/carta/${it.img}.jpg" alt="" width="78" height="78" loading="lazy" decoding="async">` : '';
    return `<li class="plato${img ? '' : ' no-img'}" data-t="${tags.join(' ')}" data-s="${esc(s)}">${img}<div class="pl-txt"><h4><span lang="es">${esc(it.n)}</span>${org ? `<span class="pl-org">${org}</span>` : ''}</h4><p class="pl-d">${esc(desc)}</p>${af}</div>${priceHTML(it)}</li>`;
  }
  function renderCarta() {
    body.innerHTML = C.cats.map((cat) => {
      const bread = cat.bread ? `<div class="pan" role="group" aria-label="${t('bread.label')}"><button type="button" data-b="0" aria-pressed="${state.bread === 0}">${t('bread.c')}</button><button type="button" data-b="1" aria-pressed="${state.bread === 1}">${t('bread.b')}</button></div>` : '';
      let list;
      if (cat.groups) list = cat.groups.map((g) => `<li class="grupo-h" role="presentation">${g.t[lang]}</li>` + g.items.map((it) => itemHTML(it, cat)).join('')).join('');
      else list = cat.items.map((it) => itemHTML(it, cat)).join('');
      const extras = cat.extras ? `<p class="extras"><b>${cat.extras.t[lang]}</b>${cat.extras.items.map(([n, p]) => `<span>${n[lang]} ${money(p)}</span>`).join('')}</p>` : '';
      return `<section class="cat" id="c-${cat.id}" data-cat="${cat.id}" aria-labelledby="ch-${cat.id}"><div class="cat-h"><h3 id="ch-${cat.id}">${cat.t[lang]}</h3>${bread}<p class="cat-n">${cat.n[lang]}</p></div><ul class="platos" role="list">${list}</ul>${extras}</section>`;
    }).join('');
    catsNav.innerHTML = C.cats.map((cat) => `<a href="#c-${cat.id}" data-cat="${cat.id}">${cat.t[lang]}</a>`).join('');
    $$('.pan button', body).forEach((b) => b.addEventListener('click', () => {
      state.bread = +b.dataset.b;
      $$('.pan button', body).forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.b === state.bread)));
      $$('[data-p2]', body).forEach((p) => { p.textContent = money(+p.dataset.p2.split(',')[state.bread]); });
    }));
    $$('a', catsNav).forEach((a) => a.addEventListener('click', anchorJump));
    applyFilter(false);
    observeCats();
    observeItems();
  }
  function applyFilter(anim) {
    const q = norm(state.q.trim());
    let any = false;
    $$('.cat', body).forEach((sec) => {
      let n = 0;
      let group = null, groupN = 0;
      const flush = () => { if (group) group.hidden = groupN === 0; };
      [...$('.platos', sec).children].forEach((li) => {
        if (li.classList.contains('grupo-h')) { flush(); group = li; groupN = 0; return; }
        const ok = (state.f === 'all' || li.dataset.t.split(' ').includes(state.f)) && (!q || li.dataset.s.includes(q));
        li.hidden = !ok; if (ok) { n++; groupN++; if (anim) li.classList.add('in'); }
      });
      flush();
      sec.hidden = n === 0;
      const ex = $('.extras', sec); if (ex) ex.hidden = !n || state.f !== 'all' || !!q;
      const a = $(`a[data-cat="${sec.dataset.cat}"]`, catsNav); if (a) a.hidden = n === 0;
      if (n) any = true;
    });
    $('#vacio').hidden = any;
    if (anim && !reduced && window.gsap) {
      gsap.fromTo($$('.cat:not([hidden]) .plato:not([hidden])', body).slice(0, 14), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.03, clearProps: 'opacity,transform' });
    }
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  $$('#filtros button').forEach((b) => b.addEventListener('click', () => {
    state.f = b.dataset.f === state.f && b.dataset.f !== 'all' ? 'all' : b.dataset.f;
    $$('#filtros button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.f === state.f)));
    applyFilter(true);
  }));
  let qt;
  $('#buscar').addEventListener('input', (e) => { clearTimeout(qt); qt = setTimeout(() => { state.q = e.target.value; applyFilter(true); }, 120); });

  let catIO;
  function observeCats() {
    if (catIO) catIO.disconnect();
    catIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.dataset.cat;
        $$('a', catsNav).forEach((a) => a.classList.toggle('is-on', a.dataset.cat === id));
        const a = $(`a[data-cat="${id}"]`, catsNav);
        if (a) catsNav.scrollTo({ left: a.offsetLeft - catsNav.clientWidth / 2 + a.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('.cat', body).forEach((s) => catIO.observe(s));
  }
  let itemIO;
  function observeItems() {
    const items = $$('.plato', body);
    if (reduced || !('IntersectionObserver' in window)) { items.forEach((li) => li.classList.add('in')); return; }
    if (itemIO) itemIO.disconnect();
    itemIO = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); itemIO.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
    items.forEach((li) => itemIO.observe(li));
  }

  // ---------- la barra ----------
  const copaState = [];
  function renderBarra() {
    const ul = $('#copas');
    ul.innerHTML = '';
    copaState.length = 0;
    C.copas.forEach((s) => {
      const cp = window.Copa(s);
      const li = document.createElement('li');
      li.className = 'copa-card';
      li.style.setProperty('--c', s.c[s.c.length - 1]);
      li.innerHTML = `${cp.svg}<span class="cp-ronda">${t('copas.ronda')}</span><h4 lang="es">${esc(s.n)}</h4><p class="cp-price">${money(s.p)}${s.zero ? `<span class="cp-zero">${t('zero')}</span>` : ''}</p>${s.af ? `<p class="cp-af">${maracuya}<span>${esc(s.af[lang])}</span></p>` : ''}`;
      ul.appendChild(li);
      const st = { li, cp, level: 0, sips: 0 };
      copaState.push(st);
      const sip = () => {
        if (!st.level) return;
        st.sips++;
        li.classList.add('is-sip');
        clearTimeout(st.to); st.to = setTimeout(() => li.classList.remove('is-sip'), 900);
        if (st.level <= 0.3) {
          setLevel(st, 0.9);
          const r = $('.cp-ronda', li);
          if (window.gsap && !reduced) gsap.fromTo(r, { opacity: 0, y: 6 }, { opacity: 1, y: -6, duration: 0.5, ease: 'expo.out', yoyo: true, repeat: 1, repeatDelay: 0.8 });
        } else setLevel(st, st.level - 0.2);
      };
      if (fine) li.addEventListener('pointerenter', sip); else li.addEventListener('click', sip);
    });
    $('#copas-hint').textContent = fine ? t('copas.hint') : t('copas.hintTouch');
    $('#frutas').innerHTML = C.batidos.map(([n, c, af]) => `<li${af ? ' class="is-af"' : ''} style="--c:${c}"><i aria-hidden="true"></i><span lang="es">${n}</span></li>`).join('');
    $('#batido-af span').textContent = C.batidoAf[lang];
    $('#smoothies-list').textContent = joinList(C.smoothies.map((x) => x[lang]), t('or'));
    $('#sangria').innerHTML = C.sangria.map(([n, p]) => `<li><span>${n[lang]}</span><b>${money(p)}</b></li>`).join('');
    if (barraFilled) fillCopas(true);
  }
  function setLevel(st, lv) {
    st.level = lv;
    if (st.cp.coco) return;
    const y = st.cp.top + (st.cp.bottom - st.cp.top) * (1 - lv);
    $('.liq', st.li).style.transform = `translateY(${y.toFixed(1)}px)`;
  }
  let barraFilled = false;
  function fillCopas(now) {
    barraFilled = true;
    copaState.forEach((st, i) => { if (now || reduced) setLevel(st, 0.9); else setTimeout(() => setLevel(st, 0.9), 120 + i * 110); });
  }
  if (window.ScrollTrigger) ScrollTrigger.create({ trigger: '#copas', start: 'top 78%', onEnter: () => { if (!barraFilled) fillCopas(false); } });
  else new IntersectionObserver(([e], o) => { if (e.isIntersecting) { fillCopas(false); o.disconnect(); } }, { threshold: 0.25 }).observe($('#copas'));

  // ---------- reserva por WhatsApp ----------
  let people = 2;
  const out = $('#n-out');
  function setPeople(n) { people = Math.max(1, Math.min(20, n)); out.textContent = people; }
  $('#n-less').addEventListener('click', () => setPeople(people - 1));
  $('#n-more').addEventListener('click', () => setPeople(people + 1));
  const dayIn = $('#r-day');
  const isMonday = (iso) => new Date(iso + 'T12:00:00').getDay() === 1;
  (() => {
    const { iso } = madridNow();
    dayIn.min = iso;
    const start = new Date(iso + 'T12:00:00');
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

  // ---------- mapa de Google: solo con consentimiento ----------
  const MAP_SRC = 'https://maps.google.com/maps?q=Bar%20Restaurant%20Como%20en%20Casa%20Mirian%20%26%20Salva%2C%20Av.%20del%20Rieral%2073%2C%2017310%20Lloret%20de%20Mar&z=16&output=embed';
  function showMap() {
    const box = $('#mapa');
    if ($('iframe', box)) return;
    const f = document.createElement('iframe');
    f.src = MAP_SRC; f.title = 'Google Maps · Av. del Rieral, 73, Lloret de Mar'; f.loading = 'lazy'; f.allowFullscreen = true;
    f.referrerPolicy = 'no-referrer-when-downgrade';
    box.appendChild(f); box.classList.add('is-on');
  }
  function hideMap() { const f = $('#mapa iframe'); if (f) f.remove(); $('#mapa').classList.remove('is-on'); }
  $('#mapa-load').addEventListener('click', () => { if (window.CEC_CONSENT) window.CEC_CONSENT.set({ maps: true }); else showMap(); });
  if (window.CEC_CONSENT) window.CEC_CONSENT.onChange((c) => (c && c.maps ? showMap() : hideMap()));

  // ---------- idiomas ----------
  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    $$('[data-i18n]').forEach((el) => { const v = t(el.dataset.i18n); if (typeof v === 'string') el.textContent = v; });
    $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    $$('.langs button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    $('#buscar').placeholder = t('carta.search');
    $('#hint span').textContent = fine ? t('hero.hint') : t('hero.hintTouch');
    renderHours(); renderStatus();
    renderCarta(); renderBarra();
    // WhatsApp directo con un saludo en el idioma de la web
    $$('.wa-link').forEach((a) => { a.href = `https://wa.me/${WA}?text=${encodeURIComponent(t('wa.msg'))}`; });
    if (window.CEC_CONSENT) window.CEC_CONSENT.lang(l);
    try { localStorage.setItem('cec-lang', l); } catch (e) { /* sin almacenamiento */ }
  }
  $$('.langs button').forEach((b) => b.addEventListener('click', () => { if (b.dataset.lang !== lang) applyLang(b.dataset.lang); }));

  // hojas decorativas con la misma monstera que la selva
  $$('[data-hoja]').forEach((p) => p.setAttribute('d', window.monsteraPath(+p.dataset.hoja)));

  applyLang(lang);
  setInterval(renderStatus, 60000);

  // ---------- selva y letrero ----------
  const hero = $('#inicio'), sign = $('#letrero');
  let selva = null;
  try { selva = new window.Selva($('#selva'), { back: $('#selva-fondo'), host: hero, sign, reduced }); } catch (e) { /* sin canvas */ }
  const setGlow = (v) => { hero.style.setProperty('--glow', v); if (selva) selva.setGlow(v); };
  function lightUp(done) {
    if (reduced) { sign.classList.remove('is-off'); setGlow(1); done(); return; }
    // parpadeo de fluorescente al arrancar
    const seq = [[0, 1], [90, 0], [170, 1], [230, 0], [470, 1], [520, 0], [610, 1]];
    seq.forEach(([ms, on]) => setTimeout(() => { sign.classList.toggle('is-off', !on); setGlow(on ? 0.85 : 0.08); }, ms));
    setTimeout(() => {
      const o = { g: 0.85 };
      if (window.gsap) gsap.to(o, { g: 1, duration: 0.8, onUpdate: () => setGlow(o.g) }); else setGlow(1);
      done();
    }, 640);
  }

  // ---------- animaciones ----------
  const hasG = !!window.gsap;
  const intro = () => {
    if (!hasG || reduced) {
      lightUp(() => selva && selva.reveal());
      return;
    }
    gsap.set(['.hero-h .ln > *', '.hero-sub', '.ctas', '.status'], { opacity: 0 });
    gsap.set('.hint', { opacity: 0 });
    gsap.set('.top', { opacity: 0 });
    setTimeout(() => lightUp(() => selva && selva.reveal(2.6)), 350);
    const tl = gsap.timeline({ delay: 1.45 });
    tl.fromTo('.hero-h .ln > *', { yPercent: 105, opacity: 1 }, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.12, clearProps: 'transform' }, 0)
      .fromTo(['.hero-sub', '.ctas', '.status'], { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.09, clearProps: 'transform,opacity' }, 0.35)
      .to('.top', { opacity: 1, duration: 1, clearProps: 'opacity' }, 0.6)
      .to('.hint', { opacity: 1, duration: 1.2 }, 1.6);
  };
  const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
  fontsReady.then(intro);

  // la pista se va cuando ya has apartado hojas
  let moved = 0, lastP = null;
  hero.addEventListener('pointermove', (e) => {
    if (lastP) moved += Math.hypot(e.clientX - lastP[0], e.clientY - lastP[1]);
    lastP = [e.clientX, e.clientY];
    if (moved > 900 && hasG) { gsap.to('.hint', { opacity: 0, duration: 0.8 }); moved = -1e9; }
  }, { passive: true });

  if (hasG) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    if (!reduced) {
      gsap.to('.hero-in', { yPercent: -8, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      $$('[data-rise]').forEach((el) => {
        gsap.from(el, { y: 36, opacity: 0, duration: 1.2, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } });
      });
      $$('.foto-hoja').forEach((f, i) => {
        gsap.from(f, { y: 60, opacity: 0, rotation: i % 2 ? 4 : -4, duration: 1.4, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: f, start: 'top 90%', toggleActions: 'play none none none' } });
        gsap.fromTo($('img', f), { yPercent: -7 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      gsap.fromTo('.esp-ph img', { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.especial', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('.terr-ph img', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.terr-ph', start: 'top bottom', end: 'bottom 30%', scrub: true } });
      gsap.from('.letrero-pie', { scale: 0.92, opacity: 0, duration: 1.4, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '#pie', start: 'top 80%', toggleActions: 'play none none none' } });
    }
  }

  // ---------- cabecera, barra móvil y anclas ----------
  const top = $('#top-bar'), barra = $('#barra-movil'), pie = $('#pie'), waFloat = $('#wa-flotante');
  let pieIn = false;
  new IntersectionObserver(([e]) => { pieIn = e.isIntersecting; onScroll(); }).observe(pie);
  function onScroll() {
    const past = window.scrollY > hero.offsetHeight - 90;
    top.classList.toggle('is-solid', past);
    barra.classList.toggle('show', past && !pieIn);
    waFloat.classList.toggle('show', past && !pieIn);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function anchorJump(e) {
    const id = e.currentTarget.getAttribute('href');
    const el = id.length > 1 && $(id);
    if (!el) return;
    e.preventDefault();
    const off = id === '#reserva' ? 90 : id.startsWith('#c-') ? 130 : 60;
    const y = id === '#inicio' ? 0 : el.getBoundingClientRect().top + window.scrollY - off;
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    if (id === '#reserva') setTimeout(() => $('#r-day').focus({ preventScroll: true }), 800);
  }
  $$('a[href^="#"]').filter((a) => !a.closest('#cats')).forEach((a) => a.addEventListener('click', anchorJump));
})();
