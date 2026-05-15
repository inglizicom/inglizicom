# sahla.inglizi.com — Separate Vercel Project

`sahla.inglizi.com` is its own standalone Vercel project (not a route of the main `inglizi.com` Next.js app). The full source lives in [`/sahla/`](../sahla/).

## Why a separate project?

- **Independent deploys** — push lesson updates to Sahla without rebuilding the main marketing site.
- **No dependencies** — pure static HTML/CSS/JS. No Supabase, no auth context, no Tailwind build.
- **Hostinger-friendly** — `inglizi.com` lives on Hostinger; Sahla lives on Vercel; both work side by side.

## What's deployed there

1. **Hub** — `sahla.inglizi.com/` lists all 18 sentence-builder lessons + links out to other private resources on the main site.
2. **Sentence Builder** — 18 interactive lessons at `sahla.inglizi.com/units/unit-4/lesson-*.html`
3. **External links** — Grammar, Reading, Level 01, Real Life English point to `inglizi.com/private/lessons/*` (they live in the main Next.js app).

## Deploy steps

### 1. Create the Vercel project

From the Vercel dashboard:

- **New Project** → Import a Git Repository.
- If you push `/sahla/` as its own repo: import that repo, framework preset **Other**, deploy.
- If you import the existing `Inglizi.com` repo: set **Root Directory** to `sahla` in project settings, framework preset **Other**.

### 2. Add the subdomain

In the new Vercel project → **Settings → Domains** → **Add** → `sahla.inglizi.com`.

Vercel will show the required DNS record:

| Type | Name | Value |
|---|---|---|
| CNAME | sahla | cname.vercel-dns.com |

### 3. Add the DNS record on Hostinger

Since `inglizi.com` is hosted on Hostinger, DNS is managed there:

1. **hpanel.hostinger.com** → **Domains** → `inglizi.com` → **DNS / Nameservers** tab.
2. Scroll to **DNS Records** → **Add Record**:
   - Type: `CNAME`
   - Name: `sahla`
   - Points to: `cname.vercel-dns.com`
   - TTL: `14400`
3. Save.

Propagation: 1–10 minutes. Vercel will turn the domain green when verified.

## Verify

```bash
dig +short CNAME sahla.inglizi.com
# → cname.vercel-dns.com.

curl -sI https://sahla.inglizi.com | head -1
# → HTTP/2 200
```

## Sync lessons between projects

The sentence-builder source of truth is `public/units/unit-4/` in the main repo. After editing, sync to Sahla:

```bash
cp public/units/unit-4/*.{html,css,js} sahla/units/unit-4/
```

Commit and push the `sahla/` folder for Vercel to redeploy.

## Reverting

To take down the subdomain:
- Vercel: project → **Settings → Domains** → remove `sahla.inglizi.com`.
- Hostinger: delete the `sahla` CNAME record.

The `/sahla/` source folder can stay for future redeploys.
