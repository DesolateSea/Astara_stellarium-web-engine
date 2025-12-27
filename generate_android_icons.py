import os
from PIL import Image

def generate_icons(source_path, android_res_path):
    """
    Generate Android launcher icons from a source image.
    
    For Adaptive Icons, the foreground must be 108dp with the visible area
    being only the center 72dp (66%). We'll make the icon occupy ~55% of the
    canvas to ensure it doesn't get cropped.
    """
    
    # Standard legacy icon sizes (48dp baseline)
    legacy_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }
    
    # Adaptive foreground sizes (108dp baseline = 2.25x legacy)
    foreground_sizes = {
        "mipmap-mdpi": 108,
        "mipmap-hdpi": 162,
        "mipmap-xhdpi": 216,
        "mipmap-xxhdpi": 324,
        "mipmap-xxxhdpi": 432
    }
    
    if not os.path.exists(source_path):
        print(f"Source image {source_path} not found")
        return

    source_img = Image.open(source_path).convert("RGBA")
    
    for folder in legacy_sizes:
        dir_path = os.path.join(android_res_path, folder)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
        
        # --- Legacy Icons (ic_launcher.png, ic_launcher_round.png) ---
        legacy_size = legacy_sizes[folder]
        legacy_icon = source_img.resize((legacy_size, legacy_size), Image.Resampling.LANCZOS)
        legacy_icon.save(os.path.join(dir_path, "ic_launcher.png"))
        legacy_icon.save(os.path.join(dir_path, "ic_launcher_round.png"))
        
        # --- Adaptive Foreground (ic_launcher_foreground.png) ---
        fg_size = foreground_sizes[folder]
        # The icon should be about 60% of the foreground canvas
        icon_size = int(fg_size * 0.70)
        
        # Create transparent canvas
        fg_canvas = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
        # Resize source icon
        fg_icon = source_img.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        # Center it on the canvas
        offset = (fg_size - icon_size) // 2
        fg_canvas.paste(fg_icon, (offset, offset), fg_icon)
        fg_canvas.save(os.path.join(dir_path, "ic_launcher_foreground.png"))
        
        print(f"Generated icons for {folder}")

    print("Done! All icons generated.")

if __name__ == "__main__":
    base_path = os.path.abspath(os.path.dirname(__file__))
    source = os.path.join(base_path, "apps", "web-frontend", "public", "stellarium.png")
    android_res = os.path.join(base_path, "apps", "web-frontend", "android", "app", "src", "main", "res")
    generate_icons(source, android_res)
