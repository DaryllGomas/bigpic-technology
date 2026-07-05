'use strict';

// ================================================================
// DAWN SEQUENCE — scroll-driven WebGL sunrise over the full page
// Ported from mockups/dawn-sequence.html (approved design), including
// the "daylight mode" finale.
//
// Safety rails: this entire module is a no-op unless WebGL works, GSAP +
// ScrollTrigger + Lenis are loaded, the viewport is desktop-sized, and the
// user hasn't asked for reduced motion. If any check fails we bail before
// touching the DOM — the existing stars/celestial/orbit animations and all
// current styling stay exactly as shipped.
// ================================================================
(function () {

  function supportsWebGL() {
    try {
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // ?motion=1 forces the system ON (preview/testing on machines with OS-level
  // reduced-motion, e.g. Windows "Animation effects" off); ?motion=0 forces OFF.
  var motionOverride = null;
  try {
    motionOverride = new URLSearchParams(window.location.search).get('motion');
  } catch (e) { /* ancient browser — no override */ }

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionOverride === '1') prefersReducedMotion = false;
  if (motionOverride === '0') prefersReducedMotion = true;

  var isMobileViewport = window.innerWidth < 768;
  var hasDeps = typeof gsap !== 'undefined' &&
    typeof ScrollTrigger !== 'undefined' &&
    typeof Lenis !== 'undefined';

  if (prefersReducedMotion || isMobileViewport || !hasDeps || !supportsWebGL()) {
    return; // do nothing — current site stays exactly as today
  }

  var canvas = document.getElementById('sky');
  if (!canvas) return;

  var gl;
  try {
    gl = canvas.getContext('webgl', { antialias: false });
  } catch (e) {
    return;
  }
  if (!gl) return; // WebGL context creation failed — leave everything untouched

  // ---- We're committed: boot the system ----
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('dawn-active');

  // ---------- Shaders (ported verbatim from the mockup) ----------
  var vsrc = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  var fsrc = `
    precision highp float;
    uniform vec2 uRes;
    uniform float uT;
    uniform float uP; // 0 night -> 1 sunrise

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash21(i);
      float b = hash21(i + vec2(1.0, 0.0));
      float c = hash21(i + vec2(0.0, 1.0));
      float d = hash21(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.03;
        a *= 0.5;
      }
      return v;
    }

    vec3 seg4(vec3 c0, vec3 c1, vec3 c2, vec3 c3, float p) {
      vec3 col = mix(c0, c1, smoothstep(0.0, 0.35, p));
      col = mix(col, c2, smoothstep(0.35, 0.68, p));
      col = mix(col, c3, smoothstep(0.68, 1.0, p));
      return col;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uRes;
      float aspect = uRes.x / uRes.y;
      vec2 pv = vec2(uv.x * aspect, uv.y);

      // ----- sky gradient -----
      // Golden-hour cap: the arc ends at the moment dawn breaks — deep
      // indigo holds the top, molten amber at the horizon. Never daylight.
      // Keeps the whole page luminous-text-on-dark like the rest of BigPic.
      vec3 top = seg4(
        vec3(0.012, 0.020, 0.045),
        vec3(0.035, 0.058, 0.135),
        vec3(0.070, 0.110, 0.220),
        vec3(0.072, 0.105, 0.215), uP);
      vec3 hor = seg4(
        vec3(0.035, 0.062, 0.110),
        vec3(0.130, 0.160, 0.310),
        vec3(0.460, 0.270, 0.360),
        vec3(0.760, 0.420, 0.215), uP);
      vec3 col = mix(hor, top, pow(uv.y, 0.75));

      // ----- stars -----
      vec2 sp = pv * 90.0;
      vec2 id = floor(sp);
      vec2 gv = fract(sp) - 0.5;
      float h = hash21(id);
      float star = 0.0;
      if (h > 0.90) {
        vec2 off = (vec2(hash21(id + 1.7), hash21(id + 3.1)) - 0.5) * 0.7;
        float sd = length(gv - off);
        float s = smoothstep(0.10 + 0.10 * fract(h * 13.0), 0.0, sd);
        float tw = 0.55 + 0.45 * sin(uT * (0.6 + h * 2.4) + h * 40.0);
        star = s * tw * (0.35 + 0.65 * fract(h * 7.0));
      }
      star *= mix(1.0, 0.28, smoothstep(0.30, 0.75, uP)); // stars never fully leave — it's still the BigPic night
      star *= smoothstep(0.10, 0.35, uv.y);
      col += vec3(star) * vec3(0.9, 0.95, 1.0);

      // ----- horizon silhouette -----
      float hline = 0.085 + fbm(vec2(uv.x * 3.5, 7.0)) * 0.045;

      // ----- pre-dawn horizon glow -----
      float above = max(uv.y - hline, 0.0);
      float hg = exp(-above * 9.0) * mix(0.10, 0.42, smoothstep(0.05, 0.75, uP));
      col += hg * vec3(0.95, 0.55, 0.28);

      // ----- clouds -----
      float band = smoothstep(0.42, 0.10, uv.y) * smoothstep(0.03, 0.13, uv.y);
      float n = fbm(vec2(uv.x * 3.5 + uT * 0.008, uv.y * 9.0));
      float cloud = smoothstep(0.48, 0.85, n) * band;
      vec3 cloudCol = mix(vec3(0.10, 0.12, 0.22), vec3(0.80, 0.45, 0.24), smoothstep(0.3, 0.9, uP));
      col = mix(col, cloudCol, cloud * 0.45 * smoothstep(0.15, 0.7, uP));

      // ----- the sun -----
      float sunT = smoothstep(0.04, 0.96, uP);
      sunT = pow(sunT, 1.8); // hug the horizon through the journey, lift only at the end
      vec2 sunPos = vec2(0.5 * aspect, mix(-0.16, 0.58, sunT)); // just-risen, never high
      float d = distance(pv, sunPos);
      float ang = atan(pv.y - sunPos.y, pv.x - sunPos.x);

      // morning haze: fully risen sun softens so finale text stays readable
      float damp = 1.0 - 0.40 * smoothstep(0.75, 1.0, uP);
      float core = smoothstep(0.072, 0.066, d);
      float glow = (exp(-d * 5.5) * 0.85 + exp(-d * 1.8) * 0.30) * damp;
      glow *= 1.0 + 0.12 * sin(ang * 10.0 - uT * 0.35) * smoothstep(0.55, 1.0, uP);
      vec3 sunCol = mix(vec3(1.0, 0.88, 0.66), vec3(1.0, 0.70, 0.42), uP);
      vec3 sunLayer = sunCol * (core * 1.4 + glow * (0.35 + 0.75 * uP));

      // orbital rings
      float rings = 0.0;
      float r1 = abs(d - 0.15);
      float r2 = abs(d - 0.235);
      float r3 = abs(d - 0.33);
      rings += smoothstep(0.0022, 0.0, r1) * (0.35 + 0.30 * sin(ang * 2.0 + uT * 0.30));
      rings += smoothstep(0.0020, 0.0, r2) * (0.30 + 0.28 * sin(ang * 3.0 - uT * 0.22));
      rings += smoothstep(0.0018, 0.0, r3) * (0.24 + 0.24 * sin(ang * 1.0 + uT * 0.16));
      sunLayer += sunCol * rings * (0.25 + 0.55 * uP);

      col += sunLayer;

      // ----- ground occludes the sun (this IS the sunrise) -----
      float ground = smoothstep(hline, hline - 0.004, uv.y);
      vec3 groundCol = mix(vec3(0.010, 0.014, 0.026), vec3(0.055, 0.038, 0.040), uP);
      // rim light on the ridge at high p
      float rim = smoothstep(hline, hline - 0.006, uv.y) - smoothstep(hline - 0.006, hline - 0.014, uv.y);
      groundCol += rim * vec3(0.9, 0.5, 0.25) * uP * 0.7;
      col = mix(col, groundCol, ground * 0.97);

      // vignette
      float vig = 1.0 - 0.30 * pow(length(uv - vec2(0.5, 0.45)), 1.6);
      col *= vig;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'uRes');
  var uT = gl.getUniformLocation(prog, 'uT');
  var uP = gl.getUniformLocation(prog, 'uP');

  var progress = 0, smoothP = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- Smooth scroll + scroll progress ----------
  var lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.create({
    trigger: document.body,
    start: 0,
    end: function () { return document.documentElement.scrollHeight - window.innerHeight; },
    onUpdate: function (self) { progress = self.progress; }
  });

  // Same-page hash links (e.g. the hero CTA "#contact") route through Lenis
  // instead of the browser's native jump. External links (reports/, other
  // domains) don't match this selector, so they're untouched.
  var hashLinks = document.querySelectorAll('a[href^="#"]');
  for (var i = 0; i < hashLinks.length; i++) {
    (function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id.length < 2) return;
        var target;
        try { target = document.querySelector(id); } catch (err) { return; }
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target);
      });
    })(hashLinks[i]);
  }

  // Service cards "lit from below" as the sun reaches them (the existing
  // .reveal IntersectionObserver in index.html keeps handling the initial
  // fade-in; this just drives the scroll-scrubbed --p custom property).
  var cards = document.querySelectorAll('.service-card');
  for (var c = 0; c < cards.length; c++) {
    (function (card) {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        end: 'top 35%',
        scrub: true,
        onUpdate: function (self) { card.style.setProperty('--p', self.progress.toFixed(3)); }
      });
    })(cards[c]);
  }

  // ---------- HUD (bottom-left time/phase readout) ----------
  var hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML =
    '<div class="hud-time" id="dawn-hud-time">04:12</div>' +
    '<div class="hud-phase" id="dawn-hud-phase">NIGHT</div>' +
    '<div class="hud-track" id="dawn-hud-track"></div>';
  document.body.appendChild(hud);
  var hudTime = document.getElementById('dawn-hud-time');
  var hudPhase = document.getElementById('dawn-hud-phase');
  var hudTrack = document.getElementById('dawn-hud-track');

  var PHASES = [
    [0.00, 'NIGHT'],
    [0.22, 'FIRST LIGHT'],
    [0.48, 'DAWN'],
    [0.78, 'SUNRISE']
  ];
  function fmtTime(p) {
    // 04:12 -> 06:48 over the scroll
    var mins = 252 + Math.round(p * 156);
    var h = String(Math.floor(mins / 60)).padStart(2, '0');
    var m = String(mins % 60).padStart(2, '0');
    return h + ':' + m;
  }

  // ---------- Render loop (paused while the tab is hidden) ----------
  var t0 = performance.now();
  var running = false;

  function loop() {
    if (document.hidden) { running = false; return; }
    running = true;

    smoothP += (progress - smoothP) * 0.06;
    var t = (performance.now() - t0) / 1000;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, t);
    gl.uniform1f(uP, smoothP);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    hudTime.textContent = fmtTime(smoothP);
    var ph = PHASES[0][1];
    for (var p = 0; p < PHASES.length; p++) if (smoothP >= PHASES[p][0]) ph = PHASES[p][1];
    hudPhase.textContent = ph;
    hudTrack.style.setProperty('--p', smoothP.toFixed(3));

    // Golden-hour cap: the sky stays dark enough for luminous text
    // everywhere — no ink/daylight class flips needed.

    requestAnimationFrame(loop);
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && !running) requestAnimationFrame(loop);
  });

  requestAnimationFrame(loop);
})();
