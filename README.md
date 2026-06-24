# Pip says English

Emoji + spoken-English vocabulary app for a 4yo. Two activities: **Explore** (flashcards) and **Find it** (multiple choice). Vanilla HTML/CSS/JS, no framework, no build step.

## Run locally

Serve the repo root as static files, then open `index.html`:

```bash
python3 -m http.server     # http://localhost:8000
# or: npx serve .
```

## Tests

```bash
npm test            # vitest unit/integration (jsdom)
npm run test:e2e    # Playwright end-to-end
```

## Deployment

This repo has two hosting targets. **Cloudflare Pages is canonical** — it hosts the kid-facing URL because of its better accessibility from mainland China (the target user is a 4yo there on an Android tablet). **GitHub Pages is a secondary/preview target** for sharing and dev.

| Target           | Role                         | How it gets there                                  |
| ---------------- | ---------------------------- | -------------------------------------------------- |
| Cloudflare Pages | Canonical, kid-facing        | Cloudflare's git integration (manual / external)   |
| GitHub Pages     | Secondary, preview/dev       | `.github/workflows/deploy-pages.yml` on push to main |

### GitHub Pages

On every push to `main`, the `deploy-pages.yml` workflow uploads the repo root to GitHub Pages. The site lands at `https://<owner>.github.io/<repo>/`.

All asset references in `index.html` are relative, so the app works unchanged under the `/<repo>/` subpath.

**One-time setup (maintainer only):** in GitHub repo settings, go to **Settings → Pages → Source** and select **"GitHub Actions"**. Until this is set, workflow runs will succeed but no site is published.
