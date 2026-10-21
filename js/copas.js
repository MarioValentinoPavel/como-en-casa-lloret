// Copas de la barra en SVG: vaso, líquido con ola, hielo y adornos.
// window.Copa(spec) devuelve { svg, fill(level), wave(on) } listo para insertar.
(() => {
  let uid = 0;
  // inner: interior del vaso (máscara del líquido); top/bottom: altura del líquido lleno y vacío; rim: [x izq, x der, y borde]
  const GLASS = {
    alto: { out: 'M30 34 L33 150 Q33.5 155 38 155 L62 155 Q66.5 155 67 150 L70 34', inner: 'M32.6 38 L35.4 151 L64.6 151 L67.4 38 Z', top: 42, bottom: 151, rim: [30, 70, 34] },
    bajo: { out: 'M24 86 L27 150 Q27.5 155 32 155 L68 155 Q72.5 155 73 150 L76 86', inner: 'M26.6 90 L29.4 151 L70.6 151 L73.4 90 Z', top: 96, bottom: 151, rim: [24, 76, 86] },
    huracan: { out: 'M33 26 C29 52 26 66 34 86 C40 100 43 110 43 120 L43 140 Q43 146 35 148 Q30 150 30 153 L70 153 Q70 150 65 148 Q57 146 57 140 L57 120 C57 110 60 100 66 86 C74 66 71 52 67 26', inner: 'M35.4 30 C31.6 54 28.8 66 36.4 85 C42.4 99 45.4 109 45.4 120 L54.6 120 C54.6 109 57.6 99 63.6 85 C71.2 66 68.4 54 64.6 30 Z', top: 36, bottom: 120, rim: [33, 67, 26] },
    copa: { out: 'M27 32 C25 66 33 88 50 90 C67 88 75 66 73 32 M50 90 L50 147 M33 152 Q50 145 67 152', inner: 'M29.4 36 C27.6 66 35 86 50 87.6 C65 86 72.4 66 70.6 36 Z', top: 46, bottom: 88, rim: [27, 73, 32] },
    margarita: { out: 'M15 44 C30 48 40 54 43 66 Q44 74 48 76 L48 147 M52 76 L52 147 M52 76 Q56 74 57 66 C60 54 70 48 85 44 M33 152 Q50 145 67 152', inner: 'M19 47 C31 51 40 56 42.2 66.5 Q43.4 72.6 50 73.8 Q56.6 72.6 57.8 66.5 C60 56 69 51 81 47 Z', top: 50, bottom: 74, rim: [15, 85, 44] },
    coupe: { out: 'M19 52 C21 76 36 88 50 88 C64 88 79 76 81 52 M50 88 L50 147 M33 152 Q50 145 67 152', inner: 'M21.6 55 C24 76 37.6 85.8 50 85.8 C62.4 85.8 76 76 78.4 55 Z', top: 58, bottom: 86, rim: [19, 81, 52] }
  };

  const wave = (w) => { let d = 'M-60 0'; for (let x = -60; x < 160; x += 20) d += ` Q${x + 5} ${-w} ${x + 10} 0 T${x + 20} 0`; return d + ' V80 H-60 Z'; };

  function garnish(type, rim) {
    const [x0, x1, y] = rim;
    switch (type) {
      case 'lima': case 'limon': {
        const c = type === 'lima' ? '#9ed45a' : '#f2d040', cx = x1 - 3, cy = y - 3;
        let seg = '';
        for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; seg += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * 8).toFixed(1)}" y2="${(cy + Math.sin(a) * 8).toFixed(1)}"/>`; }
        return `<g class="g-${type}"><circle cx="${cx}" cy="${cy}" r="10.5" fill="${c}"/><circle cx="${cx}" cy="${cy}" r="8.6" fill="${type === 'lima' ? '#d8f0a0' : '#fff2a8'}"/><g stroke="${c}" stroke-width="1.1">${seg}</g></g>`;
      }
      case 'naranja': {
        const cx = x1 - 4, cy = y - 2;
        let seg = '';
        for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; seg += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * 9).toFixed(1)}" y2="${(cy + Math.sin(a) * 9).toFixed(1)}"/>`; }
        return `<g><circle cx="${cx}" cy="${cy}" r="12" fill="#ff8a1e"/><circle cx="${cx}" cy="${cy}" r="10" fill="#ffc463"/><g stroke="#ff9a32" stroke-width="1.2">${seg}</g></g>`;
      }
      case 'fresa': {
        const cx = x1 - 2, cy = y - 4;
        return `<g><path d="M${cx - 9} ${cy - 5} Q${cx} ${cy - 11} ${cx + 9} ${cy - 5} Q${cx + 9} ${cy + 8} ${cx} ${cy + 14} Q${cx - 9} ${cy + 8} ${cx - 9} ${cy - 5}Z" fill="#e3203f"/><path d="M${cx - 7} ${cy - 6} L${cx - 2} ${cy - 3} L${cx} ${cy - 9} L${cx + 2} ${cy - 3} L${cx + 7} ${cy - 6} L${cx + 3} ${cy - 1} L${cx - 3} ${cy - 1}Z" fill="#4f9a3a"/><g fill="#ffd7a0"><circle cx="${cx - 4}" cy="${cy + 2}" r=".8"/><circle cx="${cx + 3}" cy="${cy + 3}" r=".8"/><circle cx="${cx}" cy="${cy + 7}" r=".8"/><circle cx="${cx - 3}" cy="${cy + 8}" r=".8"/><circle cx="${cx + 4}" cy="${cy + 8}" r=".8"/></g></g>`;
      }
      case 'cereza': {
        const cx = x1 - 14, cy = y - 7;
        return `<g><path d="M${cx} ${cy - 3} Q${cx + 2} ${cy - 16} ${cx + 10} ${cy - 20}" fill="none" stroke="#5a7a2c" stroke-width="1.4"/><circle cx="${cx}" cy="${cy}" r="5" fill="#b3122b"/><circle cx="${cx - 1.6}" cy="${cy - 1.6}" r="1.4" fill="#ff8aa0" opacity=".7"/></g>`;
      }
      case 'sombrilla': {
        const cx = x0 + 8, cy = y - 22;
        return `<g><line x1="${cx}" y1="${cy}" x2="${cx + 10}" y2="${y + 12}" stroke="#f4ead9" stroke-width="1.2"/><path d="M${cx - 15} ${cy + 5} Q${cx} ${cy - 13} ${cx + 15} ${cy + 1} Z" fill="#ff5a76"/><path d="M${cx - 15} ${cy + 5} L${cx} ${cy - 4} L${cx - 5} ${cy + 3.5}Z M${cx} ${cy - 4} L${cx + 15} ${cy + 1} L${cx + 6} ${cy + 2.5}Z" fill="#ffd25a"/></g>`;
      }
      case 'pina': {
        const cx = x1 - 3, cy = y - 2;
        return `<g><path d="M${cx - 10} ${cy + 4} L${cx + 10} ${cy + 4} L${cx + 2} ${cy - 14}Z" fill="#f5c842"/><path d="M${cx - 10} ${cy + 4} L${cx + 10} ${cy + 4} L${cx + 9} ${cy + 7} L${cx - 9} ${cy + 7}Z" fill="#c98a1e"/><path d="M${cx + 2} ${cy - 14} q-3 -10 -9 -12 q7 3 9 8 q1 -9 6 -12 q-3 7 -3 12 q5 -4 10 -3 q-7 2 -11 9Z" fill="#4f9a3a"/></g>`;
      }
      case 'apio': {
        return `<g><path d="M${x0 + 16} ${y + 30} L${x0 + 4} ${y - 30}" stroke="#8cc65a" stroke-width="5" stroke-linecap="round"/><path d="M${x0 + 4} ${y - 30} q-8 -6 -6 -14 q4 6 8 8 q-1 -8 4 -12 q0 8 -2 12 q6 -3 10 0 q-6 2 -12 7Z" fill="#6fb04a"/></g>`;
      }
      case 'flor': {
        const cx = x1 - 4, cy = y - 6;
        let p = '';
        for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; p += `<ellipse cx="${(cx + Math.cos(a) * 6).toFixed(1)}" cy="${(cy + Math.sin(a) * 6).toFixed(1)}" rx="6" ry="4.2" transform="rotate(${(a * 180 / Math.PI).toFixed(0)} ${(cx + Math.cos(a) * 6).toFixed(1)} ${(cy + Math.sin(a) * 6).toFixed(1)})" fill="#ff4f7b"/>`; }
        return `<g>${p}<circle cx="${cx}" cy="${cy}" r="2.6" fill="#ffd25a"/></g>`;
      }
      default: return '';
    }
  }

  function Copa(s) {
    const id = 'cp' + (++uid);
    if (s.v === 'coco') return coco(s, id);
    const G = GLASS[s.v];
    const stops = s.c.map((c, i) => `<stop offset="${(i / Math.max(1, s.c.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('');
    const [x0, x1, ry] = G.rim;
    let inside = '';
    if (s.ice) {
      const cw = G === GLASS.bajo ? 15 : 13;
      const ys = G === GLASS.copa ? [52, 64] : G === GLASS.bajo ? [100, 118] : [48, 70, 92];
      ys.forEach((y, i) => { inside += `<rect class="ice" x="${40 + (i % 2) * 8}" y="${y}" width="${cw}" height="${cw}" rx="3" transform="rotate(${i % 2 ? 14 : -10} ${46 + (i % 2) * 8} ${y + 7})"/>`; });
    }
    if (s.mint) inside += `<path class="mint" d="M44 128 q-8 -10 2 -16 q4 10 -2 16Z M56 118 q10 -6 12 4 q-10 2 -12 -4Z M48 104 q-6 -8 2 -12 q3 8 -2 12Z"/>`;
    if (s.lime) inside += `<path d="M38 136 l10 -6 l2 11Z M58 128 l10 4 l-8 8Z M46 116 l9 -2 l-3 9Z" fill="#8ccf4a" opacity=".85"/>`;
    if (s.bubbles) inside += `<g class="burbujas">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${38 + i * 5}" cy="${G.bottom - 4}" r="${0.9 + (i % 3) * 0.4}" style="--d:${(i * 0.37).toFixed(2)}s"/>`).join('')}</g>`;
    const straw = s.straw ? `<g class="pajita"><line x1="56" y1="${G.bottom - 12}" x2="${x1 - 6}" y2="${ry - 30}" stroke="${s.straw}" stroke-width="3.6" stroke-linecap="round"/><line x1="56" y1="${G.bottom - 12}" x2="${x1 - 6}" y2="${ry - 30}" stroke="#d61f4a" stroke-width="3.6" stroke-dasharray="4 5" stroke-linecap="butt" opacity=".75"/></g>` : '';
    const salt = s.salt ? `<g class="sal">${Array.from({ length: 22 }, (_, i) => `<circle cx="${(x0 + 1 + i * (x1 - x0 - 2) / 21).toFixed(1)}" cy="${(ry - 0.6 + (i % 3) * 0.7).toFixed(1)}" r="1.1"/>`).join('')}</g>` : '';
    const gar = (s.gar || []).map((g) => garnish(g, G.rim)).join('');
    const svg = `<svg class="copa-svg" viewBox="0 0 100 160" aria-hidden="true" focusable="false">
      <defs><clipPath id="${id}c"><path d="${G.inner}"/></clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs>
      ${straw}
      <g clip-path="url(#${id}c)">
        <g class="liq" style="transform:translateY(${G.bottom}px)">
          <path class="ola" d="${wave(1.8)}" fill="url(#${id}g)"/>
          <rect x="-10" y="0" width="120" height="${G.bottom - G.top + 12}" fill="url(#${id}g)"/>
        </g>
        ${inside}
      </g>
      <path class="vidrio" d="${G.out}"/>
      <path class="brillo" d="M${x0 + 5} ${ry + 8} Q${x0 + 6} ${(ry + G.bottom) / 2} ${x0 + 9} ${G.bottom - 8}"/>
      ${salt}${gar}
    </svg>`;
    return { svg, top: G.top, bottom: G.bottom };
  }

  function coco(s, id) {
    const svg = `<svg class="copa-svg" viewBox="0 0 100 160" aria-hidden="true" focusable="false">
      <defs><radialGradient id="${id}r" cx=".4" cy=".2" r=".9"><stop offset="0" stop-color="#7a4a2a"/><stop offset="1" stop-color="#2e1a0e"/></radialGradient></defs>
      <g class="pajita"><line x1="52" y1="96" x2="66" y2="52" stroke="${s.straw}" stroke-width="3.6" stroke-linecap="round"/><line x1="52" y1="96" x2="66" y2="52" stroke="#f4ead9" stroke-width="3.6" stroke-dasharray="4 5" opacity=".7"/></g>
      <path d="M17 98 C17 150 83 150 83 98 Z" fill="url(#${id}r)"/>
      <g stroke="#9a6a40" stroke-width=".8" opacity=".45" fill="none"><path d="M24 108 q10 26 26 32"/><path d="M34 104 q6 24 18 36"/><path d="M76 108 q-10 26 -26 32"/><path d="M66 104 q-4 22 -12 36"/></g>
      <ellipse cx="50" cy="98" rx="33" ry="7.5" fill="#f4ead9"/>
      <ellipse class="coco-liq" cx="50" cy="98.6" rx="29" ry="5.6" fill="${s.c[0]}"/>
      ${garnish('flor', [17, 83, 98])}
    </svg>`;
    return { svg, top: 0, bottom: 0, coco: true };
  }

  window.Copa = Copa;
})();
