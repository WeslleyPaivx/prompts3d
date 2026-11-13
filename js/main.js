(() => {
  'use strict';

  const doc = document.documentElement;
  const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const celularMQ = window.matchMedia('(max-width: 760px)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- Loja (Cakto) ---------- */
  const loja = window.LOJA || { pacotes: {} };
  $$('[data-pacote]').forEach(card => {
    const dados = loja.pacotes[card.dataset.pacote] || {};
    const preco = $('[data-preco]', card);
    const btn = $('[data-comprar]', card);
    if (dados.preco) preco.textContent = dados.preco;
    if (dados.checkout) {
      btn.href = dados.checkout;
      btn.rel = 'noopener';
      btn.querySelector('span').textContent = 'Comprar agora';
      btn.removeAttribute('aria-disabled');
    } else {
      // venda ainda não aberta: o botão leva pro TikTok, pra pessoa acompanhar
      btn.href = loja.tiktok || '#duvidas';
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.querySelector('span').textContent = 'Me avisar no TikTok';
    }
  });
  if (loja.tiktok) $$('[data-tiktok]').forEach(a => { a.href = loja.tiktok; });

  /* ---------- Grão (um só, por cima de tudo) ---------- */
  (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 180;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(180, 180);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    $('#grao').style.backgroundImage = `url(${c.toDataURL()})`;
  })();

  /* ---------- Nuvens ---------- */
  const TAM = { 1: [1110, 240], 2: [350, 211], 3: [705, 369], 4: [434, 255], 6: [1208, 246], 7: [279, 210] };
  const VEL = { longe: .32, horizonte: .55, frente: .95, muro: .5 };
  const BLUR = { longe: .8, horizonte: .3, frente: 0, muro: 2.2 };
  // [nuvem, x, cy, w, espelhada, opacidade]
  const LAYOUT = {
    desktop: {
      longe: [[2, .03, .36, 11, 1, .8], [7, .77, .22, 9, 0, .75], [4, .89, .40, 12, 0, .8], [1, .60, .33, 18, 0, .55], [7, .16, .19, 6, 1, .5]],
      horizonte: [[3, -.05, .53, 33], [6, .16, .67, 74], [1, .60, .61, 52, 1], [4, .86, .53, 19, 1]],
      frente: [[6, .30, .83, 72, 1], [1, -.20, .88, 80], [3, .72, .79, 36, 1], [7, .06, .74, 13], [2, .50, .97, 30]],
      muro: [[3, -.05, .17, 70], [4, .60, .15, 52, 1], [6, -.30, .42, 160, 1], [1, .36, .47, 140], [3, .42, .66, 80, 1], [6, -.20, .78, 170]]
    },
    celular: {
      longe: [[2, -.12, .22, 34, 1, .85], [7, .66, .17, 22, 0, .7], [4, .78, .44, 26, 0, .8]],
      horizonte: [[3, -.36, .47, 78], [6, .04, .56, 150], [1, .52, .50, 110, 1]],
      frente: [[6, -.30, .62, 160, 1], [3, .56, .60, 82, 1], [1, .20, .74, 170], [4, -.20, .86, 80], [7, .70, .94, 50]],
      muro: [[3, -.40, .14, 150], [4, .45, .12, 110, 1], [6, -1.00, .38, 320, 1], [1, -.30, .44, 280], [3, .10, .62, 170, 1], [6, -.60, .76, 330]]
    }
  };

  const palco = $('#palco');
  const imgsNuvem = [];

  function montarNuvens() {
    const L = palco.clientWidth, A = palco.clientHeight;
    const cel = celularMQ.matches;
    const u = cel ? Math.max(L, .62 * A) / 100 : Math.min(L, 1.9 * A) / 100;
    const lay = LAYOUT[cel ? 'celular' : 'desktop'];
    $$('[data-nuvens]').forEach(box => {
      const nome = box.dataset.nuvens;
      box.textContent = '';
      lay[nome].forEach(([n, x, cy, w, e, a]) => {
        const [nw, nh] = TAM[n];
        const wpx = w * u, hpx = wpx * nh / nw;
        const inicio = -wpx - 90;
        const percurso = L + wpx + 180;
        const dur = percurso / (VEL[nome] * u);
        let fase = (x * L - inicio) / percurso;
        fase = ((fase % 1) + 1) % 1;
        const el = document.createElement('div');
        el.className = 'nuvem' + (e ? ' e' : '');
        el.style.cssText = `width:${wpx}px;left:${inicio}px;top:${cy * A - hpx / 2}px;` +
          `--dx:${percurso}px;--dur:${dur}s;--atraso:${-fase * dur}s;` +
          `--blur:${(BLUR[nome] * u / 14).toFixed(2)}px;` + (a ? `opacity:${a};` : '');
        if (reduz) el.style.transform = `translate3d(${fase * percurso}px,0,0)`;
        const img = new Image();
        img.src = `img/nuvem-${n}.webp`;
        img.alt = '';
        img.decoding = 'async';
        img.width = nw; img.height = nh;
        el.appendChild(img);
        box.appendChild(el);
        imgsNuvem.push(img);
      });
    });
  }
  montarNuvens();

  let larguraAnt = window.innerWidth, celAnt = celularMQ.matches, tResize;
  window.addEventListener('resize', () => {
    clearTimeout(tResize);
    tResize = setTimeout(() => {
      // no celular a barra do navegador muda a altura o tempo todo: só remonta se a largura mudar
      if (window.innerWidth !== larguraAnt || celularMQ.matches !== celAnt) {
        larguraAnt = window.innerWidth; celAnt = celularMQ.matches;
        montarNuvens();
      }
    }, 180);
  });

  /* pausa a deriva com o hero fora da tela */
  new IntersectionObserver(([en]) => palco.classList.toggle('pausa', !en.isIntersecting)).observe(palco);

  /* ---------- Nome letra a letra ---------- */
  const letras = $('#letras');
  letras.innerHTML = letras.textContent.split('').map(ch => `<span>${ch}</span>`).join('');

  /* ---------- Nav: some ao descer, volta ao subir ---------- */
  const nav = $('#nav');
  let yAnt = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < 40) nav.classList.remove('escondida');
    else if (y > yAnt + 4) nav.classList.add('escondida');
    else if (y < yAnt - 4) nav.classList.remove('escondida');
    if (Math.abs(y - yAnt) > 4 || y < 40) yAnt = y;
  }, { passive: true });
  nav.addEventListener('focusin', () => nav.classList.remove('escondida'));

  /* ---------- HUD ---------- */
  const hudPct = $('#hudPct'), hudStatus = $('#hudStatus');
  function hudPronto() { hudStatus.textContent = 'Pronto pra postar ✓'; }
  function contarHud(dur) {
    const t0 = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 2);
    (function q(t) {
      const k = clamp((t - t0) / dur, 0, 1);
      hudPct.textContent = Math.round(ease(k) * 100);
      if (k < 1) requestAnimationFrame(q); else setTimeout(hudPronto, 900);
    })(t0);
  }

  /* ---------- Palco: cursor + saída ---------- */
  const hero = $('#topo');
  const camadas = {};
  $$('[data-camada]').forEach(el => { camadas[el.dataset.camada] = el; });
  const CFG = {
    ceu: { prof: .05, saida: .06, esc: 0 },
    longe: { prof: .18, saida: .16, esc: 0 },
    horizonte: { prof: .34, saida: .32, esc: 0 },
    ilha: { prof: .58, saida: .6, esc: -.14, origem: '51.5% 40%' },
    frente: { prof: 1, saida: 1.25, esc: .38, origem: '50% 85%' }
  };
  Object.entries(CFG).forEach(([k, c]) => { if (c.origem) camadas[k].style.transformOrigin = c.origem; });
  const sombra = $('.sombra');
  const muro = $('#muro'), veu = $('#veu'), texto = $('#texto'), sombraIn = $('.sombra-in');
  const huds = [$('#hudEsq'), $('#hudDir'), $('#dica')];

  const temMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let mxAlvo = 0, myAlvo = 0, mx = 0, my = 0, p = 0, chaveAnt = '';
  if (temMouse && !reduz) {
    window.addEventListener('pointermove', e => {
      mxAlvo = (e.clientX / window.innerWidth) * 2 - 1;
      myAlvo = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  function alvoP() {
    const curso = hero.offsetHeight - window.innerHeight;
    if (curso <= 0) return 0;
    return clamp(-hero.getBoundingClientRect().top / curso, 0, 1);
  }

  let tAnt = performance.now();
  function quadro(t) {
    const dt = Math.min(64, t - tAnt) / 16.67; tAnt = t;
    const kP = 1 - Math.pow(1 - .16, dt), kM = 1 - Math.pow(1 - .05, dt);
    const pa = alvoP();
    p += (pa - p) * kP; if (Math.abs(pa - p) < .0004) p = pa;
    mx += (mxAlvo - mx) * kM; my += (myAlvo - my) * kM;

    const A = palco.clientHeight;
    const chave = `${p.toFixed(4)}|${mx.toFixed(3)}|${my.toFixed(3)}|${A}`;
    if (chave !== chaveAnt) {
      chaveAnt = chave;
      for (const k in CFG) {
        const c = CFG[k];
        const x = -mx * 26 * c.prof;
        const y = -my * 14 * c.prof - p * c.saida * A;
        camadas[k].style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)` + (c.esc ? ` scale(${(1 + p * c.esc).toFixed(4)})` : '');
      }
      camadas.ilha.style.opacity = (1 - smooth(.28, .58, p)).toFixed(3);
      muro.style.transform = `translate3d(${(-mx * 26 * 1.3).toFixed(2)}px,${((1.16 - 1.62 * p) * A).toFixed(2)}px,0)`;
      veu.style.opacity = smooth(.5, 1, p).toFixed(3);
      sombra.style.opacity = (1 - smooth(.02, .3, p)).toFixed(3);
      const op = 1 - smooth(.02, .3, p);
      texto.style.transform = `translate3d(0,${(-p * .62 * A).toFixed(2)}px,0)`;
      texto.style.opacity = op.toFixed(3);
      texto.style.visibility = p > .32 ? 'hidden' : 'visible';
      const oh = (1 - smooth(0, .22, p)).toFixed(3);
      huds.forEach(h => { h.style.opacity = oh; });
    }
    nav.classList.toggle('solida', p > .82 || window.scrollY > hero.offsetHeight - window.innerHeight);
    requestAnimationFrame(quadro);
  }

  /* ---------- Entrada em camadas ---------- */
  const EXPO = 'cubic-bezier(.16,1,.3,1)', P3 = 'cubic-bezier(.215,.61,.355,1)', P2IO = 'cubic-bezier(.455,.03,.515,.955)';
  function anim(el, kf, delay, duration, easing = EXPO) {
    if (!el) return;
    const a = el.animate(kf, { delay: delay * 1000, duration: duration * 1000, easing, fill: 'both' });
    // ao terminar, devolve o controle ao CSS (assim a nav ainda consegue sumir, o HUD sumir na saída etc.)
    a.finished.then(() => a.cancel()).catch(() => {});
  }

  function entrada() {
    const A = palco.clientHeight;
    const op = [{ opacity: 0 }, { opacity: 1 }];
    const sobe = d => [{ opacity: 0, transform: `translate3d(0,${d}px,0)` }, { opacity: 1, transform: 'translate3d(0,0,0)' }];

    anim($('.ceu .in'), op, 0, 1.4, P2IO);
    anim($('.longe .in'), sobe(40), .3, 2);
    anim($('.horizonte .in'), sobe(70), .45, 2.2);
    anim($('.ilha .in'), [
      { opacity: 0, transform: `translate3d(0,${.2 * A}px,0) scale(.94)` },
      { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }
    ], .6, 2.8, P3);
    anim($('.frente .in'), sobe(130), .8, 2.2);
    anim($('#chipPrompt'), sobe(24), 2.1, 1.2);
    anim($('#chipRender'), sobe(24), 2.35, 1.2);
    anim(sombraIn, op, .8, 2);
    $$('#letras span').forEach((s, i) => anim(s, [{ transform: 'translateY(115%)' }, { transform: 'translateY(0)' }], 1.15 + i * .065, 1.4));
    anim(nav, op, 1.3, 1);
    anim($('#hudEsq'), op, 1.3, 1);
    anim($('#hudDir'), op, 1.3, 1);
    setTimeout(() => contarHud(1900), 1300);
    anim($('.lado'), op, 1.4, .01);
    $$('.ln > span').forEach((s, i) => anim(s, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], 1.4 + i * .09, 1.2));
    anim($('#aster'), [{ opacity: 0, transform: 'scale(0) rotate(-140deg)' }, { opacity: 1, transform: 'scale(1) rotate(0deg)' }], 1.55, 1.6);
    anim($('#botaoHero'), sobe(16), 1.7, 1.2);
    anim($('#dica'), [{ opacity: 0 }, { opacity: .85 }], 2.3, 1);
    doc.classList.remove('pre');
  }

  function semEntrada() {
    doc.classList.remove('pre');
    hudPct.textContent = '100';
    hudPronto();
  }


  /* =========================================================
     Hero: chip de prompt digitando sozinho
     ========================================================= */
  const chipTxt = $('#chipTxt');
  const PROMPTS = [
    'ilha flutuante, luz da manhã, câmera orbitando devagar',
    'miniatura 3D de uma cafeteria, estilo maquete, 9:16',
    'texto surgindo letra a letra sobre nuvens, motion suave'
  ];
  if (reduz) chipTxt.textContent = PROMPTS[0];
  else {
    let pi = 0, ci = 0, apagando = false;
    (function digita() {
      const alvo = PROMPTS[pi];
      if (!apagando) {
        ci++;
        chipTxt.textContent = alvo.slice(0, ci);
        if (ci >= alvo.length) { apagando = true; return setTimeout(digita, 2200); }
        return setTimeout(digita, 34 + Math.random() * 40);
      }
      ci -= 2;
      chipTxt.textContent = alvo.slice(0, Math.max(0, ci));
      if (ci <= 0) { apagando = false; ci = 0; pi = (pi + 1) % PROMPTS.length; return setTimeout(digita, 400); }
      setTimeout(digita, 14);
    })();
  }

  /* =========================================================
     Títulos palavra a palavra + revelações no scroll
     ========================================================= */
  $$('[data-palavras]').forEach(el => {
    const palavras = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = palavras.map((w, i) => `<span class="pw" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
  });
  const obsRevela = new IntersectionObserver(ents => {
    ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visivel'); obsRevela.unobserve(en.target); } });
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
  $$('[data-revela], [data-palavras]').forEach(el => obsRevela.observe(el));

  /* =========================================================
     Faixas de texto (andam com o scroll)
     ========================================================= */
  const faixas = $$('[data-faixa]').map(f => {
    const span = f.querySelector('span');
    for (let i = 0; i < 3; i++) f.appendChild(span.cloneNode(true));
    return { el: f, dir: +f.dataset.faixa, span };
  });

  /* =========================================================
     Processo: palco preso, o celular muda com o scroll
     ========================================================= */
  const processo = $('#como');
  const etapas = $$('#etapas li');
  const telas = $$('[data-tela]');
  const cel = $('.celular');
  const digitaEl = $('#digita'), bolhaIa = $('#bolhaIa');
  const telaGera = $('.tela-gera'), geraPct = $('#geraPct'), coracao = $('#coracao');
  const TXT_PROMPT = 'Crie uma cena 3D em miniatura: uma ilha de terra vermelha flutuando no céu da manhã, com uma casinha, painéis solares e varal colorido. Câmera orbitando devagar, luz dourada, formato 9:16.';
  let etapaAnt = -1, iaRespondeu = false;

  function atualizaProcesso() {
    const r = processo.getBoundingClientRect();
    const curso = processo.offsetHeight - window.innerHeight;
    const q = clamp(-r.top / curso, 0, 1);
    const cortes = [0, .34, .67, 1];
    let etapa = q < cortes[1] ? 0 : q < cortes[2] ? 1 : 2;
    const local = clamp((q - cortes[etapa]) / (cortes[etapa + 1] - cortes[etapa]), 0, 1);

    if (etapa !== etapaAnt) {
      etapas.forEach((li, i) => li.classList.toggle('ativa', i === etapa));
      telas.forEach((t, i) => t.classList.toggle('ativa', i === etapa));
      if (etapa === 2) { coracao.classList.remove('pop'); void coracao.offsetWidth; coracao.classList.add('pop'); }
      etapaAnt = etapa;
    }
    etapas.forEach((li, i) => li.querySelector('.barra i').style.setProperty('--prog', i < etapa ? 1 : i === etapa ? local.toFixed(3) : 0));

    // etapa 1: o prompt vai sendo digitado
    const n = etapa > 0 ? TXT_PROMPT.length : Math.round(clamp(local / .78, 0, 1) * TXT_PROMPT.length);
    if (digitaEl.textContent.length !== n) digitaEl.textContent = TXT_PROMPT.slice(0, n);
    const mostraIa = etapa > 0 || local > .82;
    bolhaIa.classList.toggle('mostra', mostraIa);
    const respondeu = etapa > 0 || local > .95;
    if (respondeu !== iaRespondeu) {
      bolhaIa.innerHTML = respondeu ? 'Montando sua cena agora ✱' : '<span class="pontos"><i></i><i></i><i></i></span>';
      iaRespondeu = respondeu;
    }

    // etapa 2: a cena aparece de cima pra baixo
    const g = etapa > 1 ? 1 : etapa < 1 ? 0 : clamp(local / .85, 0, 1);
    telaGera.style.setProperty('--g', g.toFixed(4));
    telaGera.style.setProperty('--scan-op', g >= 1 ? 0 : 1);
    geraPct.textContent = Math.round(g * 100) + '%';

    // o celular gira de leve com o scroll
    cel.style.setProperty('--rot', ((q - .5) * -5).toFixed(2) + 'deg');
    cel.style.setProperty('--ty', ((q - .5) * -30).toFixed(1) + 'px');
  }

  /* =========================================================
     Final: nuvens e ilha
     ========================================================= */
  const finalNuvens = $('[data-nuvens-final]');
  [[3, 4, 34, 1, 0, 70], [6, 1, 70, 1, -1, 95], [1, 12, 55, .9, 1, 80], [2, 22, 18, .85, 1, 60], [4, 30, 22, .8, -1, 75], [7, 38, 12, .7, 1, 55]]
    .forEach(([n, top, w, a, e, dur], i) => {
      const img = new Image();
      img.src = `img/nuvem-${n}.webp`; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      img.style.cssText = `top:${top}%;width:${w}vw;opacity:${a};--sx:${e < 0 ? -1 : 1};--dur:${dur}s;--atraso:${-(dur * ((i * .37) % 1)).toFixed(1)}s`;
      finalNuvens.appendChild(img);
    });
  const finalSec = $('#final'), finalIlha = $('#finalIlha');

  /* =========================================================
     Laço de scroll da parte de baixo
     ========================================================= */
  let rolPendente = false;
  function rolagem() {
    rolPendente = false;
    const ih = window.innerHeight;
    if (!reduz) {
      faixas.forEach(f => {
        const r = f.el.getBoundingClientRect();
        if (r.bottom < -50 || r.top > ih + 50) return;
        const w = f.span.offsetWidth || 1;
        const v = (ih - r.top) * .45 * f.dir;
        const m = ((v % w) + w) % w;
        f.el.style.transform = `translate3d(${(-m).toFixed(1)}px,0,0)`;
      });
      const rf = finalSec.getBoundingClientRect();
      if (rf.top < ih && rf.bottom > 0) {
        const k = clamp(1 - rf.top / ih, 0, 1.6);
        finalIlha.style.transform = `translate3d(0,${((1 - k) * 140).toFixed(1)}px,0) scale(${(.9 + k * .08).toFixed(3)})`;
      }
    }
    const rp = processo.getBoundingClientRect();
    if (rp.top < ih && rp.bottom > 0) atualizaProcesso();
  }
  const pedeRolagem = () => { if (!rolPendente) { rolPendente = true; requestAnimationFrame(rolagem); } };
  window.addEventListener('scroll', pedeRolagem, { passive: true });
  window.addEventListener('resize', pedeRolagem);
  atualizaProcesso(); rolagem();

  /* =========================================================
     Cards: inclinação 3D e brilho seguindo o mouse
     ========================================================= */
  if (temMouse && !reduz) {
    $$('.card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.classList.add('inclinando');
        card.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
        card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('inclinando');
        card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* =========================================================
     Dúvidas: abre e fecha com animação de altura
     ========================================================= */
  $$('.faq details').forEach(d => {
    const sum = d.querySelector('summary'), resp = d.querySelector('.resp');
    sum.addEventListener('click', e => {
      if (reduz) return;
      e.preventDefault();
      if (d.open) {
        const a = resp.animate([{ height: resp.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' });
        d.classList.add('fechando');
        a.onfinish = () => { d.open = false; d.classList.remove('fechando'); };
      } else {
        d.open = true;
        const h = resp.offsetHeight;
        resp.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  });

  /* espera ilha, nuvens e fontes (no máximo 3 s) */
  const ilhaImg = $('.flutua img');
  const carregou = img => img.complete ? Promise.resolve() : new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
  const pronto = Promise.all([
    carregou(ilhaImg).then(() => ilhaImg.decode ? ilhaImg.decode().catch(() => {}) : null),
    ...imgsNuvem.map(carregou),
    document.fonts ? document.fonts.ready : Promise.resolve()
  ]);
  Promise.race([pronto, new Promise(r => setTimeout(r, 3000))]).then(() => {
    if (reduz) { semEntrada(); return; }
    entrada();
    requestAnimationFrame(t => { tAnt = t; quadro(t); });
  });
})();
