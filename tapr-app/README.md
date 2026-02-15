# 🍺 Tapr App — Full Stack Setup & Deployment Guide

## 📁 ساختار پروژه

```
tapr-app/
├── app/
│   ├── layout.tsx              ← Root layout (فونت، رنگ، wrapper)
│   ├── globals.css             ← استایل‌های global + Tailwind
│   ├── page.tsx                ← صفحه Welcome
│   ├── auth/
│   │   └── login/page.tsx      ← صفحه لاگین
│   ├── venues/
│   │   ├── page.tsx            ← لیست venue‌ها
│   │   └── [id]/
│   │       ├── page.tsx        ← جزئیات venue
│   │       └── menu/page.tsx   ← منوی venue
│   ├── tip/
│   │   └── page.tsx            ← صفحه پرداخت انعام
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── register/route.ts
│       ├── venues/
│       │   ├── route.ts        ← GET /api/venues
│       │   └── [id]/route.ts   ← GET /api/venues/:slug
│       ├── menu/route.ts       ← GET /api/menu?venue=slug
│       └── tips/route.ts       ← GET/POST /api/tips
├── components/
│   └── BottomNav.tsx
├── lib/
│   ├── db.ts                   ← Prisma client singleton
│   ├── auth.ts                 ← JWT helpers
│   └── api.ts                  ← Response helpers
├── prisma/
│   ├── schema.prisma           ← Database schema
│   └── seed.ts                 ← اطلاعات اولیه
├── .env.example
├── vercel.json
└── README.md
```

---

## 🛠 نصب و راه‌اندازی Local

### ۱. نصب پیش‌نیازها

```bash
# Node.js 18+ نیاز داری
node --version   # باید 18+ باشه

# PostgreSQL نصب کن (یا از Neon/Supabase استفاده کن)
```

### ۲. Clone و نصب

```bash
git clone https://github.com/your-username/tapr-app.git
cd tapr-app
npm install
```

### ۳. تنظیم Environment Variables

```bash
cp .env.example .env.local
```

فایل `.env.local` رو باز کن و پر کن:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tapr_db"
JWT_SECRET="your-32-char-secret-key-here"
NEXTAUTH_SECRET="another-32-char-secret-key"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."        # اختیاری برای پرداخت واقعی
NEXT_PUBLIC_STRIPE_KEY="pk_test_..."   # اختیاری
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### ۴. راه‌اندازی Database

```bash
# ساخت دیتابیس PostgreSQL
createdb tapr_db   # یا از pgAdmin

# اعمال schema به دیتابیس
npm run db:push

# پر کردن با داده اولیه
npm run db:seed
```

### ۵. اجرا

```bash
npm run dev
# باز کن: http://localhost:3000
# لاگین: nessa@tapr.app / password123
```

---

## 🚀 Deploy روی Vercel (رایگان)

### روش ۱: از طریق GitHub (توصیه می‌شه)

#### قدم ۱ — GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/tapr-app.git
git push -u origin main
```

#### قدم ۲ — Database رایگان با Neon

1. برو به [neon.tech](https://neon.tech) → Register
2. یه project جدید بساز
3. از dashboard کپی کن `Connection string`:
   ```
   postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

#### قدم ۳ — Deploy روی Vercel

1. برو به [vercel.com](https://vercel.com) → Sign up with GitHub
2. کلیک "New Project" → repo تو رو import کن
3. در **Environment Variables** اضافه کن:
   ```
   DATABASE_URL     = (connection string از Neon)
   JWT_SECRET       = (یه string رندوم 32 کاراکتری)
   NEXTAUTH_SECRET  = (یه string رندوم دیگه)
   NEXTAUTH_URL     = https://your-app.vercel.app
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   ```
4. کلیک **Deploy** — تموم!

#### قدم ۴ — Seed دیتابیس

```bash
# یه بار بعد از deploy
DATABASE_URL="your-neon-url" npm run db:seed
```

---

## 🖥 Deploy روی VPS (DigitalOcean / Hetzner / Linode)

### قدم ۱ — سرور آماده کن (Ubuntu 22.04)

```bash
# Node.js 20 نصب
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 برای process management
sudo npm install -g pm2

# PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE USER tapr WITH PASSWORD 'strongpassword';"
sudo -u postgres psql -c "CREATE DATABASE tapr_db OWNER tapr;"

# Nginx
sudo apt install nginx -y
```

### قدم ۲ — آپلود و نصب

```bash
# روی سرور
git clone https://github.com/YOUR-USERNAME/tapr-app.git /var/www/tapr
cd /var/www/tapr
npm install
cp .env.example .env.local
nano .env.local   # مقادیر رو پر کن
```

### قدم ۳ — Build و اجرا

```bash
npm run db:push
npm run db:seed
npm run build
pm2 start npm --name "tapr" -- start
pm2 save
pm2 startup
```

### قدم ۴ — Nginx config

```bash
sudo nano /etc/nginx/sites-available/tapr
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/tapr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### قدم ۵ — SSL رایگان با Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 📡 API Endpoints

| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | `/api/auth/login` | ورود با email/password |
| POST | `/api/auth/register` | ثبت‌نام |
| GET | `/api/venues` | لیست همه venue‌ها |
| GET | `/api/venues?search=copper` | جستجو |
| GET | `/api/venues?category=Bar` | فیلتر |
| GET | `/api/venues/:slug` | جزئیات venue |
| GET | `/api/menu?venue=copper-head` | منوی venue |
| GET | `/api/menu?venue=xxx&category=Cocktail` | فیلتر منو |
| POST | `/api/tips` | ثبت انعام |
| GET | `/api/tips` | تاریخچه انعام‌های کاربر |

### مثال درخواست‌ها:

```bash
# لاگین
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nessa@tapr.app","password":"password123"}'

# لیست venues
curl http://localhost:3000/api/venues

# منوی venue
curl "http://localhost:3000/api/menu?venue=copper-head-beer-workshop"

# ثبت انعام
curl -X POST http://localhost:3000/api/tips \
  -H "Content-Type: application/json" \
  -d '{"staffId":"xxx","amount":25,"paymentMethod":"card"}'
```

---

## 💳 Stripe (پرداخت واقعی)

```bash
# نصب
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

در `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🗄 Database Management

```bash
npm run db:studio    # Prisma Studio - UI ویژوال برای DB
npm run db:migrate   # migration جدید بساز
npm run db:push      # schema رو اعمال کن (dev)
npm run db:seed      # داده اولیه
```

---

## 📱 PWA (نصب روی موبایل)

در `app/layout.tsx` manifest اضافه شده. فایل `public/manifest.json` رو بساز:

```json
{
  "name": "Tapr",
  "short_name": "Tapr",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0e0e0e",
  "theme_color": "#0e0e0e",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 🐛 خطاهای رایج

| خطا | راه‌حل |
|-----|---------|
| `DATABASE_URL not set` | فایل `.env.local` رو چک کن |
| `prisma not found` | `npm install` مجدد |
| `relation does not exist` | `npm run db:push` رو اجرا کن |
| `JWT_SECRET not set` | مقدار رو در .env.local بذار |
| Port 3000 in use | `kill -9 $(lsof -t -i:3000)` |

---

## 📞 Stack Summary

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM  
- **Auth**: JWT (httpOnly cookies)
- **Styling**: Tailwind CSS
- **Payments**: Stripe (optional)
- **Hosting**: Vercel (free tier) یا VPS
- **DB Hosting**: Neon (free tier) یا Supabase
