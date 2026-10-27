#!/usr/bin/env python3
"""Import reviewed culture-specific gettext contexts without flattening them."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re

spec = importlib.util.spec_from_file_location(
    'po_importer', Path(__file__).with_name('import-translations.py'))
po_importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(po_importer)

# Only use contexts whose meaning matches these bundled cultures.
CONTEXTS = {
    'western': ['IAU constellation name'],
    'western_hlad': ['IAU constellation name'],
    'western_rey': ['IAU constellation name'],
    'western_SnT': ['S&T constellation name'],
    'chinese': ['chinese skycultures', 'chinese lunar mansion'],
    'chinese_contemporary': ['chinese skycultures', 'chinese lunar mansion'],
    'indian': ['indian zodiac sign', 'indian lunar mansion'],
    'arabic_lunar_stations': ['arabian lunar stations'],
    'japanese_moon_stations': ['japanese lunar mansion'],
    'korean': ['korean lunar mansion'],
}


def culture_keys(data):
    keys = set()

    def visit(value):
        if isinstance(value, dict):
            if isinstance(value.get('english'), str):
                name = value['english']
                keys.add(name)
                # The engine translates the base name, then formats Added/numerals.
                keys.add(re.sub(r' (?:Added(?: [IVXLCDM]+)?|[IVXLCDM]+)$', '', name))
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(data)
    return keys | {'Added'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--source', required=True)
    parser.add_argument('--cultures', type=Path,
                        default=Path(__file__).resolve().parents[1] / 'public/skydata/skycultures')
    args = parser.parse_args()
    text = args.input.read_text(encoding='utf-8-sig')
    entries = po_importer.parse_po(text)
    catalog = json.loads(args.output.read_text())
    for culture, contexts in CONTEXTS.items():
        keys = culture_keys(json.loads((args.cultures / culture / 'index.json').read_text()))
        translations = po_importer.convert(entries, contexts)
        domain = 'skyculture/' + culture
        catalog[domain] = {key: value for key, value in translations.items() if key in keys}
        catalog.setdefault('_sources', {})[domain] = {
            'url': args.source,
            'sha256': hashlib.sha256(args.input.read_bytes()).hexdigest(),
            'contexts': contexts,
            'attribution': catalog['_sources']['skyculture']['attribution'],
        }
        print(f'Imported {len(catalog[domain])} {domain} translations')
    args.output.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
