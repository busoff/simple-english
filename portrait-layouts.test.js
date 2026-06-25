import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

describe('portrait layouts', () => {
  let cssContent;

  beforeEach(() => {
    const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'styles.css');
    cssContent = readFileSync(cssPath, 'utf-8');
  });

  it('has responsive word grid with media query for portrait', () => {
    // Check for portrait media query in CSS
    const portraitMediaQuery = cssContent.match(/@media[^{]*\(orientation:\s*portrait\)/i);
    expect(portraitMediaQuery).toBeTruthy();

    // Check that word-grid has responsive column settings
    const wordGridStyles = cssContent.match(/\.word-grid\s*{[^}]+grid-template-columns:\s*[^;]+/g);
    expect(wordGridStyles).toBeTruthy();

    // Should have grid-template-columns defined
    const gridCols = cssContent.match(/\.word-grid[^}]*grid-template-columns:\s*([^;]+)/);
    expect(gridCols).toBeTruthy();
    expect(gridCols[1]).toContain('1fr');
  });

  it('findit grid maintains 2 columns', () => {
    // Find-it grid should always have 2 columns (good for both orientations)
    const findItGrid = cssContent.match(/\.findit-grid[^}]*grid-template-columns:\s*([^;]+)/);
    expect(findItGrid).toBeTruthy();
    expect(findItGrid[1]).toContain('repeat(2, 1fr)');
  });

  it('category tiles remain usable in portrait', () => {
    // Category tiles should use flex wrap and centering
    const categoryTiles = cssContent.match(/\.category-tiles[^}]+}/);
    expect(categoryTiles).toBeTruthy();
    const styles = categoryTiles[0];

    // Should have flex layout
    expect(styles).toMatch(/display:\s*flex/);
    expect(styles).toMatch(/flex-wrap:\s*wrap/);
    expect(styles).toMatch(/justify-content:\s*center/);
  });
});
