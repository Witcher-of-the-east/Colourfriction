# Colourfriction — Phase 2.8

A deliberately handmade, retro personal-web scrapbook built with React, TypeScript and Vite.

## Phase 2.8 refinements

### Customisation 2.0
- Custom accent and paper colours in addition to the preset palettes.
- Full-page sticker canvas: drag decorations across the entire homepage, not only the welcome panel.
- Select any sticker and use precise horizontal/vertical position, rotation, and size sliders; remove a selected sticker when you no longer want it. Arrow keys move the selected sticker in small increments; hold Shift for larger steps.
- Create custom text stickers, move/rotate/resize them, and save their content and positions in this browser.
- The decoration bar can pin/unpin up to 12 emoji decorations; up to 20 custom text stickers can be added. Reset positions to start over.
- Existing identity, badges, wallpaper textures, fonts, layouts, and live preview remain available.

### Media Collection 2.0
- Manage each standard collection as individual titles instead of editing a comma-separated text box.
- Search the catalogue before adding a title, review multiple matches and select the exact result/artwork to pin. Manual title entry remains available when a catalogue has no match.
- Add up to 12 items per standard shelf, remove items, and reorder them with accessible arrow buttons.
- Create up to 12 custom-named shelves (for example, “comfort films” or “books for rainy days”), choose an icon, add a description and optional cover image URL, set a personal 0–5 vibe rating, and add/remove titles. Reorder shelves with arrow controls and drag titles to rearrange them; arrow controls remain available as an alternative.
- Custom shelves appear in both the live Profile Lab preview and the personal homepage.
- Click any stamp to open Stamp Workshop. You can search for more cover options, choose one, paste a URL, or upload a cover.
- Uploaded images are resized before saving to help reduce local browser-storage usage.
- Catalogue lookups use Google Books, Apple's iTunes Search API, and Steam Store Search. Results are ranked by title similarity, and result details include available authors, artists, publishers, release years, or catalogue identifiers. An internet connection is required for catalogue lookups.

## Run locally

Requirements: Node.js 18 or newer recommended.

```bash
npm install
npm run dev
```

To verify the production build:

```bash
npm run build
```

## Storage and limitations

This remains a front-end prototype. Profile fields, stamp overrides, sticker layout, custom text stickers, named shelves, decorations, and guestbook entries are stored in the current browser's local storage. They are not public, synced, or shared with other devices. Catalogue endpoints may return different results or be unavailable; use the custom URL/upload options if that happens. Local storage has a finite quota, so avoid uploading many large images.
