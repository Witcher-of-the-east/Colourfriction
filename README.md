# Colourfriction — Phase 1: Personal-Web Edition

A deliberately nostalgic React + TypeScript prototype for Colourfriction, an entertainment-taste community. This iteration leans into early personal websites, Neocities-style sidebars, pixel controls, tiny web badges, browser-window panels, and hand-made visual details rather than a conventional modern landing page.

## Included in this iteration

- Retro two-column homepage with a personal-web sidebar
- Faux browser windows: site status, now-playing cassette, and link list
- 88×31-inspired web badges, webring, visitor counter, and sticker details
- Interactive guestbook modal (demo entries persist in this browser)
- Four colour palettes in the theme switcher
- Media scrapbook filters, search modal, and favourite hearts
- Responsive layout for mobile and desktop
- Distinct display/type styles: Bungee Shade, Silkscreen, VT323, Syne, Caveat, Fraunces

## Run locally

You need Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Build for production:

```bash
npm run build
npm run preview
```

## Phase 1 verification status

- Core homepage, retro visual system, responsive layout rules, theme switching, search, category filtering, favourites, and guestbook UI are implemented.
- Theme selection, favourite hearts, and guestbook notes are saved locally in the current browser. Clearing site data removes them; they do not sync between devices.
- Keyboard Escape closes open overlays and menus; visible controls include focus styles.
- A full production build still needs to be run on a machine where npm can install the declared dependencies.

## Current prototype limits

Media, member profiles, the visitor counter, and the web-ring are sample content. Theme selection, favourite hearts, and guestbook entries persist in this browser using localStorage. This is local-only persistence, not a user account or shared database. Authentication, PostgreSQL, and real TMDB/IGDB/music/book APIs are planned for later phases. Google Fonts are loaded remotely, so the custom typefaces need an internet connection.
