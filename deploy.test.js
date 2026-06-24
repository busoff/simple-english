import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const workflowPath = join(here, '.github', 'workflows', 'deploy-pages.yml');
const htmlPath = join(here, 'index.html');
const readmePath = join(here, 'README.md');

function loadWorkflowText() {
  if (!existsSync(workflowPath)) return null;
  return readFileSync(workflowPath, 'utf8');
}

function loadReadmeText() {
  if (!existsSync(readmePath)) return null;
  return readFileSync(readmePath, 'utf8');
}

describe('GitHub Pages deployment workflow', () => {
  it('exists at .github/workflows/deploy-pages.yml and triggers on push to main', () => {
    const text = loadWorkflowText();
    expect(text, 'workflow file must exist').not.toBeNull();
    expect(text).toContain('push:');
    expect(text).toMatch(/branches:\s*\[\s*main\s*\]|-\s*main\b/);
  });

  it('uses actions/deploy-pages to publish the site', () => {
    const text = loadWorkflowText();
    expect(text).toMatch(/uses:\s*actions\/deploy-pages@v\d+/);
  });

  it('grants pages:write and id-token:write permissions', () => {
    const text = loadWorkflowText();
    expect(text).toMatch(/pages:\s*write/);
    expect(text).toMatch(/id-token:\s*write/);
  });

  it('uses concurrency to cancel in-flight deploys on main', () => {
    const text = loadWorkflowText();
    expect(text).toContain('concurrency:');
    expect(text.toLowerCase()).toContain('cancel-in-progress');
  });

  it('checks out the repo and uploads the repo root as the pages artifact', () => {
    const text = loadWorkflowText();
    expect(text).toMatch(/uses:\s*actions\/checkout@v\d+/);
    expect(text).toMatch(/uses:\s*actions\/upload-pages-artifact@v\d+/);
    expect(text).toMatch(/path:\s*\./);
  });
});

describe('index.html subpath compatibility', () => {
  it('references stylesheets and scripts with relative paths (no leading slash)', () => {
    const html = readFileSync(htmlPath, 'utf8');
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const relatives = [
      ...doc.querySelectorAll('link[rel="stylesheet"][href]'),
      ...doc.querySelectorAll('script[src]'),
    ];
    expect(relatives.length, 'expected at least one stylesheet or script').toBeGreaterThan(0);

    for (const el of relatives) {
      const href = el.getAttribute('href') || el.getAttribute('src');
      expect(href.startsWith('/'), `${href} must not be root-absolute for subpath hosting`)
        .toBe(false);
    }
  });
});

describe('README deployment docs', () => {
  it('documents Cloudflare Pages as canonical and GitHub Pages as secondary', () => {
    const text = loadReadmeText();
    expect(text, 'README.md must exist').not.toBeNull();
    const lower = text.toLowerCase();
    expect(lower).toContain('cloudflare');
    expect(lower).toContain('github pages');
    expect(lower).toMatch(/canonical|primary/);
    expect(lower).toMatch(/secondary|preview/);
  });

  it('calls out the one-time Pages Source = GitHub Actions setup step', () => {
    const text = loadReadmeText();
    const lower = text.toLowerCase();
    expect(lower).toMatch(/pages source|source.*github actions|github actions.*source/);
  });
});
