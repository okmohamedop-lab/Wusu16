(() => {
'use strict';

/* ============================== أدوات DOM ============================== */
const $ = (s, r = document) => r.querySelector(s);
const add = (el, kids) => { for (const k of kids.flat(Infinity)) { if (k == null || k === false) continue; el.append(k.nodeType ? k : document.createTextNode(String(k))); } return el; };
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') { for (const [p, val] of Object.entries(v)) p.startsWith('--') ? el.style.setProperty(p, val) : (el.style[p] = val); }
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  return add(el, kids);
}
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  arrowL: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  list: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  gamepad: '<path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-3.9 3.2L1.5 15a3 3 0 0 0 5 2.6L8.5 16h7l2 1.6a3 3 0 0 0 5-2.6l-1.3-6.8A4 4 0 0 0 17.3 5z"/>',
  console: '<rect x="3" y="4" width="18" height="12" rx="2.5"/><path d="M8 20h8M12 16v4"/><circle cx="12" cy="10" r="2.6"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M12 21 8 9l4-6 4 6z"/>',
  crosshair: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.2"/><path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="m10 11 5 3-5 3z"/>',
  film: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M7 3v18M17 3v18M3 8h4M3 12h18M3 16h4M17 8h4M17 16h4"/>',
  cube: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13"/><path d="M12 8H8a2.5 2.5 0 1 1 0-5c2.5 0 4 5 4 5zM12 8h4a2.5 2.5 0 1 0 0-5c-2.5 0-4 5-4 5z"/>',
};
function ic(name, cls) {
  const t = document.createElement('template');
  t.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${P[name] || ''}</svg>`;
  return t.content.firstElementChild;
}
const LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4b5c"/><stop offset="1" stop-color="#ff9a4a"/></linearGradient></defs><rect width="64" height="64" rx="17" fill="#141829"/><path d="M12 38a20 20 0 0 1 40 0z" fill="url(#lg)"/><rect x="10" y="43" width="44" height="4" rx="2" fill="#f3f4f8"/><rect x="18" y="50" width="28" height="3" rx="1.5" fill="#f3f4f8" opacity=".45"/></svg>';
const svgFromString = (s) => { const t = document.createElement('template'); t.innerHTML = s; return t.content.firstElementChild; };

/* ============================== الحالة والـ API ============================== */
const S = { cfg: { siteName: 'أفق ستور' }, me: { user: null }, cats: [], catMap: {}, path: '/', tok: 0, refresh: null, timeOff: 0, modals: 0, timers: [] };

async function api(path, o = {}) {
  const r = await fetch('/api' + path, {
    method: o.method || 'GET', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
    body: o.body ? JSON.stringify(o.body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(j.message || 'حدث خطأ غير متوقع.'); e.status = r.status; e.data = j;
    if (r.status === 403 && j.error === 'banned') { S.me.ban = j.ban; route(); }
    if (r.status === 401 && S.me.user) { S.me = { user: null }; route(); }
    throw e;
  }
  return j;
}

/* ============================== تنسيقات ============================== */
const money = (c) => '$' + (c / 100).toFixed(2);
const p2 = (n) => String(n).padStart(2, '0');
const DT = { format: (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}  ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}` };
const fmtDT = (t) => h('span', { class: 't-time' }, DT.format(new Date(t)));
const RTF = new Intl.RelativeTimeFormat('ar-u-nu-latn', { numeric: 'auto' });
function ago(t) {
  const s = Math.round((t - Date.now()) / 1000), a = Math.abs(s);
  if (a < 45) return 'الآن';
  if (a < 3600) return RTF.format(Math.round(s / 60), 'minute');
  if (a < 86400) return RTF.format(Math.round(s / 3600), 'hour');
  return RTF.format(Math.round(s / 86400), 'day');
}
const STATUS = {
  awaiting_payment: ['بانتظار الدفع', 'mute'], paid: ['قيد المراجعة', 'warn'], delivered: ['تم التسليم', 'ok'], rejected: ['مرفوض', 'bad'],
};
const statusPill = (s) => { const [t, c] = STATUS[s] || [s, 'mute']; return h('span', { class: 'pill ' + c }, t); };
const catOf = (slug) => S.catMap[slug] || { c1: '#555', c2: '#999', glyph: 'gift', name: slug };
const initial = (n) => (n || '?').trim().charAt(0).toUpperCase();
const avatar = (u) => h('div', { class: 'avatar' }, u.picture ? h('img', { src: u.picture, alt: '', referrerpolicy: 'no-referrer', onerror(e) { e.target.remove(); } }) : null, u.picture ? null : initial(u.name));

function toast(msg, kind = 'ok') {
  const t = h('div', { class: 'toast ' + kind }, ic(kind === 'ok' ? 'check' : 'alert'), h('span', null, msg));
  $('#toasts').append(t); setTimeout(() => { t.style.transition = '.3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3200);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('تم النسخ'); }
  catch { const ta = h('textarea', { style: { position: 'fixed', opacity: '0' } }); ta.value = text; document.body.append(ta); ta.select(); try { document.execCommand('copy'); toast('تم النسخ'); } catch { toast('تعذّر النسخ', 'bad'); } ta.remove(); }
}

/* ============================== النوافذ المنبثقة ============================== */
function sheet(children, { center = false, onClose } = {}) {
  const ov = h('div', { class: 'ov', onclick: (e) => { if (e.target === ov) close(); } });
  const sh = h('div', { class: 'sheet' + (center ? ' center' : ''), role: 'dialog', 'aria-modal': 'true' }, children);
  ov.append(sh); $('#modal-root').append(ov);
  S.modals++; document.body.style.overflow = 'hidden';
  const key = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', key);
  let closed = false;
  function close() { if (closed) return; closed = true; ov.remove(); document.removeEventListener('keydown', key); if (--S.modals <= 0) { S.modals = 0; document.body.style.overflow = ''; } onClose && onClose(); }
  const f = sh.querySelector('input,textarea,select'); if (f) setTimeout(() => f.focus(), 60);
  return { close, el: sh };
}
function busy(btn, on, label) {
  if (on) { btn._html = [...btn.childNodes]; btn.disabled = true; btn.replaceChildren(h('span', { class: 'spin' })); }
  else { btn.disabled = false; btn.replaceChildren(...(btn._html || [label])); }
}

/* ---------- تسجيل الدخول ---------- */
function loginSheet(next) {
  next = next || '/';
  const go = () => { location.href = '/auth/login?next=' + encodeURIComponent(next); };
  const kids = [
    h('div', { class: 'hero-ico' }, ic('lock')),
    h('h3', null, 'سجّل دخولك للمتابعة'),
    h('p', { class: 'sub' }, 'نستخدم Whop لتسجيل الدخول بأمان. حسابك وطلباتك تُحفظ وتجدها كما هي عند عودتك.'),
    h('button', { class: 'whop-btn', onclick: go, disabled: !S.cfg.loginReady }, ic('shield'), 'المتابعة عبر Whop'),
  ];
  if (!S.cfg.loginReady) kids.push(h('p', { class: 'fine' }, 'تسجيل الدخول غير مهيأ بعد على الخادم.'));
  if (S.cfg.dev) {
    const em = h('input', { class: 'inp', placeholder: 'user@example.com', value: 'user@example.com', dir: 'ltr' });
    kids.push(h('div', { class: 'divider' }), h('div', { class: 'fld' }, h('label', null, 'دخول تجريبي (وضع التطوير فقط)'), em),
      h('button', { class: 'btn btn-ghost', style: { width: '100%' }, onclick: () => { location.href = '/dev/login?email=' + encodeURIComponent(em.value) + '&next=' + encodeURIComponent(next); } }, 'دخول تجريبي'));
  }
  kids.push(h('p', { class: 'fine' }, 'بالمتابعة فأنت توافق على شروط الاستخدام.'));
  return sheet(kids, { center: true });
}
function accountSheet() {
  const u = S.me.user; if (!u) return loginSheet(S.path);
  const s = sheet([
    h('div', { class: 'u-head', style: { marginBottom: '18px' } }, avatar(u), h('div', null, h('h2', null, u.name), h('small', null, u.email))),
    u.isAdmin ? h('p', { class: 'sub' }, 'أنت مسجّل كمدير للمتجر.') : null,
    h('button', { class: 'btn btn-ghost', style: { width: '100%' }, onclick: async () => { await api('/logout', { method: 'POST' }); location.href = '/'; } }, ic('logout'), 'تسجيل الخروج'),
  ]);
}

/* ============================== الهيكل ============================== */
function header() {
  const u = S.me.user, adm = u && u.isAdmin, p = S.path;
  const links = adm ? [['/admin', 'المستخدمون', p === '/admin' || p.startsWith('/admin/users')], ['/admin/orders', 'الطلبات', p.startsWith('/admin/orders')]]
    : [['/', 'الرئيسية', p === '/' || p.startsWith('/c/')], ['/orders', 'الاستلام', p.startsWith('/orders')]];
  return h('header', { class: 'top' }, h('div', { class: 'wrap' },
    h('a', { class: 'logo', href: adm ? '#/admin' : '#/', 'aria-label': S.cfg.siteName }, svgFromString(LOGO), h('div', null, h('b', null, S.cfg.siteName), h('small', null, 'OFOQ'))),
    h('nav', { class: 'nav-links' }, links.map(([to, t, on]) => h('a', { href: '#' + to, class: on ? 'on' : '', onclick: (e) => guard(e, to) }, t, to.endsWith('orders') ? h('span', { class: 'badge js-badge', style: { display: 'none', marginInlineStart: '8px' } }) : null))),
    h('div', { class: 'spacer' }),
    adm ? h('span', { class: 'tag-admin' }, 'مدير') : null,
    u ? h('button', { class: 'chip-user', onclick: accountSheet, 'aria-label': 'الحساب' }, h('span', null, u.name), avatar(u))
      : h('button', { class: 'btn btn-primary btn-sm', onclick: () => loginSheet(S.path) }, 'تسجيل الدخول')));
}
function guard(e, to) { if (!S.me.user && to !== '/') { e.preventDefault(); loginSheet(to); } }
function bnav() {
  const u = S.me.user, adm = u && u.isAdmin, p = S.path;
  const items = adm
    ? [['/admin', 'users', 'المستخدمون', p === '/admin' || p.startsWith('/admin/users')], ['/admin/orders', 'list', 'الطلبات', p.startsWith('/admin/orders')]]
    : [['/', 'home', 'الرئيسية', p === '/' || p.startsWith('/c/')], ['/orders', 'box', 'الاستلام', p.startsWith('/orders')]];
  return h('nav', { class: 'bnav', 'aria-label': 'التنقل' }, h('div', { class: 'in' },
    items.map(([to, i, t, on]) => h('a', { href: '#' + to, class: on ? 'on' : '', onclick: (e) => guard(e, to) }, ic(i), t, to.endsWith('orders') ? h('span', { class: 'badge js-badge', style: { display: 'none' } }) : null)),
    h('button', { onclick: accountSheet }, ic('user'), u ? 'حسابي' : 'دخول')));
}
function setBadge(n) { document.querySelectorAll('.js-badge').forEach(b => { b.textContent = n; b.style.display = n > 0 ? '' : 'none'; }); }
async function refreshBadge() {
  const u = S.me.user; if (!u) return setBadge(0);
  try {
    if (u.isAdmin) setBadge((await api('/admin/summary')).pending);
    else setBadge((await api('/orders')).orders.filter(o => o.status === 'paid').length);
  } catch { /* تجاهل */ }
}
function shell(main) {
  const root = $('#root');
  root.replaceChildren(header(), h('main', { id: 'view' }, main), bnav());
  refreshBadge();
}
const setView = (...kids) => { const v = $('#view'); if (v) v.replaceChildren(...kids.flat()); };
const wrap = (...kids) => h('div', { class: 'wrap' }, kids);
const skeleton = (n = 4) => h('div', { class: 'list' }, Array.from({ length: n }, () => h('div', { class: 'skel' })));

/* ============================== الصفحة الرئيسية ============================== */
function catTile(c) {
  return h('button', { class: 'cat reveal', style: { '--c1': c.c1, '--c2': c.c2 }, onclick: () => { if (!S.me.user) loginSheet('/c/' + c.slug); else location.hash = '#/c/' + c.slug; }, 'aria-label': c.nameAr },
    h('div', { class: 'art' }, ic(c.glyph)),
    h('div', { class: 'meta' }, h('h3', null, c.nameAr), h('p', null, c.name + ' · ' + c.count + ' فئات')),
    h('div', { class: 'from' }, h('span', null, 'ابتداءً من ', h('b', { class: 'num' }, money(c.from))), h('span', { class: 'arrow' }, ic('arrowL'))));
}
function viewHome() {
  const cats = S.cats, total = cats.reduce((a, c) => a + c.count, 0);
  const demo = [['c1', cats[0], 'R$100'], ['c2', cats[1], '$25'], ['c3', cats[5] || cats[2], '$20']];
  setView(wrap(
    h('section', { class: 'hero' },
      h('div', null,
        h('span', { class: 'eyebrow' }, h('i'), 'تسليم يدوي موثّق خلال 24 ساعة'),
        h('h1', null, 'بطاقات الألعاب والاشتراكات الرقمية، ', h('em', null, 'بأسعار واضحة وتجربة بلا تعقيد')),
        h('p', { class: 'lead' }, 'اختر القسم، ادفع بأمان عبر Whop، وتابع طلبك لحظة بلحظة من صفحة «الاستلام». كل ما تحتاجه من بطاقات PlayStation وXbox وNetflix وغيرها في مكان واحد.'),
        h('div', { class: 'hero-cta' },
          h('a', { class: 'btn btn-primary btn-lg', href: '#cats', onclick: (e) => { e.preventDefault(); $('#cats').scrollIntoView({ behavior: 'smooth' }); } }, 'تصفّح الأقسام', ic('arrowL')),
          S.me.user ? null : h('button', { class: 'btn btn-ghost btn-lg', onclick: () => loginSheet('/') }, 'تسجيل الدخول')),
        h('div', { class: 'stats' },
          h('div', null, h('b', null, cats.length), h('span', null, 'أقسام رئيسية')),
          h('div', null, h('b', null, total), h('span', null, 'فئة متاحة')),
          h('div', null, h('b', null, '24h'), h('span', null, 'مدة التسليم')))),
      h('div', { class: 'stack', 'aria-hidden': 'true' }, demo.map(([k, c, amt]) => c && h('div', { class: 'gcard ' + k, style: { background: `linear-gradient(135deg,${c.c1},${c.c2})` } },
        h('div', { class: 'g-top' }, h('span', null, c.name), ic(c.glyph)), h('div', { class: 'g-amt' }, amt))))),
    h('section', { class: 'sec', id: 'cats' },
      h('div', { class: 'sec-h' }, h('div', null, h('h2', null, 'اختر القسم'), h('p', null, 'سجّل دخولك مرة واحدة وابدأ الشراء.'))),
      h('div', { class: 'cats' }, cats.map(catTile))),
    h('section', { class: 'sec' },
      h('div', { class: 'sec-h' }, h('div', null, h('h2', null, 'كيف تشتري؟'), h('p', null, 'ثلاث خطوات فقط.'))),
      h('div', { class: 'steps' }, [
        ['1', 'سجّل دخولك', 'عبر حساب Whop الخاص بك، بضغطة واحدة وبدون كلمات مرور جديدة.'],
        ['2', 'اختر وادفع', 'اختر الفئة التي تريدها وأتمم الدفع من بوابة Whop الآمنة.'],
        ['3', 'استلم طلبك', 'نراجع الطلب ونسلّمه خلال 24 ساعة في صفحة «الاستلام» وعلى بريدك.'],
      ].map(([n, t, d]) => h('div', { class: 'step' }, h('div', { class: 'n' }, n), h('div', null, h('h4', null, t), h('p', null, d)))))),
    h('section', { class: 'sec' },
      h('div', { class: 'sec-h' }, h('div', null, h('h2', null, 'أسئلة شائعة'))),
      h('div', { class: 'faq' }, [
        ['كم يستغرق وصول طلبي؟', 'بعد إتمام الدفع يصبح الطلب «قيد المراجعة»، ويتم تجهيزه وتسليمه خلال 24 ساعة كحد أقصى.'],
        ['أين أجد البطاقة أو الكود؟', 'في صفحة «الاستلام» داخل حسابك بمجرد قبول الطلب، ونرسل لك نسخة إلى بريدك الإلكتروني أيضاً.'],
        ['ماذا لو رُفض طلبي؟', 'ستظهر لك رسالة الرفض وسببه (إن وُجد) في صفحة «الاستلام»، ويُعاد المبلغ إليك.'],
        ['هل بياناتي ودفعي آمنان؟', 'الدفع يتم بالكامل عبر Whop، ولا نحتفظ ببيانات بطاقتك البنكية إطلاقاً.'],
      ].map(([q, a]) => h('details', null, h('summary', null, q), h('p', null, a))))),
    h('footer', { class: 'foot' }, h('p', null, '© ' + new Date().getFullYear() + ' ' + S.cfg.siteName + ' — جميع الحقوق محفوظة'), h('p', null, 'جميع أسماء المنتجات والعلامات التجارية ملك لأصحابها، وهذا المتجر غير تابع لها أو معتمد منها.'))));
}

/* ============================== صفحة القسم ============================== */
async function viewCategory(slug, tok) {
  if (!S.me.user) { viewHome(); loginSheet('/c/' + slug); return; }
  setView(wrap(h('div', { class: 'page-h' }, h('div', { class: 'skel', style: { width: '54px', height: '54px' } })), h('div', { class: 'denoms' }, Array.from({ length: 6 }, () => h('div', { class: 'skel', style: { height: '190px' } })))));
  let d; try { d = await api('/catalog/' + slug); } catch (e) { if (tok !== S.tok) return; toast(e.message, 'bad'); location.hash = '#/'; return; }
  if (tok !== S.tok) return;
  let sel = d.items[0];
  const total = h('b', { class: 'num' }, money(sel.price)), selName = h('span', { class: 'sel-name' }, d.name + ' · ' + sel.label);
  const cards = d.items.map((it, i) => {
    const el = h('button', { class: 'denom reveal' + (i === 0 ? ' sel' : ''), style: { '--c1': d.c1, '--c2': d.c2, animationDelay: i * 40 + 'ms' }, 'aria-pressed': i === 0 ? 'true' : 'false', onclick: () => {
      sel = it; cards.forEach(c => { c.classList.remove('sel'); c.setAttribute('aria-pressed', 'false'); }); el.classList.add('sel'); el.setAttribute('aria-pressed', 'true');
      total.textContent = money(it.price); selName.textContent = d.name + ' · ' + it.label;
    } },
      h('span', { class: 'tick' }, ic('check')),
      h('div', { class: 'art' }, ic(d.glyph, 'ghost'), h('div', { class: 'big' }, it.big), h('div', { class: 'unit' }, it.unit)),
      h('div', { class: 'info' }, h('span', { class: 'lb' }, it.label), h('span', { class: 'pr' }, money(it.price))));
    return el;
  });
  const buy = h('button', { class: 'btn btn-primary btn-lg' }, 'اشترِ الآن', ic('arrowL'));
  buy.onclick = async () => {
    busy(buy, true);
    try {
      const r = await api('/orders', { method: 'POST', body: { category: d.slug, item: sel.id } });
      sheet([h('div', { class: 'hero-ico' }, ic('shield')), h('h3', null, 'جارٍ تحويلك إلى الدفع الآمن'), h('p', { class: 'sub' }, 'لحظات وتفتح بوابة Whop لإتمام الدفع…'), h('div', { class: 'spin', style: { margin: '6px auto 0', borderColor: 'rgba(255,255,255,.2)', borderTopColor: '#fff', width: '26px', height: '26px' } })], { center: true });
      setTimeout(() => { location.href = r.checkoutUrl; }, 500);
    } catch (e) { busy(buy, false, 'اشترِ الآن'); toast(e.message, 'bad'); }
  };
  setView(wrap(
    h('div', { class: 'page-h' },
      h('button', { class: 'icon-btn', onclick: () => { location.hash = '#/'; }, 'aria-label': 'رجوع' }, ic('arrowR')),
      h('div', { class: 'ico', style: { '--c1': d.c1, '--c2': d.c2 } }, ic(d.glyph)),
      h('div', null, h('h1', null, d.nameAr), h('p', null, d.blurb + ' · تسليم خلال 24 ساعة'))),
    d.note ? h('div', { class: 'notice' }, ic('info'), h('span', null, d.note)) : null,
    h('div', { class: 'sec-h', style: { marginBottom: '12px' } }, h('h2', { style: { fontSize: '18px' } }, 'اختر المبلغ')),
    h('div', { class: 'denoms' }, cards)),
    h('div', { class: 'buybar' }, h('div', { class: 'in' }, h('div', { class: 'tot' }, h('small', null, 'الإجمالي'), total, selName), buy)));
}

/* ============================== الاستلام (طلبات العميل) ============================== */
function orderCard(o) {
  const c = catOf(o.categorySlug);
  const kids = [
    h('div', { class: 'ord-h' }, h('div', { class: 'ico', style: { '--c1': c.c1, '--c2': c.c2 } }, ic(c.glyph)),
      h('div', { class: 'grow' }, h('h3', null, o.categoryName + ' — ' + o.itemLabel), h('div', { class: 'id' }, '#' + o.id)), statusPill(o.status)),
    h('div', { class: 'kv' },
      h('div', null, h('small', null, 'السعر'), h('b', { class: 'num' }, money(o.priceCents))),
      h('div', null, h('small', null, 'وقت الطلب'), h('b', null, fmtDT(o.createdAt))),
      h('div', { class: 'wide' }, h('small', null, 'البريد الإلكتروني'), h('b', { dir: 'ltr', style: { textAlign: 'start' } }, o.email)),
      o.paidAt ? h('div', null, h('small', null, 'وقت الدفع'), h('b', null, fmtDT(o.paidAt))) : null,
      o.reviewedAt ? h('div', null, h('small', null, 'وقت المعالجة'), h('b', null, fmtDT(o.reviewedAt))) : null),
  ];
  if (o.status === 'awaiting_payment') {
    kids.push(h('div', { class: 'msg info' }, ic('info'), h('span', null, 'لم يكتمل الدفع لهذا الطلب بعد. أكمل الدفع ليبدأ تجهيزه.')),
      h('div', { class: 'row-actions' },
        o.checkoutUrl ? h('a', { class: 'btn btn-primary btn-sm', href: o.checkoutUrl }, 'إكمال الدفع') : null,
        h('button', { class: 'btn btn-ghost btn-sm', onclick: async () => { await api('/orders/' + o.id + '/cancel', { method: 'POST' }); toast('تم إلغاء الطلب'); loadOrders(); } }, 'إلغاء الطلب')));
  } else if (o.status === 'paid') {
    kids.push(h('div', { class: 'msg warn' }, ic('clock'), h('span', null, 'تم الدفع بنجاح ✓ طلبك الآن ', h('b', null, 'قيد المراجعة'), '، يرجى الانتظار حتى 24 ساعة ليتم تجهيزه وإرساله إليك هنا وعلى بريدك الإلكتروني.')));
  } else if (o.status === 'delivered') {
    kids.push(h('div', { class: 'msg ok' }, ic('check'), h('span', null, 'تم قبول طلبك! هذه هي بيانات منتجك، ونسخة منها أُرسلت إلى بريدك الإلكتروني.')),
      h('div', { class: 'deliv' }, h('button', { class: 'btn btn-ghost btn-sm cp', onclick: () => copy(o.delivery), 'aria-label': 'نسخ' }, ic('copy')), o.delivery));
  } else if (o.status === 'rejected') {
    kids.push(h('div', { class: 'msg bad' }, ic('alert'), h('span', null, 'تم رفض طلبك.', o.rejectReason ? [h('br'), 'السبب: ' + o.rejectReason] : null,
      o.refund && o.refund.status === 'refunded' ? [h('br'), 'تم استرداد المبلغ إلى وسيلة الدفع الخاصة بك.'] : [h('br'), 'إن كنت قد دفعت، سيتم التواصل معك لإعادة المبلغ.'])));
  }
  return h('article', { class: 'ord reveal' }, kids);
}
let lastStatuses = {};
async function loadOrders(tok) {
  const box = $('#ordbox'); if (!box) return;
  try {
    const { orders } = await api('/orders');
    if (tok != null && tok !== S.tok) return;
    orders.forEach(o => { const was = lastStatuses[o.id]; if (was && was !== o.status && (o.status === 'delivered' || o.status === 'rejected')) toast(o.status === 'delivered' ? 'تم قبول أحد طلباتك — بيانات المنتج جاهزة!' : 'تم تحديث حالة أحد طلباتك', o.status === 'delivered' ? 'ok' : 'bad'); lastStatuses[o.id] = o.status; });
    setBadge(orders.filter(o => o.status === 'paid').length);
    box.replaceChildren(...(orders.length ? orders.map(orderCard) : [h('div', { class: 'empty' }, h('div', { class: 'em-ico' }, ic('box')), h('h3', null, 'لا توجد طلبات بعد'), h('p', null, 'عندما تشتري شيئاً سيظهر طلبك هنا مع حالته وبيانات المنتج.'), h('a', { class: 'btn btn-primary', href: '#/' }, 'ابدأ التسوق'))]));
    return orders;
  } catch (e) { if (e.status !== 401 && e.status !== 403) toast(e.message, 'bad'); }
}
async function viewOrders(query, tok) {
  if (!S.me.user) { viewHome(); loginSheet('/orders'); return; }
  setView(wrap(h('div', { class: 'page-h' }, h('div', null, h('h1', null, 'الاستلام'), h('p', null, 'طلباتك وحالتها وبيانات المنتجات المستلمة'))), h('div', { class: 'orders', id: 'ordbox' }, skeleton(2))));
  const orders = await loadOrders(tok);
  if (tok !== S.tok) return;
  S.refresh = () => loadOrders(S.tok);
  const justId = query.get('paid') || query.get('pending');
  if (justId) {
    history.replaceState(null, '', '#/orders');
    let o = orders && orders.find(x => x.id === justId), tries = 0;
    while (o && o.status === 'awaiting_payment' && tries++ < 6) { // قد يتأخر الـ webhook ثوانٍ
      await new Promise(r => setTimeout(r, 3500)); if (tok !== S.tok) return;
      const l = await loadOrders(tok); o = l && l.find(x => x.id === justId);
    }
    if (o && o.status !== 'awaiting_payment') {
      const s = sheet([h('div', { class: 'hero-ico ok' }, ic('check')), h('h3', null, 'تم الدفع بنجاح 🎉'),
        h('p', { class: 'sub' }, 'شكراً لك! استلمنا دفعتك وطلبك الآن «قيد المراجعة». يرجى الانتظار حتى ', h('b', null, '24 ساعة'), ' ليتم تجهيزه، وسيصلك على صفحة «الاستلام» وعلى بريدك الإلكتروني.'),
        h('button', { class: 'btn btn-primary', style: { width: '100%' }, onclick: () => s.close() }, 'حسناً')], { center: true });
    } else if (o) toast('لم نستلم تأكيد الدفع بعد. إن كنت قد دفعت فسيظهر طلبك قريباً.', 'bad');
  }
}

/* ============================== شاشة الحظر ============================== */
function viewBan(ban) {
  const perm = ban.type === 'perm';
  const cells = ['d', 'h', 'm', 's'].map((k, i) => h('div', null, h('b', { id: 't' + k }, '00'), h('span', null, ['يوم', 'ساعة', 'دقيقة', 'ثانية'][i])));
  $('#root').replaceChildren(h('div', { class: 'ban' }, h('div', { class: 'card reveal' },
    h('div', { class: 'ico' }, ic(perm ? 'ban' : 'pause')),
    h('h1', null, perm ? 'تم تبنيد حسابك' : 'حسابك موقوف مؤقتاً'),
    h('p', null, perm ? 'لم يعد بإمكانك استخدام هذا الحساب.' : 'سيُرفع الإيقاف تلقائياً عند انتهاء المؤقّت.'),
    ban.reason ? h('div', { class: 'reason' }, h('small', null, 'السبب'), ban.reason) : null,
    perm ? null : h('div', { class: 'timer' }, cells),
    h('button', { class: 'btn btn-ghost', style: { width: '100%', marginTop: '10px' }, onclick: async () => { await api('/logout', { method: 'POST' }).catch(() => {}); location.href = '/'; } }, ic('logout'), 'تسجيل الخروج'))));
  if (perm) return;
  const tick = () => {
    let s = Math.max(0, Math.floor((ban.until - (Date.now() + S.timeOff)) / 1000));
    if (s <= 0) { clearInterval(iv); init(); return; }
    const d = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sc = s % 60;
    [['d', d], ['h', hh], ['m', m], ['s', sc]].forEach(([k, v]) => { const el = $('#t' + k); if (el) el.textContent = p2(v); });
  };
  const iv = setInterval(tick, 1000); S.timers.push(iv); tick();
}

/* ============================== لوحة الأدمن ============================== */
function adminHead(title, sub, back) {
  return h('div', { class: 'adm-top' },
    back ? h('button', { class: 'icon-btn', onclick: () => { location.hash = '#' + back; }, 'aria-label': 'إغلاق' }, ic('x')) : null,
    h('div', null, h('h1', null, title), sub ? h('p', null, sub) : null));
}
const userStateBadges = (u) => [
  u.ban ? h('span', { class: 'pill ' + (u.ban.type === 'perm' ? 'bad' : 'warn') }, u.ban.type === 'perm' ? 'محظور' : 'موقوف مؤقتاً') : null,
  u.pending ? h('span', { class: 'pill warn' }, u.pending + ' قيد المراجعة') : (u.orders ? h('span', { class: 'pill mute' }, u.orders + (u.orders === 1 ? ' طلب' : ' طلبات')) : null),
];
async function viewAdminUsers(tok) {
  let q = '', timer;
  const listBox = h('div', { class: 'list' }, skeleton(4));
  const kpis = h('div', { class: 'kpis' });
  const load = async () => {
    try {
      const [{ users }, sm] = await Promise.all([api('/admin/users?q=' + encodeURIComponent(q)), api('/admin/summary')]);
      if (tok !== S.tok) return;
      setBadge(sm.pending);
      kpis.replaceChildren(
        h('div', { class: 'kpi' }, h('small', null, 'المستخدمون'), h('b', null, sm.users)),
        h('div', { class: 'kpi' + (sm.pending ? ' hot' : '') }, h('small', null, 'طلبات قيد المراجعة'), h('b', null, sm.pending)),
        h('div', { class: 'kpi' }, h('small', null, 'تم تسليمها'), h('b', null, sm.delivered)),
        h('div', { class: 'kpi' }, h('small', null, 'مرفوضة'), h('b', null, sm.rejected)));
      listBox.replaceChildren(...(users.length ? users.map(u => h('button', { class: 'row reveal', onclick: () => { location.hash = '#/admin/users/' + u.id; } },
        avatar(u), h('div', { class: 'grow' }, h('b', null, u.name), h('small', null, u.email)), h('div', { class: 'side' }, userStateBadges(u)))) :
        [h('div', { class: 'empty' }, h('div', { class: 'em-ico' }, ic('users')), h('h3', null, q ? 'لا نتائج' : 'لا يوجد مستخدمون بعد'), h('p', null, q ? 'جرّب كلمة بحث أخرى.' : 'سيظهر هنا كل من يسجّل الدخول إلى المتجر.'))]));
    } catch (e) { toast(e.message, 'bad'); }
  };
  const inp = h('input', { class: 'inp', placeholder: 'ابحث بالاسم أو البريد…', oninput: () => { clearTimeout(timer); timer = setTimeout(() => { q = inp.value.trim(); load(); }, 250); }, 'aria-label': 'بحث' });
  setView(wrap(adminHead('المستخدمون', 'كل من سجّل الدخول إلى المتجر'), kpis, h('div', { class: 'search' }, ic('search'), inp), listBox));
  S.refresh = () => { if (document.activeElement !== inp) load(); };
  load();
}

function banSheet(user, mode, done) {
  const reason = h('textarea', { class: 'txt', placeholder: 'اكتب سبب الإجراء ليظهر للمستخدم…', maxlength: '400', style: { minHeight: '90px' } });
  const amount = h('input', { class: 'inp', type: 'number', min: '1', value: '1', inputmode: 'numeric' });
  const unit = h('select', { class: 'slct' }, h('option', { value: '1' }, 'دقيقة'), h('option', { value: '60' }, 'ساعة'), h('option', { value: '1440', selected: '' }, 'يوم'));
  const send = async (btn, withReason) => {
    const body = { mode, reason: withReason ? reason.value.trim() : '' };
    if (mode === 'temp') { body.minutes = Math.floor(Number(amount.value) * Number(unit.value)); if (!(body.minutes >= 1)) return toast('أدخل مدة صحيحة', 'bad'); }
    busy(btn, true);
    try { await api('/admin/users/' + user.id + '/ban', { method: 'POST', body }); s.close(); toast(mode === 'temp' ? 'تم إيقاف الحساب مؤقتاً' : 'تم تبنيد الحساب'); done(); }
    catch (e) { busy(btn, false, 'إرسال'); toast(e.message, 'bad'); }
  };
  const main = h('button', { class: 'btn ' + (mode === 'perm' ? 'btn-danger' : 'btn-warn'), onclick: (e) => send(e.currentTarget, true) }, mode === 'perm' ? 'تبنيد' : 'إرسال');
  const skip = mode === 'perm' ? h('button', { class: 'btn btn-ghost', onclick: (e) => send(e.currentTarget, false) }, 'تخطي (بدون سبب)') : null;
  const s = sheet([
    h('div', { class: 'hero-ico', style: { background: mode === 'perm' ? 'linear-gradient(135deg,#fb7185,#f43f5e)' : 'linear-gradient(135deg,#fbbf24,#f59e0b)' } }, ic(mode === 'perm' ? 'ban' : 'pause')),
    h('h3', { style: { textAlign: 'center' } }, mode === 'perm' ? 'تبنيد الحساب نهائياً' : 'إيقاف الحساب مؤقتاً'),
    h('p', { class: 'sub', style: { textAlign: 'center' } }, user.name + ' — ' + user.email),
    mode === 'temp' ? h('div', { class: 'two' }, h('div', { class: 'fld' }, h('label', null, 'المدة'), amount), h('div', { class: 'fld' }, h('label', null, 'الوحدة'), unit)) : null,
    h('div', { class: 'fld' }, h('label', null, mode === 'perm' ? 'السبب (اختياري)' : 'السبب'), reason),
    h('div', { class: 'actions' }, skip, main)]);
}
async function viewAdminUser(id, tok) {
  setView(wrap(adminHead('حساب المستخدم', null, '/admin'), skeleton(3)));
  let r; try { r = await api('/admin/users/' + id); } catch (e) { if (tok !== S.tok) return; toast(e.message, 'bad'); location.hash = '#/admin'; return; }
  if (tok !== S.tok) return;
  const { user: u, orders } = r, reload = () => viewAdminUser(id, S.tok);
  const unban = h('button', { class: 'btn btn-ok', disabled: !u.ban, onclick: async (e) => {
    busy(e.currentTarget, true); try { await api('/admin/users/' + id + '/unban', { method: 'POST' }); toast('تم فك الحظر'); reload(); } catch (er) { toast(er.message, 'bad'); busy(e.currentTarget, false, 'فك الحظر'); } } }, ic('unlock'), 'فك الحظر');
  const paidOrders = orders.filter(o => o.status !== 'awaiting_payment');
  setView(wrap(
    adminHead('حساب المستخدم', null, '/admin'),
    h('div', { class: 'panel reveal' },
      h('div', { class: 'u-head' }, avatar(u), h('div', { style: { minWidth: 0 } }, h('h2', null, u.name), h('small', null, u.email))),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' } },
        u.ban ? h('span', { class: 'pill ' + (u.ban.type === 'perm' ? 'bad' : 'warn') }, u.ban.type === 'perm' ? 'محظور نهائياً' : 'موقوف مؤقتاً حتى ' + DT.format(new Date(u.ban.until)).trim()) : h('span', { class: 'pill ok' }, 'نشط'),
        paidOrders.length ? h('span', { class: 'pill ' + (u.pending ? 'warn' : 'info') }, 'قام بطلب (' + paidOrders.length + ')') : h('span', { class: 'pill mute' }, 'لم يقم بأي طلب')),
      u.ban && u.ban.reason ? h('div', { class: 'msg bad', style: { marginTop: '14px' } }, ic('alert'), h('span', null, 'سبب الإجراء: ' + u.ban.reason)) : null,
      h('div', { class: 'kv', style: { marginTop: '14px' } }, h('div', null, h('small', null, 'تاريخ الانضمام'), h('b', null, fmtDT(u.createdAt))), h('div', null, h('small', null, 'آخر دخول'), h('b', null, u.lastLoginAt ? fmtDT(u.lastLoginAt) : '—'))),
      h('div', { class: 'acts' },
        h('button', { class: 'btn btn-danger', onclick: () => banSheet(u, 'perm', reload) }, ic('ban'), 'تبنيد الحساب'),
        h('button', { class: 'btn btn-warn', onclick: () => banSheet(u, 'temp', reload) }, ic('pause'), 'إيقاف مؤقت'),
        unban)),
    h('div', { class: 'panel reveal' }, h('h3', null, ic('list'), 'الطلبات'),
      orders.length ? h('div', { class: 'list' }, orders.map(o => h('button', { class: 'mini-ord', onclick: () => { location.hash = '#/admin/orders/' + o.id + '?back=' + encodeURIComponent('/admin/users/' + id); } },
        h('div', { class: 'grow' }, h('b', null, o.categoryName + ' — ' + o.itemLabel + ' · ', h('span', { class: 'num' }, money(o.priceCents))),
          h('small', null, o.status === 'awaiting_payment' ? 'أُنشئ الطلب: ' : 'تاريخ الطلب: ', fmtDT(o.paidAt || o.createdAt))), statusPill(o.status))))
        : h('p', { style: { color: 'var(--muted)' } }, 'لم يقم هذا المستخدم بأي طلب بعد.'))));
  S.refresh = null;
}

async function viewAdminOrders(query, tok) {
  let f = query.get('f') || 'paid';
  const listBox = h('div', { class: 'list' }, skeleton(3));
  const tabs = h('div', { class: 'tabs' });
  const defs = [['paid', 'قيد المراجعة'], ['delivered', 'تم التسليم'], ['rejected', 'مرفوضة'], ['all', 'الكل']];
  const paintTabs = () => tabs.replaceChildren(...defs.map(([k, t]) => h('button', { class: 'tab' + (f === k ? ' on' : ''), onclick: () => { f = k; paintTabs(); load(); } }, t)));
  const load = async () => {
    try {
      const { orders } = await api('/admin/orders?status=' + f); if (tok !== S.tok) return;
      if (f === 'paid') setBadge(orders.length);
      listBox.replaceChildren(...(orders.length ? orders.map(o => { const c = catOf(o.categorySlug);
        return h('button', { class: 'row reveal', onclick: () => { location.hash = '#/admin/orders/' + o.id + '?back=' + encodeURIComponent('/admin/orders'); } },
          h('div', { class: 'ico ord-ico', style: { '--c1': c.c1, '--c2': c.c2, width: '46px', height: '46px', borderRadius: '14px', background: `linear-gradient(135deg,${c.c1},${c.c2})`, display: 'grid', placeItems: 'center', flex: 'none' } }, h('span', { style: { color: '#fff', display: 'grid' } }, ic(c.glyph))),
          h('div', { class: 'grow' }, h('b', null, o.categoryName + ' — ' + o.itemLabel), h('small', null, o.userName + ' · ' + o.email), h('small', { style: { marginTop: '2px' } }, fmtDT(o.paidAt || o.createdAt))),
          h('div', { class: 'side' }, h('b', { class: 'num', style: { fontSize: '16px' } }, money(o.priceCents)), statusPill(o.status))); })
        : [h('div', { class: 'empty' }, h('div', { class: 'em-ico' }, ic('list')), h('h3', null, 'لا توجد طلبات هنا'), h('p', null, f === 'paid' ? 'لا توجد طلبات بانتظار المراجعة حالياً. 🎉' : 'لا شيء لعرضه في هذا التصنيف.'))]));
    } catch (e) { toast(e.message, 'bad'); }
  };
  paintTabs();
  setView(wrap(adminHead('الطلبات', 'الطلبات المدفوعة وإدارتها'), tabs, listBox));
  S.refresh = load; load();
}

const safeBack = (b, d) => (typeof b === 'string' && /^\/[A-Za-z0-9\-_\/]*$/.test(b)) ? b : d;
async function viewAdminOrder(id, query, tok) {
  const back = safeBack(query.get('back'), '/admin/orders');
  setView(wrap(adminHead('تفاصيل الطلب', null, back), skeleton(3)));
  let o; try { o = (await api('/admin/orders/' + id)).order; } catch (e) { if (tok !== S.tok) return; toast(e.message, 'bad'); location.hash = '#' + back; return; }
  if (tok !== S.tok) return;
  const c = catOf(o.categorySlug), reload = () => viewAdminOrder(id, query, S.tok);
  const blocks = [];
  if (o.status === 'paid') {
    const ta = h('textarea', { class: 'txt', placeholder: 'اكتب هنا المنتج: الكود أو الحساب أو أي بيانات يستلمها العميل…', dir: 'auto', style: { fontFamily: 'ui-monospace,Menlo,Consolas,monospace' } });
    const send = h('button', { class: 'btn btn-ok' }, ic('check'), 'قبول وإرسال');
    send.onclick = async () => {
      if (!ta.value.trim()) return toast('اكتب المنتج أو الكود أولاً', 'bad');
      busy(send, true);
      try { await api('/admin/orders/' + id + '/accept', { method: 'POST', body: { delivery: ta.value } }); toast('تم قبول الطلب وإرساله للعميل'); reload(); }
      catch (e) { busy(send, false); toast(e.message, 'bad'); }
    };
    blocks.push(h('div', { class: 'panel reveal' }, h('h3', null, ic('check'), 'قبول الطلب'), h('div', { class: 'fld' }, ta),
      h('div', { class: 'acts', style: { marginTop: 0 } }, send, h('button', { class: 'btn btn-danger', onclick: () => rejectSheet(o, reload) }, ic('x'), 'رفض الطلب'))));
  } else if (o.status === 'delivered') {
    const mail = `mailto:${encodeURIComponent(o.email)}?subject=${encodeURIComponent('طلبك من ' + S.cfg.siteName + ' #' + o.id)}&body=${encodeURIComponent('مرحباً ' + o.userName + '،\n\nتم قبول طلبك (' + o.categoryName + ' — ' + o.itemLabel + '). هذه بيانات منتجك:\n\n' + o.delivery + '\n\nشكراً لاختيارك ' + S.cfg.siteName + '.')}`;
    blocks.push(h('div', { class: 'panel reveal' }, h('h3', null, ic('check'), 'ما تم إرساله للعميل'),
      h('div', { class: 'deliv' }, h('button', { class: 'btn btn-ghost btn-sm cp', onclick: () => copy(o.delivery), 'aria-label': 'نسخ' }, ic('copy')), o.delivery),
      h('div', { class: 'row-actions', style: { marginTop: '12px' } },
        h('a', { class: 'btn btn-primary btn-sm', href: mail }, ic('mail'), 'إرسال بالبريد'),
        h('button', { class: 'btn btn-ghost btn-sm', onclick: () => copy(o.email) }, ic('copy'), 'نسخ البريد'))));
  } else if (o.status === 'rejected') {
    blocks.push(h('div', { class: 'msg bad reveal' }, ic('alert'), h('span', null, 'تم رفض هذا الطلب.', o.rejectReason ? [h('br'), 'السبب: ' + o.rejectReason] : null,
      o.refund ? [h('br'), o.refund.status === 'refunded' ? 'تم استرداد المبلغ.' : (o.refund.message || 'فشل الاسترداد.')] : [h('br'), 'لم يُطلب استرداد تلقائي.'])));
  }
  setView(wrap(adminHead('تفاصيل الطلب', '#' + o.id, back),
    h('div', { class: 'panel reveal' },
      h('div', { class: 'ord-h', style: { marginBottom: '14px' } }, h('div', { class: 'ico', style: { '--c1': c.c1, '--c2': c.c2 } }, ic(c.glyph)), h('div', { class: 'grow' }, h('h3', null, o.categoryName + ' — ' + o.itemLabel), h('div', { class: 'id num' }, money(o.priceCents))), statusPill(o.status)),
      h('div', { class: 'kv' },
        h('div', null, h('small', null, 'العميل'), h('b', null, o.userName)),
        h('div', null, h('small', null, 'البريد'), h('b', { dir: 'ltr', style: { textAlign: 'start' } }, o.email)),
        h('div', null, h('small', null, 'وقت الطلب'), h('b', null, fmtDT(o.createdAt))),
        h('div', null, h('small', null, 'وقت الدفع'), h('b', null, o.paidAt ? fmtDT(o.paidAt) : '—')),
        o.reviewedAt ? h('div', null, h('small', null, 'وقت المعالجة'), h('b', null, fmtDT(o.reviewedAt))) : null,
        o.paymentId ? h('div', null, h('small', null, 'رقم الدفعة'), h('b', { class: 'num', style: { fontSize: '13px' } }, o.paymentId)) : null),
      h('div', { class: 'row-actions', style: { marginTop: '12px' } }, h('button', { class: 'btn btn-ghost btn-sm', onclick: () => { location.hash = '#/admin/users/' + o.userId; } }, ic('user'), 'فتح حساب العميل'))),
    blocks));
  S.refresh = null;
}
function rejectSheet(o, done) {
  const reason = h('textarea', { class: 'txt', placeholder: 'سبب الرفض (اختياري) — سيظهر للعميل', maxlength: '400', style: { minHeight: '90px' } });
  const refund = h('input', { type: 'checkbox', checked: '' });
  const go = h('button', { class: 'btn btn-danger' }, 'رفض الطلب');
  go.onclick = async () => {
    busy(go, true);
    try { await api('/admin/orders/' + o.id + '/reject', { method: 'POST', body: { reason: reason.value.trim(), refund: refund.checked } }); s.close(); toast('تم رفض الطلب'); done(); }
    catch (e) { busy(go, false, 'رفض الطلب'); toast(e.message, 'bad'); }
  };
  const s = sheet([h('div', { class: 'hero-ico', style: { background: 'linear-gradient(135deg,#fb7185,#f43f5e)' } }, ic('x')), h('h3', { style: { textAlign: 'center' } }, 'رفض الطلب'),
    h('p', { class: 'sub', style: { textAlign: 'center' } }, 'ستصل العميل رسالة الرفض في صفحة «الاستلام».'),
    h('div', { class: 'fld' }, h('label', null, 'السبب'), reason),
    h('label', { class: 'chk' }, refund, 'استرداد المبلغ للعميل تلقائياً عبر Whop'),
    h('div', { class: 'actions' }, h('button', { class: 'btn btn-ghost', onclick: () => s.close() }, 'إلغاء'), go)]);
}

/* ============================== التوجيه ============================== */
async function route() {
  const tok = ++S.tok; S.refresh = null;
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?'), query = new URLSearchParams(qs || '');
  S.path = path;
  const u = S.me.user;
  if (u && S.me.ban) return viewBan(S.me.ban);
  if (u && u.isAdmin && !path.startsWith('/admin')) return void (location.hash = '#/admin');
  if (path.startsWith('/admin') && !(u && u.isAdmin)) return void (location.hash = '#/');
  shell(h('div'));
  window.scrollTo(0, 0);
  let m;
  if (path === '/admin') return viewAdminUsers(tok);
  if ((m = path.match(/^\/admin\/users\/([\w\-]+)$/))) return viewAdminUser(m[1], tok);
  if (path === '/admin/orders') return viewAdminOrders(query, tok);
  if ((m = path.match(/^\/admin\/orders\/([\w\-]+)$/))) return viewAdminOrder(m[1], query, tok);
  if (path === '/orders') return viewOrders(query, tok);
  if ((m = path.match(/^\/c\/([\w\-]+)$/))) return viewCategory(m[1], tok);
  viewHome();
}
window.addEventListener('hashchange', route);
setInterval(() => { if (S.refresh && !S.modals && !document.hidden) S.refresh(); }, 20000);

/* ============================== الإقلاع ============================== */
async function init() {
  S.timers.forEach(clearInterval); S.timers = [];
  try {
    const [cfg, me, cats] = await Promise.all([api('/config'), api('/me'), api('/categories')]);
    S.cfg = cfg; S.me = me; S.cats = cats.categories; S.catMap = Object.fromEntries(S.cats.map(c => [c.slug, c]));
    S.timeOff = (me.now || cfg.now) - Date.now();
    document.title = S.cfg.siteName + ' — بطاقات ألعاب واشتراكات رقمية';
  } catch (e) {
    $('#root').replaceChildren(h('div', { class: 'ban' }, h('div', { class: 'card' }, h('h1', null, 'تعذّر تحميل المتجر'), h('p', null, 'تحقق من اتصالك ثم حدّث الصفحة.'), h('button', { class: 'btn btn-primary', style: { marginTop: '16px' }, onclick: () => location.reload() }, 'تحديث'))));
    return;
  }
  route();
}
init();
})();
