"""Run: python3 -m unittest discover -s scripts/tests"""
import importlib.util
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET
from PIL import Image

SCRIPT = Path(__file__).resolve().parents[1] / "generate_android_icons.py"
spec = importlib.util.spec_from_file_location("icons", SCRIPT)
icons = importlib.util.module_from_spec(spec)
spec.loader.exec_module(icons)


class IconTests(unittest.TestCase):
    def test_foreground_is_transparent_and_centered(self):
        svg = ET.parse(icons.SOURCE).getroot()
        image = icons.render(svg, 432, foreground_only=True)
        self.assertEqual(image.getpixel((0, 0))[3], 0)
        self.assertEqual(image.getpixel((216, 204))[3], 255)
        # Foreground fits the central adaptive-icon safe region, not a square
        # photograph on a white tile.
        alpha = image.getchannel("A").point(lambda a: 255 if a > 128 else 0)
        left, top, right, bottom = alpha.getbbox()
        self.assertGreater(left, 432 / 6)
        self.assertGreater(top, 432 / 6)
        self.assertLess(right, 432 * 5 / 6)
        self.assertLess(bottom, 432 * 5 / 6)
        for y in range(432):
            for x in range(432):
                if alpha.getpixel((x, y)):
                    self.assertLessEqual(((x-216)**2 + (y-216)**2)**0.5, 33 * 4 + 1)

    def test_web_icon_sizes_match_manifest(self):
        for file, size in [("stellarium.png", 512), ("astara-icon-192.png", 192)]:
            with Image.open(icons.PUBLIC / file) as image:
                self.assertEqual(image.size, (size, size))

    def test_android_density_sizes_and_round_masks(self):
        for density, size in [("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144), ("xxxhdpi", 192)]:
            folder = icons.RES / ("mipmap-" + density)
            with Image.open(folder / "ic_launcher.png") as image:
                self.assertEqual(image.size, (size, size))
            with Image.open(folder / "ic_launcher_round.png") as image:
                self.assertEqual(image.getpixel((0, 0))[3], 0)
            with Image.open(folder / "ic_launcher_foreground.png") as image:
                self.assertEqual(image.size, (round(size * 2.25),) * 2)
                self.assertEqual(image.getpixel((0, 0))[3], 0)

    def test_themed_icon_is_monochrome(self):
        vector = ET.parse(icons.RES / "drawable/ic_launcher_monochrome.xml").getroot()
        for path in vector:
            for attribute in ("fillColor", "strokeColor"):
                color = path.get("{" + icons.ANDROID + "}" + attribute)
                self.assertIn(color, (None, "#FFFFFF", "#00000000"))


if __name__ == "__main__":
    unittest.main()
