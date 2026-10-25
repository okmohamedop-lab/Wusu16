'use strict';
// الأسعار الأساسية بالسنت. السعر النهائي = الأساسي + 1$ (حتى 50$) أو + 3$ (فوق 50$).
const c = (x) => Math.round(x * 100);
const SYM = { USD: '$', EUR: '€', BRL: 'R$', JPY: '¥' };
const money = (code, n, base) => ({ id: `${code.toLowerCase()}-${n}`, label: `${n} ${code}`, big: `${SYM[code]}${n}`, unit: code, base: c(base) });
const game = (id, label, big, unit, base) => ({ id, label, big, unit, base: c(base) });

const CATEGORIES = [
  { slug: 'playstation', name: 'PlayStation', nameAr: 'بلايستيشن', blurb: 'بطاقات هدايا PlayStation Store', glyph: 'gamepad', c1: '#1f6bff', c2: '#12d1ff',
    note: 'عملة هذه البطاقات هي الريال البرازيلي (BRL) — تأكد أن منطقة حسابك مطابقة.',
    items: [money('BRL',35,6.77), money('BRL',60,11.38), money('BRL',100,20.48), money('BRL',150,28.15), money('BRL',250,46.63), money('BRL',300,56.07), money('BRL',360,62.52), money('BRL',400,74.49)] },
  { slug: 'xbox', name: 'Xbox', nameAr: 'إكس بوكس', blurb: 'بطاقات هدايا Xbox', glyph: 'console', c1: '#0e9f4a', c2: '#7be34f',
    note: 'تأكد أن عملة البطاقة (USD أو EUR) تطابق منطقة حسابك قبل الشراء.',
    items: [money('USD',5,4.97), money('USD',10,9.30), money('USD',15,14.10), money('USD',20,18.33), money('USD',25,23.00), money('USD',50,52.57), money('USD',100,92.51), money('EUR',5,5.79)] },
  { slug: 'free-fire', name: 'Free Fire', nameAr: 'فري فاير', blurb: 'شحن جواهر Free Fire', glyph: 'gem', c1: '#ff5a1f', c2: '#ffb21f',
    note: '',
    items: [game('ff-110','110 جوهرة','110','ماسة',2.00), game('ff-231','231 جوهرة','231','ماسة',2.36), game('ff-583','583 جوهرة','583','ماسة',5.98), game('ff-1188','1188 جوهرة','1188','ماسة',11.96), game('ff-2420','2420 جوهرة','2420','ماسة',24.24)] },
  { slug: 'pubg', name: 'PUBG Mobile', nameAr: 'ببجي موبايل', blurb: 'شحن شدات PUBG Mobile (UC)', glyph: 'crosshair', c1: '#c98a1a', c2: '#f4d06f',
    note: '',
    items: [game('uc-60','60 UC','60','UC',2.00), game('uc-325','300+25 UC','325','UC',4.61), game('uc-660','600+60 UC','660','UC',9.21), game('uc-1800','1500+300 UC','1800','UC',22.99), game('uc-3850','3000+850 UC','3850','UC',46.00), game('uc-8100','6000+2100 UC','8100','UC',90.85)] },
  { slug: 'google-play', name: 'Google Play', nameAr: 'جوجل بلاي', blurb: 'بطاقات هدايا Google Play', glyph: 'bag', c1: '#00b894', c2: '#fdcb43',
    note: 'تأكد أن عملة البطاقة (USD أو JPY) تطابق بلد حسابك قبل الشراء.',
    items: [money('USD',5,5.24), money('USD',10,10.42), money('USD',15,15.37), money('USD',25,26.06), money('USD',50,52.13), money('USD',100,104.20), money('JPY',500,3.88), money('JPY',1000,7.77)] },
  { slug: 'netflix', name: 'Netflix', nameAr: 'نتفليكس', blurb: 'بطاقات هدايا Netflix', glyph: 'film', c1: '#b0101f', c2: '#ff3b4d',
    note: 'تأكد أن عملة البطاقة (USD أو EUR) تناسب منطقة حسابك قبل الشراء.',
    items: [money('USD',15,16.48), money('USD',20,19.80), money('USD',25,24.50), money('USD',50,48.57), money('USD',60,61.47), money('USD',100,103.24), money('EUR',25,29.85), money('EUR',50,64.18)] },
  { slug: 'roblox', name: 'Roblox', nameAr: 'روبلوكس', blurb: 'بطاقات Robux', glyph: 'cube', c1: '#3d4cff', c2: '#a35bff',
    note: '',
    items: [game('rbx-800','800 Robux','800','Robux',9.95), game('rbx-1000','1000 Robux','1000','Robux',12.40), game('rbx-2000','2000 Robux','2000','Robux',24.49), game('rbx-4500','4500 Robux','4500','Robux',50.06), game('rbx-10000','10000 Robux','10000','Robux',109.85)] },
  { slug: 'amazon', name: 'Amazon', nameAr: 'أمازون', blurb: 'بطاقات هدايا Amazon', glyph: 'gift', c1: '#232f3e', c2: '#ff9900',
    note: 'تأكد أن عملة البطاقة (USD أو EUR) تطابق متجر Amazon الخاص بك قبل الشراء.',
    items: [money('EUR',5,6.94), money('EUR',10,11.37), money('EUR',25,34.89), money('EUR',50,69.08), money('EUR',100,138.84), money('USD',5,5.24), money('USD',10,9.98), money('USD',25,22.70)] },
];

const markup = (base) => base + (base > c(50) ? c(3) : c(1));
const getCategory = (slug) => CATEGORIES.find(x => x.slug === slug);
const getItem = (cat, id) => cat && cat.items.find(i => i.id === id);
const pub = (i) => ({ id: i.id, label: i.label, big: i.big, unit: i.unit, price: markup(i.base) });
const priceOf = (i) => markup(i.base);

function summaries() {
  return CATEGORIES.map(k => ({ slug: k.slug, name: k.name, nameAr: k.nameAr, blurb: k.blurb, glyph: k.glyph, c1: k.c1, c2: k.c2, count: k.items.length, from: Math.min(...k.items.map(priceOf)) }));
}
function detail(slug) {
  const k = getCategory(slug); if (!k) return null;
  return { slug: k.slug, name: k.name, nameAr: k.nameAr, blurb: k.blurb, glyph: k.glyph, c1: k.c1, c2: k.c2, note: k.note, items: k.items.map(pub) };
}
module.exports = { CATEGORIES, getCategory, getItem, priceOf, summaries, detail };
