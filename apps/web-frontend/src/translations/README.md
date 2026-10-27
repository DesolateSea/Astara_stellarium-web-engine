# Translation overrides and new languages

Each `<locale>.json` file can contain `messages`, `engine`, and `landscapes`.
These are automatically bundled and override the legacy and imported catalogs.
Empty strings are drafts and fall back to English, never blank labels.

Use `npm run l10n -- init <locale> --name '<native name>'` to create a template
and register a new language. Use `npm run l10n -- report <locale>` to find gaps,
and `npm run l10n -- check` to validate formatting before a build.
For an existing locale, `npm run l10n -- template <locale>` adds missing draft
keys without overwriting your translations or upstream files. `--output` can
write a separate work file instead. Reports can also be saved with `--output`.

See `docs/localization.md` at the repository root for the full workflow.
