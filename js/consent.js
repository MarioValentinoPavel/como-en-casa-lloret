// Cookies: aviso de primera capa, panel de configuración y estado del consentimiento.
// La web solo guarda en el navegador el idioma y esta elección (técnicas).
// Lo único de terceros es el mapa de Google, que se carga solo si se acepta.
(() => {
  const KEY = 'cec-consent', VERSION = 1, MAX_AGE = 365 * 864e5;
  const TX = {
    es: {
      h: 'Tu privacidad, como en casa',
      p: 'No usamos cookies de publicidad ni de analítica. Solo guardamos en tu navegador el idioma y esta elección. Si aceptas, también cargaremos el mapa de Google, que usa sus propias cookies.',
      more: 'Política de cookies', reject: 'Rechazar', config: 'Configurar', accept: 'Aceptar',
      ph: 'Configurar cookies', tech: 'Necesarias', techP: 'Recuerdan tu idioma y tu elección sobre cookies. Siempre activas.',
      maps: 'Mapa de Google', mapsP: 'Muestra el mapa del local dentro de la web. Al cargarlo, Google puede usar sus cookies.',
      on: 'Activadas', save: 'Guardar mi elección', all: 'Aceptar todo', close: 'Cerrar', label: 'Aviso de cookies'
    },
    ca: {
      h: 'La teva privacitat, com a casa',
      p: 'No fem servir galetes de publicitat ni d’analítica. Només desem al navegador l’idioma i aquesta elecció. Si acceptes, també carregarem el mapa de Google, que fa servir les seves pròpies galetes.',
      more: 'Política de galetes', reject: 'Rebutjar', config: 'Configurar', accept: 'Acceptar',
      ph: 'Configurar galetes', tech: 'Necessàries', techP: 'Recorden el teu idioma i la teva elecció sobre galetes. Sempre actives.',
      maps: 'Mapa de Google', mapsP: 'Mostra el mapa del local dins del web. En carregar-lo, Google pot fer servir les seves galetes.',
      on: 'Actives', save: 'Desar la meva elecció', all: 'Acceptar-ho tot', close: 'Tancar', label: 'Avís de galetes'
    },
    en: {
      h: 'Your privacy, like at home',
      p: 'We use no advertising or analytics cookies. We only store your language and this choice in your browser. If you accept, we will also load the Google map, which uses its own cookies.',
      more: 'Cookie policy', reject: 'Reject', config: 'Settings', accept: 'Accept',
      ph: 'Cookie settings', tech: 'Necessary', techP: 'They remember your language and your cookie choice. Always on.',
      maps: 'Google map', mapsP: 'Shows the restaurant’s map on this website. When it loads, Google may use its cookies.',
      on: 'Always on', save: 'Save my choice', all: 'Accept all', close: 'Close', label: 'Cookie notice'
    },
    fr: {
      h: 'Votre vie privée, comme à la maison',
      p: 'Nous n’utilisons aucun cookie publicitaire ni de mesure d’audience. Nous gardons seulement votre langue et ce choix dans votre navigateur. Si vous acceptez, nous chargerons aussi la carte Google, qui utilise ses propres cookies.',
      more: 'Politique de cookies', reject: 'Refuser', config: 'Paramétrer', accept: 'Accepter',
      ph: 'Réglages des cookies', tech: 'Nécessaires', techP: 'Ils retiennent votre langue et votre choix sur les cookies. Toujours actifs.',
      maps: 'Carte Google', mapsP: 'Affiche la carte du restaurant sur ce site. En la chargeant, Google peut utiliser ses cookies.',
      on: 'Actifs', save: 'Enregistrer mon choix', all: 'Tout accepter', close: 'Fermer', label: 'Bandeau cookies'
    }
  };
  let lang = '';
  try { lang = localStorage.getItem('cec-lang') || ''; } catch (e) { /* sin almacenamiento */ }
  if (!TX[lang]) { const n = (navigator.language || 'es').slice(0, 2).toLowerCase(); lang = TX[n] ? n : 'es'; }
  const T = () => TX[lang];

  function read() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY));
      if (c && c.v === VERSION && Date.now() - c.t < MAX_AGE) return c;
    } catch (e) { /* sin almacenamiento */ }
    return null;
  }
  let state = read();
  const subs = [];
  function save(c) {
    state = { v: VERSION, t: Date.now(), maps: !!c.maps };
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* sin almacenamiento */ }
    subs.forEach((f) => f(state));
    hideBanner(); closePanel();
  }

  // ---------- aviso ----------
  let banner = null;
  function buildBanner() {
    banner = document.createElement('section');
    banner.className = 'ck';
    banner.setAttribute('aria-label', T().label);
    banner.innerHTML = `<p class="ck-h"></p><p class="ck-p"><span></span> <a href="cookies.html"></a></p>
      <div class="ck-btns"><button type="button" class="ck-b" data-ck="reject"></button><button type="button" class="ck-b" data-ck="config"></button><button type="button" class="ck-b" data-ck="accept"></button></div>`;
    banner.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ck]'); if (!b) return;
      if (b.dataset.ck === 'accept') save({ maps: true });
      else if (b.dataset.ck === 'reject') save({ maps: false });
      else openPanel();
    });
    document.body.appendChild(banner);
    fill();
  }
  function showBanner() {
    if (!banner) buildBanner();
    document.body.classList.add('ck-open');
    requestAnimationFrame(() => banner.classList.add('show'));
    setTimeout(() => banner.classList.add('show'), 60);
  }
  function hideBanner() {
    document.body.classList.remove('ck-open');
    if (banner) { banner.classList.remove('show'); setTimeout(() => { if (banner && !banner.classList.contains('show')) { banner.remove(); banner = null; } }, 500); }
  }

  // ---------- panel ----------
  let dlg = null;
  function buildPanel() {
    dlg = document.createElement('dialog');
    dlg.className = 'ck-dlg';
    dlg.innerHTML = `<form method="dialog" class="ck-in">
        <div class="ck-top"><h2 class="ck-ph" id="ck-ph"></h2><button type="button" class="ck-x" data-ck="close">×</button></div>
        <div class="ck-row"><div><b data-t="tech"></b><p data-t="techP"></p></div><span class="ck-fixed" data-t="on"></span></div>
        <label class="ck-row"><div><b data-t="maps"></b><p data-t="mapsP"></p></div><span class="ck-sw"><input type="checkbox" id="ck-maps"><i aria-hidden="true"></i></span></label>
        <div class="ck-btns"><button type="button" class="ck-b" data-ck="save"></button><button type="button" class="ck-b" data-ck="all"></button></div>
        <p class="ck-more"><a href="cookies.html"></a></p>
      </form>`;
    dlg.setAttribute('aria-labelledby', 'ck-ph');
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) { closePanel(); return; }
      const b = e.target.closest('[data-ck]'); if (!b) return;
      if (b.dataset.ck === 'close') closePanel();
      else if (b.dataset.ck === 'all') save({ maps: true });
      else if (b.dataset.ck === 'save') save({ maps: dlg.querySelector('#ck-maps').checked });
    });
    document.body.appendChild(dlg);
    fill();
  }
  function openPanel() {
    if (!dlg) buildPanel();
    dlg.querySelector('#ck-maps').checked = !!(state && state.maps);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function closePanel() { if (dlg && dlg.open) { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); } }

  function fill() {
    const t = T();
    if (banner) {
      banner.setAttribute('aria-label', t.label);
      banner.querySelector('.ck-h').textContent = t.h;
      banner.querySelector('.ck-p span').textContent = t.p;
      banner.querySelector('.ck-p a').textContent = t.more;
      banner.querySelector('[data-ck="reject"]').textContent = t.reject;
      banner.querySelector('[data-ck="config"]').textContent = t.config;
      banner.querySelector('[data-ck="accept"]').textContent = t.accept;
    }
    if (dlg) {
      dlg.querySelector('.ck-ph').textContent = t.ph;
      dlg.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t[el.dataset.t]; });
      dlg.querySelector('.ck-x').setAttribute('aria-label', t.close);
      dlg.querySelector('[data-ck="save"]').textContent = t.save;
      dlg.querySelector('[data-ck="all"]').textContent = t.all;
      dlg.querySelector('.ck-more a').textContent = t.more;
    }
  }

  document.addEventListener('click', (e) => { if (e.target.closest('[data-cookies-open]')) { e.preventDefault(); openPanel(); } });

  window.CEC_CONSENT = {
    get: () => state,
    set: (c) => save(Object.assign({ maps: false }, state || {}, c)),
    onChange: (f) => { subs.push(f); f(state); },
    open: openPanel,
    lang: (l) => { if (TX[l]) { lang = l; fill(); } }
  };

  const start = () => { if (!state) setTimeout(showBanner, document.body.classList.contains('legal-page') ? 0 : 1600); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
