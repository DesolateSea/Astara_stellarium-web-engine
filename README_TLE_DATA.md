# Satellite TLE Data Processing Guide

This document describes the process of extracting, processing, and updating satellite TLE (Two-Line Element) data for the Stellarium Web Engine.

## 1. Overview
Satellite positions in Stellarium are calculated using the **SGP4 (Simplified General Perturbations 4)** propagator. This requires up-to-date orbital elements (TLEs) provided by the North American Aerospace Defense Command (NORAD).

## 2. Data Acquisition
The primary source for satellite data is [Space-Track.org](https://www.space-track.org).

### Recommended Download
- **Type:** Full Catalog
- **Format:** **3LE** (3-Line Element)
- **Why?** Standard TLE only contains the two lines of orbital data. 3LE includes "Line 0" (the satellite's common name), which is required for our search index and UI display.

## 3. Data Format
The application uses a JSON Lines (`.jsonl`) format where each line is a standalone JSON object.

### Schema Example:
```json
{
  "types": ["Asa"],
  "model": "tle_satellite",
  "model_data": {
    "norad_number": 44939,
    "designation": "20001AB",
    "tle": [
      "1 44939U 20001AB  20029.50001157  .00111291  00000-0  78686-3 0  9997",
      "2 44939  52.9968 285.3893 0001218  70.8095  81.0718 15.73196118  1906"
    ],
    "group": ["Starlink"],
    "status": "Operational",
    "owner": "United States",
    "launch_date": "2020-01-07"
  },
  "names": ["NAME STARLINK-1083", "NORAD 44939"],
  "short_name": "STARLINK-1083",
  "interest": 3.1
}
```

## 4. Processing Pipeline

### Step 1: 3LE to JSONL Conversion
Convert the raw text file from Space-Track into the JSONL format shown above. 
- **Line 0:** Map to `short_name` and `names`.
- **Line 1 & 2:** Strip whitespace and add to the `tle` array.
- **Metadata:** Fields like `group`, `status`, and `owner` help with filtering in the UI.

### Step 1: 3LE to JSONL Conversion
Convert the raw 3-line element data into the structured JSONL format used by the engine.
- **Tool:** `tle_satellite/convert_tle.py`
- **Action:** This script parses `tle_satellite/tle_base.txt`, applies operational status filters (excluding debris/rocket bodies), and filters out data older than 30 days.
- **Run:** `python tle_satellite/convert_tle.py`

### Step 2: Quality Control (Error Filtering)
Satellite data can occasionally contain errors that cause the SGP4 propagator to fail (e.g., "err=1" position errors).
- **Tool:** `tle_satellite/remove_error_satellites.py`
- **Action:** This script filters out satellites that have been identified as problematic in the application logs.
- **Run:** `python tle_satellite/remove_error_satellites.py`

### Step 3: Compression
To optimize engine loading and bandwidth, the engine prefers a gzipped version of the data.
- **Tool:** `tle_satellite/compress_sat.py`
- **Output:** Creates `tle_satellite.dat` from `tle_satellite.jsonl`.
- **Run:** `python tle_satellite/compress_sat.py`

## 5. Deployment Locations
Once processed, the scripts automatically update the files in the following locations:

| Destination | Purpose |
| ----------- | ------- |
| `apps/web-frontend/public/skydata/` | Web application source |
| `apps/web-frontend/dist/skydata/` | Production build artifacts (manual copy) |
| `apps/web-frontend/android/app/src/main/assets/public/skydata/` | Offline mobile app assets (manual copy) |

## 6. Troubleshooting
- **Satellite not updating:** Check the `epoch` in Line 1 of the TLE. TLE data is typically only valid for ~2 weeks.
- **White screen / Loading error:** Ensure the `.jsonl` file does not have empty lines or trailing commas between lines.
- **Position Error (err=1):** The satellite's orbital elements may be physically impossible for SGP4 at the current time. Remove these using the cleanup script.
