/* =========================================================
   Happy birthday! — game engine
   콘텐츠는 js/data.js 에 있고, 이 파일은 화면을 그리는 엔진입니다.
   ========================================================= */
(() => {
  'use strict';

  const D = window.GAME_DATA;

// 연애 시작일부터 오늘까지의 날짜를 자동 계산
const startDate = new Date('2026-05-27T00:00:00');
const today = new Date();

const startUTC = Date.UTC(
  startDate.getFullYear(),
  startDate.getMonth(),
  startDate.getDate()
);

const todayUTC = Date.UTC(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);

D.meta.days = Math.floor((todayUTC - startUTC) / 86400000) + 1;

  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SAVE_KEY = 'hb-eunji-jinhyung-save';
  const KEYS = 'ABCDEFGHIJ';
  const CAPSULE_COLORS = ['#ff8e88', '#93c5ff', '#ffd36e', '#7fe3c1', '#c9a8ff', '#ffab6b'];

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'style') el.style.cssText = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of kids.flat()) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 120) : ms));
  const pad = (n) => String(n).padStart(2, '0');
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* ignore */ } };
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    clear() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }
  };
  const lines = (arr, cls = 'lines', delay = 0.12) =>
    h('div', { class: cls }, (arr || []).map((t, i) => h('p', { text: t, style: `animation-delay:${(i * delay + 0.1).toFixed(2)}s` })));

  /* 사진: 파일이 있으면 사진, 없으면 깨지지 않는 placeholder */
  function photo(src, label, cls = '') {
    const fig = h('figure', { class: 'photo ' + cls },
      h('div', { class: 'ph' },
        h('span', { class: 'ph-icon', 'aria-hidden': 'true' }),
        h('span', { class: 'ph-label', text: label || '사진 자리' }),
        src ? h('code', { class: 'ph-path', text: src }) : null));
    if (src) {
      const img = new Image();
      img.alt = label || '';
      img.decoding = 'async';
      img.onload = () => { fig.classList.add('loaded'); fig.append(img); };
      img.src = src;
    }
    return fig;
  }

  /* ---------- 퐁이 (mascot) ---------- */
  const PPONG_SVG = `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#fffdf8" stroke="#e4dccd" stroke-width="1.4"><circle cx="18" cy="24" r="11"/><circle cx="32" cy="15" r="12"/><circle cx="46" cy="24" r="11"/><circle cx="14" cy="37" r="10"/><circle cx="50" cy="37" r="10"/><circle cx="22" cy="48" r="11"/><circle cx="42" cy="48" r="11"/><circle cx="32" cy="36" r="17"/></g><circle cx="25.5" cy="34" r="2.8" fill="#26243a"/><circle cx="38.5" cy="34" r="2.8" fill="#26243a"/><circle cx="26.4" cy="33.1" r=".9" fill="#fff"/><circle cx="39.4" cy="33.1" r=".9" fill="#fff"/><ellipse cx="32" cy="41" rx="3.2" ry="2.5" fill="#26243a"/><path d="M29 45.5q3 2.6 6 0" fill="none" stroke="#26243a" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="21" cy="41" rx="3" ry="1.8" fill="#ffc9c4" opacity=".7"/><ellipse cx="43" cy="41" rx="3" ry="1.8" fill="#ffc9c4" opacity=".7"/></svg>`;
  let ppongImgOk = false;
  (() => {
    const test = new Image();
    test.onload = () => { ppongImgOk = true; refreshMascotFaces(); };
    test.src = D.mascot.image;
  })();
  function mascotFace(target) {
    target.innerHTML = '';
    if (ppongImgOk) target.append(h('img', { src: D.mascot.image, alt: D.mascot.name }));
    else target.innerHTML = PPONG_SVG;
  }
  function refreshMascotFaces() {
    document.querySelectorAll('.ppong-face, .mascot-big, .ppong-portrait').forEach(mascotFace);
  }

  const ppong = {
    el: $('#ppong'),
    bubble: $('#ppongBubble'),
    timer: 0,
    met: false,
    stay: false,
    setMet(v) {
      this.met = v;
      this.el.classList.toggle('mystery', !v);
    },
    show(msg, ms = 2000) {
      clearTimeout(this.timer);
      this.bubble.textContent = msg == null ? (this.met ? pick(D.mascot.cheers) : pick(D.mascot.mysteryCheers)) : msg;
      this.el.classList.remove('peek');
      this.el.classList.remove('show');
      void this.el.offsetWidth;
      this.el.classList.add('show');
      this.timer = setTimeout(() => this.rest(), ms);
    },
    rest() {
      this.el.classList.remove('show');
      this.el.classList.toggle('peek', this.stay);
    },
    peek(on) { this.stay = on; this.rest(); }
  };
  mascotFace($('#ppongFace'));

  /* ---------- effects ---------- */
  const fx = $('#fx');
  function burst(x, y, opts = {}) {
    if (reduceMotion) return;
    const n = opts.n || 18;
    const colors = opts.colors || ['#ffd36e', '#93c5ff', '#7fe3c1', '#ff8e88', '#f6efe2'];
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const d = 60 + Math.random() * (opts.spread || 90);
      const s = h('span', { class: 'spark' + (opts.hearts ? ' heart' : '') });
      if (opts.hearts) s.textContent = '♥';
      s.style.cssText = `left:${x}px;top:${y}px;--c:${pick(colors)};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 30}px;--r:${Math.random() * 360}deg`;
      fx.append(s);
      setTimeout(() => s.remove(), 1000);
    }
  }
  const burstAt = (el, opts) => {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, opts);
  };
  function addRipple(btn, e) {
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const x = (e.clientX || r.left + r.width / 2) - r.left - size / 2;
    const y = (e.clientY || r.top + r.height / 2) - r.top - size / 2;
    const rp = h('span', { class: 'ripple', style: `width:${size}px;height:${size}px;left:${x}px;top:${y}px` });
    btn.append(rp);
    setTimeout(() => rp.remove(), 520);
  }

  /* ---------- flow ---------- */
  const flow = [
    ...D.chapters.map((ch) => ({ kind: 'chapter', ch })),
    { kind: 'secret' },
    { kind: 'special' },
    { kind: 'finale' }
  ];
  const ppongFlowIndex = flow.findIndex((f) => f.ch && f.ch.scenes.some((s) => s.type === 'ppong'));

  function scenesFor(item) {
    if (item.kind === 'chapter') {
      const list = [{ type: 'intro' }, ...item.ch.scenes];
      if (!list.some((s) => s.type === 'memory')) list.push({ type: 'memory' });
      return list;
    }
    if (item.kind === 'secret') {
      const qs = D.secretQuiz.questions;
      return [{ type: 'secretUnlock' }, ...qs.map((q, i) => ({ ...q, type: 'quiz', counter: `SECRET Q${i + 1} / ${qs.length}` }))];
    }
    if (item.kind === 'special') return [{ type: 'systemError' }];
    return [];
  }

  const S = { f: 0, s: 0, scenes: [], busy: false };

  /* ---------- DOM refs ---------- */
  const stage = $('#stage');
  const hud = $('#hud');
  const actions = $('#actions');
  const nextBtn = $('#nextBtn');
  const prevBtn = $('#prevBtn');
  const curtain = $('#curtain');

  /* ---------- next button api ---------- */
  const api = {
    lock(label = '진행하려면 위에서 선택해 주세요') {
      nextBtn.disabled = true;
      nextBtn.classList.remove('ready');
      nextBtn.textContent = label;
    },
    unlock(label = '다음 ▶') {
      nextBtn.disabled = false;
      nextBtn.textContent = label;
      nextBtn.classList.remove('ready');
      void nextBtn.offsetWidth;
      nextBtn.classList.add('ready');
    }
  };
  nextBtn.addEventListener('click', (e) => {
    if (nextBtn.disabled) return;
    addRipple(nextBtn, e);
    advance();
  });
  prevBtn.addEventListener('click', async () => {
    if (S.busy || S.s <= 0) return;

    S.busy = true;
    S.s--;
    await renderScene(true);
    S.busy = false;
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('button') && !actions.hidden && !nextBtn.disabled) {
      e.preventDefault();
      advance();
    }
  });

  /* ---------- HUD ---------- */
  const dots = $('#hudDots');
  flow.forEach((f) => { if (f.kind !== 'finale') dots.append(h('li', { class: f.kind === 'chapter' ? '' : 'dot-extra' })); });
  function updateHud() {
    const item = flow[S.f];
    const total = flow.length - 1;
    const pct = ((S.f + S.s / Math.max(S.scenes.length, 1)) / total) * 100;
    $('#hudFill').style.width = pct.toFixed(1) + '%';
    [...dots.children].forEach((li, i) => {
      li.classList.toggle('done', i < S.f);
      li.classList.toggle('now', i === S.f);
    });
    if (item.kind === 'chapter') {
      $('#hudChapter').textContent = `CH ${pad(item.ch.no)}`;
      $('#hudTitle').textContent = item.ch.code;
      $('#hudCount').textContent = `${S.f + 1} / ${D.chapters.length}`;
    } else if (item.kind === 'secret') {
      $('#hudChapter').textContent = 'SECRET';
      $('#hudTitle').textContent = D.secretQuiz.subtitle;
      $('#hudCount').textContent = S.s > 0 ? `Q ${S.s} / ${D.secretQuiz.questions.length}` : '';
    } else {
      $('#hudChapter').textContent = 'EVENT';
      $('#hudTitle').textContent = D.systemError.title;
      $('#hudCount').textContent = '';
    }
  }

  /* ---------- transitions ---------- */
  async function swap(el) {
    const old = stage.firstElementChild;
    if (old) {
      old.classList.add('out');
      await wait(240);
    }
    stage.replaceChildren(el);
    window.scrollTo(0, 0);
  }
  async function curtainTo(text, fn) {
    $('#curtainText').textContent = text || '';
    curtain.classList.add('in');
    await wait(560);
    await fn();
    await wait(reduceMotion ? 0 : 380);
    curtain.classList.remove('in');
  }

  /* ---------- flow control ---------- */
  function save() { store.set({ f: S.f, met: ppong.met }); }

  async function goTo(f, s = 0, useCurtain = true) {
    if (S.busy) return;
    S.busy = true;
    const item = flow[f];
    const doIt = async () => {
      S.f = f;
      S.s = s;
      S.scenes = scenesFor(item);
      ppong.setMet(ppong.met || (ppongFlowIndex >= 0 && f > ppongFlowIndex));
      ppong.peek(false);
      if (item.kind === 'finale') {
        store.set({ f, met: true, done: true });
        return startFinale();
      }
      save();
      hud.hidden = false;
      actions.hidden = false;
      updateHud();
      await renderScene(true);
    };
    const label = item.kind === 'chapter' ? `CHAPTER ${pad(item.ch.no)}` : item.kind === 'secret' ? 'SECRET' : item.kind === 'special' ? '...' : '';
    if (useCurtain) await curtainTo(label, doIt);
    else await doIt();
    S.busy = false;
  }

  async function advance() {
    if (S.busy) return;
    if (S.s < S.scenes.length - 1) {
      S.busy = true;
      S.s++;
      updateHud();
      await renderScene();
      S.busy = false;
    } else {
      goTo(S.f + 1);
    }
  }

  async function renderScene(instant) {
    const scene = S.scenes[S.s];
    const item = flow[S.f];
    const ctx = { ch: item.ch, item, api };
    api.unlock('다음 ▶');
    
    prevBtn.hidden = S.s === 0;
    const fn = R[scene.type];
    const el = fn ? fn(scene, ctx) : h('div', { class: 'card' }, `알 수 없는 장면: ${scene.type}`);
    el.classList.add('scene');
    if (instant) { stage.replaceChildren(el); window.scrollTo(0, 0); }
    else await swap(el);
    if (el._after) el._after();
  }

  /* =========================================================
     Scene renderers
     ========================================================= */
  const R = {};

  R.intro = (sc, { ch }) => {
    const el = h('section', { class: 'card intro', 'data-no': pad(ch.no) },
      h('p', { class: 'eyebrow', text: `CHAPTER ${pad(ch.no)}` }),
      h('h1', { class: 'chapter-code', text: ch.code }),
      h('p', { class: 'chapter-ko', text: ch.title }),
      h('dl', { class: 'meta' },
        ch.date ? [h('dt', { text: 'DATE' }), h('dd', { text: ch.date })] : null,
        ch.place ? [h('dt', { text: 'PLACE' }), h('dd', { text: ch.place })] : null),
      ch.summary ? h('p', { class: 'lead', text: ch.summary }) : null);
    api.unlock('PLAY ▶');
    return el;
  };

  R.story = (sc) => h('section', { class: 'card' },
    h('div', { class: 'scene', style: 'animation:none' },
      sc.date ? h('span', { class: 'chip', text: sc.date }) : null,
      sc.title ? h('h2', { class: 'h2', text: sc.title }) : null,
      lines(sc.lines, 'lines', 0.35),
      sc.quote ? h('p', { class: 'quote', style: `animation-delay:${((sc.lines || []).length * 0.35 + 0.3).toFixed(2)}s` },
        sc.quoteLabel ? h('span', { class: 'quote-label', text: sc.quoteLabel }) : null, `"${sc.quote}"`) : null));

  R.quiz = (sc, { api: a }) => {
    const multi = Array.isArray(sc.answer);
    const right = new Set(multi ? sc.answer : [sc.answer]);
    const wrongPool = [].concat(sc.wrong || ['앗, 아쉬워요. 다시 골라볼까요?', '음… 그건 아닌 것 같은데?', '거의 다 왔어! 한 번 더!']);
    const msg = h('p', { class: 'quiz-msg', 'aria-live': 'polite' });
    const card = h('section', { class: 'card' });
    let done = false;
    let wrongCount = 0;

    const opts = sc.options.map((o, i) => {
      const key = KEYS[i];
      const b = h('button', { class: 'opt', type: 'button', style: `animation-delay:${(0.15 + i * 0.07).toFixed(2)}s` },
        h('span', { class: 'opt-key', text: key }), h('span', { class: 'opt-text', text: o }));
      b.dataset.key = key;
      b.addEventListener('click', (e) => {
        if (done || b.disabled) return;
        addRipple(b, e);
        if (multi) { b.classList.toggle('picked'); vibrate(8); return; }
        if (right.has(key)) win();
        else miss([b]);
      });
      return b;
    });

    function miss(bs) {
      bs.forEach((b) => { b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); b.disabled = !multi; if (multi) setTimeout(() => b.classList.remove('wrong', 'picked'), 700); });
      msg.className = 'quiz-msg bad';
      msg.textContent = wrongPool[wrongCount++ % wrongPool.length];
      vibrate([20, 40, 20]);
    }
    function win() {
      done = true;
      opts.forEach((b) => {
        b.disabled = true;
        b.classList.remove('picked', 'wrong');
        b.classList.add(right.has(b.dataset.key) ? 'correct' : 'dim');
      });
      card.append(h('div', { class: 'stamp', text: '정답!' }));
      msg.className = 'quiz-msg good';
      msg.textContent = sc.correct || '정답!';
      vibrate(30);
      burstAt(card.querySelector('.opt.correct') || card);
      ppong.show();
      if (sc.heart) setTimeout(() => bigHeart(sc.heart), 700);
      const lastQ = S.s === S.scenes.length - 1;
      a.unlock(sc.nextLabel || (sc.counter ? (lastQ ? '다음 ▶' : '다음 문제 ▶') : '다음이야기로 ▶'));
    }

    let check = null;
    if (multi) {
      check = h('button', { class: 'btn-check', type: 'button', text: '선택 완료' });
      check.addEventListener('click', () => {
        if (done) return;
        const picked = opts.filter((b) => b.classList.contains('picked'));
        const wrongPicks = picked.filter((b) => !right.has(b.dataset.key));
        const found = picked.length - wrongPicks.length;
        if (wrongPicks.length === 0 && found === right.size) { check.remove(); win(); return; }
        if (wrongPicks.length) miss(wrongPicks);
        else { msg.className = 'quiz-msg bad'; msg.textContent = `정답은 ${right.size}개예요. ${right.size - found}개 더 찾아보세요!`; vibrate(20); }
      });
    }

    card.append(h('p', { class: 'eyebrow', text: sc.counter || 'QUIZ' }), h('h2', { class: 'quiz-q', text: sc.question }));
    if (multi) card.append(h('p', { class: 'lead', style: 'margin:4px 0 0;font-size:14px', text: '정답을 모두 고른 뒤 선택 완료를 눌러주세요.' }));
    const wrap = h('div', { class: 'scene', style: 'animation:none' }, card, h('div', { class: 'opts' }, opts), check, msg);
    a.lock('정답을 골라주세요');
    return wrap;
  };

  R.status = (sc, { api: a }) => {
    const box = h('div', { class: 'status-box' },
      h('span', { class: 'st-from', text: sc.from }),
      h('span', { class: 'st-arrow', text: '↓' }),
      h('span', { class: 'st-to', text: sc.to }));
    const el = h('section', { class: 'card', style: 'text-align:center' },
      h('p', { class: 'eyebrow', text: 'RELATIONSHIP STATUS' }), box, lines(sc.lines, 'lines status-lines'));
    a.lock('...');
    el._after = async () => {
      await wait(2000);
      burstAt(box.querySelector('.st-to'), { hearts: true, colors: ['#ff8e88', '#ffd36e', '#f6efe2'], n: 16 });
      ppong.show('...!!');
      await wait(1500);
      a.unlock('다음 ▶');
    };
    return el;
  };

  R.dialog = (sc, { api: a }) => {
    const taps = sc.taps || 3;
    let n = 0;
    const cream = h('div', { class: 'mcf-cream' });
    const crumbs = [];
    for (let i = 0; i < taps * 4; i++) {
      const c = h('i', { style: `left:${8 + Math.random() * 80}%;top:${15 + Math.random() * 70}%` });
      crumbs.push(c);
      cream.append(c);
    }
    const cup = h('div', { class: 'mcf', 'aria-hidden': 'true' }, h('div', { class: 'mcf-spoon' }), cream, h('div', { class: 'mcf-cup' }));
    const chat = h('div', { class: 'chat' });
    const btn = h('button', { class: 'tap-btn', type: 'button', text: `${sc.action || '탭하기'} (0/${taps})` });
    btn.addEventListener('click', async (e) => {
      if (n >= taps) return;
      addRipple(btn, e);
      n++;
      vibrate(10);
      cup.classList.remove('stir'); void cup.offsetWidth; cup.classList.add('stir');
      crumbs.slice(0, n * 4).forEach((c) => c.classList.add('on'));
      btn.textContent = `${sc.action || '탭하기'} (${n}/${taps})`;
      if (n === taps) {
        cup.classList.add('done');
        btn.textContent = 'QUEST CLEAR!';
        btn.disabled = true;
        burstAt(cup);
        ppong.show();
        for (const [i, l] of sc.lines.entries()) {
          await wait(i === 0 ? 600 : 1100);
          chat.append(h('div', { class: 'bubble ' + (l.who === D.meta.boyfriend ? 'left' : 'right') }, h('b', { text: l.who }), l.text));
        }
        await wait(500);
        a.unlock('다음 ▶');
      }
    });
    a.lock('맥플러리를 완성해 주세요');
    return h('section', { class: 'card' },
      h('div', { class: 'scene', style: 'animation:none' },
        h('p', { class: 'quest-title', text: sc.intro }), cup, btn, chat));
  };

  R.unlock = (sc) => {
    const el = h('div', {},
      h('div', { class: 'badge-unlock', text: sc.badge }),
      h('section', { class: 'card' },
        h('div', { class: 'scene', style: 'animation:none' },
          sc.date ? h('span', { class: 'chip', text: sc.date }) : null,
          sc.title ? h('h2', { class: 'h2', text: sc.title }) : null,
          lines(sc.lines),
          sc.image ? photo(sc.image, sc.title) : null)));
    el._after = () => { burstAt(el.firstChild); ppong.show(); };
    return el;
  };

  R.gallery = (sc) => {
    const grid = h('div', { class: 'gallery' }, sc.photos.map((p, i) => {
      const b = h('button', { type: 'button', 'aria-label': p.caption || `사진 ${i + 1}`, style: `animation-delay:${(0.2 + i * 0.06).toFixed(2)}s` }, photo(p.src, p.caption, 'small'));
      b.addEventListener('click', () => openLightbox(sc.photos, i));
      return b;
    }));
    const el = h('div', {},
      sc.badge ? h('div', { class: 'badge-unlock sky', text: sc.badge }) : null,
      h('section', { class: 'card' },
        h('div', { class: 'scene', style: 'animation:none' },
          sc.date ? h('span', { class: 'chip', text: sc.date }) : null,
          sc.title ? h('h2', { class: 'h2', text: sc.title }) : null,
          grid,
          lines(sc.lines))));
    el._after = () => { if (sc.badge) burstAt(el.firstChild, { colors: ['#93c5ff', '#f6efe2', '#ffd36e'] }); };
    return el;
  };

  R.timeline = (sc) => h('section', { class: 'card' },
    h('p', { class: 'eyebrow', style: 'margin-bottom:14px', text: sc.title || 'LOG' }),
    h('ol', { class: 'timeline' }, sc.items.map((it, i) => h('li', { style: `animation-delay:${(0.15 + i * 0.25).toFixed(2)}s` },
      h('span', { class: 'tl-date', text: it.date }),
      h('p', { class: 'tl-title', text: it.title }),
      it.text ? h('p', { class: 'tl-text', text: it.text }) : null))));

  R.collection = (sc, { api: a }) => {
    const total = sc.total || 16;
    let n = 0;
    const count = h('span', { class: 'coll-count', text: `0 / ${total}` });
    const claw = h('div', { class: 'claw', 'aria-hidden': 'true' });
    const slots = Array.from({ length: total }, (_, i) => h('div', { class: 'slot' }, h('span', { text: pad(i + 1) })));
    const btn = h('button', { class: 'tap-btn', type: 'button', text: sc.action || '뽑기!' });
    btn.addEventListener('click', (e) => {
      if (n >= total) return;
      addRipple(btn, e);
      const slot = slots[n];
      n++;
      vibrate(12);
      claw.classList.remove('grab'); void claw.offsetWidth; claw.classList.add('grab');
      slot.replaceChildren(h('div', { class: 'capsule', 'data-n': pad(n), style: `--cap:${CAPSULE_COLORS[(n - 1) % CAPSULE_COLORS.length]}` }));
      if (sc.itemPath) slot.append(photo(sc.itemPath.replace('{n}', pad(n)), '', 'small'));
      slot.classList.add('got');
      count.textContent = `${n} / ${total}`;
      if (n === total) {
        count.classList.add('full');
        btn.textContent = 'COLLECTION COMPLETE!';
        btn.disabled = true;
        burstAt(count, { n: 26 });
        ppong.show('16개나?!');
        a.unlock('다음 ▶');
      }
    });
    a.lock(`인형을 모두 모아주세요`);
    return h('section', { class: 'card' },
      h('div', { class: 'scene', style: 'animation:none' },
        h('div', { class: 'coll-head' }, h('p', { class: 'eyebrow', text: 'COLLECTION' }), count),
        sc.title ? h('h2', { class: 'h2', text: sc.title }) : null,
        lines(sc.lines),
        claw,
        h('div', { class: 'coll-grid' }, slots),
        btn));
  };

  /* 인형뽑기 미니게임 (MEMORY CLAW) */
  R.claw = (sc, { api: a }) => {
    const goal = sc.goal || sc.toys.length;
    const maxTries = sc.tries || 5;
    const CHUTE = 9;          // 배출구 위치 (%)
    const STEP = 4;           // 한 번 누를 때 이동 거리 (%)
    let pos = 55;
    let tries = maxTries;
    let got = 0;
    let misses = 0;
    let busy = false;
    let finished = false;

    const triesEl = h('b', { text: String(tries) });
    const gotEl = h('b', { text: `0/${goal}` });
    const msg = h('p', { class: 'quiz-msg cm-msg', 'aria-live': 'polite', text: sc.intro || '' });
    const hold = h('div', { class: 'cm-hold' });
    const head = h('div', { class: 'cm-head' });
    const cable = h('div', { class: 'cm-cable' }, head, hold);
    const carriage = h('div', { class: 'cm-carriage' }, cable);
    const glass = h('div', { class: 'cm-glass' }, h('div', { class: 'cm-rail' }), h('div', { class: 'cm-chute' }, h('span', { text: 'OUT' })));
    const toys = sc.toys.map((t, i) => {
      const el = h('div', { class: 'cm-toy', title: t.name || '', style: `left:${(31 + i * (59 / Math.max(sc.toys.length - 1, 1))).toFixed(1)}%;bottom:${[10, 34, 16, 40, 22, 12][i % 6]}px;animation-delay:${(i * 0.3).toFixed(1)}s` });
      if (t.image) el.append(h('img', { src: t.image, alt: t.name || '' }));
      else el.textContent = t.icon || '🧸';
      el._x = parseFloat(el.style.left);
      el._toy = t;
      glass.append(el);
      return el;
    });
    glass.append(carriage);
    const tray = h('div', { class: 'cm-tray', 'aria-label': '뽑은 인형' }, Array.from({ length: goal }, () => h('span', { class: 'cm-slot' })));
    const machine = h('div', { class: 'cm-machine' },
      h('div', { class: 'cm-marquee' }, h('i'), h('span', { text: sc.title || 'MEMORY CLAW' }), h('i')),
      glass,
      h('div', { class: 'cm-floor' }, tray));

    const btnL = h('button', { class: 'cm-btn', type: 'button', 'aria-label': '왼쪽으로', text: '◀' });
    const btnR = h('button', { class: 'cm-btn', type: 'button', 'aria-label': '오른쪽으로', text: '▶' });
    const btnGo = h('button', { class: 'cm-btn cm-go', type: 'button', text: '뽑기!' });
    const retry = h('button', { class: 'tap-btn', type: 'button', text: '한 판 더', hidden: true });
    const reward = h('div', { class: 'cm-reward', hidden: true },
      h('div', { class: 'badge-unlock', text: sc.unlockTitle || 'MEMORY UNLOCKED' }),
      h('p', { class: 'cm-reward-text', text: sc.unlockText || '' }));

    const place = () => { carriage.style.left = pos + '%'; };
    place();
    const move = (d) => {
      if (busy || finished || tries <= 0) return;
      pos = Math.max(8, Math.min(92, pos + d * STEP));
      place();
    };
    const holdMove = (btn, d) => {
      let t = 0;
      const stop = () => { clearInterval(t); t = 0; };
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        move(d);
        stop();
        t = setInterval(() => move(d), 110);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, stop));
      btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); move(d); } });
    };
    holdMove(btnL, -1);
    holdMove(btnR, 1);

    const setControls = (on) => [btnL, btnR, btnGo].forEach((b) => { b.disabled = !on; });
    const say = (text, tone) => { msg.textContent = text; msg.className = 'quiz-msg cm-msg' + (tone ? ' ' + tone : ''); };
    const cableTo = (px) => { cable.style.height = px + 'px'; };

    async function drop() {
      if (busy || finished || tries <= 0) return;
      busy = true;
      setControls(false);
      tries--;
      triesEl.textContent = String(tries);
      say('크레인이 내려갑니다...');
      vibrate(10);

      const live = toys.filter((t) => !t._gone);
      const target = live.reduce((best, t) => (!best || Math.abs(t._x - pos) < Math.abs(best._x - pos) ? t : best), null);
      const dist = target ? Math.abs(target._x - pos) : 99;
      const gH = glass.clientHeight;
      const depth = target && dist < 12 ? gH - parseFloat(target.style.bottom) - target.offsetHeight - 30 : gH - 70;
      head.classList.remove('closed');
      cableTo(depth);
      await wait(750);
      head.classList.add('closed');
      await wait(300);

      // 가까울수록 잘 잡히고, 두 번 연속 놓치면 다음엔 봐줌
      const chance = dist < 4 ? 0.92 : dist < 7 ? 0.6 : 0;
      const success = target && dist < 7 && (Math.random() < chance || misses >= 2);

      if (success) {
        misses = 0;
        target._gone = true;
        hold.append(target);
        target.style.left = '0';
        target.style.bottom = 'auto';
        target.classList.add('held');
        cableTo(24);
        await wait(700);
        pos = CHUTE;
        place();
        await wait(650);
        head.classList.remove('closed');
        target.classList.add('fall');
        await wait(450);
        target.remove();
        got++;
        gotEl.textContent = `${got}/${goal}`;
        const slot = tray.children[got - 1];
        if (slot) { slot.textContent = target._toy.icon || '🧸'; slot.classList.add('on'); }
        machine.classList.remove('shake'); void machine.offsetWidth; machine.classList.add('shake');
        burstAt(slot || machine, { n: 14 });
        vibrate(25);
        say(`성공! ${target._toy.name ? target._toy.name + ' ' : ''}추억 하나를 획득했습니다!`, 'good');
        ppong.show();
      } else {
        misses++;
        if (target && dist < 12) {
          target.classList.remove('wobble'); void target.offsetWidth; target.classList.add('wobble');
          say(dist < 7 ? '앗, 미끄러졌다! 한 번만 더!' : `아쉽다... 조금만 더 ${target._x > pos ? '오른쪽' : '왼쪽'}!`, 'bad');
        } else {
          say(target ? `허공을 잡았다! 인형은 더 ${target._x > pos ? '오른쪽' : '왼쪽'}에 있어요.` : '인형이 없어요!', 'bad');
        }
        vibrate([15, 30, 15]);
        cableTo(24);
        await wait(700);
        head.classList.remove('closed');
      }

      if (got >= goal) return complete();
      if (tries <= 0) return outOfTries();
      busy = false;
      setControls(true);
    }

    function complete() {
      finished = true;
      busy = false;
      setControls(false);
      retry.hidden = true;
      say('COLLECTION COMPLETE! 8월 20일의 기억이 해금되었습니다.', 'good');
      reward.hidden = false;
      reward.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      burstAt(reward, { n: 26, spread: 130 });
      ppong.show('다 뽑았다!');
      a.unlock('다음 ▶');
    }
    function outOfTries() {
      busy = false;
      setControls(false);
      say(sc.gameOver || '게임 종료!', 'bad');
      msg.style.whiteSpace = 'pre-line';
      retry.hidden = false;
      a.unlock('다음 ▶');
    }
    retry.addEventListener('click', () => {
      tries = maxTries;
      triesEl.textContent = String(tries);
      retry.hidden = true;
      msg.style.whiteSpace = '';
      say('다시 한 번! 크레인을 움직여 보세요.');
      setControls(true);
    });
    btnGo.addEventListener('click', drop);

    a.lock('인형을 뽑아주세요');
    const el = h('section', { class: 'card' },
      h('div', { class: 'scene', style: 'animation:none' },
        h('div', { class: 'coll-head' },
          h('span', { class: 'chip', text: sc.date || '' }),
          h('span', { class: 'cm-score' }, 'CLAWS ', triesEl, ' · ', gotEl)),
        machine,
        h('div', { class: 'cm-controls' }, btnL, btnGo, btnR),
        msg,
        retry,
        reward));
    return el;
  };

  /* 수박게임 스타일 미니게임 (MEMORY MERGE) */
  R.merge = (sc, { api: a }) => {
    const L = sc.levels;
    const TOP = 64;            // 경고선 y (px)
    const FLOOR = 22;          // 바닥 두께 (px)
    const G = 0.32;            // 중력
    const unlockAt = sc.unlockAt == null ? L.length - 1 : sc.unlockAt;
    let W = 0, H = 0, scale = 1;
    let items = [];
    let score = 0;
    let best = -1;
    let cur = 0, nxt = 0;
    let aimX = 0;
    let canDrop = true;
    let over = false;
    let unlocked = false;
    let overTimer = 0;
    let raf = 0;
    let uid = 0;

    const radius = (lv) => (15 + lv * 7.5 + lv * lv * 0.9) * scale;
    const randLv = () => Math.floor(Math.random() * Math.min(3, L.length));
    const face = (lv) => {
      const lvData = L[lv];
      if (lvData.image) return h('img', { src: lvData.image, alt: lvData.name || '' });
      return document.createTextNode(lvData.icon || '●');
    };

    const scoreEl = h('b', { class: 'mg-score', text: '0' });
    const nextEl = h('span', { class: 'mg-next-item' });
    const msg = h('p', { class: 'quiz-msg cm-msg', 'aria-live': 'polite', text: sc.intro || '' });
    const ghost = h('div', { class: 'mg-item mg-ghost' });
    const guide = h('div', { class: 'mg-guide' });
    const finalBox = h('div', { class: 'mg-final', hidden: true });
    const board = h('div', { class: 'mg-board' }, h('div', { class: 'mg-danger' }), guide, ghost, h('div', { class: 'mg-floor' }), finalBox);
    const ladder = h('div', { class: 'mg-ladder', 'aria-hidden': 'true' }, L.map((l, i) => h('span', { class: 'mg-step', 'data-lv': i }, face(i))));
    const restart = h('button', { class: 'link-btn', type: 'button', text: '게임 다시 시작' });

    function setGhost() {
      const r = radius(cur);
      ghost.replaceChildren(face(cur));
      ghost.style.width = ghost.style.height = r * 2 + 'px';
      ghost.style.fontSize = r * 1.3 + 'px';
      aimX = Math.max(r, Math.min(W - r, aimX || W / 2));
      ghost.style.transform = `translate(${aimX - r}px, ${TOP - r * 2 - 4 < 4 ? 4 : TOP - r * 2 - 4}px)`;
      guide.style.transform = `translateX(${aimX}px)`;
      ghost.style.opacity = canDrop && !over ? '1' : '.25';
      nextEl.replaceChildren(face(nxt));
    }

    function spawn(lv, x, y, vy = 0) {
      const r = radius(lv);
      const el = h('div', { class: 'mg-item pop' }, face(lv));
      el.style.width = el.style.height = r * 2 + 'px';
      el.style.fontSize = r * 1.3 + 'px';
      board.insertBefore(el, finalBox);
      const it = { id: ++uid, lv, r, x, y, vx: 0, vy, rot: 0, el, born: performance.now(), dead: false };
      items.push(it);
      setTimeout(() => el.classList.remove('pop'), 320);
      return it;
    }

    function markLadder() {
      [...ladder.children].forEach((s, i) => s.classList.toggle('on', i <= best));
    }

    function doMerge(p, q) {
      p.dead = q.dead = true;
      p.el.remove();
      q.el.remove();
      const lv = p.lv + 1;
      const mx = (p.x + q.x) / 2;
      const my = (p.y + q.y) / 2;
      const rect = board.getBoundingClientRect();
      if (lv >= L.length) {
        score += (L[L.length - 1].score || 0) * 2;
        scoreEl.textContent = String(score);
        burst(rect.left + mx, rect.top + my, { hearts: true, n: 26, spread: 150, colors: ['#ff8e88', '#ffd36e', '#f6efe2'] });
        return complete();
      }
      spawn(lv, mx, my, -1.5);
      score += L[lv].score || 0;
      scoreEl.textContent = String(score);
      burst(rect.left + mx, rect.top + my, { n: 10, spread: 50 });
      vibrate(12);
      if (lv > best) {
        best = lv;
        markLadder();
        say(`${L[lv].icon || ''} ${L[lv].name} 해금!`, 'good');
        if (lv >= 3) ppong.show();
      }
      if (!unlocked && best >= unlockAt) {
        unlocked = true;
        a.unlock('다음 ▶');
        say(`${L[lv].icon || ''} ${L[lv].name} 해금! 계속하거나 다음으로 넘어가도 돼요.`, 'good');
      }
    }

    function step() {
      const floorY = H - FLOOR;
      for (const it of items) {
        it.vy += G;
        it.vx *= 0.995;
        it.x += it.vx;
        it.y += it.vy;
      }
      for (let pass = 0; pass < 6; pass++) {
        for (let i = 0; i < items.length; i++) {
          const p = items[i];
          if (p.dead) continue;
          if (p.x < p.r) { p.x = p.r; p.vx = Math.abs(p.vx) * 0.3; }
          if (p.x > W - p.r) { p.x = W - p.r; p.vx = -Math.abs(p.vx) * 0.3; }
          if (p.y > floorY - p.r) { p.y = floorY - p.r; if (p.vy > 0) p.vy *= -0.15; p.vx *= 0.92; }
          for (let j = i + 1; j < items.length; j++) {
            const q = items[j];
            if (q.dead) continue;
            let dx = q.x - p.x, dy = q.y - p.y;
            let d = Math.hypot(dx, dy);
            const min = p.r + q.r;
            if (d >= min) continue;
            if (d < 0.001) { dx = 0.01; dy = 0; d = 0.01; }
            if (p.lv === q.lv && !over) { doMerge(p, q); break; }
            const nx = dx / d, ny = dy / d;
            const mp = p.r * p.r, mq = q.r * q.r, tot = mp + mq;
            const overlap = (min - d);
            p.x -= nx * overlap * (mq / tot);
            p.y -= ny * overlap * (mq / tot);
            q.x += nx * overlap * (mp / tot);
            q.y += ny * overlap * (mp / tot);
            const rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
            if (rv < 0) {
              const jimp = -(1.15 * rv) / (1 / mp + 1 / mq);
              p.vx -= (jimp / mp) * nx; p.vy -= (jimp / mp) * ny;
              q.vx += (jimp / mq) * nx; q.vy += (jimp / mq) * ny;
            }
          }
        }
        if (items.some((x) => x.dead)) items = items.filter((x) => !x.dead);
        if (over && !finalBox.hidden) return;
      }
    }

    function render() {
      for (const it of items) {
        it.rot += it.vx / Math.max(it.r, 1);
        it.el.style.transform = `translate(${it.x - it.r}px, ${it.y - it.r}px) rotate(${it.rot}rad)`;
      }
    }

    function checkDanger(now) {
      const high = items.some((it) => now - it.born > 1200 && it.y - it.r < TOP && Math.abs(it.vy) < 1.2);
      board.classList.toggle('warn', high);
      if (!high) { overTimer = 0; return; }
      if (!overTimer) overTimer = now;
      if (now - overTimer > 1600) gameOver();
    }

    function loop(now) {
      if (!board.isConnected) { cancelAnimationFrame(raf); return; }
      if (!over) {
        step();
        render();
        checkDanger(now);
      }
      raf = requestAnimationFrame(loop);
    }

    function say(t, tone) { msg.textContent = t; msg.className = 'quiz-msg cm-msg' + (tone ? ' ' + tone : ''); }

    function drop() {
      if (!canDrop || over) return;
      canDrop = false;
      const r = radius(cur);
      spawn(cur, Math.max(r, Math.min(W - r, aimX)), Math.max(r + 4, TOP - r - 4), 1);
      cur = nxt;
      nxt = randLv();
      vibrate(6);
      setGhost();
      setTimeout(() => { canDrop = true; setGhost(); }, 550);
    }

    function showFinal(title, text, heart) {
      finalBox.replaceChildren(
        heart ? h('div', { class: 'mg-final-heart', text: '♥' }) : null,
        h('p', { class: 'mg-final-title', text: title }),
        h('p', { class: 'mg-final-text', text }),
        (() => { const b = h('button', { class: 'tap-btn', type: 'button', text: '다시 플레이' }); b.addEventListener('click', reset); return b; })());
      finalBox.hidden = false;
    }
    function complete() {
      over = true;
      if (!unlocked) { unlocked = true; }
      a.unlock('다음 ▶');
      best = L.length - 1;
      markLadder();
      showFinal(sc.finalTitle || 'COMPLETE', sc.finalText || '', true);
      say('MEMORY COMPLETE!', 'good');
      ppong.show('수박 완성!');
      vibrate([30, 60, 30]);
    }
    function gameOver() {
      over = true;
      board.classList.remove('warn');
      showFinal('GAME OVER?', '추억이 너무 많아서 넘쳤어요.\n그래도 괜찮아, 다시 쌓으면 되니까.', false);
      say(unlocked ? '다시 해보거나 다음으로 넘어가도 돼요.' : '다시 플레이해서 도전해 보세요!', 'bad');
      if (!unlocked) { unlocked = true; a.unlock('다음 ▶'); }
    }
    function reset() {
      items.forEach((it) => it.el.remove());
      items = [];
      score = 0;
      scoreEl.textContent = '0';
      over = false;
      overTimer = 0;
      canDrop = true;
      finalBox.hidden = true;
      board.classList.remove('warn');
      cur = randLv();
      nxt = randLv();
      say(sc.intro || '');
      setGhost();
    }
    restart.addEventListener('click', reset);

    // 입력: 끌어서 위치를 정하고 손을 떼면 떨어짐
    let aiming = false;
    const xOf = (e) => e.clientX - board.getBoundingClientRect().left;
    board.addEventListener('pointerdown', (e) => {
      if (over || e.target.closest('button')) return;
      aiming = true;
      try { board.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      aimX = xOf(e);
      setGhost();
    });
    board.addEventListener('pointermove', (e) => {
      if (over) return;
      if (!aiming && e.pointerType !== 'mouse') return;
      aimX = xOf(e);
      setGhost();
    });
    const release = (e) => {
      if (!aiming) return;
      aiming = false;
      aimX = xOf(e);
      drop();
    };
    board.addEventListener('pointerup', release);
    board.addEventListener('pointercancel', () => { aiming = false; });

    a.lock(`${L[unlockAt].icon || ''} ${L[unlockAt].name}까지 만들어 보세요`);
    const el = h('section', { class: 'card' },
      h('div', { class: 'scene', style: 'animation:none' },
        h('div', { class: 'mg-head' },
          h('div', {}, h('p', { class: 'eyebrow', text: sc.title || 'MEMORY MERGE' }), h('p', { class: 'mg-sub', text: sc.subtitle || '' })),
          h('div', { class: 'mg-scorebox' }, h('span', { text: 'SCORE' }), scoreEl)),
        h('div', { class: 'mg-nextbar' }, h('span', { text: 'NEXT MEMORY' }), nextEl),
        board,
        ladder,
        msg,
        restart));
    el._after = () => {
      W = board.clientWidth;
      H = board.clientHeight;
      scale = Math.max(0.8, Math.min(1.15, W / 360));
      reset();
      raf = requestAnimationFrame(loop);
    };
    return el;
  };

  R.achievement = (sc, { api: a }) => {
    const num = h('p', { class: 'achv-num', text: '0' });
    const badge = h('div', { class: 'badge-unlock', text: sc.badge, style: 'visibility:hidden' });
    const el = h('div', {},
      h('section', { class: 'card achv' },
        h('p', { class: 'eyebrow', text: flow[S.f].ch ? flow[S.f].ch.date : '' }),
        num,
        h('p', { class: 'achv-unit', text: sc.unit || '' }),
        lines(sc.lines)),
      badge);
    a.lock('...');
    el._after = async () => {
      const target = sc.value || 100;
      const dur = reduceMotion ? 1 : 1400;
      const t0 = performance.now();
      await new Promise((res) => {
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          num.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick); else res();
        };
        requestAnimationFrame(tick);
      });
      badge.style.visibility = '';
      badge.style.animation = 'none'; void badge.offsetWidth; badge.style.animation = '';
      burstAt(num, { n: 28, spread: 140 });
      ppong.show('100일 축하해!');
      a.unlock('다음 ▶');
    };
    return el;
  };

  R.warning = (sc, { api: a }) => {
    const msg = h('p', { class: 'warn-msg' });
    const el = h('section', { class: 'card warn' },
      h('div', { class: 'scene', style: 'animation:none;align-items:center' },
        h('p', { class: 'warn-title', text: sc.title || 'WARNING' }),
        h('div', { class: 'signal', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')),
        msg,
        lines(sc.lines, 'lines', 0.4)));
    el.querySelector('.lines').style.visibility = 'hidden';
    a.lock('...');
    el._after = async () => {
      $('#app').classList.add('glitch');
      setTimeout(() => $('#app').classList.remove('glitch'), 1100);
      vibrate([30, 60, 30]);
      for (const ch of sc.message) { msg.textContent += ch; await wait(45); }
      await wait(400);
      el.querySelector('.lines').style.visibility = '';
      await wait(1200);
      a.unlock('연결 재시도 ▶');
    };
    return el;
  };

  R.gameover = (sc, { api: a }) => {
    const title = h('p', { class: 'go-title', text: 'GAME OVER?' });
    const btn = h('button', { class: 'go-continue', type: 'button', text: '[ CONTINUE ]' });
    const rest = h('div', {});
    const el = h('section', { class: 'card gameover' }, title, btn, rest);
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      vibrate(20);
      btn.style.animation = 'none';
      for (let i = 3; i >= 1; i--) { btn.textContent = `CONTINUE ${i}`; await wait(420); }
      btn.remove();
      title.classList.add('fade');
      rest.append(h('p', { class: 'go-after', text: (sc.after || []).join('\n') }));
      burstAt(rest, { n: 22 });
      ppong.show();
      await wait(900);
      const c = flow[S.f].ch;
      rest.append(h('span', { class: 'chip', style: 'margin:22px auto 10px;display:inline-flex', text: c ? `${c.date}${c.place ? ' · ' + c.place : ''}` : '' }), lines(sc.lines, 'lines', 0.4));
      await wait(900);
      a.unlock('다음 ▶');
    });
    a.lock('CONTINUE 를 눌러주세요');
    return el;
  };

  R.ride = (sc, { api: a }) => {
    const wheel = h('div', { class: 'wheel' });
    for (let i = 0; i < 4; i++) wheel.append(h('div', { class: 'spoke', style: `transform:rotate(${i * 45 + 22.5}deg)` }));
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      wheel.append(h('div', { class: 'cabin', style: `transform:translate(${Math.cos(ang) * 85}px,${Math.sin(ang) * 85}px)` }, h('i', { style: `--cap:${CAPSULE_COLORS[i % CAPSULE_COLORS.length]}` })));
    }
    const park = h('div', { class: 'park idle', 'aria-hidden': 'true' },
      h('div', { class: 'park-stand' }), wheel, h('div', { class: 'park-ground' }),
      Array.from({ length: 7 }, (_, i) => h('span', { class: 'balloon', style: `left:${8 + i * 13}%;--cap:${CAPSULE_COLORS[i % CAPSULE_COLORS.length]};animation-delay:${(i * 0.7).toFixed(1)}s;animation-duration:${(4.5 + (i % 3)).toFixed(1)}s` })));
    const ticket = h('button', { class: 'ticket', type: 'button', text: sc.action || '입장하기' });
    const text = lines(sc.lines, 'lines', 0.35);
    text.style.visibility = 'hidden';
    ticket.addEventListener('click', async () => {
      if (ticket.disabled) return;
      ticket.disabled = true;
      vibrate(20);
      ticket.append(h('span', { class: 'ticket-stamp', text: sc.stamp || 'ADMIT TWO' }));
      await wait(500);
      park.classList.remove('idle');
      wheel.classList.add('fast');
      burstAt(park, { n: 24 });
      ppong.show('신난다!');
      text.style.visibility = '';
      await wait(900);
      a.unlock('다음 ▶');
    });
    a.lock('티켓을 눌러주세요');
    return h('section', { class: 'card' },
      h('div', { class: 'scene', style: 'animation:none' },
        h('p', { class: 'adv-banner', text: 'ADVENTURE MODE' }), park, ticket, text));
  };

  R.ppong = (sc) => {
    const portrait = h('div', { class: 'ppong-portrait' });
    mascotFace(portrait);
    const el = h('div', {},
      h('div', { class: 'badge-unlock sky', text: sc.badge || 'MASCOT UNLOCKED' }),
      h('section', { class: 'card ppong-card' },
        h('div', { class: 'scene', style: 'animation:none;align-items:center' },
          portrait,
          h('p', { class: 'eyebrow', text: `${D.mascot.name} · BICHON` }),
          lines(sc.lines, 'lines', 0.4))));
    el._after = () => {
      ppong.setMet(true);
      save();
      burstAt(portrait, { hearts: true, colors: ['#ffd36e', '#f6efe2', '#93c5ff'] });
      setTimeout(() => { ppong.show('멍!'); setTimeout(() => ppong.peek(true), 2200); }, 900);
    };
    return el;
  };

  R.daily = (sc, { api: a }) => {
    let n = 0;
    const doneBadge = h('div', { class: 'badge-unlock', text: sc.done || 'CLEAR', style: 'visibility:hidden' });
    const items = sc.items.map((t) => {
      const b = h('button', { class: 'check', type: 'button', 'aria-pressed': 'false' }, h('span', { class: 'box' }), h('span', { text: t }));
      b.addEventListener('click', () => {
        if (b.classList.contains('on')) return;
        b.classList.add('on');
        b.setAttribute('aria-pressed', 'true');
        vibrate(10);
        n++;
        if (n === sc.items.length) {
          doneBadge.style.visibility = '';
          doneBadge.style.animation = 'none'; void doneBadge.offsetWidth; doneBadge.style.animation = '';
          burstAt(doneBadge);
          ppong.show();
          a.unlock('다음 ▶');
        }
      });
      return h('li', {}, b);
    });
    a.lock('체크리스트를 채워주세요');
    return h('div', {},
      h('section', { class: 'card' },
        h('div', { class: 'scene', style: 'animation:none' },
          h('p', { class: 'eyebrow', text: sc.title || 'TODAY' }),
          h('ul', { class: 'checks' }, items),
          lines(sc.lines))),
      doneBadge);
  };

  R.memory = (sc, { ch }) => {
    const m = ch.memory || {};
    const isLast = S.f === D.chapters.length - 1;
    const el = h('div', {},
      h('section', { class: 'card memory-card' },
        h('div', { class: 'scene', style: 'animation:none' },
          h('p', { class: 'clear-text', text: `CHAPTER ${pad(ch.no)} CLEAR` }),
          h('div', { class: 'badge-unlock', text: 'MEMORY UNLOCKED' }),
          photo(m.image, m.caption || ch.title),
          h('p', { class: 'caption', text: m.caption || ch.date || '' }))));
    const nextIsMemoryLast = S.s === S.scenes.length - 1;
    api.unlock(nextIsMemoryLast ? (isLast ? 'ALL CLEAR ▶' : '다음 챕터 ▶') : '다음 ▶');
    el._after = () => {
      burstAt(el.querySelector('.badge-unlock'), { n: 22 });
      ppong.show();
    };
    return el;
  };

  R.secretUnlock = () => {
    const el = h('section', { class: 'card secret' },
      h('p', { class: 'clear-text', text: 'ALL CHAPTERS CLEAR' }),
      h('div', { class: 'lock', style: 'margin-top:22px', 'aria-hidden': 'true' }),
      h('p', { class: 'secret-title', text: D.secretQuiz.title }),
      h('p', { class: 'secret-sub', text: D.secretQuiz.subtitle }),
      h('p', { class: 'lead', text: `모든 챕터를 클리어해서 숨겨진 퀴즈 ${D.secretQuiz.questions.length}문제가 열렸습니다.` }));
    api.unlock('도전하기 ▶');
    el._after = () => setTimeout(() => { burstAt(el.querySelector('.lock'), { n: 24 }); ppong.show('비밀 퀴즈다!'); }, 1100);
    return el;
  };

  R.systemError = (sc, { api: a }) => {
    const E = D.systemError;
    const holder = h('div', { class: 'scene', style: 'animation:none' });
    const errWin = h('section', { class: 'card err-window' },
      h('div', { class: 'err-bar' }, h('span', { text: E.title }), h('i', { text: '×' })),
      h('div', { class: 'err-body' },
        h('div', { class: 'err-icon', text: '!' }),
        h('div', { style: 'min-width:0' }, h('p', { class: 'err-msg', text: E.message }), h('p', { class: 'err-code', text: E.code }))),
      h('div', { class: 'err-actions' },
        h('button', { type: 'button', 'data-act': 'fix', text: '오류 무시' }),
        h('button', { type: 'button', 'data-act': 'play', text: '추천곡 확인' })));
    holder.append(errWin);
    a.lock('오류를 처리해 주세요');

    const showPlayer = async () => {
      errWin.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      const art = h('div', { class: 'player-art' }, h('div', { class: 'hippo' }),
        Array.from({ length: 8 }, (_, i) => h('span', { class: 'bubble-soap', style: `--s:${14 + (i % 4) * 8}px;--dx:${(i % 2 ? 1 : -1) * (10 + i * 7)}px;margin-left:${i % 2 ? 4 : -22}px;animation-delay:${(i * 0.4).toFixed(1)}s` })));
      const playBtn = h('button', { class: 'np-play', type: 'button', 'aria-label': '일시정지', text: '❚❚' });
      const player = h('section', { class: 'card player' },
        h('div', { class: 'scene', style: 'animation:none' },
          h('p', { class: 'np-label', text: 'NOW PLAYING · 오늘의 추천 음악' }),
          art,
          h('p', { class: 'np-title', text: E.song }),
          h('p', { class: 'np-artist', text: E.artist }),
          h('div', { class: 'np-bar' }, h('i')),
          h('div', { class: 'np-row' }, h('span', { text: '0:00' }), h('div', { class: 'eq' }, h('i'), h('i'), h('i'), h('i')), playBtn, h('span', { text: '∞:∞∞' }))));
      playBtn.addEventListener('click', () => {
        const paused = player.classList.toggle('paused');
        playBtn.textContent = paused ? '▶' : '❚❚';
        playBtn.setAttribute('aria-label', paused ? '재생' : '일시정지');
      });
      await wait(300);
      holder.append(player);
      player.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      ppong.show('뽀글뽀글?');
      await wait(1600);
      holder.append(h('p', { class: 'quiz-msg good', text: E.recovered }));
      a.unlock('시스템 복구 ▶');
    };
    errWin.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]');
      if (!b || b.disabled) return;
      if (b.dataset.act === 'fix') {
        errWin.classList.remove('glitch'); void errWin.offsetWidth; errWin.classList.add('glitch');
        b.textContent = '무시 불가';
        vibrate([20, 30, 20]);
        setTimeout(showPlayer, 700);
      } else showPlayer();
    });
    holder._after = () => {
      $('#app').classList.add('glitch');
      setTimeout(() => $('#app').classList.remove('glitch'), 1100);
    };
    return holder;
  };

  /* ---------- big heart (secret Q5) ---------- */
  function bigHeart(text) {
    const ov = h('div', { class: 'heart-overlay', role: 'dialog', 'aria-label': text },
      h('div', { class: 'heart-wrap' },
        h('div', { style: 'position:absolute;inset:0' }),
        h('p', { class: 'heart-text', text })),
      h('p', { class: 'heart-hint', text: 'TAP TO CLOSE' }));
    ov.querySelector('.heart-wrap > div').innerHTML = '<svg viewBox="0 0 100 92" aria-hidden="true"><path d="M50 88 C20 66 4 50 4 28 4 14 15 4 28 4 38 4 46 10 50 18 54 10 62 4 72 4 85 4 96 14 96 28 96 50 80 66 50 88Z" fill="#ff8e88"/><path d="M22 20 q6-8 14-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/></svg>';
    ov.addEventListener('click', () => { ov.style.transition = 'opacity .3s'; ov.style.opacity = '0'; setTimeout(() => ov.remove(), 300); });
    document.body.append(ov);
    vibrate([40, 60, 40]);
    setTimeout(() => {
      const r = ov.querySelector('.heart-wrap').getBoundingClientRect();
      for (let k = 0; k < 3; k++) setTimeout(() => burst(r.left + r.width / 2, r.top + r.height / 2, { hearts: true, n: 20, spread: 160, colors: ['#ff8e88', '#ffd36e', '#f6efe2'] }), k * 350);
    }, 700);
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox');
  let lbList = [];
  let lbIdx = 0;
  function lbRender() {
    const p = lbList[lbIdx];
    $('.lb-body', lb).replaceChildren(photo(p.src, p.caption), h('p', { class: 'caption', text: `${p.caption || ''}  ·  ${lbIdx + 1} / ${lbList.length}` }));
  }
  function openLightbox(list, i) { lbList = list; lbIdx = i; lbRender(); lb.hidden = false; }
  const lbMove = (d) => { lbIdx = (lbIdx + d + lbList.length) % lbList.length; lbRender(); };
  $('.lb-close', lb).addEventListener('click', () => { lb.hidden = true; });
  $('.lb-prev', lb).addEventListener('click', () => lbMove(-1));
  $('.lb-next', lb).addEventListener('click', () => lbMove(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.hidden = true; });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') lb.hidden = true;
    if (e.key === 'ArrowLeft') lbMove(-1);
    if (e.key === 'ArrowRight') lbMove(1);
  });
  let tx = null;
  lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (tx == null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) lbMove(dx < 0 ? 1 : -1);
    tx = null;
  });

  /* =========================================================
     Title + loading
     ========================================================= */
  function showTitle() {
    document.body.classList.remove('finale-mode');
    const old = $('#finale'); if (old) old.remove();
    hud.hidden = true;
    actions.hidden = true;
    ppong.setMet(false);
    ppong.peek(false);
    const saved = store.get();
    const start = h('button', { class: 'press-start', type: 'button', text: '[ PRESS START ]' });
    start.addEventListener('click', () => { vibrate(15); store.clear(); ppong.setMet(false); runLoading(); });
    const extras = h('div', { class: 'title-sub-actions' });
    if (saved && saved.f > 0 && saved.f < flow.length) {
      const f = saved.f;
      const label = flow[f].kind === 'chapter' ? `CH ${pad(flow[f].ch.no)}` : flow[f].kind === 'finale' ? 'ENDING' : 'SECRET';
      const cont = h('button', { class: 'link-btn', type: 'button', text: `이어하기 · ${label}` });
      cont.addEventListener('click', () => { ppong.setMet(!!saved.met); goTo(f); });
      extras.append(cont);
    }
    const el = h('section', { class: 'title-screen' },
      h('span', { class: 'title-float', style: 'left:12%;top:18%', text: '+' }),
      h('span', { class: 'title-float', style: 'right:14%;top:28%;animation-delay:-2s;color:var(--sky)', text: '♥' }),
      h('span', { class: 'title-float', style: 'left:20%;bottom:26%;animation-delay:-4s', text: '★' }),
      h('p', { class: 'title-kicker', text: D.meta.title }),
      h('h1', { class: 'title-days' }, String(D.meta.days), h('br'), 'DAYS'),
      h('p', { class: 'title-sub', text: D.meta.subtitle }),
      h('p', { class: 'title-tag', text: `“${D.meta.tagline}”` }),
      start,
      extras,
      h('p', { class: 'title-foot', text: `FOR JINHYUNG · ${D.meta.birthday}` }));
    el.style.position = 'relative';
    stage.replaceChildren(el);
  }

  async function runLoading() {
    const face = h('div', { class: 'mascot-big mystery' });
    mascotFace(face);
    const fill = h('div', { class: 'load-fill' });
    const txt = h('p', { class: 'load-text', text: 'LOADING MEMORIES...' });
    await swap(h('section', { class: 'loading scene' }, face, h('div', { class: 'load-bar' }, fill), txt));
    const tips = ['공통점 계산 중...', '은지의 코딩 실력 충전 중...', '추억 불러오는 중...', 'READY!'];
    for (let i = 0; i < tips.length; i++) {
      await wait(480);
      fill.style.width = `${((i + 1) / tips.length) * 100}%`;
      txt.textContent = tips[i];
    }
    await wait(450);
    goTo(0);
  }

  /* =========================================================
     FINALE
     ========================================================= */
  function startFinale() {
    document.body.classList.add('finale-mode');
    hud.hidden = true;
    actions.hidden = true;
    const F = D.finale;
    const root = h('div', { id: 'finale' });
    const hint = h('p', { class: 'fin-hint', text: 'TAP TO CONTINUE' });
    document.body.append(root, hint);
    stage.replaceChildren();

    let i = -1;
    let timer = 0;
    let hintTimer = 0;
    let moving = false;

    const buildScreen = (sc) => {
      if (sc.kind === 'dates') return h('div', { class: 'fin-screen' }, h('p', { class: 'fin-big', text: sc.big }),
        h('div', { class: 'fin-dates' }, h('span', { text: sc.from }), h('span', { text: '↓' }), h('span', { text: sc.to })));
      if (sc.kind === 'quote') return h('div', { class: 'fin-screen' }, h('p', { class: 'fin-quote', text: `“${sc.text}”` }));
      if (sc.kind === 'said') return h('div', { class: 'fin-screen' }, h('p', { class: 'fin-who', text: sc.who }), h('p', { class: 'fin-said', text: sc.text }));
      if (sc.kind === 'birthday') return h('div', { class: 'fin-screen' },
        h('p', { class: 'fin-hb' }, h('span', { text: sc.line1 }), h('span', { text: sc.line2 })),
        h('p', { class: 'fin-date', text: sc.date }));
      return h('div', { class: 'fin-screen' });
    };

    const holdFor = (sc) => ({ dates: 4200, quote: 6500, said: 5200, birthday: 5200 }[sc.kind] || 4500);

    async function next() {
      if (moving) return;
      moving = true;
      clearTimeout(timer);
      clearTimeout(hintTimer);
      hint.classList.remove('on');
      const cur = root.firstElementChild;
      if (cur) { cur.classList.add('out'); await wait(900); }
      i++;
      if (i < F.screens.length) {
        const sc = F.screens[i];
        root.replaceChildren(buildScreen(sc));
        if (sc.kind === 'birthday') { glows(root); vibrate([30, 80, 30]); }
        timer = setTimeout(next, reduceMotion ? 6000 : holdFor(sc));
        hintTimer = setTimeout(() => hint.classList.add('on'), 2200);
      } else {
        root.classList.add('settled');
        root.replaceChildren(finalMedia());
      }
      moving = false;
    }
    root.addEventListener('click', (e) => {
      if (root.classList.contains('settled') || e.target.closest('button, video')) return;
      next();
    });
    setTimeout(next, 1400);
  }

  function glows(root) {
    if (reduceMotion) return;
    for (let k = 0; k < 18; k++) {
      root.append(h('span', { class: 'glow', style: `left:${Math.random() * 100}%;animation-duration:${6 + Math.random() * 6}s;animation-delay:${Math.random() * 6}s;${k % 3 === 0 ? 'background:var(--rose);box-shadow:0 0 12px var(--rose)' : ''}` }));
    }
  }

  function finalMedia() {
    const F = D.finale;
    const L = F.letter;
    const media = h('div', { class: 'fin-media' });
    const letter = h('article', { class: 'letter' },
      h('p', { class: 'letter-to', text: L.to }),
      h('p', { class: 'letter-body', text: L.body }),
      h('p', { class: 'letter-from', text: L.from }));
    media.append(letter);
    if (F.video) {
      const v = h('video', { controls: true, playsinline: true, preload: 'metadata' });
      v.addEventListener('loadedmetadata', () => media.classList.add('has-video'));
      v.addEventListener('error', () => { media.classList.remove('has-video'); v.remove(); });
      v.src = F.video;
      media.prepend(v);
    }
    const replay = h('button', { class: 'fin-replay', type: 'button', text: '처음부터 다시 보기' });
    replay.addEventListener('click', () => { store.clear(); document.querySelector('.fin-hint')?.remove(); showTitle(); });
    const wrap = h('div', { class: 'fin-screen' },
      h('p', { class: 'fin-who', text: `HAPPY BIRTHDAY · ${D.meta.birthday}` }),
      media,
      replay);
    glows(wrap);
    return wrap;
  }

  /* =========================================================
     Boot — 개발용 바로가기: index.html#ch5, #secret, #error, #final
     ========================================================= */
  function boot() {
    const hash = (location.hash || '').slice(1).toLowerCase();
    let f = -1;
    const m = hash.match(/^ch(\d+)$/);
    if (m) f = flow.findIndex((x) => x.ch && x.ch.no === Number(m[1]));
    else if (hash === 'secret') f = flow.findIndex((x) => x.kind === 'secret');
    else if (hash === 'error') f = flow.findIndex((x) => x.kind === 'special');
    else if (hash === 'final') f = flow.findIndex((x) => x.kind === 'finale');
    if (f >= 0) { ppong.setMet(ppongFlowIndex >= 0 && f > ppongFlowIndex); goTo(f, 0, false); }
    else showTitle();
  }
  boot();
})();
