# Sahla · sahla.inglizi.com

Standalone static site for **Inglizi.com**'s private lesson hub. Designed for one-click deploy to Vercel.

## What's inside

```
sahla/
├── index.html              ← landing hub (18 sentence-builder lessons + links)
├── vercel.json             ← clean URLs, security headers, redirects
├── units/
│   └── unit-4/             ← 18 interactive sentence-builder lessons
│       ├── lessons.html    ← lesson index
│       ├── lesson-7.html … lesson-24.html
│       ├── styles.css
│       ├── lesson-themes.css
│       └── script.js
└── README.md
```

No framework, no build step, no dependencies. Pure HTML/CSS/JS.

## Deploy to Vercel (separate project)

### Option A — push as its own Git repo (recommended)

1. **Initialize the repo**:
   ```bash
   cd sahla
   git init -b main
   git add .
   git commit -m "init sahla.inglizi.com"
   ```
2. **Create an empty repo** on GitHub (e.g. `inglizi-sahla`) and push:
   ```bash
   git remote add origin https://github.com/<you>/inglizi-sahla.git
   git push -u origin main
   ```
3. **Import to Vercel**: vercel.com → **New Project** → import the GitHub repo. Framework Preset: **Other** (auto-detected as static). Root directory: `./`. Click **Deploy**.

### Option B — deploy this subfolder from the main monorepo

1. In Vercel → **New Project** → import the existing `Inglizi.com` repo as a **new project** (different name from the main inglizi.com one).
2. In **Settings → General → Root Directory**, set: `sahla`
3. Framework Preset: **Other**.
4. Deploy.

## Add the subdomain in Vercel

1. New project → **Settings → Domains**.
2. **Add** → enter `sahla.inglizi.com` → **Add**.
3. Vercel shows the required DNS record. For Hostinger DNS it's:

   | Type | Name | Value | TTL |
   |---|---|---|---|
   | CNAME | sahla | cname.vercel-dns.com | 14400 |

## Add the DNS record on Hostinger

1. Log in to **hpanel.hostinger.com** → **Domains** → `inglizi.com` → **DNS / Nameservers**.
2. Scroll to **DNS Records** → **Add Record**:
   - Type: `CNAME`
   - Name: `sahla`
   - Points to: `cname.vercel-dns.com`
   - TTL: `14400`
3. Save. Propagation is usually 1–10 minutes.
4. Back in Vercel, the domain status should turn **Valid Configuration** ✓.

## Verify it works

```bash
dig +short CNAME sahla.inglizi.com
# expect: cname.vercel-dns.com.

curl -sI https://sahla.inglizi.com | head -1
# expect: HTTP/2 200
```

Then open `https://sahla.inglizi.com` — you should see the hub with all 18 sentence-builder lessons.

## Local preview

No build step. Open `index.html` in a browser, or serve via:

```bash
cd sahla
npx serve .          # http://localhost:3000
# or
python3 -m http.server 8080
```

## Sync lessons from the main project

If you edit the lessons in the main project (`public/units/unit-4/`), re-sync:

```bash
# from repo root
cp public/units/unit-4/*.{html,css,js} sahla/units/unit-4/
```

## Notes

- `noindex, nofollow` is set globally — these are private lessons.
- The hub links out to `inglizi.com/private/lessons/*` for Grammar, Reading, Level 01, and Real Life English (which require the main Next.js app + Supabase auth).
- All sentence-builder lessons work fully offline once loaded (no API calls).
