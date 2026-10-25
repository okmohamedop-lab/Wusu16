# أفق ستور — متجر البطاقات الرقمية

خادم Node.js **بدون أي مكتبات خارجية** (`npm install` غير مطلوب) + واجهة عربية RTL.

## التشغيل المحلي للتجربة
```
DEV_MODE=1 node server.js        # ثم افتح http://localhost:3000
```
وضع التجربة يفتح دخولاً تجريبياً ودفعاً وهمياً (يتعطل تلقائياً عند `NODE_ENV=production`).
للدخول كأدمن في التجربة: `/dev/login?email=lamereop@gmail.com`

## النشر على Render
1. ارفع المجلد إلى GitHub، ثم أنشئ **Web Service** (Node) — Build: فارغ، Start: `node server.js`.
2. أضف **Disk** (Mount path: `/var/data`) وضع `DATA_DIR=/var/data` — بدونه تضيع الحسابات والطلبات عند كل نشر.
3. أضف المتغيرات من `.env.example`.

## إعداد Whop
1. **التطبيق:** whop.com/dashboard/developer → أنشئ تطبيقاً → أضف Redirect URI بالضبط:
   `https://موقعك/auth/callback` → انسخ `app_...` إلى `WHOP_APP_ID`.
2. **API Key:** من نفس الصفحة، بصلاحيات إنشاء checkout وقراءة المدفوعات والاسترداد → `WHOP_API_KEY`.
3. **Company ID:** `biz_...` من لوحة شركتك → `WHOP_COMPANY_ID`.
4. **Webhook:** Developer → Create webhook → URL: `https://موقعك/webhooks/whop` → الحدث `payment.succeeded` → انسخ السرّ إلى `WHOP_WEBHOOK_SECRET`.

## كيف يعمل
- الأسعار في `lib/catalog.js` (السعر الأساسي + 1$ حتى 50$، و+3$ فوق 50$) — عدّلها من هناك.
- الدفع: ينشئ الخادم checkout بالسعر الصحيح، والعميل يدفع في Whop، ثم يتأكد الخادم عبر webhook (والتحقق عند العودة) قبل أن يصبح الطلب «قيد المراجعة».
- الأدمن: الدخول بإيميل `ADMIN_EMAIL` فقط يفتح لوحة المدير (المستخدمون، الطلبات، قبول/رفض، تبنيد/إيقاف مؤقت/فك الحظر).
