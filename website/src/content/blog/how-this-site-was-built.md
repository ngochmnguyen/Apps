---
title: "How This Site Is Built"
description: "A quick look at the stack behind this site: Astro, Markdown, and GitHub Pages."
pubDate: 2026-07-19
tags: ["meta", "astro"]
---

This site is built with [Astro](https://astro.build), a framework for
content-focused websites that ships zero JavaScript by default.

**Content** lives as plain Markdown files under `src/content/blog/`. Adding a
new post is just adding a new `.md` file with a title, description, and date
in its frontmatter — no database, no CMS.

**Hosting** is [GitHub Pages](https://pages.github.com), configured through a
GitHub Actions workflow that builds the site and deploys it on every push to
the main branch. The custom domain (`minhngocn.com`) points at GitHub Pages
via DNS records.

Why this stack:

- No server to maintain — it's all static files.
- Fast by default, since there's very little client-side JavaScript.
- Free hosting, and the source is just a git repo.
- Easy to extend later — content collections, RSS, and view transitions are
  all built into Astro if the site grows.
