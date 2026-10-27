import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location(
    'import_translations', Path(__file__).parents[1] / 'tools/import-translations.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

spec = importlib.util.spec_from_file_location(
    'import_cultures', Path(__file__).parents[1] / 'tools/import-culture-translations.py')
cultures = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cultures)


class TranslationImportTests(unittest.TestCase):
    def test_entries(self):
        text = '''msgid ""
msgstr "Header"

msgctxt "major planet"
msgid "Mars"
msgstr "火星"

#, fuzzy
msgid "Draft"
msgstr "草稿"

#~ msgid "Removed"
#~ msgstr "删除"

msgid "Multi"
"line"
msgstr "多"
"行"

msgid "Empty"
msgstr ""

msgid "item"
msgid_plural "items"
msgstr[0] "项目"
'''
        self.assertEqual(module.convert(module.parse_po(text)), {'Mars': '火星', 'Multiline': '多行'})

    def test_ambiguous_contexts(self):
        entries = [
            {'msgid': 'Io', 'msgstr': '木卫一', 'msgctxt': 'moon'},
            {'msgid': 'Io', 'msgstr': '犊神星', 'msgctxt': 'minor planet'}]
        self.assertEqual(module.convert(entries), {})
        self.assertEqual(module.convert(entries, ['moon']), {'Io': '木卫一'})

    def test_culture_keys_include_base_names_without_changing_originals(self):
        data = {'constellations': [{'common_name': {'english': 'Eagle', 'native': 'Aquila'}}],
                'common_names': {'HIP 1': [{'english': 'Three Stars Added IX'}],
                                 'HIP 2': [{'english': 'Three Stars IV'}]}}
        self.assertEqual(cultures.culture_keys(data),
                         {'Eagle', 'Three Stars Added IX', 'Three Stars IV', 'Three Stars', 'Added'})
        self.assertEqual(data['common_names']['HIP 1'][0]['english'], 'Three Stars Added IX')

    def test_scoped_contexts_do_not_flatten_other_cultures(self):
        entries = [
            {'msgid': 'Maiden', 'msgstr': '室女座', 'msgctxt': 'IAU constellation name'},
            {'msgid': 'Maiden', 'msgstr': '处女', 'msgctxt': 'Greek zodiacal sign'},
            {'msgid': 'Maiden', 'msgstr': '少女'}]
        self.assertEqual(module.convert(entries), {})
        self.assertEqual(module.convert(entries, cultures.CONTEXTS['western']), {'Maiden': '室女座'})


if __name__ == '__main__':
    unittest.main()
