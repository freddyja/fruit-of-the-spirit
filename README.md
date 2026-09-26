# Fruit of the Spirit

A phone and desktop Bible PWA for Freddy Jara-Almonte. Read Scripture, keep private notes, and practice the nine fruits of Galatians 5:22–23. The visible name is **Fruit of the Spirit**. The line under that title is **Designed by Freddy Jara-Almonte**.

Personal notes, categories, voice notes, the greeting name, practice marks, and reading-plan progress stay on this device (IndexedDB and local storage). There is no account, no cloud library, and no chat.

The glass-dark screens follow the black and gold of Freddy’s Fruit of the Spirit ebook cover: charcoal cards, gold type, and atmospheric still-life art on Home and Read.

Sibling app, used only as a pattern reference: [The Living Word / Bible Verse Tracker](https://github.com/freddyja/bible-verse-tracker). This repository does not modify that project.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). The dev server uses the site root. It does not register a service worker.

```bash
npm run build
npm run preview
```

The production build uses the GitHub Pages base path `/fruit-of-the-spirit/`, so the preview URL is `http://localhost:4173/fruit-of-the-spirit/`. Installability is checked from that build: the manifest name is Fruit of the Spirit, the theme color is the cover black (`#0c0b09`), and a service worker is emitted. Settings includes Install. On iPhone, Settings says to use Share, then Add to Home Screen.

`npm run lint` runs oxlint. `npm run check:i18n` fails the build if an English, Spanish, or Portuguese string key is missing, duplicated, or if a greeting repeats the blessing.

## What’s in this scaffold

- Bottom tabs: Home, Read, Grow, Saved
- Verse of the Day on an atmospheric card
- Explore tiles, and the nine fruits as browse themes
- Continuous chapter reading, original line-art for each book, and on-device read-aloud
- Tap a verse for Meaning, Lexicon, and Context. Those notes are short scaffold text so the sheet has a place to grow. They are not a full commentary.
- Related passages for the fruit themes
- Word search and topic search
- Saved verses with notes, categories (the nine fruits to start), and an optional voice note
- A one-time greeting name. The blessing is a separate line and is omitted if it would repeat the greeting.
- 90 / 180 / 365 day plans across the Protestant canon. Days whose books are not bundled yet say so.
- Grow practice is local. There is no chat, liturgy, prayer office, or calendar.
- English, Español, and Português for the interface. The Bible version under the title follows that choice.
- A two-pane Read layout from 768px wide: chapter on the left, study on the right

## Scripture policy

Only free public-domain or openly licensed texts.

Bundled in this first build, for Matthew, John, Romans, 1 Corinthians, Galatians, Ephesians, Philippians, Colossians, Titus, James, 1 Peter, 2 Peter, and 1 John:

| Language | Version on screen | License |
| --- | --- | --- |
| English | King James Version (1769) | Public domain |
| Español | Reina-Valera 1909 | Public domain |
| Português | Bíblia Livre | Creative Commons Attribution 3.0 Brazil |

NIV, ESV, and other restricted commercial texts are not included and must not be added.

The other books appear in the library as “Later” until their public-domain files are added. How to add WEB, ASV, YLT, Darby, and the rest of these three translations is written in [`public/scripture/LICENSE.md`](public/scripture/LICENSE.md).

Bíblia Livre is used under [CC BY 3.0 Brazil](https://creativecommons.org/licenses/by/3.0/br/). The wording was not changed. Credit the Bíblia Livre project when redistributing `public/scripture/blivre/`.

## GitHub Pages

`.github/workflows/pages.yml` builds with `VITE_BASE_PATH=/fruit-of-the-spirit/` and deploys the `dist` folder. In the repository settings, Pages must use GitHub Actions. The live path is `https://freddyja.github.io/fruit-of-the-spirit/`.

`npm run dev` stays at `/` so local work is unchanged.
