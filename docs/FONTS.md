# Fonts

## Eurostile (brand font) — read this before changing `@font-face`

`src/app/globals.css` declares three `Eurostile` faces (weights 400/700/800).
They **must** point at the `.woff2` files in `public/fonts/`, not the `.ttf`.

### What was wrong (fixed 2026-07-31)

The `@font-face` rules pointed at the original TrueType files:

```
eurostile-2-extended-bold.ttf   → weight 700
eurostile-2-extended.ttf        → weight 400
eurostile-becker-bold.ttf       → weight 800
```

Those files are 1990-era Macintosh TrueType. Browsers reject them outright —
`new FontFace(...).load()` fails with *"Invalid font data in ArrayBuffer"*, and
`document.fonts` reported `Eurostile:error` **on the live site**. Every headline
therefore fell back to Oswald, so the brand font was never actually rendering
in production.

Two concrete defects made the files fail browser font sanitising:

1. a corrupt `post` table (format 2 with 2 stray bytes in `stringData`)
2. an `OS/2` table at version 0 (too old to pass validation)

### The fix

Each `.ttf` was rebuilt with fontTools into a `.woff2`: `post` table converted
to format 3 (drops the corrupt glyph-name strings), `OS/2` raised to version 4
with the required metrics filled in, then compressed to WOFF2. Outlines,
kerning and hinting are unchanged — only container and metadata tables differ.

Result: fonts load, and they are 64 % smaller (43 KB → 15.6 KB for the 700 cut).

Verified in-browser after the change: `document.fonts.check('700 36px Eurostile')`
returns `true`, and a width probe of "RACESPOT" at 60px gives 489 px versus
361 px for Arial Black — i.e. the genuinely *Extended* (wide) cut is rendering,
not a fallback.

### Traps

- **Do not "fix" this by pointing at `public/fonts/eurostile.otf`.** That file
  loads fine in browsers but it is Eurostile **Regular** — a different, much
  narrower cut. Using it would silently change the brand look.
- Keep the `.ttf` files in the repo (source material / desktop use), but never
  reference them from CSS.
- If a font is ever replaced, verify in the browser console — a broken webfont
  fails **silently** behind the fallback stack and looks "fine" at a glance:
  ```js
  document.fonts.check('700 36px Eurostile')   // must be true
  ```

### Regenerating the WOFF2 files

```bash
python3 -m venv /tmp/fontenv && /tmp/fontenv/bin/pip install fonttools brotli
```

Then, per file: load with `TTFont(path, lazy=False)`, call `setGlyphOrder(getGlyphOrder())`
and touch `font["glyf"]` **before** editing `post` (fontTools needs the glyph
order while `post` is still intact), set `post.formatType = 3.0` and clear
`extraNames`/`mapping`, set `OS/2.version = 4` plus the `sTypo*`, `usWin*`,
`ulCodePageRange*`, `sxHeight`, `sCapHeight`, `usDefaultChar`, `usBreakChar` and
`usMaxContext` fields, then `font.flavor = "woff2"` and save.
