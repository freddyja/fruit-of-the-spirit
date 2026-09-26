# Scripture licenses

This app ships only free, public-domain, or openly licensed Bible texts.
Commercial translations (including NIV and ESV) are not included and must not be added.

## Bundled in this scaffold

These books are included, in each translation below:

Matthew, John, Romans, 1 Corinthians, Galatians, Ephesians, Philippians, Colossians, Titus, James, 1 Peter, 2 Peter, 1 John.

The other books of the Protestant canon are listed in the reader so the library has its shape. Their text is not in this build.

| Folder | Translation | License |
| --- | --- | --- |
| `kjv/` | King James Version (1769) | Public domain |
| `rv1909/` | Reina-Valera 1909 | Public domain |
| `blivre/` | Bíblia Livre | [Creative Commons Attribution 3.0 Brazil](https://creativecommons.org/licenses/by/3.0/br/) |

The files use the same chapter/verse JSON shape as [bible-verse-tracker](https://github.com/freddyja/bible-verse-tracker): an array of chapters, each an array of verse strings. They were copied from that project’s public-domain and permitted editions for the books listed above. This repository does not modify bible-verse-tracker.

### Bíblia Livre attribution

Bíblia Livre is used under Creative Commons Attribution 3.0 Brazil. Changes were not made to the wording. Credit the Bíblia Livre project when redistributing `blivre/`.

## How to add another public-domain text

1. Confirm the translation is public domain or carries a license that allows bundling (WEB, ASV, YLT, Darby, Webster, and the editions already used by bible-verse-tracker are the expected family). Do not add NIV, ESV, or any other restricted commercial text.
2. Add a row in `src/scripture/versions.ts` with a stable `id`, `language` (`en`, `es`, or `pt`), `folder`, display `name`, `abbr`, and `license`.
3. Create `public/scripture/<folder>/`.
4. For each book, add `<bookId>.json` using the book ids in `src/scripture/books.ts` (`gen`, `exo`, … `rev`). The JSON value is `string[][]`: one array per chapter, one string per verse, in traditional Protestant order.
5. Add the book id to `BUNDLED_BOOK_IDS` in `src/scripture/bundled.ts` when that book should open in Read, search, and the reading plan.
6. Note the license in this file and in the README.
7. Keep the service worker’s scripture cache in `vite.config.ts` able to fetch the new JSON (the existing runtime route already matches `/scripture/*.json`).

Verse of the Day only schedules passages whose books are bundled, so a new daily verse belongs in `src/scripture/daily.ts` after its book is added.
