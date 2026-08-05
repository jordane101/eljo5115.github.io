# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site for Eli Jordan (algorithmic trading & sports analytics), served by GitHub Pages at **https://elijordan.me** (custom domain via `CNAME`). Pure static HTML/CSS/vanilla JS — there is no build step, package manager, linter, or test suite.

**Deploying:** the site is served from the `upstream` remote (`eljo5115/eljo5115.github.io`), NOT `origin` (the `jordane101` fork). Pushing only to `origin` deploys nothing. To ship: push `main` to **both** remotes, and `git fetch upstream` first — changes are sometimes committed directly to upstream, so the histories can diverge.

## Development

Serve the repo root with any static server, e.g.:

```bash
python3 -m http.server 5501
```

(VS Code Live Server is configured for port 5501 in `.vscode/settings.json`.) Pages must be served over HTTP, not opened as `file://`, because they fetch live data from external APIs.

## Architecture

- **Root (`index.html`, `style.css`, `script.js`)** — the homepage. `script.js` drives two things: the SVG stock-graph intro animation (skipped on repeat views via `sessionStorage`, skippable by click) and the 3D-tilt project cards. (A "Portfolio Holdings" section that fetched live positions from `api.dozencrust.com` was removed in Aug 2026 — don't reintroduce it.)
- **`projects/`** — long-form project write-up pages, one folder per project at `/projects/<slug>/index.html`. They reuse the root `style.css` (gradient background, buttons) plus the shared `projects/project-page.css`.
- **`sportsModel/`** — a multi-page NFL betting app (index, ev-bets, parlays, props, bet-calculator). Each page has its own paired `*-script.js` / `*-style.css`. Data comes from the `https://api.dozencrust.com/sports/nfl` backend (see `sportsModel/PROP_API.md` for the props API shape). The backend lives in a separate repo — only the frontend is here. The homepage card for this project ("Edge Alert") now points to the external https://edgealert.app instead of these pages.
- **`dataStory/`** — NBA salary data story (self-contained HTML/CSS/JS + `teamData.json`, with embedded Flourish charts).
- **`legacyPage/`** — an old version of the site, kept for reference and not linked from anywhere. Don't extend it.
- The various `*_UPDATE.md` / `*_IMPLEMENTATION.md` files at the root and in `sportsModel/` are historical feature-change notes, not living documentation.
- `Planta library.pdf` at the root is publicly reachable but intentionally left in place — don't remove or flag it.

## Adding a new project

`projects/_template/index.html` is the canonical starting point — copy the folder, rename it to the project slug, and fill in every `{{PLACEHOLDER}}` (title, meta description, OG tags, JSON-LD, tags, sections). Then:

1. Add the new URL to `/sitemap.xml` (with `lastmod`).
2. Add a card for it in the `#projects` section of `/index.html` (copy an existing `.card` div; keep `data-rotation-factor="2"` so the tilt effect works).

Projects that are just a GitHub link (no write-up) get only a homepage card whose button points at the repo.

## SEO conventions

Every indexable page carries: `<title>` ending in "— Eli Jordan", meta description, `<link rel="canonical">` (absolute `https://elijordan.me/...` URL), OG + Twitter tags, and a JSON-LD block (`Person` on the homepage, `Article` on project pages). Keep `sitemap.xml` in sync whenever pages are added, removed, or meaningfully updated.
