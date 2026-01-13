import urllib.request
import os
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

fonts_dir = r"d:\test\stellarium-web-engine-master\apps\web-frontend\public\fonts"

# Using reliable CDNs
fonts = {
    "NotoSansSC-Regular.ttf": "https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-sc@0.2.3/NotoSansSC_400Regular.ttf",
    "NotoSansSC-Bold.ttf": "https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-sc@0.2.3/NotoSansSC_700Bold.ttf",
    # Re-download DejaVu just to be safe it's correct
    "DejaVuSans.ttf": "https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/master/ttf/DejaVuSans.ttf",
    "DejaVuSans-Bold.ttf": "https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/master/ttf/DejaVuSans-Bold.ttf"
}

for filename, url in fonts.items():
    print(f"Downloading {filename}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            with open(os.path.join(fonts_dir, filename), 'wb') as out_file:
                out_file.write(response.read())
        print(f"Successfully downloaded {filename}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")
