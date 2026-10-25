'use strict';
const express = require('./lib/mini');
const crypto = require('crypto');
const path = require('path');
const { DB } = require('./lib/db');
const catalog = require('./lib/catalog');

/* ------------------------------ الإعدادات ------------------------------ */
const env = process.env;
const PORT = +env.PORT || 3000;
const SITE_URL = (env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
const IS_PROD = env.NODE_ENV === 'production';
const DEV_MODE = env.DEV_MODE === '1' && !IS_PROD;
const SITE_NAME = env.SITE_NAME || 'أفق ستور';
const ADMIN_EMAIL = (env.ADMIN_EMAIL || 'lamereop@gmail.com').trim().toLowerCase();
const SECURE = SITE_URL.startsWith('https://');
const SECRET = env.SESSION_SECRET || (() => {
  console.warn('[تحذير] SESSION_SECRET غير مضبوط — سيتم توليد مفتاح مؤقت وستنتهي الجلسات عند كل إعادة تشغيل.');
  return crypto.randomBytes(32).toString('hex');
})();
const WHOP = {
  appId: env.WHOP_APP_ID || '',            // app_xxx (معرّف التطبيق = client_id)
  clientSecret: env.WHOP_CLIENT_SECRET || '', // اختياري
  apiKey: env.WHOP_API_KEY || '',
  companyId: env.WHOP_COMPANY_ID || '',    // biz_xxx
  productId: env.WHOP_PRODUCT_ID || '',    // اختياري prod_xxx
  webhookSecret: env.WHOP_WEBHOOK_SECRET || '',
};
const whopLoginReady = !!WHOP.appId;
const whopPayReady = !!(WHOP.apiKey && WHOP.companyId);

const db = new DB(env.DATA_DIR || path.join(__dirname, 'data'));
const D = db.data;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

/* ------------------------------ أدوات ------------------------------ */
const b64u = (b) => Buffer.from(b).toString('base64url');
const sign = (obj) => {
  const p = b64u(JSON.stringify(obj));
  const s = crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
  return `${p}.${s}`;
};
const unsign = (tok) => {
  if (!tok || typeof tok !== 'string') return null;
  const [p, s] = tok.split('.');
  if (!p || !s) return null;
  const exp = crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
  const a = Buffer.from(s), b = Buffer.from(exp);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const o = JSON.parse(Buffer.from(p, 'base64url').toString());
    if (o.exp && o.exp < Date.now()) return null;
    return o;
  } catch { return null; }
};
const parseCookies = (req) => Object.fromEntries((req.headers.cookie || '').split(/;\s*/).filter(Boolean).map(c => {
  const i = c.indexOf('='); return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
}));
const setCookie = (res, name, val, maxAgeSec) => {
  let c = `${name}=${encodeURIComponent(val)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
  if (SECURE) c += '; Secure';
  res.append('Set-Cookie', c);
};
const clearCookie = (res, name) => setCookie(res, name, '', 0);
const rid = (n = 6) => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (const b of crypto.randomBytes(n)) s += A[b % A.length]; return s; };
const safeNext = (n) => (typeof n === 'string' && /^\/[A-Za-z0-9\-_\/]*$/.test(n)) ? n : '/';
const clip = (s, n) => String(s == null ? '' : s).trim().slice(0, n);

// تحديد معدل الطلبات (في الذاكرة)
const hits = new Map();
const limit = (key, max, windowMs) => (req, res, next) => {
  const k = key + ':' + req.ip, now = Date.now();
  const arr = (hits.get(k) || []).filter(t => now - t < windowMs);
  if (arr.length >= max) return res.status(429).json({ error: 'rate', message: 'محاولات كثيرة، حاول بعد قليل.' });
  arr.push(now); hits.set(k, arr); next();
};
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (!v.some(t => now - t < 600000)) hits.delete(k); }, 300000).unref();

/* ------------------------------ ترويسات الأمان ------------------------------ */
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'",
  });
  if (SECURE) res.set('Strict-Transport-Security', 'max-age=15552000');
  next();
});

/* ------------------------------ Whop ------------------------------ */
async function whopApi(method, p, body) {
  const r = await fetch('https://api.whop.com' + p, {
    method,
    headers: { Authorization: 'Bearer ' + WHOP.apiKey, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = { raw: t }; }
  if (!r.ok) { const e = new Error('whop ' + r.status); e.status = r.status; e.body = j; throw e; }
  return j;
}

async function createCheckout(order) {
  const plan = {
    initial_price: order.priceCents / 100, currency: 'usd', plan_type: 'one_time',
    title: `${order.categoryName} — ${order.itemLabel}`.slice(0, 80),
  };
  if (WHOP.productId) plan.product_id = WHOP.productId;
  const base = {
    mode: 'payment', plan,
    redirect_url: `${SITE_URL}/return?order=${order.id}`,
    metadata: { order_id: order.id, user_id: order.userId, item: `${order.categorySlug}/${order.itemId}` },
  };
  try {
    return await whopApi('POST', '/api/v1/checkout_configurations', { ...base, account_id: WHOP.companyId });
  } catch (e) {
    if (e.status === 400 || e.status === 422) { // توافق مع الإصدارات القديمة من الواجهة
      return await whopApi('POST', '/api/v1/checkout_configurations', { ...base, company_id: WHOP.companyId, plan: { ...plan, company_id: WHOP.companyId } });
    }
    throw e;
  }
}

function markPaid(order, paymentId) {
  if (!order || order.status !== 'awaiting_payment') return false;
  order.status = 'paid'; order.paidAt = Date.now(); order.paymentId = paymentId || order.paymentId || null;
  db.save(); return true;
}

// التحقق من الدفع عبر واجهة Whop عند عودة العميل (احتياط إلى جانب الـ webhook)
async function confirmPayment(order, paymentId) {
  if (!whopPayReady || !paymentId || order.status !== 'awaiting_payment') return;
  const p = await whopApi('GET', `/api/v1/payments/${encodeURIComponent(paymentId)}`);
  const status = String(p.status || '').toLowerCase();
  const okStatus = ['paid', 'succeeded', 'success', 'completed'].includes(status);
  const meta = p.metadata || {};
  const sameOrder = meta.order_id === order.id || (order.checkoutId && (p.checkout_configuration_id === order.checkoutId || (p.checkout_configuration && p.checkout_configuration.id === order.checkoutId)));
  if (okStatus && sameOrder) markPaid(order, p.id || paymentId);
}

function verifyWebhook(req) {
  const id = req.get('webhook-id'), ts = req.get('webhook-timestamp'), sigHeader = req.get('webhook-signature');
  if (!id || !ts || !sigHeader || !WHOP.webhookSecret) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const raw = req.body; // Buffer
  const msg = Buffer.concat([Buffer.from(`${id}.${ts}.`), raw]);
  const secret = WHOP.webhookSecret;
  const keys = [Buffer.from(secret)];
  try { keys.push(Buffer.from(secret.replace(/^(whsec_|ws_)/, ''), 'base64')); } catch { /* ignore */ }
  const provided = sigHeader.split(' ').map(s => s.split(',')[1]).filter(Boolean);
  return keys.some(k => {
    const exp = crypto.createHmac('sha256', k).update(msg).digest('base64');
    return provided.some(p => { const a = Buffer.from(p), b = Buffer.from(exp); return a.length === b.length && crypto.timingSafeEqual(a, b); });
  });
}

app.post('/webhooks/whop', express.raw({ type: '*/*', limit: '1mb' }), (req, res) => {
  if (!verifyWebhook(req)) return res.status(401).send('bad signature');
  let ev; try { ev = JSON.parse(req.body.toString()); } catch { return res.status(400).send('bad json'); }
  const wid = req.get('webhook-id');
  if (D.webhooks.includes(wid)) return res.send('dup');
  D.webhooks.push(wid); if (D.webhooks.length > 500) D.webhooks.shift();
  if (ev.type === 'payment.succeeded' && ev.data) {
    const p = ev.data;
    const oid = p.metadata && p.metadata.order_id;
    let order = oid && D.orders[oid];
    if (!order) {
      const cid = p.checkout_configuration_id || (p.checkout_configuration && p.checkout_configuration.id);
      if (cid) order = Object.values(D.orders).find(o => o.checkoutId === cid);
    }
    if (order) markPaid(order, p.id);
  }
  db.save();
  res.send('ok');
});

/* ------------------------------ تحليل الجسم ------------------------------ */
app.use(express.json({ limit: '50kb' }));
app.use('/api', (req, res, next) => {
  if (req.method !== 'GET' && req.get('x-requested-with') !== 'fetch') return res.status(403).json({ error: 'csrf' });
  res.set('Cache-Control', 'no-store'); next();
});

/* ------------------------------ المستخدم والجلسة ------------------------------ */
const sessionUser = (req) => { const s = unsign(parseCookies(req).sid); return s && D.users[s.uid] || null; };
const activeBan = (u) => {
  if (!u || !u.ban || u.isAdmin) return null;
  if (u.ban.type === 'temp' && u.ban.until <= Date.now()) { u.ban = null; db.save(); return null; }
  return u.ban;
};
const startSession = (res, uid) => setCookie(res, 'sid', sign({ uid, exp: Date.now() + 30 * 864e5 }), 30 * 86400);
const pubUser = (u) => ({ id: u.id, name: u.name, email: u.email, picture: u.picture || null, isAdmin: !!u.isAdmin });

function auth(req, res, next) {
  const u = sessionUser(req);
  if (!u) return res.status(401).json({ error: 'auth', message: 'سجّل الدخول أولاً.' });
  const ban = activeBan(u);
  if (ban) return res.status(403).json({ error: 'banned', ban });
  req.user = u; next();
}
function admin(req, res, next) {
  const u = sessionUser(req);
  if (!u || !u.isAdmin) return res.status(403).json({ error: 'forbidden' });
  req.user = u; next();
}

function upsertUser(info) {
  const id = info.sub;
  const email = (info.email || '').toLowerCase();
  const verified = info.email_verified !== false;
  const isAdmin = !!email && email === ADMIN_EMAIL && verified;
  const now = Date.now();
  const u = D.users[id] || (D.users[id] = { id, createdAt: now, ban: null });
  Object.assign(u, {
    name: clip(info.name || info.preferred_username || email.split('@')[0] || 'مستخدم', 80),
    username: clip(info.preferred_username, 60), email: clip(email, 160),
    picture: typeof info.picture === 'string' && /^https:\/\//.test(info.picture) ? info.picture : null,
    isAdmin, lastLoginAt: now,
  });
  if (isAdmin) u.ban = null;
  db.save(); return u;
}

/* ------------------------------ تسجيل الدخول عبر Whop (OAuth + PKCE) ------------------------------ */
const authPage = (msg) => `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui;background:#07080d;color:#f3f4f8;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px"><div><h2>${msg}</h2><p><a style="color:#ff6b6b" href="/">العودة للمتجر</a></p></div></body></html>`;

app.get('/auth/login', limit('login', 30, 600000), (req, res) => {
  const next = safeNext(req.query.next);
  if (!whopLoginReady) return res.status(503).send(authPage('تسجيل الدخول غير مهيأ بعد (WHOP_APP_ID مفقود).'));
  const state = crypto.randomBytes(16).toString('base64url');
  const nonce = crypto.randomBytes(16).toString('base64url');
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  setCookie(res, 'oa', sign({ state, nonce, verifier, next, exp: Date.now() + 600000 }), 600);
  const q = new URLSearchParams({
    response_type: 'code', client_id: WHOP.appId, redirect_uri: `${SITE_URL}/auth/callback`,
    scope: 'openid profile email', state, nonce, code_challenge: challenge, code_challenge_method: 'S256',
  });
  res.redirect('https://api.whop.com/oauth/authorize?' + q);
});

app.get('/auth/callback', limit('cb', 30, 600000), async (req, res) => {
  const tx = unsign(parseCookies(req).oa);
  clearCookie(res, 'oa');
  if (!tx || !req.query.code || req.query.state !== tx.state) return res.status(400).send(authPage('تعذّر التحقق من جلسة الدخول. حاول مرة أخرى.'));
  try {
    const body = { grant_type: 'authorization_code', code: String(req.query.code), redirect_uri: `${SITE_URL}/auth/callback`, client_id: WHOP.appId, code_verifier: tx.verifier };
    if (WHOP.clientSecret) body.client_secret = WHOP.clientSecret;
    const tr = await fetch('https://api.whop.com/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const tok = await tr.json();
    if (!tr.ok || !tok.access_token) throw new Error('token ' + tr.status + ' ' + JSON.stringify(tok));
    const ur = await fetch('https://api.whop.com/oauth/userinfo', { headers: { Authorization: 'Bearer ' + tok.access_token } });
    const info = await ur.json();
    if (!ur.ok || !info.sub) throw new Error('userinfo ' + ur.status);
    const u = upsertUser(info);
    startSession(res, u.id);
    res.redirect('/#' + tx.next);
  } catch (e) {
    console.error('[oauth]', e.message);
    res.status(502).send(authPage('حدث خطأ أثناء تسجيل الدخول عبر Whop. حاول مرة أخرى.'));
  }
});

if (DEV_MODE) { // للتجربة المحلية فقط — يُعطَّل تلقائياً في الإنتاج
  app.get('/dev/login', (req, res) => {
    const email = String(req.query.email || 'user@example.com');
    const u = upsertUser({ sub: 'user_dev_' + crypto.createHash('md5').update(email).digest('hex').slice(0, 10), email, email_verified: true, name: String(req.query.name || email.split('@')[0]) });
    startSession(res, u.id); res.redirect('/#' + safeNext(req.query.next));
  });
  app.get('/dev/pay/:id', (req, res) => {
    const o = D.orders[req.params.id]; if (!o) return res.status(404).send('no order');
    res.send(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;background:#111;color:#eee;display:grid;place-items:center;min-height:100vh"><form method="post" style="text-align:center"><h2>بوابة دفع تجريبية (DEV)</h2><p>${o.itemLabel} — $${(o.priceCents / 100).toFixed(2)}</p><button style="padding:14px 28px;font-size:18px">إتمام الدفع التجريبي</button></form>`);
  });
  app.post('/dev/pay/:id', (req, res) => {
    const o = D.orders[req.params.id]; if (!o) return res.status(404).send('no order');
    markPaid(o, 'pay_dev_' + rid(5)); res.redirect(`/return?order=${o.id}&status=succeeded`);
  });
}

app.get('/return', async (req, res) => {
  const o = D.orders[String(req.query.order || '')];
  if (!o) return res.redirect('/#/orders');
  try { if (req.query.payment) await confirmPayment(o, String(req.query.payment)); } catch (e) { console.error('[confirm]', e.status || '', e.message); }
  res.redirect(`/#/orders?${o.status === 'awaiting_payment' ? 'pending' : 'paid'}=${o.id}`);
});

/* ------------------------------ واجهة API العامة ------------------------------ */
app.get('/api/config', (req, res) => res.json({ siteName: SITE_NAME, dev: DEV_MODE, loginReady: whopLoginReady || DEV_MODE, now: Date.now() }));

app.get('/api/me', (req, res) => {
  const u = sessionUser(req);
  if (!u) return res.json({ user: null, now: Date.now() });
  res.json({ user: pubUser(u), ban: activeBan(u), now: Date.now() });
});
app.post('/api/logout', (req, res) => { clearCookie(res, 'sid'); res.json({ ok: true }); });

app.get('/api/categories', (req, res) => res.json({ categories: catalog.summaries() }));
app.get('/api/catalog/:slug', auth, (req, res) => {
  const d = catalog.detail(req.params.slug);
  if (!d) return res.status(404).json({ error: 'not_found' });
  res.json(d);
});

const pubOrder = (o) => ({
  id: o.id, categorySlug: o.categorySlug, categoryName: o.categoryName, itemLabel: o.itemLabel, itemBig: o.itemBig, itemUnit: o.itemUnit,
  priceCents: o.priceCents, status: o.status, createdAt: o.createdAt, paidAt: o.paidAt || null, reviewedAt: o.reviewedAt || null,
  delivery: o.status === 'delivered' ? o.delivery : null, rejectReason: o.status === 'rejected' ? (o.rejectReason || '') : null,
  refund: o.status === 'rejected' ? (o.refund || null) : null, email: o.userEmail,
  checkoutUrl: o.status === 'awaiting_payment' ? o.checkoutUrl : null,
});

app.post('/api/orders', auth, limit('order', 20, 600000), async (req, res) => {
  const cat = catalog.getCategory(String(req.body.category || ''));
  const item = catalog.getItem(cat, String(req.body.item || ''));
  if (!cat || !item) return res.status(400).json({ error: 'bad_item', message: 'المنتج غير موجود.' });
  const u = req.user;
  const priceCents = catalog.priceOf(item);
  // أعد استخدام طلب غير مدفوع حديث لنفس المنتج
  const reuse = Object.values(D.orders).find(o => o.userId === u.id && o.status === 'awaiting_payment' && o.categorySlug === cat.slug && o.itemId === item.id && o.checkoutUrl && Date.now() - o.createdAt < 30 * 60000);
  if (reuse) return res.json({ orderId: reuse.id, checkoutUrl: reuse.checkoutUrl });
  const open = Object.values(D.orders).filter(o => o.userId === u.id && o.status === 'awaiting_payment');
  if (open.length >= 8) return res.status(429).json({ error: 'too_many', message: 'لديك طلبات غير مدفوعة كثيرة. أكمل دفعها أو ألغِها من صفحة «الاستلام».' });

  let id; do { id = 'OF-' + rid(6); } while (D.orders[id]);
  const order = {
    id, userId: u.id, userEmail: u.email, userName: u.name, categorySlug: cat.slug, categoryName: cat.name,
    itemId: item.id, itemLabel: item.label, itemBig: item.big, itemUnit: item.unit, priceCents,
    status: 'awaiting_payment', createdAt: Date.now(), checkoutId: null, checkoutUrl: null,
  };
  try {
    if (whopPayReady) {
      const co = await createCheckout(order);
      order.checkoutId = co.id; order.checkoutUrl = co.purchase_url || (co.id ? `https://whop.com/checkout/${co.id}/` : null);
      if (!order.checkoutUrl) throw new Error('no purchase_url');
    } else if (DEV_MODE) {
      order.checkoutUrl = `/dev/pay/${id}`;
    } else {
      return res.status(503).json({ error: 'pay_unavailable', message: 'بوابة الدفع غير مهيأة بعد.' });
    }
  } catch (e) {
    console.error('[checkout]', e.status || '', JSON.stringify(e.body || e.message));
    return res.status(502).json({ error: 'checkout_failed', message: 'تعذّر إنشاء عملية الدفع الآن. حاول بعد قليل.' });
  }
  D.orders[id] = order; db.save();
  res.json({ orderId: id, checkoutUrl: order.checkoutUrl });
});

app.get('/api/orders', auth, (req, res) => {
  const list = Object.values(D.orders).filter(o => o.userId === req.user.id && o.status !== 'cancelled').sort((a, b) => b.createdAt - a.createdAt);
  res.json({ orders: list.map(pubOrder) });
});
app.post('/api/orders/:id/cancel', auth, (req, res) => {
  const o = D.orders[req.params.id];
  if (!o || o.userId !== req.user.id || o.status !== 'awaiting_payment') return res.status(404).json({ error: 'not_found' });
  o.status = 'cancelled'; db.save(); res.json({ ok: true });
});
app.post('/api/orders/:id/verify', auth, async (req, res) => {
  const o = D.orders[req.params.id];
  if (!o || o.userId !== req.user.id) return res.status(404).json({ error: 'not_found' });
  try { if (req.body.paymentId) await confirmPayment(o, String(req.body.paymentId)); } catch (e) { console.error('[verify]', e.message); }
  res.json({ order: pubOrder(o) });
});

/* ------------------------------ واجهة الأدمن ------------------------------ */
const adminOrder = (o) => ({ ...pubOrder(o), delivery: o.delivery || null, rejectReason: o.rejectReason || null, refund: o.refund || null, userId: o.userId, userName: o.userName, paymentId: o.paymentId || null });
const adminUser = (u) => {
  const os = Object.values(D.orders).filter(o => o.userId === u.id && o.status !== 'cancelled');
  return { id: u.id, name: u.name, email: u.email, picture: u.picture, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt, isAdmin: !!u.isAdmin,
    ban: activeBan(u) || null, orders: os.filter(o => o.status !== 'awaiting_payment').length, pending: os.filter(o => o.status === 'paid').length, unpaid: os.filter(o => o.status === 'awaiting_payment').length };
};

app.get('/api/admin/summary', admin, (req, res) => {
  const os = Object.values(D.orders);
  res.json({ users: Object.keys(D.users).length, pending: os.filter(o => o.status === 'paid').length, delivered: os.filter(o => o.status === 'delivered').length, rejected: os.filter(o => o.status === 'rejected').length });
});
app.get('/api/admin/users', admin, (req, res) => {
  const q = clip(req.query.q, 60).toLowerCase();
  let list = Object.values(D.users).filter(u => !u.isAdmin);
  if (q) list = list.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  list = list.map(adminUser).sort((a, b) => (b.pending - a.pending) || ((b.lastLoginAt || 0) - (a.lastLoginAt || 0)));
  res.json({ users: list });
});
app.get('/api/admin/users/:id', admin, (req, res) => {
  const u = D.users[req.params.id]; if (!u) return res.status(404).json({ error: 'not_found' });
  const orders = Object.values(D.orders).filter(o => o.userId === u.id && o.status !== 'cancelled').sort((a, b) => b.createdAt - a.createdAt).map(adminOrder);
  res.json({ user: adminUser(u), orders });
});
app.post('/api/admin/users/:id/ban', admin, (req, res) => {
  const u = D.users[req.params.id]; if (!u || u.isAdmin) return res.status(404).json({ error: 'not_found' });
  const reason = clip(req.body.reason, 400);
  if (req.body.mode === 'temp') {
    const mins = Math.floor(Number(req.body.minutes));
    if (!(mins >= 1 && mins <= 60 * 24 * 365)) return res.status(400).json({ error: 'bad_duration', message: 'مدة غير صالحة.' });
    u.ban = { type: 'temp', reason, at: Date.now(), until: Date.now() + mins * 60000 };
  } else u.ban = { type: 'perm', reason, at: Date.now() };
  db.save(); res.json({ user: adminUser(u) });
});
app.post('/api/admin/users/:id/unban', admin, (req, res) => {
  const u = D.users[req.params.id]; if (!u) return res.status(404).json({ error: 'not_found' });
  if (!activeBan(u)) return res.status(400).json({ error: 'not_banned', message: 'الحساب غير محظور.' });
  u.ban = null; db.save(); res.json({ user: adminUser(u) });
});

app.get('/api/admin/orders', admin, (req, res) => {
  const f = String(req.query.status || 'paid');
  let list = Object.values(D.orders).filter(o => o.status !== 'cancelled' && o.status !== 'awaiting_payment');
  if (f !== 'all') list = list.filter(o => o.status === f);
  list.sort(f === 'paid' ? (a, b) => (a.paidAt || 0) - (b.paidAt || 0) : (a, b) => (b.paidAt || b.createdAt) - (a.paidAt || a.createdAt));
  res.json({ orders: list.map(adminOrder) });
});
app.get('/api/admin/orders/:id', admin, (req, res) => {
  const o = D.orders[req.params.id]; if (!o) return res.status(404).json({ error: 'not_found' });
  res.json({ order: adminOrder(o) });
});
app.post('/api/admin/orders/:id/accept', admin, (req, res) => {
  const o = D.orders[req.params.id]; if (!o) return res.status(404).json({ error: 'not_found' });
  if (o.status !== 'paid') return res.status(400).json({ error: 'bad_state', message: 'هذا الطلب ليس قيد المراجعة.' });
  const delivery = clip(req.body.delivery, 5000);
  if (!delivery) return res.status(400).json({ error: 'empty', message: 'اكتب المنتج أو الكود أو بيانات الحساب أولاً.' });
  o.status = 'delivered'; o.delivery = delivery; o.reviewedAt = Date.now(); db.save();
  res.json({ order: adminOrder(o) });
});
app.post('/api/admin/orders/:id/reject', admin, async (req, res) => {
  const o = D.orders[req.params.id]; if (!o) return res.status(404).json({ error: 'not_found' });
  if (o.status !== 'paid') return res.status(400).json({ error: 'bad_state', message: 'هذا الطلب ليس قيد المراجعة.' });
  o.status = 'rejected'; o.rejectReason = clip(req.body.reason, 400); o.reviewedAt = Date.now();
  if (req.body.refund) {
    if (DEV_MODE && !whopPayReady) o.refund = { status: 'refunded', message: 'استرداد تجريبي' };
    else if (whopPayReady && o.paymentId) {
      try { await whopApi('POST', `/api/v1/payments/${encodeURIComponent(o.paymentId)}/refund`, {}); o.refund = { status: 'refunded' }; }
      catch (e) { console.error('[refund]', e.status || '', JSON.stringify(e.body || e.message)); o.refund = { status: 'failed', message: 'تعذّر الاسترداد التلقائي — استرجعه يدوياً من لوحة Whop.' }; }
    } else o.refund = { status: 'failed', message: 'لا يوجد رقم دفعة — استرجعه يدوياً من لوحة Whop.' };
  }
  db.save(); res.json({ order: adminOrder(o) });
});

/* ------------------------------ الملفات الثابتة ------------------------------ */
app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: IS_PROD ? 3600 : 0 }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'server', message: 'خطأ في الخادم.' }); });

app.listen(PORT, () => {
  console.log(`✔ ${SITE_NAME} يعمل على ${SITE_URL}`);
  console.log(`  تسجيل الدخول عبر Whop: ${whopLoginReady ? 'جاهز' : 'غير مهيأ'} | الدفع: ${whopPayReady ? 'جاهز' : (DEV_MODE ? 'وضع تجريبي' : 'غير مهيأ')} | webhook: ${WHOP.webhookSecret ? 'جاهز' : 'غير مهيأ'}`);
  if (DEV_MODE) console.log('  ⚠ DEV_MODE مفعّل: /dev/login?email=... و /dev/pay/:id (للتجربة المحلية فقط)');
});
