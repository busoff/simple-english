---
name: add-word
description: Append a new vocabulary word to words.js. Validates the word is unique, the category is one of animals/colors/food, then runs words.test.js. Invoke as /add-word <word> <emoji> <category>.
disable-model-invocation: true
---

# /add-word

Append a word to the `WORDS` array in `words.js`.

## Usage

```
/add-word <word> <emoji> <category>
```

- `<word>` — lowercase English word, e.g. `panda`
- `<emoji>` — single emoji representing the word, e.g. `🐼`
- `<category>` — one of `animals`, `colors`, `food`

## Workflow

1. **Parse args.** Require exactly three. If missing or `<category>` is not in `{animals, colors, food}`, print usage and stop.
2. **Lowercase and trim `<word>`.**
3. **Read `words.js`.** Scan existing entries; if `<word>` already exists (case-insensitive), report the duplicate with line number and stop.
4. **Locate insertion point.** Find the last entry in the matching category group. Insert immediately after it, preserving the blank line that separates category groups. Match existing formatting: 2-space indent, single quotes, trailing comma.
5. **Insert the line:**
   ```
     { word: '<word>', emoji: '<emoji>', category: '<category>' },
   ```
6. **Run `npx vitest run words.test.js`.** If it fails, revert the edit and report what failed. If it passes, report success with the new word count per category.

## Validation rules

- Word uniqueness is case-insensitive (`Cat` collides with `cat`).
- Category must be exactly one of `animals`, `colors`, `food` (no plurals, no aliases).
- Emoji should be a single grapheme cluster. If it looks like multiple emoji joined, warn but do not block.

## Out of scope

- Adding a new category (requires touching `CATEGORIES` in `app.js` and the home screen in `index.html` — not this skill).
- Editing or removing existing words.
