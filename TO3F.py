"""
WANDERLUST NEPAL — TO3.py
Flask backend: serves pages, destination data, and nearby-places proxy.
"""

from flask import Flask, render_template, jsonify, request
import math
import urllib.parse
import urllib.request
import json

app = Flask(__name__)

# ── DESTINATION DATA ───────────────────────────────────────────────────────────
# (Moved from DEST constant in TO3.js)

DESTINATIONS = {
    "pokhara": {
        "name": "Pokhara",
        "region": "Gandaki Province · 822 m altitude",
        "distance": "200 km from Kathmandu · ~5 hrs by road",
        "duration": "5–7 days recommended",
        "img": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80&auto=format&fit=crop",
        "desc": (
            "Nepal's adventure capital and its most-visited city outside Kathmandu. "
            "Perched beside the serene Phewa Lake, Pokhara offers breathtaking reflections "
            "of the Annapurna massif on still mornings, and is the gateway to some of the "
            "world's finest trekking routes — the Annapurna Circuit, Annapurna Base Camp "
            "trek, and Poon Hill sunrise trek all begin here."
        ),
        "desc2": (
            "Beyond trekking, the city is famous for paragliding over terraced rice paddies, "
            "boating to the Tal Barahi island temple on Phewa Lake, exploring Gupteshwor Cave "
            "and witnessing Davis Falls plunge into an underground tunnel. The Lakeside promenade "
            "buzzes with cafés, music and a thoroughly relaxed energy that makes it easy to stay "
            "longer than planned."
        ),
        "attractions": [
            "🏔 Annapurna Range Views",
            "🚣 Phewa Lake Boating",
            "🪂 Paragliding / Zip-line",
            "🌊 Davis Falls",
            "🕌 Tal Barahi Temple",
            "🦇 Gupteshwor Cave",
            "🌅 Sarangkot Sunrise",
            "🏕 Annapurna Base Camp Trek",
        ],
        "links": [
            {"label": "Wikipedia",     "url": "https://en.wikipedia.org/wiki/Pokhara",                  "icon": "fa-brands fa-wikipedia-w", "primary": True},
            {"label": "Nepal Tourism", "url": "https://welcomenepal.com/places-to-see/pokhara/",        "icon": "fa-solid fa-globe",        "primary": False},
        ],
    },

    "mustang": {
        "name": "Mustang",
        "region": "Gandaki Province · 3,750–4,500 m altitude",
        "distance": "~320 km from Kathmandu · ~7 hrs to Jomsom",
        "duration": "10–14 days recommended",
        "img": "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800&q=80&auto=format&fit=crop",
        "desc": (
            "Once a sealed kingdom closed to outsiders until 1992, Mustang is unlike anywhere "
            "else on Earth. A high-altitude Tibetan plateau tucked behind the Annapurna and "
            "Dhaulagiri massifs, it sits in a rain shadow that creates a dramatically arid "
            "landscape of deep crimson canyons, wind-sculpted cliffs, and ancient cave systems "
            "with Buddhist art over a thousand years old."
        ),
        "desc2": (
            "The walled city of Lo Manthang — still presided over by a ceremonial king — holds "
            "four monasteries, a royal palace, and whitewashed streets unchanged since the 15th "
            "century. Upper Mustang requires a special restricted area permit (USD 500/10 days), "
            "making it one of Nepal's most exclusive and extraordinary destinations. The annual "
            "Tiji Festival here is among Asia's most spectacular events."
        ),
        "attractions": [
            "🏯 Lo Manthang Walled City",
            "🛕 Thubchen Monastery",
            "🏜 Crimson Canyon Trails",
            "🎭 Tiji Festival (May)",
            "🗻 Thorong La Pass",
            "🏛 Ancient Cave Frescoes",
            "🐴 Horse Culture & Polo",
            "🌄 Kaligandaki Gorge",
        ],
        "links": [
            {"label": "Wikipedia",   "url": "https://en.wikipedia.org/wiki/Mustang_District", "icon": "fa-brands fa-wikipedia-w", "primary": True},
            {"label": "Permit Info", "url": "https://ntb.gov.np",                              "icon": "fa-solid fa-passport",    "primary": False},
        ],
    },

    "chitwan": {
        "name": "Chitwan National Park",
        "region": "Bagmati Province · 100–800 m altitude",
        "distance": "150 km from Kathmandu · ~4 hrs by road",
        "duration": "3–4 days recommended",
        "img": "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80&auto=format&fit=crop",
        "desc": (
            "Nepal's first national park and a UNESCO World Heritage Site — a vast subtropical "
            "jungle teeming with remarkable wildlife. It is one of the last refuges of the "
            "endangered one-horned rhinoceros, with a population of over 700 individuals. "
            "Bengal tigers, gharial crocodiles, sloth bears, and more than 500 species of birds "
            "also call this forest home."
        ),
        "desc2": (
            "Explore on jeep drives through tall elephant grass, guided jungle walks with "
            "naturalists, and dugout canoe rides along the Rapti and Narayani rivers. The Tharu "
            "people — indigenous to the lowlands — offer cultural experiences through their unique "
            "stick-dance traditions and village homestays. Best visited October to March when "
            "wildlife gathers near water."
        ),
        "attractions": [
            "🦏 One-horned Rhino Safari",
            "🐯 Bengal Tiger Spotting",
            "🛶 Rapti River Canoe",
            "🦅 Bird Watching (500+ species)",
            "🌿 Guided Jungle Walk",
            "🐊 Gharial Crocodile River",
            "🎭 Tharu Cultural Dance",
            "🏘 Tharu Village Homestay",
        ],
        "links": [
            {"label": "Wikipedia",    "url": "https://en.wikipedia.org/wiki/Chitwan_National_Park", "icon": "fa-brands fa-wikipedia-w", "primary": True},
            {"label": "Park Website", "url": "https://chitwannationalpark.gov.np",                   "icon": "fa-solid fa-globe",        "primary": False},
        ],
    },

    "lumbini": {
        "name": "Lumbini",
        "region": "Lumbini Province · 93 m altitude",
        "distance": "280 km from Kathmandu · ~6 hrs by road",
        "duration": "2–3 days recommended",
        "img": "https://images.unsplash.com/photo-1590050753481-35a76a5f3f9a?w=800&q=80&auto=format&fit=crop",
        "desc": (
            "Lumbini is the birthplace of Siddhartha Gautama — the Buddha — and one of the most "
            "sacred pilgrimage sites in the world, designated a UNESCO World Heritage Site in 1997. "
            "The Mayadevi Temple marks the exact spot where Queen Mayadevi gave birth to the future "
            "Buddha in 623 BC, beside the sacred Puskarini Pond where she bathed before the birth."
        ),
        "desc2": (
            "The surrounding Lumbini Development Zone spans 3 km and contains monasteries built by "
            "Buddhist nations from across the world — from Japan's gleaming Nipponzan Myohoji pagoda "
            "to Sri Lanka's ornate temple. Emperor Ashoka's 23-metre sandstone pillar, erected in "
            "249 BC to commemorate his pilgrimage, still stands in the garden. The eternal flame "
            "burns day and night."
        ),
        "attractions": [
            "🕌 Mayadevi Temple (623 BC birthplace)",
            "🏛 Ashoka Pillar · 249 BC",
            "🔥 Eternal Peace Flame",
            "💧 Sacred Puskarini Pond",
            "🌏 40-Nation Monastery Zone",
            "🇯🇵 Japanese Peace Pagoda",
            "🇨🇳 Chinese Monastery",
            "🧘 Meditation Gardens",
        ],
        "links": [
            {"label": "Wikipedia",        "url": "https://en.wikipedia.org/wiki/Lumbini",    "icon": "fa-brands fa-wikipedia-w", "primary": True},
            {"label": "Lumbini Dev Trust","url": "https://lumbinidevtrust.gov.np",            "icon": "fa-solid fa-globe",        "primary": False},
        ],
    },

    "rara": {
        "name": "Rara Lake",
        "region": "Karnali Province · 2,990 m altitude",
        "distance": "~480 km · Flight to Talcha + 2 hr trek",
        "duration": "7–10 days recommended",
        "img": "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80&auto=format&fit=crop",
        "desc": (
            "Rara Lake is Nepal's largest and deepest lake — a jewel of the remote Karnali region, "
            "almost entirely off the tourist trail. At nearly 3,000 m above sea level, surrounded "
            "by dense Himalayan pine and juniper forest, it is one of the most pristine wilderness "
            "destinations in all of Asia. The lake changes colour throughout the day, shifting from "
            "turquoise to cobalt to deep navy."
        ),
        "desc2": (
            "The surrounding Rara National Park protects an area of extraordinary biodiversity: "
            "red pandas, Himalayan black bears, musk deer, over 200 bird species, and endemic fish "
            "found nowhere else on Earth. Getting here requires effort — a short mountain flight or "
            "a multi-day trek through remote villages — which is precisely what keeps it so "
            "unspoiled. The dark sky at night is among Asia's most spectacular."
        ),
        "attractions": [
            "💧 Nepal's Largest Lake",
            "🐼 Red Panda Sightings",
            "🦅 200+ Bird Species",
            "🌲 Ancient Pine & Juniper",
            "🌌 World-class Stargazing",
            "🏔 Himalayan Panorama",
            "🦌 Musk Deer & Black Bear",
            "🏕 Remote Wilderness Trek",
        ],
        "links": [
            {"label": "Wikipedia",     "url": "https://en.wikipedia.org/wiki/Rara_Lake", "icon": "fa-brands fa-wikipedia-w", "primary": True},
            {"label": "Explore Nepal", "url": "https://welcomenepal.com",                "icon": "fa-solid fa-globe",        "primary": False},
        ],
    },

    "bandipur": {
        "name": "Bandipur",
        "region": "Gandaki Province · 1,030 m altitude",
        "distance": "140 km from Kathmandu · ~4 hrs by road",
        "duration": "1–2 days recommended",
        "img": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80&auto=format&fit=crop",
        "desc": (
            "Bandipur is a perfectly preserved Newari hilltop trading town frozen beautifully in "
            "the 18th century. Perched on a ridge above the Marsyangdi river valley on the old "
            "Pokhara trade road, it was bypassed when the modern highway was built — and that "
            "mistake is now its greatest treasure. The stone-paved bazaar, lined with merchant "
            "houses, pagoda temples and intricately carved wooden windows, remains entirely "
            "traffic-free."
        ),
        "desc2": (
            "The main viewpoint at the ridge edge offers a 180-degree panorama of the central "
            "Himalayas from Dhaulagiri to Manaslu — an unobstructed golden wall of peaks at "
            "sunrise. The nearby Siddha Cave is one of Nepal's largest, stretching 450 metres "
            "into the hillside. Bandipur makes a perfect overnight stop between Kathmandu and "
            "Pokhara, and an unforgettable place to watch the Himalaya turn gold."
        ),
        "attractions": [
            "🏘 Traffic-free Newari Bazaar",
            "🌄 180° Himalayan Sunrise",
            "⛩ Bindebasini Temple",
            "🛕 Mahalaxmi Temple",
            "🦇 Siddha Cave (450 m)",
            "🏺 Traditional Craft Shops",
            "🎨 Newari Architecture",
            "🌺 Thani Mai Viewpoint",
        ],
        "links": [
            {"label": "Wikipedia",    "url": "https://en.wikipedia.org/wiki/Bandipur", "icon": "fa-brands fa-wikipedia-w", "primary": True},
            {"label": "Travel Guide", "url": "https://welcomenepal.com",               "icon": "fa-solid fa-globe",        "primary": False},
        ],
    },
}

# ── OVERPASS PLACE CLASSIFICATION ─────────────────────────────────────────────
# (Moved from classify() in TO3.js — single source of truth for type/icon mapping)

NATURAL_ICONS = {
    "peak":       "fa-mountain",
    "waterfall":  "fa-water",
    "cave":       "fa-circle-half-stroke",
    "beach":      "fa-umbrella-beach",
    "hot_spring": "fa-hot-tub-person",
    "viewpoint":  "fa-binoculars",
    "glacier":    "fa-snowflake",
}
TOURISM_ICONS = {
    "museum":     "fa-building-columns",
    "attraction": "fa-star",
    "artwork":    "fa-palette",
    "zoo":        "fa-paw",
    "gallery":    "fa-image",
    "camp_site":  "fa-campground",
}
HISTORIC_ICONS = {
    "monument":  "fa-monument",
    "castle":    "fa-chess-rook",
    "ruins":     "fa-archway",
    "temple":    "fa-place-of-worship",
    "memorial":  "fa-star",
}
AMENITY_ICONS = {
    "place_of_worship": "fa-place-of-worship",
    "museum":           "fa-building-columns",
    "theatre":          "fa-masks-theater",
    "arts_centre":      "fa-palette",
}

# ── HELPERS ───────────────────────────────────────────────────────────────────

def haversine(lat1, lng1, lat2, lng2):
    """Return distance in kilometres between two lat/lng points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def classify_tags(tags: dict) -> dict:
    """
    Mirror of classify() from TO3.js.
    Returns {"type": str, "subtype": str, "icon": str}.
    """
    natural = tags.get("natural")
    tourism = tags.get("tourism")
    historic = tags.get("historic")
    leisure  = tags.get("leisure")
    amenity  = tags.get("amenity")

    if natural:
        return {"type": "natural",  "subtype": natural,  "icon": NATURAL_ICONS.get(natural,  "fa-leaf")}
    if tourism == "viewpoint":
        return {"type": "viewpoint", "subtype": "Viewpoint", "icon": "fa-binoculars"}
    if tourism:
        return {"type": "tourism",  "subtype": tourism,  "icon": TOURISM_ICONS.get(tourism,  "fa-camera-retro")}
    if historic:
        return {"type": "historic", "subtype": historic, "icon": HISTORIC_ICONS.get(historic, "fa-landmark")}
    if leisure:
        return {"type": "leisure",  "subtype": leisure,  "icon": "fa-leaf"}
    if amenity:
        return {"type": "amenity",  "subtype": amenity,  "icon": AMENITY_ICONS.get(amenity,  "fa-mug-hot")}
    return {"type": "other", "subtype": "Point of Interest", "icon": "fa-location-dot"}


def build_wiki_url(raw: str) -> str | None:
    """Convert an OSM wikipedia tag value to a full Wikipedia URL."""
    if not raw:
        return None
    slug = raw.split(":", 1)[-1] if ":" in raw else raw
    return "https://en.wikipedia.org/wiki/" + urllib.parse.quote(slug)


# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main page, injecting destination keys so HTML can reference them."""
    return render_template("TO3.html", dest_keys=list(DESTINATIONS.keys()))


@app.route("/api/destinations")
def api_destinations():
    """Return all destination data as JSON."""
    return jsonify(DESTINATIONS)


@app.route("/api/destinations/<key>")
def api_destination(key):
    """Return a single destination by key, or 404."""
    dest = DESTINATIONS.get(key)
    if not dest:
        return jsonify({"error": "Destination not found"}), 404
    return jsonify(dest)


@app.route("/api/nearby")
def api_nearby():
    """
    Fast notable-places search.

    Strategy (both run in parallel, results merged):
    A) Wikipedia Geosearch API  — ~300 ms, returns only places famous enough
       to have a Wikipedia article, with descriptions + thumbnails built in.
       Radius capped at 10 km (API limit); for larger radii we run multiple
       tile calls.
    B) Overpass (strict filter)  — only tourism=attraction + wikipedia-tagged
       nodes. Query is tiny so it finishes in 2-5 s instead of 10-20 s.

    Results are deduplicated by name, sorted by distance, cached 10 min.
    """
    try:
        lat       = float(request.args["lat"])
        lng       = float(request.args["lng"])
        radius_km = float(request.args.get("radius_km", 50))
        limit     = int(request.args.get("limit", 30))
    except (KeyError, ValueError) as exc:
        return jsonify({"error": f"Bad parameters: {exc}"}), 400

    ckey   = _cache_key(lat, lng, radius_km)
    cached = _cache_get(ckey)
    if cached:
        return jsonify({"count": len(cached), "places": cached, "cached": True})

    results_a, results_b = [], []

    # ── helper: safe HTTP GET ────────────────────────────────────────────────
    def wiki_get(url):
        req = urllib.request.Request(
            url, headers={"User-Agent": "WanderlustNepal/1.0 (educational)"}
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read().decode())

    # ── A: Wikipedia Geosearch ───────────────────────────────────────────────
    def fetch_wiki_geo():
        try:
            # Wikipedia caps radius at 10 000 m; tile across the area if larger
            tile_radius = min(int(radius_km * 1000), 10000)
            # For large radii, sample a few offset tiles to widen coverage
            offsets = [(0, 0)]
            if radius_km > 15:
                step = radius_km * 0.45 / 111   # degrees ≈ km/111
                offsets += [(step, 0), (-step, 0), (0, step), (0, -step)]

            seen_ids = set()
            for dlat, dlng in offsets:
                coord  = f"{lat+dlat}|{lng+dlng}"
                url    = (
                    f"https://en.wikipedia.org/w/api.php"
                    f"?action=query&generator=geosearch"
                    f"&ggscoord={coord}&ggsradius={tile_radius}&ggslimit=20"
                    f"&prop=pageimages|coordinates|extracts"
                    f"&pithumbsize=500&exintro=1&exchars=500&format=json"
                )
                d = wiki_get(url)
                pages = (d.get("query") or {}).get("pages", {})
                for page in pages.values():
                    pid = page.get("pageid")
                    if pid in seen_ids:
                        continue
                    seen_ids.add(pid)
                    coords = (page.get("coordinates") or [{}])[0]
                    p_lat  = coords.get("lat")
                    p_lng  = coords.get("lon")
                    if not p_lat or not p_lng:
                        continue
                    dist = haversine(lat, lng, p_lat, p_lng)
                    if dist > radius_km:
                        continue
                    title   = page.get("title", "")
                    extract = (page.get("extract") or "").strip()
                    img     = (page.get("thumbnail") or {}).get("source")
                    wiki_url = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ','_'))}"
                    results_a.append({
                        "id":           f"wiki_{pid}",
                        "name":         title,
                        "lat":          p_lat,
                        "lng":          p_lng,
                        "dist":         round(dist, 3),
                        "type":         "attraction",
                        "subtype":      "attraction",
                        "icon":         "fa-star",
                        "website":      None,
                        "wiki":         wiki_url,
                        "img":          img,
                        "desc":         extract or f"A notable attraction near your location.",
                        "opening_hours":None,
                        "phone":        None,
                        "fee":          None,
                        "access":       None,
                    })
        except Exception:
            pass

    # ── B: Lean Overpass (famous-only filter) ────────────────────────────────
    def fetch_overpass_notable():
        try:
            r_m   = int(radius_km * 1000)
            query = f"""[out:json][timeout:12];(
  node["tourism"="attraction"](around:{r_m},{lat},{lng});
  node["tourism"="museum"](around:{r_m},{lat},{lng});
  node["historic"]["wikipedia"](around:{r_m},{lat},{lng});
  node["natural"~"peak|waterfall"]["wikipedia"](around:{r_m},{lat},{lng});
  node["leisure"="nature_reserve"]["wikipedia"](around:{r_m},{lat},{lng});
);out 40;"""
            payload = ("data=" + urllib.parse.quote(query)).encode()
            # Race two mirrors
            winner = [None]
            ev     = threading.Event()
            def _try(url):
                try:
                    req = urllib.request.Request(url, data=payload, method="POST")
                    with urllib.request.urlopen(req, timeout=14) as resp:
                        d = json.loads(resp.read().decode())
                    if not ev.is_set():
                        winner[0] = d
                        ev.set()
                except Exception:
                    pass
            mirrors = [
                "https://overpass-api.de/api/interpreter",
                "https://overpass.kumi.systems/api/interpreter",
            ]
            ts = [threading.Thread(target=_try, args=(m,), daemon=True) for m in mirrors]
            for t in ts: t.start()
            ev.wait(timeout=15)
            if not winner[0]:
                return
            for el in winner[0].get("elements", []):
                p_lat = el.get("lat")
                p_lng = el.get("lon")
                if not p_lat or not p_lng:
                    continue
                tags = el.get("tags", {})
                name = tags.get("name") or tags.get("name:en")
                if not name:
                    continue
                dist = haversine(lat, lng, p_lat, p_lng)
                if dist > radius_km:
                    continue
                cl   = classify_tags(tags)
                wiki = build_wiki_url(tags.get("wikipedia", ""))
                desc = (tags.get("description") or tags.get("description:en")
                        or tags.get("note")
                        or f"A {cl['subtype'] or cl['type']} near your location.")
                results_b.append({
                    "id":           el["id"],
                    "name":         name,
                    "lat":          p_lat,
                    "lng":          p_lng,
                    "dist":         round(dist, 3),
                    "type":         cl["type"],
                    "subtype":      cl["subtype"],
                    "icon":         cl["icon"],
                    "website":      tags.get("website") or tags.get("contact:website"),
                    "wiki":         wiki,
                    "img":          None,
                    "desc":         desc,
                    "opening_hours":tags.get("opening_hours"),
                    "phone":        tags.get("phone") or tags.get("contact:phone"),
                    "fee":          tags.get("fee"),
                    "access":       tags.get("access"),
                })
        except Exception:
            pass

    # ── Run A and B in parallel ──────────────────────────────────────────────
    ta = threading.Thread(target=fetch_wiki_geo,       daemon=True)
    tb = threading.Thread(target=fetch_overpass_notable, daemon=True)
    ta.start(); tb.start()
    ta.join(timeout=12)
    tb.join(timeout=16)

    # ── Merge & deduplicate by name ──────────────────────────────────────────
    seen_names = set()
    merged = []
    # Wikipedia results first (they have better data)
    for p in sorted(results_a, key=lambda x: x["dist"]):
        key = p["name"].lower().strip()
        if key not in seen_names:
            seen_names.add(key)
            merged.append(p)
    # Overpass fills in places Wikipedia missed
    for p in sorted(results_b, key=lambda x: x["dist"]):
        key = p["name"].lower().strip()
        if key not in seen_names:
            seen_names.add(key)
            merged.append(p)

    merged.sort(key=lambda p: p["dist"])
    merged = merged[:limit]

    _cache_set(ckey, merged)
    return jsonify({"count": len(merged), "places": merged, "cached": False})




# ── ENTRY POINT ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)