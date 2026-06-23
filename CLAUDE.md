## Agent skills

### Issue tracker

Issues live in GitHub Issues (uses the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## How to run

### Stack

Vanilla JS, no framework, no build step. Tests: vitest + jsdom.

### Run tests

```bash
npm test
```

Runs `vitest run` against `**/*.test.js` in a jsdom environment.

### Run the app locally

No build step and no `start` / `dev` script — serve the repo root as static files, then open `index.html`:

```bash
python3 -m http.server     # then open http://localhost:8000
# alternative: npx serve .
```

### once.sh

Not a dev server. `once.sh [issue-number]` launches a Claude Code session that implements the given issue (or auto-picks one) using `/tdd`.
