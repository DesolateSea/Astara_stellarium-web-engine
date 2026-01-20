#!/usr/bin/env python3
"""
Script to download HiPS landscapes from data.stellarium.org

This script parses the S3 bucket listing XML and downloads all landscape files
to the local skydata/landscapes directory.
"""

import os
import sys
import xml.etree.ElementTree as ET
import urllib.request
import urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
BASE_URL = "https://data.stellarium.org/"
XML_FILE = os.path.join(os.path.dirname(__file__), "..", "stellarium_data_listing.xml")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "apps", "web-frontend", "public", "skydata", "landscapes")

def parse_landscape_files(xml_path):
    """Parse the S3 listing XML and extract landscape file paths."""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    # Handle S3 namespace
    ns = {'s3': 'http://s3.amazonaws.com/doc/2006-03-01/'}
    
    landscape_files = []
    landscapes = set()
    
    # Find all Contents elements
    for contents in root.findall('.//s3:Contents', ns):
        key_elem = contents.find('s3:Key', ns)
        if key_elem is not None and key_elem.text:
            key = key_elem.text
            # Filter for landscape files (must be in a subdirectory, not a file like index.json)
            if key.startswith('landscapes/') and len(key) > len('landscapes/'):
                parts = key.split('/')
                # Must have at least 3 parts: landscapes/name/file
                # This filters out landscapes/index.json (only 2 parts)
                if len(parts) >= 3:
                    landscape_files.append(key)
                    landscapes.add(parts[1])
    
    # Also try without namespace (in case XML doesn't have namespace)
    if not landscape_files:
        for contents in root.findall('.//Contents'):
            key_elem = contents.find('Key')
            if key_elem is not None and key_elem.text:
                key = key_elem.text
                if key.startswith('landscapes/') and len(key) > len('landscapes/'):
                    parts = key.split('/')
                    if len(parts) >= 3:
                        landscape_files.append(key)
                        landscapes.add(parts[1])
    
    return landscape_files, sorted(landscapes)

def download_file(key, output_dir):
    """Download a single file from the S3 bucket."""
    url = BASE_URL + key
    # Remove 'landscapes/' prefix for local path since output_dir already points to landscapes
    relative_path = key[len('landscapes/'):]
    local_path = os.path.join(output_dir, relative_path)
    
    # Skip if it's a directory marker (ends with /)
    if key.endswith('/'):
        return None, "skipped (directory)"
    
    # Create directory if needed
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    
    # Skip if file already exists
    if os.path.exists(local_path):
        return key, "exists"
    
    try:
        urllib.request.urlretrieve(url, local_path)
        return key, "downloaded"
    except urllib.error.HTTPError as e:
        return key, f"error: HTTP {e.code}"
    except Exception as e:
        return key, f"error: {str(e)}"

def main():
    print(f"Parsing XML file: {XML_FILE}")
    
    if not os.path.exists(XML_FILE):
        print(f"Error: XML file not found at {XML_FILE}")
        print("Please download it first with:")
        print(f"  curl -o {XML_FILE} 'https://data.stellarium.org/'")
        sys.exit(1)
    
    landscape_files, landscapes = parse_landscape_files(XML_FILE)
    
    print(f"\nFound {len(landscapes)} landscapes:")
    for ls in landscapes:
        print(f"  - {ls}")
    
    print(f"\nTotal files to download: {len(landscape_files)}")
    print(f"Output directory: {OUTPUT_DIR}")
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Ask for confirmation
    response = input("\nProceed with download? [y/N]: ")
    if response.lower() != 'y':
        print("Aborted.")
        sys.exit(0)
    
    # Download files with progress
    print("\nDownloading...")
    downloaded = 0
    skipped = 0
    errors = 0
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(download_file, key, OUTPUT_DIR): key for key in landscape_files}
        
        for i, future in enumerate(as_completed(futures), 1):
            key, status = future.result()
            if status == "downloaded":
                downloaded += 1
                print(f"  [{i}/{len(landscape_files)}] Downloaded: {key}")
            elif status == "exists":
                skipped += 1
            elif status and status.startswith("error"):
                errors += 1
                print(f"  [{i}/{len(landscape_files)}] Error: {key} - {status}")
    
    print(f"\nDone!")
    print(f"  Downloaded: {downloaded}")
    print(f"  Skipped (existing): {skipped}")
    print(f"  Errors: {errors}")
    
    # Print summary for App.vue integration
    print("\n" + "="*60)
    print("Add these lines to App.vue to register the landscapes:")
    print("="*60)
    for ls in landscapes:
        if ls:  # Skip empty strings
            print(f"core.landscapes.addDataSource({{ url: dataBaseUrl + 'skydata/landscapes/{ls}', key: '{ls}' }})")

if __name__ == "__main__":
    main()
