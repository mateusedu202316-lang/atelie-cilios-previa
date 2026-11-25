(() => {
  const WHATSAPP = "5511992490643";
  const WA_MSG = "Oi, Mara! Vim pelo site e quero fazer meu agendamento ✨";

  // Dados do catálogo: vêm do build.py (uma fonte só), embutidos no HTML.
  const ITENS = JSON.parse(document.getElementById("dados").textContent);
  const ITEM = Object.fromEntries(ITENS.map(i => [i.id, i]));
  const D1 = 16, D2 = 22; // manutenção até 16 dias; de 17 a 22 dias

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = matchMedia("(min-width: 901px)");
  const cursorOn = matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const brl = v => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const waLink = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

  /* ---------- links de WhatsApp ---------- */
  const setWa = (a, msg = WA_MSG) => { a.href = waLink(msg); a.target = "_blank"; a.rel = "noopener"; };
  $$("[data-wa]").forEach(a => setWa(a, a.dataset.wa || undefined));
  $$("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- rolagem suave (Lenis) ---------- */
  const lenis = !reduced && window.Lenis ? new window.Lenis({ duration: 1.15, smoothWheel: true }) : null;
  const lockScroll = on => {
    document.body.classList.toggle("is-locked", on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.5 });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }));

  /* ---------- intro ---------- */
  const intro = $(".intro");
  if (reduced) {
    document.documentElement.style.setProperty("--hero-delay", "0s");
    intro.remove();
  } else {
    lenis?.stop();
    requestAnimationFrame(() => $(".intro__lash").classList.add("is-drawn"));
    setTimeout(() => {
      intro.classList.add("is-done");
      lenis?.start();
      setTimeout(() => intro.remove(), 1100);
    }, 1050);
  }

  /* ---------- título do hero letra por letra ---------- */
  $$("[data-split]").forEach(el => {
    el.innerHTML = [...el.textContent].map((c, i) => `<span class="ch" style="--i:${i}" aria-hidden="true">${c}</span>`).join("");
  });
  setTimeout(() => $(".hero__lash").classList.add("is-drawn"), reduced ? 0 : 1650);

  /* ---------- leques das técnicas (Y, W, 4D, 6D...) ---------- */
  const makeFan = n => {
    const spread = Math.min(16 * (n - 1), 78);
    let lines = "";
    for (let i = 0; i < n; i++) {
      const a = n === 1 ? 0 : -spread / 2 + (spread / (n - 1)) * i;
      const rad = (a * Math.PI) / 180;
      const len = 78 - Math.abs(a) * 0.25;
      const x = 50 + Math.sin(rad) * len, y = 92 - Math.cos(rad) * len;
      lines += `<line x1="50" y1="92" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" style="--r:${(a / 6).toFixed(1)}deg"/>`;
    }
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${lines}<circle cx="50" cy="92" r="6"/></svg>`;
  };
  $$("[data-fan]").forEach(box => (box.innerHTML = makeFan(+box.dataset.fan)));

  /* ---------- manifesto: separa em palavras ---------- */
  const scrubWords = [];
  $$("[data-scrub]").forEach(p => {
    const label = p.textContent;
    const frag = document.createDocumentFragment();
    p.childNodes.forEach(node => {
      const pink = node.nodeType === 1;
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(" "); return; }
        const w = document.createElement("span");
        w.className = pink ? "w w--pink" : "w";
        w.textContent = part;
        frag.append(w);
        scrubWords.push(w);
      });
    });
    p.replaceChildren(frag);
    p.setAttribute("aria-label", label);
  });
  const scrubEl = $("[data-scrub]");
  if (reduced) scrubWords.forEach(w => w.classList.add("is-lit"));

  /* ---------- reveal ao rolar ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add(e.target.classList.contains("lash--draw") ? "is-drawn" : "is-in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal], .lash--draw:not(.hero__lash):not(.intro__lash)").forEach(el => io.observe(el));

  /* ---------- nav: menu mobile ---------- */
  const nav = $(".nav"), burger = $(".nav__burger"), menu = $(".menu");
  const setMenu = open => {
    menu.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.setAttribute("aria-hidden", !open);
    lockScroll(open);
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  $$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (menu.classList.contains("is-open")) setMenu(false);
    closeLightbox();
    closeSheet();
  });

  const navLinks = $$(".nav__links a");
  const secIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => secIO.observe(s));

  /* ---------- abas de valores ---------- */
  const tabs = $$(".tabs [role=tab]"), pill = $(".tabs__pill");
  const movePill = btn => { pill.style.width = btn.offsetWidth + "px"; pill.style.transform = `translateX(${btn.offsetLeft}px)`; };
  const selectTab = btn => {
    tabs.forEach(t => {
      const on = t === btn;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    movePill(btn);
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", e => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus(); selectTab(next);
    });
  });
  const syncPill = () => movePill($(".tabs [aria-selected=true]"));
  document.fonts?.ready.then(syncPill);
  addEventListener("resize", syncPill);
  syncPill();

  /* ---------- calculadora de manutenção ---------- */
  const calc = $(".calc");
  if (calc) {
    const MODELOS = ITENS.filter(i => i.m1 != null); // só quem tem manutenção
    const DMAX = 30;
    const pct = d => ((d - 1) / (DMAX - 1)) * 100;
    const chipsBox = $(".calc__chips", calc), range = $(".calc__range", calc), scale = $(".calc__scale", calc);
    const daysOut = $(".calc__days", calc), result = $(".calc__result", calc);
    const badge = $(".calc__badge", calc), priceEl = $(".calc__price", calc), tip = $(".calc__tip", calc), cta = $(".calc__cta", calc);
    chipsBox.innerHTML = MODELOS.map((m, n) => `<button type="button" role="radio" aria-checked="${n === 0}" data-tech="${n}">${m.nome}</button>`).join("");
    range.style.background = `linear-gradient(90deg, var(--pink) 0 ${pct(D1)}%, var(--cotton) ${pct(D1)}% ${pct(D2)}%, var(--wine) ${pct(D2)}% 100%)`;
    scale.innerHTML = `<span>1</span><span style="left:${pct(D1)}%">${D1}</span><span style="left:${pct(D2)}%">${D2}</span><span style="left:100%">${DMAX}</span>`;
    const chips = $$("button", chipsBox);
    let tech = 0, shown = null, countRaf = 0;

    const paint = (n, from) => {
      priceEl.classList.remove("is-text");
      priceEl.innerHTML = (from ? '<small class="calc__from">a partir de</small>' : "") + brl(n);
    };
    const countTo = (to, from) => {
      cancelAnimationFrame(countRaf);
      if (reduced || shown == null) { shown = to; paint(to, from); return; }
      const start = shown, t0 = performance.now();
      const step = now => {
        const p = clamp((now - t0) / 450, 0, 1);
        shown = Math.round(start + (to - start) * (1 - Math.pow(1 - p, 3)));
        paint(shown, from);
        if (p < 1) countRaf = requestAnimationFrame(step);
      };
      countRaf = requestAnimationFrame(step);
    };

    const update = () => {
      const d = +range.value, t = MODELOS[tech];
      daysOut.textContent = d === 1 ? "1 dia" : `${d} dias`;
      let zone;
      if (d <= D1) {
        zone = "best";
        badge.textContent = `Manutenção até ${D1} dias`;
        tip.textContent = "Você está no melhor prazo! ✨";
        countTo(t.m1, false);
      } else if (d <= D2) {
        zone = "mid";
        badge.textContent = `Manutenção de ${D1 + 1} a ${D2} dias`;
        tip.textContent = t.m2_from ? "Valor pode aumentar conforme avaliação técnica." : "Ainda dá tempo de fazer manutenção, corre!";
        countTo(t.m2, !!t.m2_from);
      } else {
        zone = "new";
        badge.textContent = `Mais de ${D2} dias`;
        tip.textContent = "Passou do prazo da manutenção. Chame no WhatsApp pra avaliar o seu caso.";
        cancelAnimationFrame(countRaf); shown = null;
        priceEl.classList.add("is-text"); priceEl.textContent = "Fale com a Mara";
      }
      if (result.dataset.zone !== zone) { priceEl.classList.remove("is-bump"); void priceEl.offsetWidth; priceEl.classList.add("is-bump"); }
      result.dataset.zone = zone;
      const dias = `${d} ${d === 1 ? "dia" : "dias"}`;
      setWa(cta, zone === "new"
        ? `Oi, Mara! Meus cílios (${t.nome}) têm ${dias} de aplicação. Quero saber sobre a manutenção ✨`
        : `Oi, Mara! Quero agendar a manutenção dos cílios: ${t.nome} (aplicação há ${dias}) ✨`);
    };
    chips.forEach(c => c.addEventListener("click", () => {
      tech = +c.dataset.tech;
      chips.forEach(x => x.setAttribute("aria-checked", x === c));
      update();
    }));
    range.addEventListener("input", update);
    update();
  }

  /* ---------- quiz: qual cílios combina com você? ---------- */
  // Cada resposta dá pontos aos modelos. Os pesos seguem o "Perfil ideal" que a Mara escreveu.
  // Empate: vence quem vem primeiro em ORDEM. (Testado nas 256 combinações: todos os 9 aparecem, de 10% a 12% cada.)
  const ORDEM = ["beleza-natural", "efeito-molhado", "volume-brasileiro", "volume-pink", "volume-diva", "volume-glamour", "fox-eyes", "mega-glamour", "lash-lift"];
  const BN = "beleza-natural", EM = "efeito-molhado", VB = "volume-brasileiro", VP = "volume-pink", VD = "volume-diva", VG = "volume-glamour", FX = "fox-eyes", MG = "mega-glamour", LL = "lash-lift";
  const QUIZ = [
    { q: "Como você quer o seu olhar?", opts: [
      ["Natural, quase sem perceber", { [BN]: 3, [LL]: 4, [VB]: 3, [VD]: 1 }],
      ["Marcado, mas prático", { [EM]: 2, [VB]: 2, [VP]: 1 }],
      ["Mais longo e alongado", { [VP]: 4, [FX]: 2, [VD]: 1 }],
      ["Cheio e impactante", { [MG]: 3, [VG]: 2, [FX]: 1 }]] },
    { q: "Como é a sua rotina?", opts: [
      ["Corrida, preciso de praticidade", { [VB]: 4, [EM]: 3, [BN]: 2, [LL]: 2 }],
      ["Trabalho e gosto de me cuidar", { [VG]: 2, [VD]: 3, [VP]: 1 }],
      ["Gosto de me produzir e de eventos", { [VG]: 2, [MG]: 2, [FX]: 1 }],
      ["Adoro estar na moda e chamar atenção", { [FX]: 3, [MG]: 2 }]] },
    { q: "E os seus cílios naturais?", opts: [
      ["São retos e quero curvar, sem colocar fios", { [LL]: 4 }],
      ["São bons, só quero realçar", { [BN]: 2, [EM]: 1, [VD]: 1 }],
      ["São curtos ou falhados, quero preencher", { [VB]: 1, [VD]: 2, [VG]: 1, [MG]: 1 }],
      ["Não sei, quero que a Mara me indique", {}]] },
    { q: "Qual sensação você quer?", opts: [
      ["Leve e delicada", { [BN]: 2, [VD]: 2, [VP]: 1, [VB]: 1 }],
      ["Elegante e sofisticada", { [VG]: 3, [VP]: 1, [VD]: 1 }],
      ["Estilosa e cheia de atitude", { [FX]: 3, [MG]: 2 }],
      ["Brilho de quem acabou de passar rímel", { [EM]: 3, [BN]: 1 }]] },
  ];
  const vencedor = respostas => {
    const pts = {};
    respostas.forEach((a, q) => Object.entries(QUIZ[q].opts[a][1]).forEach(([k, v]) => (pts[k] = (pts[k] || 0) + v)));
    return ORDEM.reduce((melhor, k) => ((pts[k] || 0) > (pts[melhor] || 0) ? k : melhor), ORDEM[0]);
  };

  const quiz = $(".quiz__card");
  if (quiz) {
    const stage = $(".quiz__stage", quiz), bar = $(".quiz__bar span", quiz), count = $(".quiz__count", quiz);
    let step = 0, picks = [];

    const swap = html => {
      const go = () => {
        stage.innerHTML = html;
        stage.classList.remove("quiz__anim-out");
        stage.classList.add("quiz__anim-in");
        stage.addEventListener("animationend", () => stage.classList.remove("quiz__anim-in"), { once: true });
        bindStage();
      };
      if (reduced || !stage.innerHTML) return go();
      stage.classList.add("quiz__anim-out");
      setTimeout(go, 280);
    };

    const renderQuestion = () => {
      const { q, opts } = QUIZ[step];
      count.innerHTML = `Pergunta <b>${step + 1}</b> de ${QUIZ.length}`;
      bar.style.width = `${(step / QUIZ.length) * 100}%`;
      swap(`<h3 class="quiz__q">${q}</h3><div class="quiz__opts">${opts.map(([label], i) =>
        `<button type="button" class="quiz__opt" data-v="${i}"><i>${"ABCD"[i]}</i>${label}</button>`).join("")}</div>`);
    };

    const burst = origin => {
      if (reduced) return;
      const r = quiz.getBoundingClientRect(), o = origin.getBoundingClientRect();
      const cx = o.left - r.left + o.width / 2, cy = o.top - r.top + o.height / 2;
      const colors = ["#C4A15D", "#EACFD4", "#732F46"];
      for (let i = 0; i < 22; i++) {
        const s = document.createElement("span");
        s.className = "burst";
        s.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[i % 3]}`;
        quiz.append(s);
        const ang = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 160;
        s.animate([
          { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(.3)`, opacity: 0 },
        ], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.16,1,.3,1)" }).onfinish = () => s.remove();
      }
    };

    const renderResult = () => {
      const t = ITEM[vencedor(picks)];
      count.innerHTML = "Resultado";
      bar.style.width = "100%";
      const foto = t.thumb ? `<figure class="quiz__photo"><img src="${t.thumb}" alt="${t.nome}" width="640" height="800"></figure>` : "";
      swap(`<div class="quiz__result">${foto}<div class="quiz__txt">
          <p class="note">combina com você...</p>
          <h3 class="quiz__name">${t.nome}</h3>
          <p class="quiz__fio">${t.tag || ""}</p>
          <p class="quiz__desc"><b>Perfil ideal:</b> ${t.perfil}</p>
          <p class="quiz__price">${t.app != null ? "aplicação" : "valor"} <strong>${brl(t.app ?? t.valor)}</strong></p>
          <div class="quiz__actions">
            <a class="tag" href="${waLink(`Oi, Mara! Fiz o teste no site e deu ${t.nome}. Quero agendar ✨`)}" target="_blank" rel="noopener">Quero agendar!</a>
            <button type="button" class="quiz__more" data-open="${t.id}">Ver detalhes</button>
            <button type="button" class="quiz__redo">Refazer teste ↺</button>
          </div></div></div>`);
      setTimeout(() => burst($(".quiz__name", quiz) || quiz), reduced ? 0 : 420);
    };

    function bindStage() {
      $$(".quiz__opt", stage).forEach(btn => btn.addEventListener("click", () => {
        btn.classList.add("is-picked");
        picks.push(+btn.dataset.v);
        step++;
        setTimeout(() => (step < QUIZ.length ? renderQuestion() : renderResult()), reduced ? 0 : 220);
      }));
      $(".quiz__redo", stage)?.addEventListener("click", () => { step = 0; picks = []; renderQuestion(); });
      $$(".tag", stage).forEach(enableMagnet);
    }
    renderQuestion();
  }

  /* ---------- ficha do modelo (abre ao tocar em um cartão do catálogo) ---------- */
  const sheet = $(".sheet"), sPhoto = $(".sheet__photo", sheet), sThumbs = $(".sheet__thumbs", sheet);
  const sScroll = $(".sheet__scroll", sheet), sTag = $(".sheet__tag", sheet), sTitle = $(".sheet__title", sheet), sContent = $(".sheet__content", sheet), sCta = $(".sheet__cta", sheet);
  let sheetId = null, sheetFocus = null;
  const IC = {
    bulb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16 9.5"/></svg>',
    hourglass: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/></svg>',
    alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 2.8 19.5h18.4L12 3.5Z"/><path d="M12 10v4.5M12 17.4v.1"/></svg>',
  };
  const linhaPreco = (nome, valor) => `<div class="prow"><span>${nome}</span><strong>${valor}</strong></div>`;
  const precosHTML = it => {
    if (it.app != null) {
      let h = linhaPreco("Aplicação", brl(it.app));
      if (it.m1 != null) {
        h += linhaPreco(`Manutenção até ${D1} dias`, brl(it.m1));
        h += linhaPreco(`Manutenção de ${D1 + 1} a ${D2} dias`, (it.m2_from ? "a partir de " : "") + brl(it.m2) + (it.m2_from ? "*" : ""));
        if (it.m2_from) h += '<p class="sheet__note">*Valor pode aumentar conforme avaliação técnica.</p>';
        if (it.nota_manut) h += `<p class="sheet__note">${it.nota_manut}</p>`;
      } else if (it.manut) h += `<p class="sheet__note">${it.manut}</p>`;
      return h;
    }
    return linhaPreco("Valor", (it.a_partir ? "a partir de " : "") + brl(it.valor));
  };
  const mostrarFoto = (it, n) => {
    const f = it.fotos[n];
    sPhoto.innerHTML = f ? `<img src="${f.src}" alt="${f.alt}"${f.pos ? ` style="object-position:${f.pos}"` : ""}>` : `<span class="vaga"><b>Foto em breve</b><small>${it.nome}</small></span>`;
    sThumbs.hidden = it.fotos.length < 2;
    sThumbs.innerHTML = it.fotos.length < 2 ? "" : it.fotos.map((x, i) =>
      `<button type="button" data-foto="${i}" aria-label="Ver foto ${i + 1}${x.label ? ": " + x.label : ""}" aria-pressed="${i === n}"><img src="${x.src}" alt="">${x.label ? `<span>${x.label}</span>` : ""}</button>`).join("");
  };
  const abrirFicha = (id, origem) => {
    const it = ITEM[id];
    if (!it) return;
    sheetId = id;
    if (origem) sheetFocus = origem;
    sTag.textContent = it.tag || (it.tipo === "cilios" ? "Cílios" : "Serviço");
    sTitle.textContent = it.nome;
    const meta = [];
    if (it.tempo) meta.push(`<span>${IC.hourglass}Tempo de aplicação: ${it.tempo}</span>`);
    if (it.durab) meta.push(`<span>${IC.clock}Durabilidade: ${it.durab}</span>`);
    if (it.retoque) meta.push(`<span>${IC.check}${it.retoque}</span>`);
    if (it.brown) meta.push(`<span>${IC.check}Disponível também na versão Brown (marrom)</span>`);
    sContent.innerHTML =
      (it.desc ? `<p class="sheet__desc">${it.desc}</p>` : '<p class="pend">Descrição em breve</p>') +
      (meta.length ? `<p class="sheet__meta">${meta.join("")}</p>` : "") +
      (it.atencao ? `<p class="sheet__alert">${IC.alert}<span><b>Atenção:</b> ${it.atencao}</span></p>` : "") +
      (it.perfil ? `<div class="sheet__profile"><b>${IC.bulb}Perfil ideal</b><p>${it.perfil}</p></div>` : "") +
      `<div class="sheet__prices">${precosHTML(it)}</div>`;
    mostrarFoto(it, 0);
    setWa(sCta, `Oi, Mara! Vim pelo site e quero agendar: ${it.nome} ✨`);
    if (sheet.hidden) {
      sheet.hidden = false;
      lockScroll(true);
      requestAnimationFrame(() => sheet.classList.add("is-open"));
      $(".sheet__close", sheet).focus({ preventScroll: true });
    }
    $(".sheet__panel", sheet).scrollTop = 0;
    sScroll.scrollTop = 0;
  };
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.classList.remove("is-open");
    setTimeout(() => { sheet.hidden = true; }, 300);
    lockScroll(false);
    sheetFocus?.focus({ preventScroll: true });
  }
  const passo = d => {
    const grupo = ITENS.filter(i => i.tipo === ITEM[sheetId].tipo);
    const n = (grupo.findIndex(i => i.id === sheetId) + d + grupo.length) % grupo.length;
    abrirFicha(grupo[n].id);
  };
  document.addEventListener("click", e => {
    const o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); abrirFicha(o.dataset.open, o); }
  });
  sThumbs.addEventListener("click", e => {
    const b = e.target.closest("[data-foto]");
    if (b) mostrarFoto(ITEM[sheetId], +b.dataset.foto);
  });
  $$(".sheet__nav button", sheet).forEach(b => b.addEventListener("click", () => passo(+b.dataset.step)));
  $(".sheet__close", sheet).addEventListener("click", closeSheet);
  sheet.addEventListener("click", e => { if (e.target === sheet || e.target === sScroll) closeSheet(); });
  sheet.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") passo(1);
    else if (e.key === "ArrowLeft") passo(-1);
    else if (e.key === "Tab") {
      const f = $$("button, a[href]", sheet).filter(el => !el.hidden && el.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* ---------- lightbox ---------- */
  const lb = $(".lightbox"), lbImg = $("img", lb);
  let lastFocus = null;
  function closeLightbox() {
    if (lb.hidden) return;
    lb.classList.remove("is-open");
    setTimeout(() => { lb.hidden = true; }, 300);
    lockScroll(false);
    lastFocus?.focus();
  }
  $$("[data-full]").forEach(btn => btn.addEventListener("click", () => {
    lastFocus = btn;
    lbImg.src = btn.dataset.full;
    lbImg.alt = btn.getAttribute("aria-label").replace("Ampliar foto: ", "");
    lb.hidden = false;
    lockScroll(true);
    requestAnimationFrame(() => lb.classList.add("is-open"));
    $(".lightbox__close").focus();
  }));
  lb.addEventListener("click", e => { if (e.target !== lbImg) closeLightbox(); });

  /* ---------- PC: cursor, botões magnéticos e cards 3D ---------- */
  const cursor = $(".cursor");
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 }, ring = { x: mouse.x, y: mouse.y };

  function enableMagnet(el) {
    if (!cursorOn || el.dataset.magnet !== undefined) return;
    el.dataset.magnet = "";
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${(e.clientX - r.left - r.width / 2) * 0.28}px`);
      el.style.setProperty("--my", `${(e.clientY - r.top - r.height / 2) * 0.4}px`);
    });
    el.addEventListener("mouseleave", () => { el.style.setProperty("--mx", "0px"); el.style.setProperty("--my", "0px"); });
  }

  if (cursorOn) {
    document.documentElement.classList.add("has-cursor");
    const dot = $(".cursor__dot"), ringEl = $(".cursor__ring");
    addEventListener("mousemove", e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      cursor.classList.remove("is-hidden");
    });
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("mouseover", e => {
      const view = e.target.closest("[data-cursor='ver']");
      cursor.classList.toggle("is-view", !!view);
      cursor.classList.toggle("is-link", !view && !!e.target.closest("a, button, input, label"));
    });
    cursor.ring = ringEl;

    $$(".tag, .fab, .link-arrow").forEach(enableMagnet);

    const tilt = (el, max, lift = 0) => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(${lift}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    };
    $$(".tcard:not(.tcard--cta)").forEach(c => tilt(c, 12, -10));
    tilt($(".hero__media"), 8);
  }

  /* ---------- loop de animação ---------- */
  const progress = $(".progress span"), fab = $(".fab");
  const parallaxEls = $$("[data-parallax]").map(el => ({ el, s: +el.dataset.parallax }));
  const driftEls = $$("[data-drift]").map(el => ({ el, s: +el.dataset.drift }));
  const floatEls = $$("[data-float]").map((el, i) => ({ el, s: [0.18, -0.12, 0.26, -0.2, 0.14][i % 5] }));
  const marquees = $$("[data-marquee]").map(m => ({ track: $(".marquee__track", m), dir: +m.dataset.marquee, x: 0 }));

  let lastY = scrollY, velocity = 0, scrollDir = 1, finalVisible = false;
  new IntersectionObserver(([e]) => { finalVisible = e.isIntersecting; }, { threshold: 0.3 }).observe($("#contato"));

  const inView = r => r.bottom > -200 && r.top < innerHeight + 200;

  function frame(time) {
    lenis?.raf(time);
    const y = scrollY, vh = innerHeight;
    const dy = y - lastY;
    lastY = y;
    if (dy) scrollDir = dy > 0 ? 1 : -1;
    velocity += (Math.abs(dy) - velocity) * 0.15;

    const max = document.documentElement.scrollHeight - vh;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    nav.classList.toggle("is-solid", y > 30);
    if (!menu.classList.contains("is-open")) {
      if (dy > 2 && y > vh * 0.8) nav.classList.add("is-hidden");
      else if (dy < -2) nav.classList.remove("is-hidden");
    }
    fab.classList.toggle("is-visible", y > vh * 0.7 && !finalVisible);

    if (cursorOn && cursor.ring) {
      ring.x += (mouse.x - ring.x) * 0.18;
      ring.y += (mouse.y - ring.y) * 0.18;
      cursor.ring.style.transform = `translate3d(${ring.x.toFixed(1)}px, ${ring.y.toFixed(1)}px, 0)`;
    }

    if (!reduced) {
      parallaxEls.forEach(({ el, s }) => {
        const r = el.parentElement.getBoundingClientRect();
        if (!inView(r)) return;
        el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * s).toFixed(1)}px, 0)`;
      });
      driftEls.forEach(({ el, s }) => {
        const r = el.parentElement.getBoundingClientRect();
        if (!inView(r)) return;
        const base = el.classList.contains("final__bgword") ? " translateY(-50%)" : "";
        el.style.transform = `translate3d(${((r.top + r.height / 2 - vh / 2) * s).toFixed(1)}px, 0, 0)${base}`;
      });
      floatEls.forEach(({ el, s }) => {
        const r = el.parentElement.getBoundingClientRect();
        if (!inView(r)) return;
        el.style.transform = `translate3d(0, ${(r.top * s).toFixed(1)}px, 0)`;
      });
      marquees.forEach(m => {
        const half = m.track.scrollWidth / 2;
        m.x -= (0.6 + Math.min(velocity, 60) * 0.25) * m.dir * scrollDir;
        if (m.x <= -half) m.x += half;
        if (m.x > 0) m.x -= half;
        m.track.style.transform = `translate3d(${m.x.toFixed(1)}px, 0, 0)`;
      });
      if (scrubEl) {
        const r = scrubEl.getBoundingClientRect();
        if (inView(r)) {
          const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
          const lit = Math.round(p * scrubWords.length);
          scrubWords.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
        }
      }
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
