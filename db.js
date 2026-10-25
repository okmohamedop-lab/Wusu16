'use strict';
// قاعدة بيانات ملف JSON بسيطة وآمنة (كتابة ذرّية). ضع DATA_DIR على قرص دائم عند الاستضافة.
const fs = require('fs');
const path = require('path');

class DB {
  constructor(dir) {
    fs.mkdirSync(dir, { recursive: true });
    this.file = path.join(dir, 'store.json');
    this.data = { users: {}, orders: {}, webhooks: [] };
    this._t = null;
    try {
      const raw = fs.readFileSync(this.file, 'utf8');
      try { Object.assign(this.data, JSON.parse(raw)); }
      catch (e) {
        const bak = this.file + '.corrupt-' + Date.now();
        fs.renameSync(this.file, bak);
        console.error('[db] الملف تالف، تم حفظ نسخة في', bak);
      }
    } catch (e) { if (e.code !== 'ENOENT') console.error('[db] load', e); }
    const flush = () => { try { this.flush(); } catch (e) { console.error(e); } };
    process.on('exit', flush);
    ['SIGINT', 'SIGTERM'].forEach(s => process.on(s, () => { flush(); process.exit(0); }));
  }
  save() {
    if (this._t) return;
    this._t = setTimeout(() => { this._t = null; this.flush(); }, 120);
  }
  flush() {
    if (this._t) { clearTimeout(this._t); this._t = null; }
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data));
    fs.renameSync(tmp, this.file);
  }
}
module.exports = { DB };
