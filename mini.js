'use strict';
// إطار خادم مصغّر متوافق مع الجزء المستخدم من Express — بدون أي اعتماديات خارجية.
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2' };

function compile(p) {
  const keys = [];
  const re = new RegExp('^' + p.replace(/\/+$/, '').replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  return { re, keys };
}

function createApp() {
  const stack = [];
  const app = (req, res) => handle(req, res);
  app.disable = () => app; app.set = () => app;
  app.use = (a, ...fns) => { if (typeof a === 'function') stack.push({ fn: a }); else stack.push({ prefix: a.replace(/\/+$/, ''), fns }); return app; };
  for (const m of ['get', 'post']) app[m] = (p, ...fns) => { stack.push({ method: m.toUpperCase(), ...compile(p), fns }); return app; };

  function enhance(req, res) {
    const u = new URL(req.url, 'http://x');
    req.path = u.pathname; req.query = Object.fromEntries(u.searchParams); req.params = {}; req.body = {};
    req.get = (n) => req.headers[n.toLowerCase()];
    req.ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
    res.statusCode = 200;
    res.status = (c) => { res.statusCode = c; return res; };
    res.set = (a, b) => { if (typeof a === 'string') res.setHeader(a, b); else for (const k in a) res.setHeader(k, a[k]); return res; };
    res.append = (k, v) => { const cur = res.getHeader(k); res.setHeader(k, cur ? [].concat(cur, v) : v); return res; };
    res.json = (o) => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); };
    res.send = (b) => { if (typeof b === 'string' && !res.getHeader('Content-Type')) res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(b); };
    res.redirect = (u2) => { res.statusCode = 302; res.setHeader('Location', u2); res.end(); };
  }

  function handle(req, res) {
    try { enhance(req, res); } catch { res.statusCode = 400; return res.end('bad request'); }
    const queue = [];
    for (const l of stack) {
      if (l.fn) queue.push(l.fn);
      else if (l.prefix !== undefined) { if (req.path === l.prefix || req.path.startsWith(l.prefix + '/')) queue.push(...l.fns); }
      else if (l.method === req.method || (l.method === 'GET' && req.method === 'HEAD')) {
        const m = l.re.exec(req.path);
        if (m) queue.push(...l.fns.map(f => (rq, rs, nx) => { rq.params = Object.fromEntries(l.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])); return f(rq, rs, nx); }));
      }
    }
    let i = 0, errored = null;
    const next = (err) => {
      if (err) errored = err;
      while (i < queue.length) {
        const f = queue[i++];
        if (errored ? f.length === 4 : f.length < 4) {
          try {
            const r = errored ? f(errored, req, res, next) : f(req, res, next);
            if (r && r.catch) r.catch(next);
          } catch (e) { return next(e); }
          return;
        }
      }
      if (errored) { console.error(errored); if (!res.headersSent) { res.statusCode = 500; res.end('Server error'); } }
      else if (!res.headersSent) { res.statusCode = 404; res.end('Not found'); }
    };
    next();
  }

  app.listen = (port, cb) => http.createServer(app).listen(port, cb);
  return app;
}

function readBody(req, max) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on('data', c => { n += c.length; if (n > max) { reject(Object.assign(new Error('too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
const parseLimit = (l, d) => { if (!l) return d; const m = /^(\d+)(kb|mb)?$/i.exec(String(l)); return m ? +m[1] * ({ kb: 1024, mb: 1048576 }[(m[2] || '').toLowerCase()] || 1) : d; };

function json(o = {}) {
  const max = parseLimit(o.limit, 102400);
  return async (req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
    try {
      const buf = await readBody(req, max);
      if (buf.length && /json/i.test(req.get('content-type') || '')) req.body = JSON.parse(buf.toString('utf8'));
      next();
    } catch (e) { res.status(e.status || 400).json({ error: 'bad_body', message: 'طلب غير صالح.' }); }
  };
}
function raw(o = {}) {
  const max = parseLimit(o.limit, 1048576);
  return async (req, res, next) => {
    try { req.body = await readBody(req, max); next(); }
    catch (e) { res.status(e.status || 400).send('bad body'); }
  };
}
function serveStatic(dir, o = {}) {
  const root = path.resolve(dir);
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    let p; try { p = decodeURIComponent(req.path); } catch { return next(); }
    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(root, path.normalize(p));
    if (!file.startsWith(root + path.sep) && file !== root) return next();
    const tryFiles = [file, file + '.html'];
    for (const f of tryFiles) {
      let st; try { st = fs.statSync(f); } catch { continue; }
      if (!st.isFile()) continue;
      res.setHeader('Content-Type', MIME[path.extname(f)] || 'application/octet-stream');
      res.setHeader('Content-Length', st.size);
      res.setHeader('Cache-Control', o.maxAge ? `public, max-age=${Math.round((typeof o.maxAge === 'string' ? 3600 : o.maxAge) )}` : 'no-cache');
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(f).pipe(res);
    }
    next();
  };
}
const express = createApp;
express.json = json; express.raw = raw; express.static = serveStatic;
module.exports = express;
