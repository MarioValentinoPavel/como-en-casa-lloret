// La selva: hojas de monstera, palmera y plátano dibujadas en canvas 2D.
// Tapan el letrero al llegar, se apartan cuando se enciende, se mecen solas,
// se apartan con la mano (puntero o dedo) y se tiñen con la luz roja del letrero.
(() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const wrap = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function cubic(p0, p1, p2, p3, n, out, skipFirst) {
    for (let i = skipFirst ? 1 : 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
    }
  }

  // ---------- geometría de la monstera ----------
  // Unidades: la lámina mide 1 de largo, el seno (donde entra el tallo) está en x≈0.07 y la punta en x=1.
  function monstera(seed) {
    const R = rng(seed);
    const W = 0.94;
    const half = [];
    cubic([1, 0], [0.86, -0.3 * W], [0.62, -0.53 * W], [0.36, -0.5 * W], 46, half);
    cubic([0.36, -0.5 * W], [0.1, -0.48 * W], [-0.09, -0.37 * W], [-0.07, -0.16 * W], 34, half, true);
    cubic([-0.07, -0.16 * W], [-0.06, -0.05 * W], [0.02, -0.02 * W], [0.07, 0], 12, half, true);
    const n = half.length;
    const pts = [], holes = [], veins = [];
    const sides = [
      { s: -1, line: half },
      { s: 1, line: half.slice().reverse().map(([x, y]) => [x, -y]) }
    ];
    sides.forEach(({ s, line }) => {
      // índices de los cortes (en la mitad superior van de la punta al seno; en la inferior, al revés)
      const nS = 5 + Math.floor(R() * 2);
      const idx = [];
      for (let k = 0; k < nS; k++) idx.push(Math.round(11 + k * (64 / nS) + R() * 5));
      const at = new Set(s === -1 ? idx : idx.map((i) => n - 1 - i));
      const inner = [];
      line.forEach((p, i) => {
        if (s === 1 && i === 0) return; // el seno ya está en la mitad superior
        if (!at.has(i) || i === 0 || i === line.length - 1) { pts.push(p); return; }
        const a0 = line[i - 1], a1 = line[i + 1];
        let tx = a1[0] - a0[0], ty = a1[1] - a0[1];
        const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        // hacia un punto del nervio central algo más cerca del tallo
        let dx = -0.24, dy = -p[1];
        const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
        const depth = Math.abs(p[1]) * (0.5 + R() * 0.22);
        const hw = 0.0105 + R() * 0.004;
        const A = [p[0] - tx * hw, p[1] - ty * hw], B = [p[0] + tx * hw, p[1] + ty * hw];
        pts.push(A, [A[0] + dx * depth, A[1] + dy * depth], [p[0] + dx * (depth + hw), p[1] + dy * (depth + hw)], [B[0] + dx * depth, B[1] + dy * depth], B);
        inner.push({ i, x: p[0] + dx * depth, y: p[1] + dy * depth, ex: p[0], ey: p[1] });
      });
      // nervios entre cortes y agujeros junto al nervio central
      inner.sort((a, b) => b.ex - a.ex);
      for (let k = 0; k < inner.length - 1; k++) {
        const a = inner[k], b = inner[k + 1];
        const ex = (a.ex + b.ex) / 2, ey = (a.ey + b.ey) / 2 * 0.98;
        const mx = ex - 0.2, my = 0;
        veins.push([mx, my, ex, ey]);
        if (R() < 0.75 && Math.abs(ey) > 0.2) {
          const hx = mx + (ex - mx) * (0.28 + R() * 0.1), hy = ey * (0.24 + R() * 0.08);
          holes.push({ x: hx, y: hy, rx: 0.026 + R() * 0.022, ry: 0.011 + R() * 0.008, a: Math.atan2(ey - my, ex - mx) });
        }
      }
      if (inner.length) { const f = inner[0]; veins.push([f.ex - 0.18, 0, (f.ex + 1) / 2, f.ey * 0.6]); }
    });
    return { pts, holes, veins, W };
  }

  // Trayecto SVG de una monstera (para decorados): lámina apuntando hacia arriba, ancho 100, alto 100
  function monsteraPath(seed) {
    const g = monstera(seed);
    const T = ([x, y]) => [(50 + y * 100 / 1).toFixed(2), (100 - (x + 0.09) * 100 / 1.09).toFixed(2)];
    let d = 'M' + g.pts.map((p) => T(p).join(' ')).join('L') + 'Z';
    g.holes.forEach((h) => {
      const k = 14; const ring = [];
      for (let i = 0; i < k; i++) { const a = i / k * TAU; const x = h.x + Math.cos(a) * h.rx * Math.cos(h.a) - Math.sin(a) * h.ry * Math.sin(h.a); const y = h.y + Math.cos(a) * h.rx * Math.sin(h.a) + Math.sin(a) * h.ry * Math.cos(h.a); ring.push(T([x, y]).join(' ')); }
      d += 'M' + ring.join('L') + 'Z';
    });
    return d;
  }

  // ---------- sprites ----------
  const TONES = {
    front: { a: '#04100a', b: '#0f2c1d', c: '#061710', vein: 'rgba(150,215,170,.10)', rib: 'rgba(175,230,190,.17)', stem: '#08180f', hi: 'rgba(140,220,170,.07)' },
    back: { a: '#0a2217', b: '#1d4d34', c: '#0d281b', vein: 'rgba(170,235,195,.12)', rib: 'rgba(195,245,210,.2)', stem: '#11301f', hi: 'rgba(160,235,190,.1)' }
  };

  function spriteMonstera(Lt, seed, tone, blur) {
    const stem = Lt * 0.24, Lb = Lt - stem;
    const geo = monstera(seed);
    const pad = Math.ceil(Lt * 0.04);
    const c = document.createElement('canvas');
    c.width = Math.ceil(Lt + Lb * 0.02 + pad * 2); c.height = Math.ceil(Lb * geo.W + pad * 2);
    const g = c.getContext('2d');
    if (blur) g.filter = `blur(${blur}px)`;
    g.translate(pad, c.height / 2);
    // tallo
    g.strokeStyle = tone.stem; g.lineCap = 'round'; g.lineWidth = Lt * 0.016;
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(stem * 0.6, -Lt * 0.012, stem + Lb * 0.07, 0); g.stroke();
    const X = (x) => stem + x * Lb, Y = (y) => y * Lb;
    const P = new Path2D();
    geo.pts.forEach(([x, y], i) => (i ? P.lineTo(X(x), Y(y)) : P.moveTo(X(x), Y(y))));
    P.closePath();
    geo.holes.forEach((h) => { P.moveTo(X(h.x) + Math.cos(h.a) * h.rx * Lb, Y(h.y) + Math.sin(h.a) * h.rx * Lb); P.ellipse(X(h.x), Y(h.y), h.rx * Lb, h.ry * Lb, h.a, 0, TAU); });
    const gr = g.createLinearGradient(0, -Lb * 0.5, 0, Lb * 0.5);
    gr.addColorStop(0, tone.a); gr.addColorStop(0.5, tone.b); gr.addColorStop(1, tone.c);
    g.fillStyle = gr; g.fill(P, 'evenodd');
    g.save(); g.clip(P, 'evenodd');
    // brillo suave en la mitad superior
    const hi = g.createRadialGradient(X(0.55), Y(-0.22), 0, X(0.55), Y(-0.22), Lb * 0.5);
    hi.addColorStop(0, tone.hi); hi.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = hi; g.fillRect(X(-0.1), Y(-0.6), Lb * 1.2, Lb * 1.2);
    g.strokeStyle = tone.vein; g.lineWidth = Lb * 0.006;
    geo.veins.forEach(([x0, y0, x1, y1]) => { g.beginPath(); g.moveTo(X(x0), Y(y0)); g.quadraticCurveTo(X((x0 + x1) / 2 + 0.06), Y(y1 * 0.45), X(x1), Y(y1)); g.stroke(); });
    // nervio central que se afina hacia la punta
    g.fillStyle = tone.rib;
    g.beginPath(); g.moveTo(X(0.07), Y(-0.012)); g.quadraticCurveTo(X(0.5), Y(-0.008), X(0.97), 0); g.quadraticCurveTo(X(0.5), Y(0.008), X(0.07), Y(0.012)); g.fill();
    g.restore();
    return { c, ox: pad, oy: c.height / 2, L: Lt, hw: 0.4 };
  }

  function spritePalma(Lt, seed, tone, blur) {
    const R = rng(seed);
    const pad = Math.ceil(Lt * 0.05);
    const c = document.createElement('canvas');
    c.width = Math.ceil(Lt + pad * 2); c.height = Math.ceil(Lt * 0.86 + pad * 2);
    const g = c.getContext('2d');
    if (blur) g.filter = `blur(${blur}px)`;
    g.translate(pad, c.height / 2);
    const bow = (R() < 0.5 ? -1 : 1) * Lt * 0.07;
    const P = (t) => [Lt * t, bow * t * t];
    const T = (t) => { const a = P(Math.max(0, t - 0.01)), b = P(Math.min(1, t + 0.01)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
    const n = 26;
    for (let i = 0; i < n; i++) {
      const t = 0.16 + 0.82 * (i / (n - 1));
      const [bx, by] = P(t); const th = T(t);
      for (const s of [-1, 1]) {
        const len = Lt * 0.4 * Math.sin(Math.PI * (0.18 + 0.78 * t)) * (1 - 0.42 * t) * (0.9 + R() * 0.2);
        const a = th + s * (0.58 + R() * 0.16);
        const qx = bx + Math.cos(a) * len, qy = by + Math.sin(a) * len;
        const droop = len * (0.12 + R() * 0.08) * s;
        const nx = -Math.sin(a), ny = Math.cos(a);
        const w = Lt * (0.017 - 0.008 * t);
        const mx = (bx + qx) / 2 + nx * droop, my = (by + qy) / 2 + ny * droop;
        g.fillStyle = R() < 0.5 ? tone.b : tone.c;
        g.beginPath(); g.moveTo(bx, by);
        g.quadraticCurveTo(mx + nx * w, my + ny * w, qx, qy);
        g.quadraticCurveTo(mx - nx * w, my - ny * w, bx, by);
        g.fill();
        g.strokeStyle = tone.vein; g.lineWidth = Lt * 0.0025;
        g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(mx, my, qx, qy); g.stroke();
      }
    }
    g.strokeStyle = tone.stem; g.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const t0 = i / 12, t1 = (i + 1) / 12; const a = P(t0), b = P(t1);
      g.lineWidth = Lt * (0.014 - 0.011 * t0); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
    return { c, ox: pad, oy: c.height / 2, L: Lt, hw: 0.32 };
  }

  function spritePlatano(Lt, seed, tone, blur) {
    const R = rng(seed);
    const stem = Lt * 0.14, Lb = Lt - stem, Wb = Lb * 0.21;
    const pad = Math.ceil(Lt * 0.04);
    const c = document.createElement('canvas');
    c.width = Math.ceil(Lt + pad * 2); c.height = Math.ceil(Wb * 2.2 + pad * 2);
    const g = c.getContext('2d');
    if (blur) g.filter = `blur(${blur}px)`;
    g.translate(pad, c.height / 2);
    g.strokeStyle = tone.stem; g.lineCap = 'round'; g.lineWidth = Lt * 0.018;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(stem + Lb * 0.03, 0); g.stroke();
    const w = (t, s) => Wb * Math.pow(Math.sin(Math.PI * clamp(t, 0, 1)), 0.62) * (s < 0 ? 1 : 0.92) * (1 - 0.18 * t);
    const tears = [];
    const nT = 7 + Math.floor(R() * 4);
    for (let k = 0; k < nT; k++) tears.push({ t: 0.12 + R() * 0.8, s: R() < 0.5 ? -1 : 1, d: 0.55 + R() * 0.4 });
    const P = new Path2D();
    const N = 90;
    for (const s of [-1, 1]) {
      for (let i = 0; i <= N; i++) {
        const t = s < 0 ? i / N : 1 - i / N;
        const x = stem + t * Lb, y = s * w(t, s);
        const tear = tears.find((q) => q.s === s && Math.abs(q.t - t) < 0.5 / N);
        if (i === 0 && s < 0) P.moveTo(x, y);
        else if (tear) {
          const back = Lb * 0.03;
          P.lineTo(x - Lb * 0.003, y); P.lineTo(x - back, y * (1 - tear.d)); P.lineTo(x + Lb * 0.003, y);
        } else P.lineTo(x, y);
      }
    }
    P.closePath();
    const gr = g.createLinearGradient(0, -Wb, 0, Wb);
    gr.addColorStop(0, tone.a); gr.addColorStop(0.5, tone.b); gr.addColorStop(1, tone.c);
    g.fillStyle = gr; g.fill(P);
    g.save(); g.clip(P);
    g.strokeStyle = tone.vein; g.lineWidth = Lt * 0.002;
    for (let i = 0; i < 46; i++) {
      const x = stem + Lb * (0.04 + i / 46 * 0.94);
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + Wb * 0.55, -Wb * 1.1); g.moveTo(x, 0); g.lineTo(x + Wb * 0.55, Wb * 1.1); g.stroke();
    }
    g.fillStyle = tone.rib;
    g.beginPath(); g.moveTo(stem, -Lt * 0.006); g.lineTo(stem + Lb * 0.98, 0); g.lineTo(stem, Lt * 0.006); g.fill();
    g.restore();
    return { c, ox: pad, oy: c.height / 2, L: Lt, hw: 0.2 };
  }

  // ---------- disposición ----------
  // [x, y] del anclaje (fracción del área), tamaño, tipo, profundidad (0 fondo, 1 delante), ángulo abierto (grados, 0 = derecha)
  // Abiertas, las hojas enmarcan por los lados y las esquinas y dejan libre el letrero y el texto.
  const WIDE = [
    [0.04, 0.28, 0.62, 'm', 0.25, 22],
    [0.96, 0.32, 0.62, 'm', 0.27, 158],
    [0.16, 1.08, 0.62, 'p', 0.32, -62],
    [0.84, 1.08, 0.62, 'p', 0.34, -118],
    [-0.06, 0.62, 0.62, 'p', 0.42, 6],
    [1.06, 0.66, 0.62, 'p', 0.44, 176],
    [-0.05, 0.86, 0.5, 'b', 0.5, -14],
    [1.05, 0.88, 0.5, 'b', 0.52, 194],
    [-0.05, 1.04, 0.9, 'm', 0.9, -42],
    [1.05, 1.05, 0.95, 'm', 1, -138],
    [-0.06, -0.05, 0.74, 'm', 0.95, 70],
    [1.06, -0.05, 0.72, 'm', 0.97, 110]
  ];
  const TALL = [
    [-0.04, 0.42, 0.5, 'm', 0.25, 30],
    [1.04, 0.46, 0.5, 'm', 0.27, 150],
    [0.2, 1.06, 0.55, 'p', 0.32, -72],
    [0.8, 1.06, 0.55, 'p', 0.34, -108],
    [-0.08, 0.62, 0.55, 'p', 0.42, 10],
    [1.08, 0.66, 0.55, 'p', 0.44, 170],
    [-0.06, 0.84, 0.45, 'b', 0.5, -20],
    [1.06, 0.86, 0.45, 'b', 0.52, 200],
    [-0.08, 1.02, 0.8, 'm', 0.45, -62],
    [1.08, 1.03, 0.82, 'm', 0.48, -118],
    [-0.08, -0.02, 0.7, 'm', 0.95, 78],
    [1.08, -0.01, 0.68, 'm', 0.97, 102]
  ];

  class Selva {
    // canvas: capa delantera (por encima del texto); back: capa de fondo (detrás del letrero)
    constructor(canvas, { back, host, sign, reduced }) {
      this.cv = canvas; this.ctx = canvas.getContext('2d');
      this.cvB = back || null; this.ctxB = back ? back.getContext('2d') : null;
      this.host = host; this.sign = sign; this.reduced = reduced;
      this.glow = 0; this.open = 0; this.t0 = 0;
      this.ptr = { x: -9999, y: -9999, vx: 0, vy: 0, on: false, last: 0 };
      this.running = false; this.visible = true; this.sprites = null; this.leaves = [];
      this.flies = [];
      this._loop = this.loop.bind(this);
      this.bind();
      this.resize();
    }
    bind() {
      const h = this.host;
      const move = (e) => {
        const r = h.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; const p = this.ptr;
        const now = performance.now();
        if (p.on && now - p.last < 80) { p.vx = p.vx * 0.4 + (x - p.x) * 0.6; p.vy = p.vy * 0.4 + (y - p.y) * 0.6; } else { p.vx = 0; p.vy = 0; }
        p.x = x; p.y = y; p.on = true; p.last = now;
        if (this.reduced) this.draw(performance.now());
      };
      h.addEventListener('pointermove', move, { passive: true });
      h.addEventListener('pointerdown', (e) => { move(e); this.burst(this.ptr.x, this.ptr.y); }, { passive: true });
      h.addEventListener('pointerleave', () => { this.ptr.on = false; });
      h.addEventListener('pointercancel', () => { this.ptr.on = false; });
      let rt;
      addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => this.resize(), 120); });
      new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.kick(); }).observe(h);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.kick(); });
    }
    resize() {
      const r = this.host.getBoundingClientRect();
      const W = Math.max(1, r.width), H = Math.max(1, r.height);
      const mobile = W < 720;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      this.W = W; this.H = H; this.dpr = dpr;
      [this.cv, this.cvB].forEach((cv) => { if (!cv) return; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px'; });
      const base = 0.42 * Math.min(W, H) + 0.2 * Math.max(W, H);
      const SPEC = W / H < 0.8 ? TALL : WIDE;
      const kMul = 1;
      const maxL = Math.max(...SPEC.map((s) => s[2])) * base * kMul;
      // sprites compartidos: 2 variantes de cada tipo (delante / fondo), al tamaño máximo
      const sz = Math.min(900, maxL) * Math.min(dpr, 1.5);
      if (!this.sprites || Math.abs(this.sprites.sz - sz) / sz > 0.25) {
        this.sprites = {
          sz,
          m: [spriteMonstera(sz, 11, TONES.front, 0), spriteMonstera(sz * 0.8, 23, TONES.back, 2)],
          m2: [spriteMonstera(sz, 37, TONES.front, 0), spriteMonstera(sz * 0.8, 41, TONES.back, 2)],
          p: [spritePalma(sz, 5, TONES.front, 0), spritePalma(sz * 0.8, 9, TONES.back, 2)],
          b: [spritePlatano(sz, 13, TONES.front, 0), spritePlatano(sz * 0.8, 17, TONES.back, 2)]
        };
      }
      const cx = W * 0.5, cy = H * 0.44;
      this.leaves = SPEC.map(([fx, fy, k, type, depth, deg], i) => {
        const ax = fx * W, ay = fy * H;
        const L = base * k * kMul;
        const toC = Math.atan2(cy - ay, cx - ax);
        const kind = type === 'm' ? (i % 2 ? 'm2' : 'm') : type;
        const spr = this.sprites[kind][depth > 0.5 ? 0 : 1];
        const prev = this.leaves[i];
        const closed = toC + (i % 2 ? 0.06 : -0.06);
        const openA = closed + wrap(deg * Math.PI / 180 - closed);
        return {
          ax, ay, L, depth, spr, sc: L / spr.L,
          closed, openA,
          side: Math.sign(wrap(openA - toC)) || 1,
          a: prev ? prev.a : 0, v: prev ? prev.v : 0,
          ph: i * 1.7, w1: 0.8 + (i % 5) * 0.11, w2: 1.3 + (i % 3) * 0.2,
          delay: (1 - depth) * 0.35 + (i % 3) * 0.06
        };
      });
      const nF = this.reduced ? 0 : mobile ? 16 : 30;
      if (this.flies.length !== nF) {
        const R = rng(99);
        this.flies = Array.from({ length: nF }, () => ({ x: R(), y: 0.2 + R() * 0.75, r: 0.6 + R() * 1.1, ph: R() * TAU, f: 0.4 + R() * 0.9, dx: R() * TAU, front: R() < 0.3 }));
      }
      if (!this.fly) {
        const f = document.createElement('canvas'); f.width = f.height = 48;
        const g = f.getContext('2d'); const gr = g.createRadialGradient(24, 24, 0, 24, 24, 24);
        gr.addColorStop(0, 'rgba(255,236,170,1)'); gr.addColorStop(0.18, 'rgba(255,200,110,.55)'); gr.addColorStop(1, 'rgba(255,170,80,0)');
        g.fillStyle = gr; g.fillRect(0, 0, 48, 48); this.fly = f;
      }
      this.draw(performance.now());
    }
    // abre la selva: de tapado a abierto
    reveal(dur = 2.6) {
      if (this.reduced) { this.open = 1; this.draw(performance.now()); return; }
      this.openStart = performance.now(); this.openDur = dur * 1000;
      this.kick();
    }
    setGlow(v) { this.glow = v; if (this.reduced || !this.running) this.draw(performance.now()); }
    burst(x, y) {
      this.leaves.forEach((l) => {
        const d = Math.hypot(x - l.ax, y - l.ay); if (d > l.L * 1.4) return;
        const diff = wrap(Math.atan2(y - l.ay, x - l.ax) - (l.openA + l.a));
        l.v += -Math.sign(diff || 1) * 0.05 * (1 - d / (l.L * 1.4));
      });
      this.kick();
    }
    kick() { if (!this.running && this.visible && !document.hidden && !this.reduced) { this.running = true; this.last = performance.now(); requestAnimationFrame(this._loop); } }
    loop(now) {
      if (!this.visible || document.hidden) { this.running = false; return; }
      this.step(now);
      this.draw(now);
      requestAnimationFrame(this._loop);
    }
    step(now) {
      const f = Math.min(3, (now - (this.last || now)) / 16.67); this.last = now;
      if (this.openStart != null) this.open = clamp((now - this.openStart) / this.openDur, 0, 1.2);
      const p = this.ptr;
      if (p.on && now - p.last > 120) { p.vx *= 0.8; p.vy *= 0.8; }
      this.leaves.forEach((l) => {
        let torque = 0;
        const th = this.angleOf(l, now);
        if (p.on) {
          const dx = p.x - l.ax, dy = p.y - l.ay, d = Math.hypot(dx, dy);
          if (d < l.L * 1.05 && d > l.L * 0.12) {
            const diff = wrap(Math.atan2(dy, dx) - th);
            const span = Math.min(0.9, (l.spr.hw * l.L) / d) * 1.15;
            if (Math.abs(diff) < span) {
              const fall = 1 - Math.abs(diff) / span;
              const perp = -Math.sin(th) * p.vx + Math.cos(th) * p.vy;
              torque += (perp / d) * 0.5 * fall;
              torque += -Math.sign(diff) * 0.0035 * fall;
            }
          }
        }
        l.v += (torque - l.a * 0.018) * f;
        l.v *= Math.pow(0.915, f);
        l.a = clamp(l.a + l.v * f, -0.75, 0.75);
      });
    }
    angleOf(l, now) {
      const o = ease((this.open - l.delay) / (1 - 0.35));
      const t = now * 0.001;
      const gust = (Math.sin(t * 0.31) + Math.sin(t * 0.53 + 1.3)) * 0.5;
      const sway = this.reduced ? 0 : Math.sin(t * l.w1 + l.ph) * 0.022 + Math.sin(t * l.w2 * 1.7 + l.ph * 2) * 0.008 + gust * 0.018 * (0.4 + l.depth);
      const scroll = this.scrollP || 0;
      return l.closed + wrap(l.openA - l.closed) * o + sway + l.a + l.side * scroll * 0.28;
    }
    draw(now) {
      const hr = this.host.getBoundingClientRect();
      this.scrollP = clamp(-hr.top / Math.max(1, hr.height), 0, 1);
      const s = this.sign && this.sign.getBoundingClientRect();
      if (this.ctxB) { this.layer(this.ctxB, now, hr, s, false); this.layer(this.ctx, now, hr, s, true); }
      else this.layer(this.ctx, now, hr, s, null);
    }
    // front: true = solo hojas delanteras, false = solo las de fondo, null = todas
    layer(ctx, now, hr, s, front) {
      const { W, H, dpr } = this;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const t = now * 0.001;
      const drawFlies = (fr) => {
        if (front !== null && fr !== front) return;
        if (!this.flies.length) return;
        ctx.globalCompositeOperation = 'lighter';
        this.flies.forEach((q) => {
          if (q.front !== fr) return;
          const x = ((q.x + Math.sin(t * 0.07 * q.f + q.dx) * 0.06 + t * 0.004 * q.f) % 1) * W;
          const y = (q.y + Math.sin(t * 0.11 * q.f + q.ph) * 0.05) * H;
          const blink = Math.pow(Math.max(0, Math.sin(t * q.f * 1.3 + q.ph)), 3);
          if (blink < 0.02) return;
          const sz = 22 * q.r * (fr ? 1.3 : 1);
          ctx.globalAlpha = blink * (0.55 + 0.45 * this.glow) * (fr ? 0.9 : 0.7);
          ctx.drawImage(this.fly, x - sz / 2, y - sz / 2, sz, sz);
        });
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      };
      drawFlies(false);
      const o = this.open;
      this.leaves.forEach((l) => {
        if (front !== null && (l.depth >= 0.5) !== front) return;
        const th = this.angleOf(l, now);
        const oo = ease((o - l.delay) / 0.65);
        const sc = l.sc * (1.2 - 0.2 * oo);
        const flutter = 1 - Math.min(0.2, Math.abs(l.v) * 4);
        const out = this.scrollP * 0.22;
        const ax = l.ax + (l.ax - W / 2) * out, ay = l.ay + (l.ay - H / 2) * out;
        ctx.save();
        ctx.translate(ax, ay); ctx.rotate(th); ctx.scale(sc, sc * flutter);
        ctx.globalAlpha = l.depth > 0.5 ? 1 : 0.92;
        ctx.drawImage(l.spr.c, -l.spr.ox, -l.spr.oy);
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      // luz del letrero sobre las hojas
      if (s && this.glow > 0.01) {
        const sx = s.left - hr.left + s.width / 2, sy = s.top - hr.top + s.height / 2;
        const R = Math.max(s.width * 0.62, 320);
        ctx.globalCompositeOperation = 'source-atop';
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, R);
        g.addColorStop(0, `rgba(240,40,72,${0.34 * this.glow})`);
        g.addColorStop(0.5, `rgba(214,28,60,${0.12 * this.glow})`);
        g.addColorStop(1, 'rgba(200,20,50,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        const g2 = ctx.createRadialGradient(W / 2, H * 1.05, 0, W / 2, H * 1.05, H * 0.7);
        g2.addColorStop(0, `rgba(255,170,90,${0.16 * this.glow})`); g2.addColorStop(1, 'rgba(255,170,90,0)');
        ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      }
      drawFlies(true);
    }
  }

  window.Selva = Selva;
  window.monsteraPath = monsteraPath;
})();
