#!/usr/bin/env python3
"""Convert reviewed gettext catalogs to offline engine JSON (stdlib only)."""
import argparse
import ast
import hashlib
import json
from pathlib import Path
import re


def parse_po(text):
    """Read singular PO entries, retaining context and excluding fuzzy entries."""
    entries = []
    entry = {}
    field = None
    for line in (text + '\n\n').splitlines():
        line = line.strip()
        if not line:
            if entry:
                if not entry.get('fuzzy') and 'msgid_plural' not in entry:
                    entries.append(entry)
                entry = {}
            field = None
        elif line.startswith('#,'):
            entry['fuzzy'] = entry.get('fuzzy', False) or 'fuzzy' in [
                flag.strip() for flag in line[2:].split(',')]
        elif line.startswith('#'):
            continue
        elif line.startswith('"') and field:
            entry[field] += ast.literal_eval(line)
        else:
            match = re.match(r'(msgctxt|msgid_plural|msgid|msgstr(?:\[\d+\])?)\s+(".*")$', line)
            if not match:
                raise ValueError('Unsupported PO line: ' + line)
            field = match[1]
            entry[field] = ast.literal_eval(match[2])
    return entries


def convert(entries, contexts=None):
    candidates = {}
    for entry in entries:
        key, value = entry.get('msgid'), entry.get('msgstr')
        if not key or not value:
            continue
        if contexts is not None and entry.get('msgctxt', '') not in contexts:
            continue
        candidates.setdefault(key, set()).add(value)
    # The engine supplies a domain but no gettext context. Ambiguous terms
    # must fall back to English rather than select an arbitrary translation.
    return {key: next(iter(values)) for key, values in sorted(candidates.items())
            if len(values) == 1}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--domain', choices=['gui', 'sky', 'skyculture'], required=True)
    parser.add_argument('--source', required=True, help='Pinned upstream URL/revision for attribution')
    parser.add_argument('--context', action='append', help='Limit to these gettext contexts')
    parser.add_argument('--keys-from', type=Path, help='Import only keys in this JSON list')
    args = parser.parse_args()
    text = args.input.read_text(encoding='utf-8-sig')
    catalog = json.loads(args.output.read_text()) if args.output.exists() else {}
    catalog[args.domain] = convert(parse_po(text), args.context)
    if args.keys_from:
        keys = set(json.loads(args.keys_from.read_text()))
        catalog[args.domain] = {key: value for key, value in catalog[args.domain].items()
                                if key in keys}
    comments = []
    for line in text.splitlines():
        if not line.startswith('#'):
            break
        comments.append(line)
    catalog.setdefault('_sources', {})[args.domain] = {
        'url': args.source,
        'sha256': hashlib.sha256(args.input.read_bytes()).hexdigest(),
        'attribution': '\n'.join(comments)
    }
    args.output.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    print(f'Imported {len(catalog[args.domain])} unambiguous {args.domain} translations')


if __name__ == '__main__':
    main()
