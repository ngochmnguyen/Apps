# minhngocn.com

Personal website, built with [Astro](https://astro.build). Static output,
deployed to GitHub Pages behind the custom domain `minhngocn.com`.

## Structure

```
src/
  components/   Header.astro, Footer.astro
  layouts/      BaseLayout.astro (shared <head>, nav, footer)
  pages/        index.astro (About), projects.astro, contact.astro
  pages/blog/   index.astro (listing), [...slug].astro (post template), rss.xml.js
  content/blog/ Markdown posts
  content.config.ts   Blog collection schema (title, description, pubDate, tags, draft)
public/
  CNAME         Custom domain for GitHub Pages — contains "minhngocn.com"
  favicon.svg
```

## Local development

```
cd website
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Editing content

- **Bio / homepage** — edit `src/pages/index.astro`.
- **Projects** — edit the `projects` array at the top of `src/pages/projects.astro`.
- **Contact info / social links** — edit `src/components/Footer.astro` and
  `src/pages/contact.astro`.
- **Blog posts** — add a new Markdown file to `src/content/blog/`, e.g.:

  ```markdown
  ---
  title: "My Post"
  description: "One sentence describing the post."
  pubDate: 2026-08-01
  tags: ["notes"]
  ---

  Post body in Markdown.
  ```

  Set `draft: true` in the frontmatter to keep a post out of the build until
  it's ready.

The name "Minh Ngoc Nguyen" and the placeholder email
(`hello@minhngocn.com`) are guesses based on the domain — update them in
`src/components/Header.astro`, `src/components/Footer.astro`,
`src/pages/contact.astro`, and `src/layouts/BaseLayout.astro` if they're not
right.

## Deployment (GitHub Pages)

`.github/workflows/deploy-website.yml` builds this site and deploys it to
GitHub Pages on every push to `main` that touches `website/**`. Two one-time
manual steps are needed before it'll actually go live:

1. **Enable Pages in the repo.** Repo → Settings → Pages → Build and
   deployment → Source: **GitHub Actions**. (This can't be done through the
   API/MCP tools available in this session — it's a repo settings change you
   make once in the GitHub UI.)
2. **Point DNS at GitHub Pages.** At your domain registrar for
   `minhngocn.com`, add:

   - Four `A` records for the apex domain (`minhngocn.com`) pointing to:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - (Optional) a `CNAME` record for `www` pointing to
     `ngochmnguyen.github.io` if you also want `www.minhngocn.com` to work.

   DNS propagation can take anywhere from a few minutes to a few hours.
   GitHub will auto-provision an HTTPS certificate once it verifies the
   `CNAME` file in this repo matches the domain you configure in Settings →
   Pages.

**Note on branches:** this repo's current default branch is
`claude/travel-opportunities-app-criteria-c3vwj7`, not `main` — this repo
hosts more than one project (a travel app, alongside this website). The
deploy workflow is scoped to `website/**` changes on `main` so it won't
interfere with the other app; merge this branch into whatever branch you
intend to treat as production, or adjust the `branches:` filter in the
workflow if your setup differs.

## Future ideas

- Newsletter/monetization for the blog (e.g. Substack-style email capture,
  sponsorships, or affiliate links) — nothing is wired up yet, but the blog's
  Markdown + content-collection structure is a fine base to build on later.
- A contact form via [Formspree](https://formspree.io) instead of a plain
  `mailto:` link (see `src/pages/contact.astro`).
