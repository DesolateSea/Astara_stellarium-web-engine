"""Generate Android/web icons from assets/astara-icon.svg. Requires Pillow.

Run from any directory: python3 scripts/generate_android_icons.py
The small SVG subset below keeps generation offline and dependency-light.
"""
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts/assets/astara-icon.svg"
RES = ROOT / "apps/web-frontend/android/app/src/main/res"
PUBLIC = ROOT / "apps/web-frontend/public"
NS = {"svg": "http://www.w3.org/2000/svg"}
ANDROID = "http://schemas.android.com/apk/res/android"
ET.register_namespace("android", ANDROID)


def path_points(data):
    """Sample absolute M/L/C/Z paths; fail loudly on unsupported SVG edits."""
    tokens = re.findall(r"[A-Za-z]|[-+]?(?:\d*\.)?\d+", data)
    points, current, start = [], (0, 0), None
    i = 0
    while i < len(tokens):
        command = tokens[i]
        i += 1
        if command in ("M", "L"):
            current = tuple(map(float, tokens[i:i + 2]))
            i += 2
            points.append(current)
            if command == "M":
                start = current
        elif command == "C":
            values = list(map(float, tokens[i:i + 6]))
            i += 6
            p0, p1, p2, p3 = current, values[:2], values[2:4], values[4:6]
            for step in range(1, 65):
                t = step / 64
                points.append(tuple((1-t)**3*p0[a] + 3*(1-t)**2*t*p1[a]
                                    + 3*(1-t)*t*t*p2[a] + t**3*p3[a]
                                    for a in (0, 1)))
            current = tuple(p3)
        elif command == "Z":
            points.append(start)
            current = start
        else:
            raise ValueError("Unsupported SVG path command: " + command)
    return points


def render(svg, size, foreground_only=False):
    scale = size * 4 / 108
    background = svg.find("svg:g[@id='background']/svg:rect", NS).get("fill")
    image = Image.new("RGBA", (size * 4, size * 4),
                      (0, 0, 0, 0) if foreground_only else background)
    draw = ImageDraw.Draw(image)
    for shape in svg.find("svg:g[@id='foreground']", NS):
        if shape.tag.endswith("path"):
            points = [(x * scale, y * scale) for x, y in path_points(shape.get("d"))]
            if shape.get("fill") != "none":
                draw.polygon(points, fill=shape.get("fill"))
            if shape.get("stroke"):
                width = float(shape.get("stroke-width")) * scale
                draw.line(points, fill=shape.get("stroke"), width=round(width), joint="curve")
                # Round each sampled join too, avoiding hairline raster seams.
                for x, y in points:
                    r = width / 2
                    draw.ellipse((x-r, y-r, x+r, y+r), fill=shape.get("stroke"))
        elif shape.tag.endswith("circle"):
            x, y, r = [float(shape.get(key)) * scale for key in ("cx", "cy", "r")]
            draw.ellipse((x-r, y-r, x+r, y+r), fill=shape.get("fill"))
        else:
            raise ValueError("Unsupported SVG element: " + shape.tag)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def write_vector(svg, target, monochrome=False):
    attrs = {"width": "108dp", "height": "108dp", "viewportWidth": "108", "viewportHeight": "108"}
    vector = ET.Element("vector", {f"{{{ANDROID}}}{k}": v for k, v in attrs.items()})
    for shape in svg.find("svg:g[@id='foreground']", NS):
        if monochrome and shape.get("data-themed") == "false":
            continue
        if shape.tag.endswith("circle"):
            x, y, r = [float(shape.get(key)) for key in ("cx", "cy", "r")]
            data = f"M{x-r},{y}a{r},{r} 0,1 0,{2*r},0a{r},{r} 0,1 0,{-2*r},0"
        else:
            data = shape.get("d")
        fill = shape.get("fill", "none")
        attrs = {"pathData": data, "fillColor": "#00000000" if fill == "none" else ("#FFFFFF" if monochrome else fill)}
        if shape.get("stroke"):
            attrs.update(strokeColor="#FFFFFF" if monochrome else shape.get("stroke"),
                         strokeWidth=shape.get("stroke-width"), strokeLineCap="round", strokeLineJoin="round")
        ET.SubElement(vector, "path", {f"{{{ANDROID}}}{k}": v for k, v in attrs.items()})
    ET.indent(vector)
    target.parent.mkdir(parents=True, exist_ok=True)
    ET.ElementTree(vector).write(target, encoding="utf-8", xml_declaration=True)


def generate_icons():
    svg = ET.parse(SOURCE).getroot()
    for density, size in [("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144), ("xxxhdpi", 192)]:
        folder = RES / ("mipmap-" + density)
        folder.mkdir(parents=True, exist_ok=True)
        icon = render(svg, size)
        icon.save(folder / "ic_launcher.png")
        mask = Image.new("L", (size * 4, size * 4))
        ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
        round_icon = icon.copy()
        round_icon.putalpha(mask.resize((size, size), Image.Resampling.LANCZOS))
        round_icon.save(folder / "ic_launcher_round.png")
        render(svg, round(size * 2.25), foreground_only=True).save(folder / "ic_launcher_foreground.png")
    write_vector(svg, RES / "drawable-v24/ic_launcher_foreground.xml")
    write_vector(svg, RES / "drawable/ic_launcher_monochrome.xml", monochrome=True)
    render(svg, 512).save(PUBLIC / "stellarium.png")
    render(svg, 192).save(PUBLIC / "astara-icon-192.png")
    render(svg, 256).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Generated Astara launcher, adaptive, monochrome, and web icons.")


if __name__ == "__main__":
    generate_icons()
