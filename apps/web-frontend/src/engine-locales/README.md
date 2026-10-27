# Upstream translation attribution

The `sky` entries in `de.json`, `fr.json`, and `zh-Hans.json` are the unambiguous,
non-fuzzy singular entries of Stellarium's `po/stellarium-sky/{de,fr,zh_CN}.po`
at revision `210b7ccbaa174b673a48fa9ff57ebd37239c1cb4`:

https://github.com/Stellarium/stellarium/tree/210b7ccbaa174b673a48fa9ff57ebd37239c1cb4/po/stellarium-sky

The upstream files state:

> Copyright (C) YEAR Stellarium's team
> This file is distributed under the same license as the PACKAGE package.

Stellarium is GPL-2.0-or-later. These translations are redistributed as part of
Astara under AGPL-3.0; upstream attribution is retained here. See the upstream
[COPYING](https://github.com/Stellarium/stellarium/blob/210b7ccbaa174b673a48fa9ff57ebd37239c1cb4/COPYING)
and Astara's `LICENSE-AGPL-3.0.txt`.

The PO headers credit the following translators:

- **German:** Susanne Hoffmann, Susanne M Hoffmann, Simon Hoffmann,
  Alexander V. Wolf, Alexander Stohr, cardinot, Latein Lebt, Georg Zotti.
- **French:** Bruno Averty, Didier Dubreuil, Alexander V. Wolf, Ascor8522,
  Frédéric Guérin, Lionel HANNEQUIN, Mathieu Corbett, Léo, Ziirofan, cardinot,
  Nicolas Martignoni.
- **Simplified Chinese:** StarryNight268, Fluorine Zhu, 杨 先生, Cat Astro,
  hongming chu, Silas Wong, cardinot, 殳玮 孙.

Other engine strings fall back to their original text. New PO imports made
with `tools/import-translations.py` retain the original header, source URL,
and SHA-256 in the output catalog's `_sources` field. Keep culture-specific
terms separate and review gettext context collisions before importing.
# Expanded catalogs

The `gui` domain additionally imports unambiguous translations matching the
object-type names in `src/otypes.c`. The `skyculture` domain imports only English
names used by bundled `public/skydata/skycultures/*/index.json` files. Both use
the same pinned upstream revision as the planet seed catalog. Each JSON retains
the upstream PO attribution, URL, and SHA-256 in `_sources`.

Conflicting gettext contexts, fuzzy entries and missing translations are
excluded; untranslated names remain in their source language. These catalogs
do not contain historical biographies or landscape descriptions; those are
translated in Astara's separate `src/locales/` catalogs.

`skyculture/<culture>` domains select reviewed upstream gettext contexts via
`tools/import-culture-translations.py`. They override the global culture catalog
only for that culture, retain the original PO attribution/checksum, and include
the selected contexts in `_sources`. The app-authored supplement in
`src/locales/sky-names.js` further distinguishes Pyxis and Circinus, which both
have the English source name Compass. Missing object types are supplemented in
`src/locales/object-types.js`; these are not presented as upstream translations.
