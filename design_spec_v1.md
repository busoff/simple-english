---
name: design-spec-v1
description: Full v1 design spec for the simple-english app — locked decisions from grill-me session 2026-06-23
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fea96bb-b31a-4b72-9c41-17878b55680b
---

# simple-english v1 Design Spec

Locked decisions from the grill-me design session on 2026-06-23. See [[learner-profile]] for target user.

## Learner & device
- 4yo Chinese boy, near-zero English exposure
- Android tablet, **landscape only**, touch input only
- UI language: English only (parent reads English fine)

## Goal & activities
- **v1 goal:** hearing + understanding spoken English (no speaking back, no reading, no writing)
- **Two activities:** Explore (flashcards) + Find it (multiple choice)

## Content (30 words)
- **Animals (10):** cat, dog, bird, fish, cow, pig, duck, lion, rabbit, bear
- **Colors (10):** red, orange, yellow, green, blue, purple, brown, black, white, pink
- **Food (10):** apple, banana, bread, milk, egg, rice, cake, cookie, grape, watermelon
- All represented as **emoji** (Google Android set)
- **Free exploration** — no locked sequence, kid picks any category/word

## Activity mechanics

### Explore mode
- Tap word tile in grid → fullscreen card opens
- Big emoji (~50% screen height) + word text below (72px, lowercase)
- Audio: just the word, spoken once on entry
- Tap card or 🔊 button → replay audio

### Find it mode
- 4 options in 2×2 grid, distractors from same category, random positions
- TTS speaks target word on round start ("Find the cat")
- Big 🔊 button to replay; auto-replay after 4s of no input
- **8 rounds per session**, random mix from category
- Correct: tile flips green, emoji bounces, cheer sound, auto-advance after 1s
- Wrong: tile wobbles red, soft "try again" tone, tile disabled 1.5s, no scoring
- After round 8: celebration screen (confetti + mascot dancing + "Yay!") → auto-return to category grid after 3s

## Navigation
- **Home:** mascot 🦜 top-right (waves) + 3 large category tiles (Animals 🐾, Colors 🎨, Food 🍎)
- **Category tap → word grid** (5×2 emoji tiles) with mode toggle at top: "👀 Look" (Explore, default) / "🎮 Play" (Find it)
- **Persistent home button** top-left on every screen
- No exit button (PWA; home is enough)

## Audio
- **Live browser TTS** via `SpeechSynthesis` API
- First available `en-US` female voice
- Rate: 0.9, Pitch: 1.0
- Fallback if no en-US voice: show "🔊?" indicator, don't block usage
- Always `speechSynthesis.cancel()` before `speak()` (no overlap)

## Engagement
- **Instant feedback on every tap:** bouncy animations, audio
- **Mascot:** 🦜 parrot emoji with CSS animations:
  - Idle on home: sway ±5°, 2s loop
  - Celebration: bounce translateY 0↔-20px, 0.5s loop
  - Rotate-nag: tilted 🦜 + 💭 with 🔄
- **No scoring, no failure states** — "try again" is the only negative feedback
- **No stickers, no progress display** for v1

## Visual design
- **Palette:** bright primary colors (Crayola-style), category accents (Animals=green, Colors=rainbow, Food=orange)
- **Background:** warm off-white (~`#FFF8E7`)
- **Typography:** system font (Roboto on Android), no bundled font
  - Word display: 72px lowercase
  - Category labels: 32px
  - Button labels: 24px
- **Cards:** 24px rounded corners, soft drop shadow, scale-up on tap
- **Tap targets:** min 96×96px (category tiles, Find-it options); word grid tiles ~80px

## Tech stack
- **Vanilla HTML/CSS/JS, no framework, no build step**
- No persistence (no localStorage, no settings — resets each open)
- PWA manifest for "Add to Home Screen" (opens fullscreen, no browser chrome)
- No service worker for v1
- TTS voices are device-installed, so work offline regardless

## File structure
```
simple-english/
├── index.html          (all screens)
├── styles.css          (all styles + animations)
├── words.js            ([{word, emoji, category}, ...])
├── app.js              (navigation, TTS, find-it logic)
├── manifest.json       (PWA config, display:standalone, orientation:landscape)
└── icon.png            (192 & 512 — 🦜 on colored bg)
```

## Edge cases (mobile hardening)
- TTS unavailable → "🔊?" indicator, don't block
- Audio overlap → `cancel()` before `speak()`
- Mid-session home tap → exit immediately, no warning, state lost
- Portrait orientation → friendly rotate-nag screen with mascot
- Double-tap zoom → viewport meta `maximum-scale=1, user-scalable=no` + `touch-action: manipulation`
- Swipe/pull-to-refresh → `overscroll-behavior: none` + `popstate` intercept + `touch-action: none` on game areas

## Hosting
- **Cloudflare Pages** (free, HTTPS, `*.pages.dev` subdomain, better China accessibility than GitHub)
- Backup option: Gitee Pages if Cloudflare blocked

## Success criteria (all must be true for v1 to ship)
1. Loads on Android Chrome in <3s on home Wi-Fi
2. All 30 emoji render correctly on Android (Google set)
3. TTS plays on first tap of any word tile, en-US voice
4. Explore mode works end-to-end
5. Find it: 8 rounds complete without UI breaking
6. PWA install via "Add to Home Screen" works, opens fullscreen
7. **Kid test:** son uses app solo for ≥3 minutes without confusion/stuck/boredom; completes ≥1 Find-it session

## Deliberately excluded from v1
- Speaking/recording back
- Reading/writing
- Sound effects (animal noises, etc.)
- Stickers, collectibles, badges
- Progress tracking, settings
- Spaced repetition, difficulty progression
- Multiple kid profiles
- Custom illustration / mascot art
- Service worker / offline caching
- Pre-rendered audio files

**Why:** each excluded item is a real feature that deserves its own v2 conversation after v1 validates that the kid actually engages.

**How to apply:** when implementing v1, push back on scope creep that re-introduces any excluded item. v2 starts after success criteria pass.
