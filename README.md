# Matsui Lab — Homepage

Source of the Matsui Lab (松井研究室) website, built with [Astro](https://astro.build) + Tailwind CSS and deployed to GitHub Pages.

The site is bilingual (English / Japanese). English lives at `/…/` and Japanese at `/ja/…/`.

## Quick start

Requires Node 20+ (see `.nvmrc`).

```bash
npm install
npm run dev        # local dev server on http://localhost:4321
npm run build      # production build → ./dist
npm run preview    # preview the built site locally
```

## Project layout

```
src/
  components/      Reusable .astro components (Header, Footer, Hero, lists, cards)
  data/            Centralized site content (members, publications, news, awards, i18n strings)
  layouts/         Shared HTML shell
  pages/           English routes (index, research, members, publications, news, join, contact)
  pages/ja/        Japanese mirror of the same routes
  styles/global.css  Tailwind entry + small base styles
astro.config.mjs   Astro config (sets `site`, i18n locales)
tailwind.config.mjs  Brand color palette, fonts
.github/workflows/deploy.yml   CI for GitHub Pages
```

### Editing content

Most updates do **not** require touching component code. Edit the appropriate file under `src/data/`:

- **News** → `src/data/news.ts` (newest first; each entry has `en` and `ja` strings)
- **Publications** → `src/data/publications.ts`
- **Members** → `src/data/members.ts`
- **Awards / grants** → `src/data/awards.ts`
- **Lab name, tagline, email, social links** → `src/data/site.ts`
- **Navigation labels and other UI strings** → `src/data/i18n.ts`

To add a new top-level page, create `src/pages/<slug>.astro` and the mirror `src/pages/ja/<slug>.astro`, then add a new entry to `items` in `src/components/Header.astro`.

## Deploying to GitHub Pages

This project is configured to deploy as a **project page** at:

```
https://akira55.github.io/matsui-lab/
```

Setup (one-time):

1. Create a public GitHub repo named **`matsui-lab`** under user `Akira55`.
2. Push this project to `main` (see commands below).
3. Repo Settings → **Pages** → set Source to **GitHub Actions**.
4. Every push to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes.

### Internal links

All internal links use the `u()` helper in `src/lib/url.ts`, which prefixes the deploy `base` (`/matsui-lab/`). When adding new internal `href` / `src` attributes, use it:

```astro
import { u } from '../lib/url';
<a href={u('/talks/')}>Talks</a>
<img src={u('/charactor.png')} />
```

### Changing the URL later

Edit `site` and `base` in `astro.config.mjs`:
- **User site** (`https://akira55.github.io`): rename repo to `Akira55.github.io` and remove the `base` line.
- **Custom domain** (e.g. `https://matsui-lab.org`): add `public/CNAME` containing the domain, configure DNS, set `site: 'https://matsui-lab.org'` and remove `base`.

## Acknowledgements

Profile content is drawn from [researchmap](https://researchmap.jp/amrmap) and the [Kobe University RIEB faculty page](https://www.rieb.kobe-u.ac.jp/faculty/global_finance/a_matsui.html). Design inspiration: [yachie-lab.org](https://yachie-lab.org).
