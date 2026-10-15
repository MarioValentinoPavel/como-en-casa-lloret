// Terciopelo capitoné en WebGL: se acolcha botón a botón, se hunde con la mano y guarda lo que escribes con el dedo
(function () {
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTuft, uCellW, uCellH, uAmp, uSeed;
uniform vec3 uPress;
uniform sampler2D uPerm, uTrans;
uniform vec3 uDeep, uMid, uSheen;
const float PI = 3.14159265;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1.,0.)), u.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y);
}
vec2 lat(vec2 p){ return vec2(p.x/uCellW + p.y/uCellH, p.x/uCellW - p.y/uCellH); }
vec2 unlat(vec2 q){ return vec2((q.x+q.y)*.5*uCellW, (q.x-q.y)*.5*uCellH); }
float tuftAt(vec2 c){
  float d = length((c - uRes*.5)/uRes.y);
  float t = clamp(uTuft*2.1 - d*1.25, 0., 1.);
  return t*t*(3.-2.*t);
}
float height(vec2 p, out vec2 bc){
  vec2 q = lat(p);
  vec2 f = fract(q);
  bc = unlat(floor(q + .5));
  float t = tuftAt(p);
  float puff = pow(max(sin(PI*f.x)*sin(PI*f.y), 0.), .55);
  float h = mix(.6, puff, t);
  vec2 d2 = p - bc;
  float r = min(uCellW, uCellH)*.19;
  float dd = dot(d2, d2)/(r*r);
  h -= exp(-dd)*.6*t;
  float ang = atan(d2.y, d2.x);
  h += .06*t*cos(ang*4.)*exp(-dd*.3)*(1.-exp(-dd*1.5));
  vec2 dp = p - uPress.xy;
  float R = min(uCellW, uCellH)*.6;
  h -= uPress.z*.8*exp(-dot(dp, dp)/(R*R));
  return h;
}
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = p/uRes;
  vec2 bc, b2;
  float e = 1.5;
  float h = height(p, bc);
  float hx = height(p + vec2(e, 0.), b2);
  float hy = height(p + vec2(0., e), b2);
  vec3 N = normalize(vec3(-(hx-h)*uAmp/e, -(hy-h)*uAmp/e, 1.));
  vec3 L = normalize(vec3(-.45, -.7, .58));
  float diff = clamp(dot(N, L), 0., 1.);
  float rim = pow(1. - N.z, 1.25);

  float big = noise(p/(uCellW*1.15) + uSeed)*.6 + noise(p/(uCellW*.4) - uSeed)*.4;
  float fib = noise(p*.85)*.5 + noise(p*2.1 + 7.)*.5;
  vec3 perm = texture2D(uPerm, uv).rgb;
  float tr = texture2D(uTrans, uv).r;
  float lightB = perm.r + tr*.5;
  float darkB = perm.g;

  vec3 col = mix(uDeep, uMid, diff);
  col += uSheen*(rim*(.7 + .6*big) + lightB*.62);
  col = mix(col, vec3(dot(col, vec3(.35, .45, .2))), lightB*.12);
  col *= 1. - .45*darkB;
  col *= mix(.36, 1., smoothstep(-.25, .55, h));
  col *= .92 + .12*fib;

  float t = tuftAt(bc);
  float rb = min(uCellW, uCellH)*.075*t;
  if (rb > .6) {
    float db = length(p - bc);
    col *= 1. - .5*smoothstep(rb*2.4, rb*.95, db)*step(rb, db);
    if (db < rb + 1.) {
      vec2 o = (p - bc)/rb;
      vec3 Nb = normalize(vec3(o*.9, sqrt(max(1. - dot(o, o), 0.))));
      float d3 = clamp(dot(Nb, L), 0., 1.);
      vec3 bcol = mix(uDeep, uMid, d3)*1.08 + uSheen*pow(1. - Nb.z, 1.3)*.85;
      col = mix(col, bcol, smoothstep(rb + 1., rb - 1., db));
    }
  }
  vec2 vv = uv - .5;
  col *= 1. - .6*dot(vv, vv);
  col += (hash(p + uSeed) - .5)*.022;
  gl_FragColor = vec4(col, 1.);
}`;

  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };

  class Velvet {
    constructor(canvas, opts) {
      this.c = canvas;
      this.o = Object.assign({
        target: canvas.parentElement, cell: (w) => Math.max(84, Math.min(170, w / 7.5)), ratio: 1.3,
        dpr: 1.5, interactive: true, still: false, reduced: false, tuftDur: 2400,
        deep: '#1c040a', mid: '#6a1225', sheen: '#9c3a4c'
      }, opts || {});
      const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
      if (!gl) { canvas.classList.add('is-fallback'); this.gl = null; return; }
      this.gl = gl;
      this.prog = this.program(VS, FS);
      gl.useProgram(this.prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(this.prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      this.u = {};
      ['uRes', 'uTuft', 'uCellW', 'uCellH', 'uAmp', 'uSeed', 'uPress', 'uPerm', 'uTrans', 'uDeep', 'uMid', 'uSheen']
        .forEach((k) => { this.u[k] = gl.getUniformLocation(this.prog, k); });
      gl.uniform3fv(this.u.uDeep, hex(this.o.deep));
      gl.uniform3fv(this.u.uMid, hex(this.o.mid));
      gl.uniform3fv(this.u.uSheen, hex(this.o.sheen));
      gl.uniform1f(this.u.uSeed, Math.random() * 50);
      gl.uniform1i(this.u.uPerm, 0);
      gl.uniform1i(this.u.uTrans, 1);
      this.texPerm = this.tex(0);
      this.texTrans = this.tex(1);

      this.tuft = this.o.reduced || this.o.still ? 1 : 0;
      this.tuftT0 = null;
      this.press = { x: -9999, y: -9999, s: 0, v: 0, target: 0 };
      this.last = null;
      this.down = false;
      this.jobs = [];
      this.transLife = 0;
      this.visible = false;
      this.wrote = false;

      this.resize();
      new ResizeObserver(() => { this.resize(); this.kick(); }).observe(canvas);
      new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; if (this.visible) this.kick(); }, { rootMargin: '80px' }).observe(canvas);
      if (this.o.interactive) this.bind();
    }

    program(vs, fs) {
      const gl = this.gl;
      const sh = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
        return s;
      };
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      return p;
    }

    tex(unit) {
      const gl = this.gl, t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }

    resize() {
      if (!this.gl) return;
      const r = this.c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, this.o.dpr);
      const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
      this.cssW = r.width; this.cssH = r.height; this.scale = dpr; this.bk = dpr * 0.8;
      if (w === this.c.width && h === this.c.height && this.permC) return;
      this.c.width = w; this.c.height = h;
      this.gl.viewport(0, 0, w, h);
      // las capas de escritura conservan lo escrito al redimensionar
      ['perm', 'trans'].forEach((k) => {
        const old = this[k + 'C'];
        const nc = document.createElement('canvas');
        nc.width = Math.ceil(r.width * this.bk); nc.height = Math.ceil(r.height * this.bk);
        const x = nc.getContext('2d');
        x.fillStyle = '#000'; x.fillRect(0, 0, nc.width, nc.height);
        if (old) x.drawImage(old, 0, 0, nc.width, nc.height);
        this[k + 'C'] = nc; this[k + 'X'] = x;
      });
      this.cellCss = this.o.cell(this.cssW);
      this.dirtyPerm = this.dirtyTrans = true;
    }

    bind() {
      const t = this.o.target;
      const pos = (e) => { const r = this.c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      const onUi = (e) => e.target.closest && e.target.closest('a,button,input,select,label,textarea');
      t.addEventListener('pointerdown', (e) => {
        if (onUi(e) || e.button > 0) return;
        this.down = true;
        const p = pos(e);
        this.last = p;
        this.press.x = p.x; this.press.y = p.y; this.press.target = 1;
        this.kick();
      });
      t.addEventListener('pointermove', (e) => {
        const p = pos(e);
        const prev = this.last;
        this.last = p;
        this.press.x = p.x; this.press.y = p.y;
        if (e.pointerType === 'mouse') {
          if (!this.down) this.press.target = 0.22;
          if (prev) this.stroke(prev, p, this.down ? 'perm' : 'trans');
          if (this.down && prev) this.stroke(prev, p, 'trans');
        } else if (this.down && prev) {
          this.stroke(prev, p, 'perm');
        }
        this.kick();
      });
      const up = () => { if (this.down) { this.down = false; this.press.target = 0; this.kick(); } };
      window.addEventListener('pointerup', up);
      t.addEventListener('pointercancel', () => { this.down = false; this.press.target = 0; this.last = null; this.kick(); });
      t.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { this.press.target = 0; this.last = null; this.down = false; this.kick(); } });
    }

    stroke(a, b, layer) {
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
      if (len < 0.5) return;
      const k = this.bk;
      const x = this[layer + 'X'];
      const w = this.cellCss * (layer === 'perm' ? 0.2 : 0.26) * k;
      // el pelo del terciopelo cae hacia abajo: a favor se aclara, a contrapelo se oscurece
      const dir = 0.5 + 0.5 * ((dx * 0.35 + dy * 0.94) / len);
      x.save();
      x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = w;
      if (layer === 'perm') {
        const col = `rgb(${Math.round(255 * (0.35 + 0.65 * dir))},${Math.round(255 * (1 - dir) * 0.85)},0)`;
        x.strokeStyle = col; x.shadowColor = col;
        x.shadowBlur = w * 0.45;
        this.dirtyPerm = true;
        if (!this.wrote) { this.wrote = true; this.c.dispatchEvent(new CustomEvent('velvet:wrote', { bubbles: true })); }
      } else {
        x.strokeStyle = 'rgba(255,255,255,.32)';
        x.shadowColor = 'rgba(255,255,255,.5)';
        x.shadowBlur = w;
        this.transLife = 260;
        this.dirtyTrans = true;
      }
      x.beginPath(); x.moveTo(a.x * k, a.y * k); x.lineTo(b.x * k, b.y * k); x.stroke();
      x.restore();
    }

    // Escribe un texto "con el dedo": la máscara del texto se destapa de izquierda a derecha
    write(text, o) {
      if (!this.gl) return Promise.resolve();
      const font = o.font || 'Sacramento';
      return document.fonts.load(`${Math.round(o.size)}px "${font}"`).catch(() => {}).then(() => new Promise((res) => {
        const k = this.bk;
        const size = o.size * k;
        const m = document.createElement('canvas');
        const mx = m.getContext('2d');
        mx.font = `${size}px "${font}"`;
        const tw = mx.measureText(text).width;
        const pad = size * 0.5;
        m.width = Math.ceil(tw + pad * 2); m.height = Math.ceil(size * 1.9);
        mx.font = `${size}px "${font}"`;
        mx.textBaseline = 'middle';
        mx.fillStyle = 'rgb(255,25,0)';
        mx.shadowColor = 'rgb(255,25,0)';
        mx.shadowBlur = size * 0.012;
        mx.lineWidth = size * 0.055; mx.lineJoin = 'round'; mx.strokeStyle = 'rgb(255,25,0)';
        mx.fillText(text, pad, m.height / 2);
        mx.strokeText(text, pad, m.height / 2);
        const dx = o.x * k - m.width / 2, dy = o.y * k - m.height / 2;
        this.jobs.push({ m, dx, dy, t0: null, dur: (o.dur || 1500) * (this.o.reduced ? 0 : 1), delay: o.delay || 0, done: 0, res });
        this.kick();
      }));
    }

    smooth() {
      this.jobs.push({ smooth: true, t0: null, dur: this.o.reduced ? 0 : 700, delay: 0, done: 0, res: () => {} });
      this.wrote = false;
      this.kick();
    }

    start() { this.tuftT0 = null; this.started = true; this.kick(); }

    kick() { if (!this.gl || this.raf || !this.visible) return; this.raf = requestAnimationFrame((t) => this.frame(t)); }

    frame(now) {
      this.raf = 0;
      if (!this.visible) return;
      let busy = false;
      // acolchado inicial
      if (this.started && this.tuft < 1) {
        if (this.tuftT0 === null) this.tuftT0 = now;
        this.tuft = Math.min(1, (now - this.tuftT0) / this.o.tuftDur);
        busy = true;
      }
      // muelle de la presión: se hunde y recupera como un cojín
      const P = this.press;
      P.v += (P.target - P.s) * 0.16; P.v *= 0.74; P.s += P.v;
      if (Math.abs(P.v) > 0.0005 || Math.abs(P.target - P.s) > 0.002) busy = true;
      // trabajos de escritura y alisado
      this.jobs = this.jobs.filter((j) => {
        if (j.t0 === null) j.t0 = now + j.delay;
        if (now < j.t0) { busy = true; return true; }
        const q = j.dur ? Math.min(1, (now - j.t0) / j.dur) : 1;
        const e = 1 - Math.pow(1 - q, 2.2);
        if (j.smooth) {
          const H = this.permC.height, W = this.permC.width;
          const y = Math.round(e * H);
          const g = this.permX.createLinearGradient(0, y - H * 0.18, 0, y);
          g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          this.permX.fillStyle = '#000'; this.permX.fillRect(0, 0, W, Math.max(0, y - H * 0.18));
          this.permX.fillStyle = g; this.permX.fillRect(0, y - H * 0.18, W, H * 0.18);
        } else {
          const w = Math.round(e * j.m.width);
          if (w > j.done) {
            this.permX.save();
            this.permX.globalCompositeOperation = 'lighten';
            this.permX.drawImage(j.m, j.done, 0, w - j.done, j.m.height, j.dx + j.done, j.dy, w - j.done, j.m.height);
            this.permX.restore();
            j.done = w;
            // la "mano" que escribe deja una huella que se mueve con ella
            if (q < 1) { P.x = (j.dx + w) / this.bk; P.y = (j.dy + j.m.height / 2) / this.bk; P.target = 0.35; }
          }
        }
        this.dirtyPerm = true;
        if (q >= 1) { if (!j.smooth) P.target = this.down ? 1 : 0; j.res(); return false; }
        busy = true;
        return true;
      });
      // el rastro de la mano se desvanece
      if (this.transLife > 0) {
        this.transLife--;
        this.transX.fillStyle = 'rgba(0,0,0,.045)';
        this.transX.fillRect(0, 0, this.transC.width, this.transC.height);
        if (this.transLife === 0) { this.transX.fillStyle = '#000'; this.transX.fillRect(0, 0, this.transC.width, this.transC.height); }
        this.dirtyTrans = true;
        busy = true;
      }
      this.draw();
      if (busy) this.kick();
    }

    draw() {
      const gl = this.gl;
      if (this.dirtyPerm) {
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.texPerm);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.permC);
        this.dirtyPerm = false;
      }
      if (this.dirtyTrans) {
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.texTrans);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.transC);
        this.dirtyTrans = false;
      }
      const s = this.scale, cw = this.cellCss * s;
      gl.uniform2f(this.u.uRes, this.c.width, this.c.height);
      gl.uniform1f(this.u.uTuft, this.started || this.o.still ? this.tuft : 0);
      gl.uniform1f(this.u.uCellW, cw);
      gl.uniform1f(this.u.uCellH, cw * this.o.ratio);
      gl.uniform1f(this.u.uAmp, cw * 0.26);
      gl.uniform3f(this.u.uPress, this.press.x * s, this.press.y * s, Math.max(0, this.press.s));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }

  window.Velvet = Velvet;
})();
