"""
WANDERLUST NEPAL — TO3.py
Flask backend: serves pages, destination data, and nearby-places proxy.
"""

from flask import Flask, render_template, jsonify, request
import math
import urllib.parse
import urllib.request
import json
import threading
import time
from functools import lru_cache

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

    "kathmandu": {
        "name": "Kathmandu Valley",
        "region": "Bagmati Province · 1,400 m altitude",
        "distance": "Nepal's Capital City",
        "duration": "4–7 days recommended",
        "img": "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800&q=80&auto=format&fit=crop",
        "desc": (
            "Kathmandu is Nepal's vibrant capital and an extraordinary open-air museum of Himalayan "
            "art and culture. The valley contains seven UNESCO World Heritage Sites including three "
            "Durbar Squares — medieval palace complexes with intricate woodcarvings — and the great "
            "Buddhist stupas of Boudhanath and Swayambhunath (the Monkey Temple). Streets alive with "
            "temples, incense and ritual make every walk a revelation."
        ),
        "desc2": (
            "The bustling Thamel district is the tourist hub with hundreds of restaurants, bookshops, "
            "trekking agencies and music venues. Just outside the city, the sacred Pashupatinath Temple "
            "on the Bagmati River is one of Hinduism's most important pilgrimage sites. Kathmandu is "
            "also the gateway to all major trekking routes and the starting point for Everest, "
            "Annapurna and Langtang expeditions."
        ),
        "attractions": [
            "🏛 Pashupatinath Temple (UNESCO)",
            "🕉 Boudhanath Stupa (UNESCO)",
            "🐒 Swayambhunath (Monkey Temple)",
            "🏯 Kathmandu Durbar Square",
            "🏯 Bhaktapur Durbar Square",
            "🏯 Patan Durbar Square",
            "🛕 Changu Narayan Temple",
            "🛍 Thamel Cultural District",
        ],
        "links": [
            {"label": "Wikipedia",     "url": "https://en.wikipedia.org/wiki/Kathmandu", "icon": "fa-brands fa-wikipedia-w", "primary": True},
            {"label": "Nepal Tourism", "url": "https://welcomenepal.com",                "icon": "fa-solid fa-globe",        "primary": False},
        ],
    },

    "everest": {
        "name": "Everest Base Camp",
        "region": "Koshi Province · 5,364 m altitude",
        "distance": "Flight to Lukla + 12–14 day trek",
        "duration": "16–21 days recommended",
        "img": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&auto=format&fit=crop",
        "desc": (
            "The Everest Base Camp trek is the world's most iconic high-altitude journey — a pilgrimage "
            "to the foot of the highest point on Earth at 8,849 metres. The route passes through the "
            "dramatic Khumbu region, home of the legendary Sherpa people, ascending through rhododendron "
            "forests, ancient monasteries and glacial moraines to the great Khumbu Icefall."
        ),
        "desc2": (
            "The route passes through Namche Bazaar — the bustling Sherpa capital — Tengboche Monastery "
            "with its Everest backdrop, and Dingboche before reaching the final goal at 5,364 metres. "
            "The views of Lhotse, Nuptse, Ama Dablam and Pumori are as spectacular as Everest itself. "
            "The trek requires acclimatisation days and good physical fitness, but no technical climbing "
            "skills — making it achievable for fit, well-prepared trekkers."
        ),
        "attractions": [
            "🏔 Mount Everest View (8,849 m)",
            "🧊 Khumbu Glacier & Icefall",
            "🛕 Tengboche Monastery",
            "🏘 Namche Bazaar Sherpa Town",
            "📡 Kalapatthar Sunrise (5,545 m)",
            "🦅 Ama Dablam Panorama",
            "🎿 Gokyo Lakes Side Trek",
            "🧗 Three Passes Challenge",
        ],
        "links": [
            {"label": "Wikipedia",   "url": "https://en.wikipedia.org/wiki/Everest_Base_Camp_trek", "icon": "fa-brands fa-wikipedia-w", "primary": True},
            {"label": "Permit Info", "url": "https://ntb.gov.np",                                    "icon": "fa-solid fa-passport",    "primary": False},
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


# ── PLACE DETAIL — Wikipedia full-article parser ───────────────────────────────

import re as _re
import html as _html

def _strip_html(text: str) -> str:
    """Remove HTML tags and decode entities, collapse whitespace."""
    text = _re.sub(r"<[^>]+>", " ", text)
    text = _html.unescape(text)
    text = _re.sub(r"\s{2,}", " ", text)
    return text.strip()

def _wiki_get(url: str) -> dict:
    req = urllib.request.Request(
        url, headers={"User-Agent": "WanderlustNepal/1.0 (educational)"}
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode())

def _find_wiki_title(name: str) -> str | None:
    """
    Find the best-matching Wikipedia article title for a place name.
    Step 1: direct REST summary.
    Step 2: OpenSearch with 'Nepal' appended.
    """
    def try_direct(title):
        try:
            slug = urllib.parse.quote(title.replace(" ", "_"))
            d = _wiki_get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}")
            if d.get("type") != "disambiguation" and d.get("extract"):
                return d.get("title", title)
        except Exception:
            pass
        return None

    found = try_direct(name)
    if found:
        return found

    try:
        q  = urllib.parse.quote(f"{name} Nepal")
        d  = _wiki_get(f"https://en.wikipedia.org/w/api.php?action=opensearch&search={q}&limit=3&format=json")
        ts = d[1] if len(d) > 1 else []
        if ts:
            return try_direct(ts[0]) or ts[0]
    except Exception:
        pass

    return None


# Section-title keywords that map to each of our 5 tabs
_SECTION_MAP = {
    "history":   ["history", "background", "origin", "historical", "past", "founded",
                  "establishment", "construction", "built", "ancient"],
    "beliefs":   ["belief", "religion", "religious", "significance", "legend", "myth",
                  "mythology", "culture", "tradition", "spiritual", "sacred", "worship",
                  "deity", "goddess", "god", "faith", "pilgrimage", "significance"],
    "festivals": ["festival", "celebration", "event", "ceremony", "fair", "mela",
                  "worship", "ritual", "puja", "tiji", "dashain", "tihar", "teej",
                  "bisket", "indra jatra", "holi", "losar", "buddha jayanti"],
    "visitor":   ["visit", "tourism", "tourist", "access", "location", "getting",
                  "transport", "time", "season", "hour", "admission", "fee", "tip",
                  "best time", "when to", "how to", "practical", "nearby", "note"],
}

def fetch_place_detail(name: str) -> dict:
    """
    Fetches comprehensive Wikipedia content for a place and organises it into
    5 structured tabs: overview, history, beliefs, festivals, visitor_info.

    Strategy:
    1. Resolve the Wikipedia article title (direct → OpenSearch).
    2. Fetch mobile-sections API for the full structured article.
    3. Map section titles to our 5 tabs using keyword matching.
    4. Fetch the best available image (REST thumbnail → pageimages → Commons).
    Returns a dict safe to jsonify; all fields default to empty string on failure.
    """

    empty = {
        "title": name, "img": None, "url": None,
        "overview": "", "history": "", "beliefs": "",
        "festivals": "", "visitor_info": "",
    }

    # ── 1. Resolve article title ───────────────────────────────────────────────
    title = _find_wiki_title(name)
    if not title:
        return empty

    slug = urllib.parse.quote(title.replace(" ", "_"))

    # ── 2. Fetch image ─────────────────────────────────────────────────────────
    img_url = None
    wiki_url = f"https://en.wikipedia.org/wiki/{slug}"

    try:
        d = _wiki_get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}")
        img_url = (d.get("thumbnail") or {}).get("source")
    except Exception:
        pass

    if not img_url:
        try:
            d  = _wiki_get(
                f"https://en.wikipedia.org/w/api.php"
                f"?action=query&titles={slug}&prop=pageimages&pithumbsize=800&format=json&redirects=1"
            )
            pages = (d.get("query") or {}).get("pages", {})
            for pg in pages.values():
                img_url = (pg.get("thumbnail") or {}).get("source")
                if img_url:
                    break
        except Exception:
            pass

    if not img_url:
        try:
            q = urllib.parse.quote(f"{name} Nepal")
            d = _wiki_get(
                f"https://commons.wikimedia.org/w/api.php"
                f"?action=query&generator=search&gsrnamespace=6"
                f"&gsrsearch={q}&gsrlimit=3&prop=imageinfo&iiprop=url&format=json"
            )
            pages = (d.get("query") or {}).get("pages", {})
            for pg in sorted(pages.values(), key=lambda p: p.get("index", 99)):
                ii = pg.get("imageinfo", [])
                if ii:
                    u = ii[0].get("url", "")
                    if u.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                        img_url = u
                        break
        except Exception:
            pass

    # ── 3. Fetch full article via mobile-sections API ──────────────────────────
    sections_raw = {}  # key: lowercase section title → accumulated text
    overview_text = ""

    try:
        ms = _wiki_get(f"https://en.wikipedia.org/api/rest_v1/page/mobile-sections/{slug}")

        # Lead section = overview
        lead_secs = (ms.get("lead") or {}).get("sections", [])
        if lead_secs:
            overview_text = _strip_html(lead_secs[0].get("text", ""))

        # Remaining sections → map by title
        remaining = (ms.get("remaining") or {}).get("sections", [])
        for sec in remaining:
            sec_title = (sec.get("title") or "").lower()
            sec_text  = _strip_html(sec.get("text", ""))
            if not sec_text or len(sec_text) < 40:
                continue
            sections_raw[sec_title] = sec_text

    except Exception:
        pass

    # ── 4. Fallback: use full extracts API if mobile-sections failed ───────────
    if not overview_text:
        try:
            d = _wiki_get(
                f"https://en.wikipedia.org/w/api.php"
                f"?action=query&titles={slug}&prop=extracts&exintro=0"
                f"&explaintext=1&exsectionformat=wiki&format=json&redirects=1"
            )
            pages = (d.get("query") or {}).get("pages", {})
            for pg in pages.values():
                raw = pg.get("extract", "")
                if raw:
                    paras = [p.strip() for p in raw.split("\n\n") if len(p.strip()) > 60]
                    overview_text = " ".join(paras[:3])
                    # Heuristic: split remaining paras into sections
                    for i, para in enumerate(paras[3:], 1):
                        tl = para[:60].lower()
                        for tab_key, kws in _SECTION_MAP.items():
                            if any(kw in tl for kw in kws):
                                sections_raw[tl] = para
                                break
        except Exception:
            pass

    # ── 5. Assign sections to tabs ─────────────────────────────────────────────
    def collect(tab_key):
        parts = []
        for sec_title, sec_text in sections_raw.items():
            for kw in _SECTION_MAP[tab_key]:
                if kw in sec_title:
                    parts.append(f"<h4>{sec_title.title()}</h4><p>{sec_text}</p>")
                    break
        return "\n".join(parts)

    history_html  = collect("history")
    beliefs_html  = collect("beliefs")
    festivals_html = collect("festivals")
    visitor_html  = collect("visitor")

    # If a tab is empty, note it gracefully
    def fallback(content, label):
        if content:
            return content
        return (f"<p class='tab-empty'>Detailed {label} information is not available "
                f"for this place on Wikipedia. You can "
                f"<a href='{wiki_url}' target='_blank'>read the full article</a> for more.</p>")

    return {
        "title":        title,
        "img":          img_url,
        "url":          wiki_url,
        "overview":     overview_text,
        "history":      fallback(history_html,  "history"),
        "beliefs":      fallback(beliefs_html,  "culture & beliefs"),
        "festivals":    fallback(festivals_html, "festivals"),
        "visitor_info": fallback(visitor_html,  "visitor"),
    }


# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main page, injecting destination keys so HTML can reference them."""
    return render_template("TO3F.html", dest_keys=list(DESTINATIONS.keys()))


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


@app.route("/api/place-detail/<path:name>")
def api_place_detail(name: str):
    """
    Returns structured Wikipedia content for any place name, organised into tabs:
    overview, history, beliefs, festivals, visitor_info — plus image and URL.
    Never returns an error status; all fields default to empty string on failure.
    """
    return jsonify(fetch_place_detail(name))


# ── IN-MEMORY CACHE (10 min TTL) ──────────────────────────────────────────────
_CACHE: dict = {}
_CACHE_TTL   = 600  # seconds

def _cache_key(lat, lng, radius_km):
    return f"{round(lat,3)}:{round(lng,3)}:{radius_km}"

def _cache_get(key):
    entry = _CACHE.get(key)
    if entry and (time.time() - entry["ts"]) < _CACHE_TTL:
        return entry["data"]
    return None

def _cache_set(key, data):
    _CACHE[key] = {"ts": time.time(), "data": data}


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

    # Adaptive timeouts: scale with search area
    if radius_km <= 20:
        ovp_timeout, ovp_wait, wiki_join, ovp_join = 20, 18, 14, 22
    elif radius_km <= 50:
        ovp_timeout, ovp_wait, wiki_join, ovp_join = 35, 32, 22, 36
    else:
        ovp_timeout, ovp_wait, wiki_join, ovp_join = 60, 55, 40, 60

    # Smarter admin filter: only blocks when admin word is a SUFFIX/STANDALONE
    # e.g. "Kavrepalanchok District" → blocked, "Nagarjun Forest Reserve" → allowed
    import re as _re2
    _ADMIN_SUFFIX = _re2.compile(
        r'(\s+(district|province|zone|anchal|ilaka|vdc|'
        r'rural\s+municipality|urban\s+municipality|metropolitan\s+city|'
        r'gaupalika|gaunpalika|nagarpalika|sub-?metropolitan)\s*$'
        r'|\bward\s+no\.?\s*\d+\b'
        r'|\bvillage\s+development\s+committee\b'
        r'|(जिल्ला|नगरपालिका|गाउँपालिका|महानगरपालिका|उपमहानगरपालिका|गाँउपालिका)\s*$)',
        _re2.IGNORECASE
    )

    def is_valid_tourist_place(name, tags=None):
        if not name or len(name) < 3:
            return False
        if _ADMIN_SUFFIX.search(name):
            return False
        if tags:
            if tags.get("boundary") or tags.get("admin_level"):
                return False
            if tags.get("place") in ("district", "county", "state", "province", "region"):
                return False
            if tags.get("landuse"):
                return False
        return True

    def fetch_wiki_geo():
        try:
            tile_radius = min(int(radius_km * 1000), 10000)
            deg = 1 / 111.0

            offsets = [(0.0, 0.0)]
            ring_r = 15.0
            while ring_r < radius_km:
                n = max(6, min(16, int(2 * math.pi * ring_r / 14)))
                for i in range(n):
                    angle = 2 * math.pi * i / n
                    offsets.append((
                        ring_r * math.cos(angle) * deg,
                        ring_r * math.sin(angle) * deg,
                    ))
                ring_r += 15.0

            if len(offsets) > 30:
                step = len(offsets) / 30
                offsets = [offsets[int(i * step)] for i in range(30)]

            tile_results: list = [None] * len(offsets)
            lock_wiki = threading.Lock()

            def fetch_one_tile(idx, dlat, dlng):
                try:
                    coord = f"{lat + dlat}|{lng + dlng}"
                    url = (
                        "https://en.wikipedia.org/w/api.php"
                        "?action=query&generator=geosearch"
                        f"&ggscoord={coord}&ggsradius={tile_radius}&ggslimit=50"
                        "&prop=pageimages|coordinates|extracts"
                        "&pithumbsize=500&exintro=1&exchars=500&format=json"
                    )
                    d = wiki_get(url)
                    with lock_wiki:
                        tile_results[idx] = d
                except Exception:
                    pass

            wiki_threads = [
                threading.Thread(target=fetch_one_tile, args=(i, dlat, dlng), daemon=True)
                for i, (dlat, dlng) in enumerate(offsets)
            ]
            for t in wiki_threads: t.start()
            for t in wiki_threads: t.join(timeout=12)  # 12s max per tile batch

            seen_ids: set = set()
            for d in tile_results:
                if not d:
                    continue
                pages = (d.get("query") or {}).get("pages", {})
                for page in pages.values():
                    pid = page.get("pageid")
                    if pid in seen_ids:
                        continue
                    seen_ids.add(pid)
                    title = page.get("title", "")
                    if not is_valid_tourist_place(title):
                        continue
                    coords = (page.get("coordinates") or [{}])[0]
                    p_lat = coords.get("lat")
                    p_lng = coords.get("lon")
                    if not p_lat or not p_lng:
                        continue
                    dist = haversine(lat, lng, p_lat, p_lng)
                    if dist > radius_km:
                        continue
                    extract  = (page.get("extract") or "").strip()
                    img      = (page.get("thumbnail") or {}).get("source")
                    wiki_url = (
                        "https://en.wikipedia.org/wiki/"
                        + urllib.parse.quote(title.replace(" ", "_"))
                    )
                    results_a.append({
                        "id":            f"wiki_{pid}",
                        "name":          title,
                        "lat":           p_lat,
                        "lng":           p_lng,
                        "dist":          round(dist, 3),
                        "type":          "attraction",
                        "subtype":       "attraction",
                        "icon":          "fa-star",
                        "website":       None,
                        "wiki":          wiki_url,
                        "img":           img,
                        "desc":          extract or "A notable attraction near your location.",
                        "opening_hours": None,
                        "phone":         None,
                        "fee":           None,
                        "access":        None,
                    })
        except Exception:
            pass

    # ── B: Overpass — tiled for large radius, strict tags for speed ──────────
    def fetch_overpass_notable():
        try:
            # For large radius, tile into smaller circles to avoid server timeout
            # Each tile = 25km radius; tiles arranged in rings every 30km
            if radius_km <= 30:
                centers = [(lat, lng)]
                tile_r  = radius_km
            else:
                tile_r  = 30
                centers = [(lat, lng)]
                ring_km = 35.0
                dg      = 1 / 111.0
                while ring_km < radius_km:
                    n = max(6, min(12, int(2 * math.pi * ring_km / 40)))
                    for i in range(n):
                        a = 2 * math.pi * i / n
                        centers.append((
                            lat + ring_km * math.cos(a) * dg,
                            lng + ring_km * math.sin(a) * dg,
                        ))
                    ring_km += 35.0

            r_m = int(tile_r * 1000)

            # Strict tag filter: only visitable, named tourist spots
            def make_query(clat, clng):
                return (
                    f'[out:json][timeout:25];('
                    f'node["tourism"~"attraction|museum|viewpoint|zoo|gallery|theme_park|artwork"]["name"](around:{r_m},{clat},{clng});'
                    f'node["historic"~"monument|castle|ruins|temple|fort|memorial|archaeological_site|shrine"]["name"](around:{r_m},{clat},{clng});'
                    f'node["natural"~"peak|waterfall|cave|hot_spring|glacier|beach|geyser"]["name"](around:{r_m},{clat},{clng});'
                    f'node["leisure"~"nature_reserve|park|garden|miniature_golf"]["name"](around:{r_m},{clat},{clng});'
                    f'node["amenity"~"place_of_worship|museum"]["name"]["wikipedia"](around:{r_m},{clat},{clng});'
                    f'way["tourism"~"attraction|museum|viewpoint"]["name"](around:{r_m},{clat},{clng});'
                    f');out center 500;'
                )

            seen_ids: set = set()
            lock = threading.Lock()
            done_ev = threading.Event()
            all_elements: list = []

            def _fetch_tile(clat, clng):
                try:
                    query   = make_query(clat, clng)
                    payload = ("data=" + urllib.parse.quote(query)).encode()
                    for mirror in [
                        "https://overpass-api.de/api/interpreter",
                        "https://overpass.kumi.systems/api/interpreter",
                    ]:
                        try:
                            req = urllib.request.Request(mirror, data=payload, method="POST")
                            with urllib.request.urlopen(req, timeout=28) as resp:
                                d = json.loads(resp.read().decode())
                            with lock:
                                all_elements.extend(d.get("elements", []))
                            return
                        except Exception:
                            continue
                except Exception:
                    pass

            threads = [threading.Thread(target=_fetch_tile, args=(c[0], c[1]), daemon=True)
                       for c in centers]
            for t in threads: t.start()
            for t in threads: t.join(timeout=32)

            for el in all_elements:
                eid = el.get("id")
                if eid in seen_ids:
                    continue
                seen_ids.add(eid)
                # support both node (lat/lon) and way (center.lat/lon)
                p_lat = el.get("lat") or (el.get("center") or {}).get("lat")
                p_lng = el.get("lon") or (el.get("center") or {}).get("lon")
                if not p_lat or not p_lng:
                    continue
                tags = el.get("tags", {})
                name = tags.get("name") or tags.get("name:en")
                if not name:
                    continue
                if not is_valid_tourist_place(name, tags=tags):
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
                    "id":            el["id"],
                    "name":          name,
                    "lat":           p_lat,
                    "lng":           p_lng,
                    "dist":          round(dist, 3),
                    "type":          cl["type"],
                    "subtype":       cl["subtype"],
                    "icon":          cl["icon"],
                    "website":       tags.get("website") or tags.get("contact:website"),
                    "wiki":          wiki,
                    "img":           None,
                    "desc":          desc,
                    "opening_hours": tags.get("opening_hours"),
                    "phone":         tags.get("phone") or tags.get("contact:phone"),
                    "fee":           tags.get("fee"),
                    "access":        tags.get("access"),
                })
        except Exception:
            pass

    # ── Run A and B in parallel ──────────────────────────────────────────────
    ta = threading.Thread(target=fetch_wiki_geo,        daemon=True)
    tb = threading.Thread(target=fetch_overpass_notable, daemon=True)
    ta.start(); tb.start()
    ta.join(timeout=18)   # Wikipedia: 30 concurrent tiles × ~0.5s avg = ~15s
    tb.join(timeout=40)   # Overpass: tiled approach, each tile 25-32s max

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
    # No hard cap — return all found places

    _cache_set(ckey, merged)
    return jsonify({"count": len(merged), "places": merged, "cached": False})




# ── ENTRY POINT ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)