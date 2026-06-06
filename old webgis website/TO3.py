"""
TO3.py — GeoInsight Nepal · Flask Backend
==========================================
Full-stack WebGIS backend that demonstrates a production-grade
GeoJSON preprocessing pipeline before serving map data via REST API.

Pipeline:  RAW GeoJSON  →  Validate  →  Simplify  →  Serve
"""

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import json
import math
import os

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 · GEOMETRY VALIDATOR
# In production: from shapely.geometry import shape; shape(geom).is_valid
# Here we implement a pure-Python equivalent for portability.
# ─────────────────────────────────────────────────────────────────────────────

VALID_GEOMETRY_TYPES = {
    "Point", "MultiPoint", "LineString", "MultiLineString",
    "Polygon", "MultiPolygon", "GeometryCollection"
}

def validate_geojson_geometry(geom: dict) -> tuple[bool, str]:
    """
    Lightweight GeoJSON geometry validator.

    Checks:
      · 'type' field is a recognised geometry type
      · 'coordinates' key is present
      · No NaN / null numeric values in coordinate tuples
      · Polygon / MultiPolygon rings are closed (first coord == last coord)

    Returns:
        (True,  "Valid")          on success
        (False, "<reason>")       on failure
    """
    if not isinstance(geom, dict):
        return False, "Geometry must be a JSON object"

    g_type = geom.get("type")
    if g_type not in VALID_GEOMETRY_TYPES:
        return False, f"Unrecognised geometry type: '{g_type}'"

    coords = geom.get("coordinates")
    if coords is None and g_type != "GeometryCollection":
        return False, "Missing 'coordinates' field"

    # ── Recursively validate coordinate values ──────────────────────────────
    def _check_coords(obj, depth):
        """depth 0 = a single [lng, lat] pair."""
        if depth == 0:
            if not isinstance(obj, (list, tuple)) or len(obj) < 2:
                return False, "Coordinate pair must have ≥ 2 values"
            for v in obj:
                if not isinstance(v, (int, float)) or math.isnan(v) or math.isinf(v):
                    return False, f"Invalid coordinate value: {v}"
            return True, "OK"
        for item in obj:
            ok, msg = _check_coords(item, depth - 1)
            if not ok:
                return False, msg
        return True, "OK"

    coord_depth = {
        "Point": 0, "MultiPoint": 1,
        "LineString": 1, "MultiLineString": 2,
        "Polygon": 2, "MultiPolygon": 3,
    }

    if g_type in coord_depth:
        ok, msg = _check_coords(coords, coord_depth[g_type])
        if not ok:
            return False, msg

    # ── Polygon ring closure check ──────────────────────────────────────────
    def _check_closed(rings):
        for ring in rings:
            if len(ring) < 4:
                return False, "Polygon ring must have ≥ 4 positions"
            if ring[0] != ring[-1]:
                return False, "Polygon ring is not closed (first ≠ last coordinate)"
        return True, "OK"

    if g_type == "Polygon":
        ok, msg = _check_closed(coords)
        if not ok:
            return False, msg

    elif g_type == "MultiPolygon":
        for poly in coords:
            ok, msg = _check_closed(poly)
            if not ok:
                return False, msg

    return True, "Valid"


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 · GEOMETRY SIMPLIFIER  (Ramer–Douglas–Peucker)
# In production: shape(geom).simplify(tolerance, preserve_topology=True)
# ─────────────────────────────────────────────────────────────────────────────

def _point_line_distance(p, a, b) -> float:
    """Perpendicular distance from point p to line segment a→b."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    if dx == 0 and dy == 0:
        return math.hypot(p[0] - a[0], p[1] - a[1])
    t = max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
    proj = [a[0] + t * dx, a[1] + t * dy]
    return math.hypot(p[0] - proj[0], p[1] - proj[1])


def rdp(points: list, epsilon: float) -> list:
    """
    Ramer–Douglas–Peucker vertex reduction.
    Retains points that deviate more than `epsilon` from the simplified line.
    Preserves first and last points (keeps rings closed).
    """
    if len(points) <= 2:
        return points

    max_dist, max_idx = 0.0, 0
    for i in range(1, len(points) - 1):
        d = _point_line_distance(points[i], points[0], points[-1])
        if d > max_dist:
            max_dist, max_idx = d, i

    if max_dist > epsilon:
        left  = rdp(points[:max_idx + 1], epsilon)
        right = rdp(points[max_idx:],     epsilon)
        return left[:-1] + right

    return [points[0], points[-1]]


def simplify_geometry(geom: dict, epsilon: float = 0.008) -> dict:
    """
    Applies RDP simplification to Polygon / MultiPolygon coordinates.
    Other geometry types are returned unchanged.

    epsilon ≈ degrees; 0.008° ≈ ~890 m at Nepal's latitude — suitable for
    province-level display. Tighten for district-level data.
    """
    g_type = geom.get("type")

    if g_type == "Polygon":
        geom["coordinates"] = [
            rdp(ring, epsilon) for ring in geom["coordinates"]
        ]
    elif g_type == "MultiPolygon":
        geom["coordinates"] = [
            [rdp(ring, epsilon) for ring in polygon]
            for polygon in geom["coordinates"]
        ]

    return geom


# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 · FULL PREPROCESSING PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

def preprocess_feature(feature: dict, epsilon: float = 0.008) -> dict | None:
    """
    Runs a single GeoJSON Feature through the full pipeline:
      1. Validate geometry structure & coordinate values
      2. Simplify polygon vertices via RDP
      3. Return cleaned feature, or None if invalid

    This mirrors what shapely-based production code would do:
        shape = shape(feature['geometry'])
        if not shape.is_valid: shape = shape.buffer(0)   # auto-repair
        simplified = shape.simplify(tolerance, preserve_topology=True)
    """
    geom = feature.get("geometry", {})
    name = feature.get("properties", {}).get("name", "unnamed")

    # 1 · Validate
    valid, reason = validate_geojson_geometry(geom)
    if not valid:
        print(f"  [SKIP] '{name}' — geometry invalid: {reason}")
        return None

    print(f"  [OK]   '{name}' — valid ({geom['type']})")

    # 2 · Simplify
    orig_verts = sum(len(r) for r in geom.get("coordinates", []))
    geom = simplify_geometry(geom, epsilon)
    new_verts  = sum(len(r) for r in geom.get("coordinates", []))
    reduction  = round((1 - new_verts / max(orig_verts, 1)) * 100, 1)
    print(f"         vertices: {orig_verts} → {new_verts}  ({reduction}% reduction)")

    feature["geometry"] = geom
    return feature


# ─────────────────────────────────────────────────────────────────────────────
# RAW DATA — Nepal Provinces  (approximate boundaries, Census 2021 statistics)
# In production this would be loaded from a PostGIS database or a shapefile.
# ─────────────────────────────────────────────────────────────────────────────

RAW_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [86.70, 26.45], [87.10, 26.50], [87.55, 26.60],
                    [88.00, 26.62], [88.20, 26.75], [88.15, 27.10],
                    [87.80, 27.50], [87.40, 27.80], [87.00, 27.95],
                    [86.50, 27.90], [86.10, 27.70], [85.90, 27.45],
                    [85.95, 27.10], [86.10, 26.85], [86.40, 26.60],
                    [86.70, 26.45]
                ]]
            },
            "properties": {
                "province_no": 1, "name": "Koshi Province",
                "capital": "Biratnagar", "density": 183,
                "population": 4534943, "area_km2": 25905, "hdi": 0.499,
                "description": "Home to Mt. Everest & lush Terai plains"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [84.90, 26.35], [85.30, 26.38], [85.80, 26.40],
                    [86.30, 26.42], [86.70, 26.45], [86.40, 26.60],
                    [86.10, 26.85], [85.95, 27.10], [85.50, 27.05],
                    [85.10, 26.95], [84.90, 26.80], [84.90, 26.35]
                ]]
            },
            "properties": {
                "province_no": 2, "name": "Madhesh Province",
                "capital": "Janakpur", "density": 487,
                "population": 6126288, "area_km2": 9661, "hdi": 0.433,
                "description": "Fertile Terai heartland — most densely populated"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [84.40, 26.90], [84.90, 26.80], [85.10, 26.95],
                    [85.50, 27.05], [85.90, 27.45], [86.10, 27.70],
                    [85.80, 28.00], [85.40, 28.30], [85.00, 28.20],
                    [84.55, 28.05], [84.20, 27.70], [84.10, 27.35],
                    [84.40, 26.90]
                ]]
            },
            "properties": {
                "province_no": 3, "name": "Bagmati Province",
                "capital": "Hetauda", "density": 553,
                "population": 6084042, "area_km2": 20300, "hdi": 0.605,
                "description": "Contains Kathmandu Valley — political & cultural core"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [83.30, 27.70], [84.10, 27.35], [84.40, 26.90],
                    [84.55, 28.05], [85.00, 28.20], [84.75, 28.55],
                    [84.20, 28.85], [83.70, 28.70], [83.15, 28.40],
                    [82.90, 28.05], [83.10, 27.85], [83.30, 27.70]
                ]]
            },
            "properties": {
                "province_no": 4, "name": "Gandaki Province",
                "capital": "Pokhara", "density": 78,
                "population": 2403757, "area_km2": 21774, "hdi": 0.534,
                "description": "Annapurna massif & Pokhara's lakeside paradise"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [81.90, 27.35], [82.50, 27.20], [83.10, 27.20],
                    [83.30, 27.70], [83.10, 27.85], [82.90, 28.05],
                    [82.50, 28.30], [82.00, 28.10], [81.60, 27.95],
                    [81.40, 27.65], [81.70, 27.45], [81.90, 27.35]
                ]]
            },
            "properties": {
                "province_no": 5, "name": "Lumbini Province",
                "capital": "Butwal", "density": 203,
                "population": 5124225, "area_km2": 22288, "hdi": 0.490,
                "description": "Birthplace of the Buddha — Lumbini pilgrimage centre"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [80.60, 28.40], [81.40, 27.65], [81.60, 27.95],
                    [82.00, 28.10], [82.50, 28.30], [82.90, 28.05],
                    [83.15, 28.40], [83.00, 29.00], [82.40, 29.35],
                    [81.70, 29.20], [81.10, 28.95], [80.60, 28.70],
                    [80.60, 28.40]
                ]]
            },
            "properties": {
                "province_no": 6, "name": "Karnali Province",
                "capital": "Birendranagar", "density": 32,
                "population": 1693535, "area_km2": 27984, "hdi": 0.452,
                "description": "Remote highlands — lowest density, rugged terrain"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [79.80, 29.40], [80.20, 29.05], [80.60, 28.70],
                    [81.10, 28.95], [81.70, 29.20], [81.30, 29.75],
                    [80.70, 30.05], [80.10, 29.90], [79.80, 29.60],
                    [79.80, 29.40]
                ]]
            },
            "properties": {
                "province_no": 7, "name": "Sudurpashchim Province",
                "capital": "Dhangadhi", "density": 86,
                "population": 2552517, "area_km2": 19539, "hdi": 0.478,
                "description": "Far-western frontier with Shuklaphanta wildlife reserve"
            }
        }
    ]
}


# ─────────────────────────────────────────────────────────────────────────────
# FLASK APPLICATION
# ─────────────────────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)  # Allow cross-origin requests from the frontend


@app.route("/api/map-data")
def get_map_data():
    """
    REST endpoint: GET /api/map-data

    Runs every raw feature through the preprocessing pipeline and returns
    a clean, lightweight GeoJSON FeatureCollection ready for Leaflet.

    Response shape:
    {
      "type": "FeatureCollection",
      "features": [ ... ],
      "metadata": { "attribute": "density", ... }
    }
    """
    processed, skipped = [], 0

    for raw_feature in RAW_GEOJSON["features"]:
        # Deep-copy so the pipeline can mutate safely without touching RAW_GEOJSON
        import copy
        feature = copy.deepcopy(raw_feature)
        result = preprocess_feature(feature, epsilon=0.006)

        if result is not None:
            processed.append(result)
        else:
            skipped += 1

    return jsonify({
        "type": "FeatureCollection",
        "features": processed,
        "metadata": {
            "total_features":   len(processed),
            "skipped_invalid":  skipped,
            "attribute":        "density",
            "attribute_unit":   "people / km²",
            "attribute_range":  {
                "min": min(f["properties"]["density"] for f in processed),
                "max": max(f["properties"]["density"] for f in processed),
            },
            "source":       "Nepal Census 2021 (demo-approximated boundaries)",
            "preprocessed": True,
            "simplification_epsilon": 0.006,
        }
    })


@app.route("/")
def index():
    """Serve the dashboard HTML."""
    return send_from_directory(".", "TO3.html")


# ─────────────────────────────────────────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "═" * 60)
    print("  GeoInsight Nepal — WebGIS Backend")
    print("  GeoJSON Preprocessing Pipeline")
    print("═" * 60)
    print(f"\n  Loading {len(RAW_GEOJSON['features'])} raw province features…\n")

    import copy
    valid_count = sum(
        1 for f in RAW_GEOJSON["features"]
        if preprocess_feature(copy.deepcopy(f), 0.006) is not None
    )

    print(f"\n  ✓ {valid_count}/{len(RAW_GEOJSON['features'])} features passed validation")
    print("  → API ready at:  http://localhost:5000/api/map-data")
    print("  → Dashboard at:  http://localhost:5000/\n")
    print("═" * 60 + "\n")

    app.run(debug=True, port=5000)