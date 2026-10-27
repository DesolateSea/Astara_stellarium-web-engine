# Localization

Astara bundles English (`en`), German (`de`), French (`fr`), and Simplified
Chinese (`zh-Hans`) UI catalogs. No translation server or network request is
required at runtime.

## Choosing a language

On startup, a saved choice takes precedence over the browser/Android WebView
language preferences. Unsupported languages fall back to English. Simplified
Chinese accepts `zh`, `zh-CN`, `zh-SG`, and `zh-Hans`; Traditional Chinese tags
are not silently mapped to Simplified Chinese.
`src/languages.json` is the single registry for the selector, locale aliases,
date-library locale, widget locale, writing direction, and bundled font family.

Open **Settings → Language** to override the device language, or choose
**System language** to remove the override. A change saves `astara-language`
in localStorage and reloads the app. This resets transient view state while
initializing engine language, sky-culture caches, and fonts consistently.
If storage is unavailable, an error appears and the app does not reload.
The observer's location has no effect on the language.

## Frontend translations

- `apps/web-frontend/src/locale.js`: supported locales, preference resolution,
  and engine font selection.
- `apps/web-frontend/src/i18n.js`: Vue i18n catalogs and engine translation bridge.
- `apps/web-frontend/src/locales/*.json`: frontend catalogs.
- `apps/web-frontend/src/locales/ui.js`: expanded application messages, with
  one English/German/French/Simplified Chinese row per key.
- `src/locales/history.js`: every bundled historical title, biography, and event description.
- `src/locales/credits.js`: translated acknowledgments with citation links kept in the template.
- `src/locales/landscapes.js`: all eight bundled landscape titles and descriptions,
  rendered as plain text without fetching English HTML.
- `src/locales/object-types.js`: app-authored supplements for missing upstream object types.
- `src/locales/sky-names.js`: object-specific names whose English spelling is ambiguous.
- `src/translations/<locale>.json`: editable overrides and new-language catalogs,
  automatically bundled; empty draft strings do not suppress English fallback.
- Plugin catalogs are merged from `src/plugins/*/locales/*.json`.

Wrap visible UI strings in `$t('English source text')`; preserve placeholders
such as `{0}` and `{count}`. Use `$tc` for plural messages. Add each key to all
four catalogs (or all four columns in `ui.js`). Missing keys fall back to English;
development builds warn.
Moment, native date formatting, Vuetify widgets, and document `lang` use the
selected locale. Chinese UI and engine labels use bundled Noto Sans SC fonts.
Non-Latin fonts are selected from the language registry for both UI and engine;
the UI registers the matching local Regular/Bold TTFs automatically.

Settings, all sky-control submenus, search categories/filters/empty states,
object-detail labels, coordinate editing, calendar weekdays and calculated
event prose, historical content, landscapes, About, and Data Credits are localized. `event-localization.js`
formats event copies at display time, keeping category/object identifiers and
cached source events unchanged. Date formatting follows the selected language.

Historical catalogs translate the existing source content, not revise its dates
or scientific claims. Original landscape HTML is retained as source material and
as a fallback for landscapes added without a bundled translation.
Unknown proper names and unreviewed ambiguous names still fall back to the source;
external object descriptions are not translated by these bundled catalogs.
Localized names do not automatically add aliases to the search index.
Catalog identifiers (HIP, NGC, Messier), bibliographic titles, source links, and
satellite identifiers remain unchanged. Scientist display names use localized
spellings where conventional (especially Chinese). UI language and sky culture are independent.

## Stellarium translations

The engine's `translateFn(domain, text)` reads domain-specific JSON from
`src/engine-locales/`. The `getLangFn()` hook supplies its locale before core
initialization. **Rebuild the WASM engine after this change**: existing compiled
bundles do not contain the new `sys_set_lang_function` export.

The bundled catalogs reuse over 2,100 upstream sky names per language, including
Sun, Moon, planets, stars, deep-sky names, and meteor showers, and unambiguous
names appearing in the bundled sky cultures (coverage varies by locale).
Every one of the 290 object-type labels has an upstream or app-authored translation.
All 88 standard Western constellation names are covered. Culture-specific gettext contexts
are imported separately; the engine requests `skyculture/<culture>/<native name>`
and falls back through `skyculture/<culture>` to the unambiguous `skyculture` map.
Thus the two constellations called Compass can display distinct names. The
translation callback resolves this context before caching the resulting UTF-8
string, so switching cultures cannot reuse an earlier culture's meaning.
See `src/engine-locales/README.md` for the pinned revision and attribution.
Untranslated sky/sky-culture names fall back to the original text, not machine
translation. UI language and sky culture are separate settings.

To import a reviewed upstream catalog using Python's standard library:

```sh
cd apps/web-frontend
python3 tools/import-translations.py /path/to/de.po src/engine-locales/de.json \
  --domain sky --source 'https://github.com/Stellarium/stellarium/blob/<commit>/po/stellarium-sky/de.po'
python3 tools/import-culture-translations.py /path/to/culture-de.po src/engine-locales/de.json \
  --source 'https://github.com/Stellarium/stellarium/blob/<commit>/po/stellarium-skycultures/de.po'
```

The importer replaces only the selected domain and preserves other domains.
It excludes fuzzy, untranslated, obsolete, and plural entries. Because the
engine supplies no gettext context, conflicting translations of the same
source text are excluded instead of guessed. `--context` can select a reviewed
context; do not flatten culture-specific terms into a global map without
checking their meaning. The import retains upstream attribution and a source
checksum. Verify license compatibility before importing other catalogs.
`--keys-from /path/to/keys.json` restricts imports to a JSON list of source keys.
The culture importer uses an explicit reviewed culture/context mapping, filters
to bundled English names (including Chinese base names), and retains context
metadata with each scoped domain. Fuzzy, empty, and conflicting entries still
fall back safely. It does not guess missing translations.

Weblate can maintain these JSON/PO files as an optional self-hosted,
open-source contributor tool. Machine translation may draft new strings
offline, but terminology and placeholders must be reviewed before shipping.
Neither is a runtime dependency.

## Repeatable contributor workflow

Run these commands from `apps/web-frontend`. They use Node/Python and local files,
not an online translation service. They do **not** invent translations.

### Find and fix missing names

```sh
npm run l10n -- report zh-Hans --output /tmp/opencode/zh-Hans-gaps.json
npm run l10n -- template zh-Hans
```

The report contains English source values and exact domains/keys. It checks
bundled sky-culture data, human-readable star/deep-sky index names, UI/history/
credits, engine object types, and landscapes. It excludes recognizable catalog
numbers and Bayer/Flamsteed/variable-star identifiers. `unchanged` entries are
listed separately: Sirius in German is not necessarily a missing translation.
Scoped counts can overlap between cultures and do not mean unique objects.
Chinese numbered star names are checked by their translated base name, matching
the engine's numeral formatting rather than reporting thousands of false gaps.
Data loaded from outside the bundled indexes may still contain additional names.

`template` adds empty keys to `src/translations/zh-Hans.json` without overwriting
existing values. Supply `--output /tmp/opencode/work.json` for a separate work file.
The file has three sections:

```json
{
  "messages": { "Settings": "设置" },
  "engine": {
    "sky": { "Polaris": "北极星" },
    "skyculture/western/Pyxis": { "Compass": "罗盘座" }
  },
  "landscapes": {
    "ocean": { "title": "海洋", "description": "宁静的海洋地平线。" }
  }
}
```

Use exact source spellings from the report. General international names belong
in `engine.sky`; culture-specific meanings belong in scoped `skyculture/...`
domains. Put custom corrections here instead of modifying generated upstream
JSON, so a later PO reimport cannot erase them. Keep proper names where the
language convention does; never translate IDs just to eliminate every Latin
character. Search labels use the translation flag and raw-name lookup, but
canonical IDs, cached records, favourite matching, and navigation remain intact.
Translated labels are not automatically new search aliases.
Chinese display labels omit upstream Latin-name suffixes while retaining those
aliases in search data. Bayer/Flamsteed names keep their identifying letters and
numbers but use translated constellation labels, sourced from the existing
Western culture catalogs through `src/translations/designations.js`. English
retains the standard IAU form. Established French/German proper names can still
be identical to the international spelling (e.g. French Arcturus, German Spica).

### Add a language

For a Latin-script example:

```sh
npm run l10n -- init es --name 'Español'
npm run l10n -- report es --output /tmp/opencode/es-source.json
```

This registers `es` and creates **one editable catalog** at
`src/translations/es.json`, including the missing UI/content, object/sky/culture,
and landscape keys. Fill its empty values using the source report. The selector,
locale detection, catalog loading, widgets, and date formatting use the registry;
no new imports or pipe-table columns are required. Empty values remain English
fallbacks, so adding a draft language does not create blank controls.

For another script, first place licensed font files in
`public/fonts/<Family>-Regular.ttf` and `<Family>-Bold.ttf`, then choose them:

```sh
npm run l10n -- init hi --name 'हिन्दी' --font NotoSansDevanagari
```

`--aliases` accepts comma-separated device tags; `--moment` and `--vuetify`
select upstream library locale names when they differ (e.g. `zh-cn` vs `zh-Hans`).
`--dir rtl` selects RTL document/widget direction. Fonts, text shaping, and RTL
layouts still require testing on the target device. The checker rejects missing
TTFs; it cannot prove their glyph coverage. If Vuetify has no requested locale,
its built-in widget wording falls back to English. Existing four-language
pipe-table catalogs remain supported but are not the recommended way to extend
the language list.

Reuse reviewed Stellarium PO files with the import commands above. Upstream
imports and editable overrides are merged, with nonempty overrides taking
precedence. The nested JSON files can also be maintained with an open-source
tool such as Weblate; translation tooling is optional and never needed at runtime.

### Validate and ship

```sh
npm run l10n -- check
npm run test:localization
NODE_OPTIONS=--openssl-legacy-provider npm run build
npx cap sync android
```

`check` validates the registry, offline fonts, override value types, domains,
landscape keys, plain-text values, and interpolation placeholders. It allows
unfinished drafts; `report` is the separate completeness review. Then build the
Android APK normally. Catalog-only changes require a frontend rebuild/sync,
**not** a WASM rebuild, and installing an update preserves the saved language.
The localization tests include a native C formatter regression test and require
`cc` (GCC or Clang). Changes to `src/designation.c`, unlike catalog-only edits,
require rebuilding the WASM engine and copying its generated JS/WASM assets
before the frontend build. Raw common names in bundled star tiles must use the
same translation lookup as `NAME `-prefixed aliases.

## Checks

```sh
cd apps/web-frontend
npm run test:localization
node tools/audit-localization.js
python3 -m unittest discover -s tests -p 'test_*.py'
```

On Android and web, check each language at narrow screen widths, persistence
after restart, System language behavior, Chinese glyphs with Western and
Chinese sky cultures, date labels, and English fallback for unknown names.
Use the normal documented engine/frontend build before packaging an APK.
The template audit is read-only and reports source citations/proper names too;
it is not proof that dynamic labels or external data are fully translated.
