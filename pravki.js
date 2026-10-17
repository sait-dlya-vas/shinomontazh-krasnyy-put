// Варианты цвета кнопками (приём №14 из копилки): три палитры каркаса, выбор – параметром ?pal= в адресе.
// Подключается ДО Vibe.mount: движок читает цвета секций (data-v-drift) один раз при запуске.
(function () {
  var P = {
    a: { name: 'Янтарь', c: '#0b0d11', s: '#141821', i: '#f1ede4', is: '#9d9a92', a: '#f2a93b', ai: '#16110a', sh: '4 6 12', acc: '242 169 59', cr: '11 13 17', d1: '#0e1219', d2: '#0d1016' },
    b: { name: 'Натрий', c: '#0d0b09', s: '#181310', i: '#f4eee4', is: '#a69c8e', a: '#ff7a2f', ai: '#1a0b03', sh: '6 4 2', acc: '255 122 47', cr: '13 11 9', d1: '#140f0b', d2: '#110d0a' },
    v: { name: 'Хром', c: '#0a0e14', s: '#131a24', i: '#eef2f6', is: '#95a3b3', a: '#cfdae6', ai: '#0a0e14', sh: '3 6 12', acc: '207 218 230', cr: '10 14 20', d1: '#0d121a', d2: '#0c1118' }
  };
  var page = document.querySelector('.v-page');
  if (!page) return;
  var base = page.getAttribute('data-pal') || 'a';
  var m = /[?&]pal=([abv])/.exec(location.search);
  var cur = m ? m[1] : base;

  if (cur !== base) {
    var p = P[cur], st = page.style;
    st.setProperty('--v-canvas', p.c); st.setProperty('--v-surface', p.s);
    st.setProperty('--v-ink', p.i); st.setProperty('--v-ink-soft', p.is);
    st.setProperty('--v-accent', p.a); st.setProperty('--v-accent-ink', p.ai);
    st.setProperty('--v-shadow-color', p.sh); st.setProperty('--acc-rgb', p.acc); st.setProperty('--canvas-rgb', p.cr);
    document.documentElement.style.background = p.c;
    var acts = page.querySelectorAll('[data-v-drift]'), first = acts.length ? acts[0].getAttribute('data-v-drift') : '';
    acts.forEach(function (el) {
      var v = el.getAttribute('data-v-drift');
      el.setAttribute('data-v-drift', v === first ? p.c : (el.id === 'sezon' ? p.d1 : p.d2));
    });
  }

  // В автоматической съёмке (скриншоты, ролик) панель не показываем – она только для живого владельца
  if (!(navigator.webdriver || location.hostname === "127.0.0.1")) (function () {
  var box = document.createElement('div');
  box.className = 'demo-pal'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Варианты цвета сайта');
  box.appendChild(document.createTextNode('Цвет'));
  Object.keys(P).forEach(function (k) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-pressed', String(k === cur)); b.title = 'Вариант «' + P[k].name + '»';
    b.style.setProperty('--sw', P[k].a); b.style.setProperty('--bg', P[k].c);
    b.innerHTML = '<i aria-hidden="true"></i><span>' + P[k].name + '</span>';
    b.addEventListener('click', function () {
      if (k === cur) return;
      var q = location.search.replace(/[?&]pal=[abv]/, '').replace(/^&/, '?');
      q = k === base ? q : (q ? q + '&' : '?') + 'pal=' + k;
      history.replaceState(null, '', location.pathname + q + location.hash);
      location.reload();
    });
    box.appendChild(b);
  });
  page.appendChild(box);

  // На телефоне панель видна только в начале и в конце страницы, чтобы не закрывать текст
  function place() {
    var e = document.documentElement, y = window.scrollY, end = e.scrollHeight - innerHeight - 400;
    box.classList.toggle("is-away", y > innerHeight * 0.6 && y < end);
  }
  window.addEventListener("scroll", place, { passive: true }); place();
  })();

  // Тире не переносится в начало строки: движок делит кинетические заголовки по словам (и превращает &nbsp; в пробел),
  // причём не сразу, а когда заголовок появляется. Ждём разбора и склеиваем «слово –» в одну неразрывную группу.
  function glue(el) {
    var ks = [].filter.call(el.children, function (c) { return c.classList.contains("v-k"); });
    if (!ks.length) return false;
    ks.forEach(function (k, i) {
      if (i === 0 || k.textContent.trim() !== "–") return;
      var prev = ks[i - 1], w = document.createElement("span");
      w.style.whiteSpace = "nowrap";
      prev.parentNode.insertBefore(w, prev); w.appendChild(prev);
      if (w.nextSibling && w.nextSibling.nodeType === 3) w.appendChild(w.nextSibling);
      w.appendChild(k);
    });
    if (el.__vk && el.__vk.regroup) el.__vk.regroup();
    return true;
  }
  var pending = [].filter.call(document.querySelectorAll("[data-v-kinetic]"), function (el) { return / – /.test(el.textContent.replace(/\s+/g, " ")); });
  (function tick() {
    pending = pending.filter(function (el) { return !glue(el); });
    if (pending.length) requestAnimationFrame(tick);
  })();
})();
