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


## Phase 2.9 refinements

- Profile Lab includes a JSON backup and restore workflow for local profile data, custom shelves, stamp overrides, sticker layouts, decorations, guestbook notes, and selected Colourfriction preferences. Backups are versioned and validated before restore; the import attempts to roll back local storage if a write fails.
- Stamp Workshop supports an optional personal review (up to 180 characters) and a 0–5 personal rating per stamp. Reviews and ratings appear below the artwork and are included in backups.
- Backups are files saved to your computer. They are not uploaded anywhere. Treat them as personal data because they may contain your profile text and uploaded image data.


## Phase 2.10 refinements

- Sticker Studio now offers optional alignment guides and snap-to-5%-grid placement. These editor toggles are temporary UI settings; sticker coordinates remain saved in browser storage.
- Custom text stickers support arrow-key nudging (hold Shift for larger steps), as do emoji stickers.
- Custom media shelves support compressed cover-image uploads as well as direct image URLs, a live cover preview, and removing a cover.
- Individual custom shelves can be exported as JSON, including the shelf definition and matching saved stamp overrides. Shelf export is a backup artifact; importing a single shelf is not yet implemented.
- Uploaded shelf covers remain in browser local storage. Large or numerous images can still hit browser storage quotas; keep a full profile backup.


### Phase 2.11 — shelf restore and storage safety
- Custom shelves can now be imported from a Phase 2.10+ individual shelf JSON export using the upload arrow in a custom shelf header.
- Shelf import validates the app/version and required fields, limits imported items to 12, sanitises text lengths, and merges included artwork overrides.
- Saving the profile and custom shelves now rolls back the previous values if a write fails, reducing the chance of a partially saved profile. Quota errors show a specific message about uploaded covers and browser storage.
- All profile, shelf, and artwork data remains local to the browser; individual shelf import/export does not sync data to other devices.
