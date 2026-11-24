(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = v => Math.min(1, Math.max(0, v)), mix = (a, b, t) => a + (b - a) * t, ease = t => t * t * (3 - 2 * t);

  // Abertura: um olho fechado que se abre ao rolar; os cílios acompanham o cursor ou o dedo.
  const hero = $(".hero"), cv = $(".stage canvas"), c = cv.getContext("2d"), txt = $(".hero-text"), end = $(".hero-end");
  let vw, vh, tx = 0, ty = 0, mx = 0, my = 0, last = "";
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    vw = cv.clientWidth; vh = cv.clientHeight; cv.width = vw * d; cv.height = vh * d; c.setTransform(d, 0, 0, d, 0, 0); last = "";
  };
  const born = performance.now();
  const draw = now => {
    if (!still) requestAnimationFrame(draw);
    const p = still ? 0 : clamp(-hero.getBoundingClientRect().top / (hero.offsetHeight - vh));
    if (p >= 1 && last === "end") return;
    const o = still ? 1 : 1 - Math.pow(1 - clamp((now - born - 200) / 1600), 3);
    mx += (tx - mx) * .08; my += (ty - my) * .08;
    const key = [p.toFixed(4), o.toFixed(3), mx.toFixed(3), my.toFixed(3)].join();
    if (key === last) return;
    last = p >= 1 ? "end" : key;
    const t = ease(clamp((p - .08) / .72));
    const w = mix(Math.min(vw * .4, vh * .42), Math.min(vw * .43, vh * .37), t), cx = vw / 2, cy = mix(vh * .68, Math.max(84 + w * 1.1, vw < vh ? vh * .47 : 0), t);
    const low = w * .42, up = mix(low, -w * .72, t);
    const at = (u, d) => [cx - w + 2 * w * u, cy + 4 * u * (1 - u) * d / 1];
    const lid = d => { c.beginPath(); c.moveTo(cx - w, cy); c.quadraticCurveTo(cx, cy + 2 * d, cx + w, cy); };
    c.clearRect(0, 0, vw, vh);
    c.lineCap = "round"; c.strokeStyle = "#b99a68"; c.fillStyle = "#b99a68";
    if (t > 0) {
      c.save(); lid(up); c.quadraticCurveTo(cx, cy + 2 * low, cx - w, cy); c.clip();
      c.fillStyle = "#f9f5ef"; c.fillRect(cx - w, cy - w, 2 * w, 2 * w);
      const ix = cx + mx * w * .12, iy = cy - w * .08 + my * w * .06, r = w * .4;
      c.fillStyle = "#4a2a1a"; c.beginPath(); c.arc(ix, iy, r, 0, 7); c.fill();
      c.lineWidth = 1.4;
      for (let i = 0; i < 72; i++) { const a = i / 72 * 6.2832, k = .55 + .4 * Math.abs(Math.sin(i * 12.9)); c.beginPath(); c.moveTo(ix + Math.cos(a) * r * .46, iy + Math.sin(a) * r * .46); c.lineTo(ix + Math.cos(a) * r * k, iy + Math.sin(a) * r * k); c.stroke(); }
      c.fillStyle = "#1a0a0c"; c.beginPath(); c.arc(ix, iy, r * .44, 0, 7); c.fill();
      c.fillStyle = "#fff"; c.beginPath(); c.arc(ix + r * .3, iy - r * .34, r * .13, 0, 7); c.fill();
      c.restore();
      c.lineWidth = 2; c.globalAlpha = t; lid(low); c.stroke(); c.globalAlpha = 1;
    }
    c.fillStyle = c.strokeStyle = "#e9ddcb"; c.lineWidth = Math.max(3, w * .012); lid(up); c.stroke();
    const N = 37, dir = mix(1, -1, t), th = Math.max(2, w * .0085);
    for (let i = 0; i < N; i++) {
      const u = .04 + .92 * i / (N - 1), [x, y] = at(u, up);
      const grow = clamp(o * 1.6 - Math.abs(u - .5) * 1.1);
      const L = w * .36 * (.62 + .38 * Math.sin(u * 3.1416)) * grow * (i % 2 ? .86 : 1);
      const sx = (u - .5) * 1.25 + mx * .32, ex = x + sx * L * 1.15, ey = y + dir * L * (1 + my * .12);
      const qx = x + sx * L * .25, qy = y + dir * L * .72;
      c.beginPath(); c.moveTo(x - th, y); c.quadraticCurveTo(qx - th * .5, qy, ex, ey); c.quadraticCurveTo(qx + th * .5, qy, x + th, y); c.fill();
    }
    txt.style.opacity = 1 - clamp(p / .2); txt.style.visibility = p > .2 ? "hidden" : "";
    end.style.opacity = clamp((p - .68) / .18);
  };
  size(); requestAnimationFrame(draw);
  addEventListener("resize", () => { size(); if (still) draw(0); });
  addEventListener("pointermove", e => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), { threshold: .2 });
  $$("[data-rise]").forEach(e => io.observe(e));

  const svcs = $$(".svc");
  svcs.forEach(s => s.querySelector("h3 button").addEventListener("click", () => {
    svcs.forEach(x => { const on = x === s; x.classList.toggle("on", on); x.querySelector("h3 button").setAttribute("aria-expanded", on); });
    if (innerWidth <= 820) s.scrollIntoView({ behavior: still ? "auto" : "smooth" });
  }));

  // Rosto ilustrado.
  const face = $(".face");
  let r = 7; const rnd = () => (r = r * 16807 % 2147483647) / 2147483647;
  let curls = "";
  for (let i = 0; i < 150; i++) {
    const a = Math.PI * (1.02 + .96 * rnd()), k = 1 + rnd() * .3;
    const x = 300 + Math.cos(a) * 285 * k, y = 350 + Math.sin(a) * 335 * k, q = 13 + rnd() * 20;
    curls += `<circle cx="${x}" cy="${y}" r="${q}" fill="${rnd() > .5 ? "#1d1113" : "#2a191a"}" stroke="#4a2e2b" stroke-width="1.6"/>`;
  }
  let lashes = "", hairs = "";
  for (let i = 0; i < 15; i++) {
    const u = .05 + .9 * i / 14, x = 95 + 165 * u, y = 292 + 4 * u * (1 - u) * 36, s = (u - .62) * 60;
    lashes += `<path data-x="${x}" data-y="${y}" data-s="${s}" data-i="${i}"/>`;
  }
  for (let i = 0; i < 22; i++) {
    const u = i / 21, x = 262 - 178 * u, y = 226 - 62 * Math.sin(u * 2.35) + (u > .75 ? (u - .75) * 60 : 0);
    hairs += `<path d="M${x} ${y + 12 - 8 * u}q${-6 - 10 * u} ${-12 + 14 * u} ${-16 - 4 * u} ${-20 + 22 * u}"/>`;
  }
  const half = `<path class="shadow" d="M84 290Q130 218 190 216Q245 222 268 292Q180 360 84 290Z" filter="url(#b1)"/>
    <path class="browfill" d="M272 214Q210 166 148 160Q104 166 66 208Q112 182 148 183Q210 194 270 238Q277 226 272 214Z"/><g class="hairs" fill="none" stroke="#1d1113" stroke-width="2" stroke-linecap="round">${hairs}</g>
    <path d="M110 268Q178 226 248 270" fill="none" stroke="#1d0d0a" stroke-opacity=".35" stroke-width="2.5"/>
    <path d="M95 292Q177.500 364 260 292" fill="none" stroke="#1d1113" stroke-width="5" stroke-linecap="round"/><g class="lashes" fill="none" stroke="#1d1113" stroke-linecap="round">${lashes}</g>
    <ellipse class="blush" cx="112" cy="420" rx="70" ry="44" fill="#a3293f" opacity=".22" filter="url(#b2)"/>
    <path d="M258 440Q262 468 284 462Q292 470 300 470" fill="none" stroke="#1d0d0a" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>`;
  face.innerHTML = `<defs><filter id="b1" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter><filter id="b2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="24"/></filter></defs>
    <path class="skin" d="M22 260C22 60 150 8 300 8S578 60 578 260C578 480 470 690 300 690S22 480 22 260Z"/>${curls}<g>${half}</g><g transform="translate(600 0) scale(-1 1)">${half}</g>
    <g class="lips"><path d="M212 552Q262 520 284 523Q300 532 316 523Q338 520 388 552Q345 560 300 557Q255 560 212 552Z"/><path d="M212 553Q255 562 300 560Q345 562 388 553Q352 606 300 606Q248 606 212 553Z"/></g><path d="M212 552Q255 562 300 559Q345 562 388 552" fill="none" stroke="#1d0d0a" stroke-opacity=".55" stroke-width="2.500"/><path d="M262 584Q300 592 338 584" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>`;
  const st = {}, all = (s, f) => face.querySelectorAll(s).forEach(f);
  const natural = { "#8d5a3f": "#7d4038", "#5d3726": "#5a2a2a", "#b98262": "#a75f55", "#e6bfa3": "#cf8d84" };
  const paint = () => {
    all(".skin", e => e.setAttribute("fill", st.skin));
    all(".lips", e => e.setAttribute("fill", st.lip === "none" ? natural[st.skin] : st.lip));
    all(".shadow", e => { if (st.shadow !== "none") e.setAttribute("fill", st.shadow); e.setAttribute("opacity", st.shadow === "none" ? 0 : .85); });
    all(".browfill", e => { e.setAttribute("fill", "#1d1113"); e.setAttribute("opacity", [.12, .5, .88][st.brow]); });
    all(".hairs", e => e.setAttribute("opacity", [.5, .9, .6][st.brow]));
    const L = [22, 36, 44][st.lash];
    all(".lashes path", e => {
      const { x, y, s, i } = e.dataset, k = L * (i % 2 ? .86 : 1), d = +s * L / 36;
      e.setAttribute("d", `M${x} ${y}q${d * .1} ${k * .8} ${d} ${k}`); e.setAttribute("stroke-width", [1.8, 2.4, 4.4][st.lash]);
    });
  };
  const opts = $$("[data-g]");
  const set = b => { st[b.dataset.g] = b.dataset.v; opts.filter(x => x.dataset.g === b.dataset.g).forEach(x => x.setAttribute("aria-pressed", x === b)); };
  opts.forEach(b => { if (b.getAttribute("aria-pressed") === "true") set(b); b.addEventListener("click", () => { set(b); paint(); }); });
  ["lash:2", "brow:1", "shadow:#b99a68", "lip:#a3293f"].forEach(k => { const [g, v] = k.split(":"); set(opts.find(b => b.dataset.g === g && b.dataset.v === v)); });
  paint();
  $(".surprise").addEventListener("click", () => {
    ["lash", "brow", "shadow", "lip"].forEach(g => { const l = opts.filter(b => b.dataset.g === g && b.getAttribute("aria-pressed") !== "true"); set(l[Math.floor(Math.random() * l.length)]); });
    paint();
  });

  const cmp = $(".cmp");
  cmp.querySelector("input").addEventListener("input", e => cmp.style.setProperty("--x", e.target.value + "%"));
})();
