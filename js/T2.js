/* ═══════════════════════════════════════════
   WANDERLUST NEPAL — script.js
   Features: 3D tilt cards, destination modal,
   Leaflet map, Overpass API, animated hero
   ═══════════════════════════════════════════ */
'use strict';

// ── STATE ─────────────────────────────────────────
let map = null;
let userCoords = null;
let userMarker = null;
let radiusCircle = null;
let allPlaces = [];
let activeMarkers = [];
let radiusKm = 50;
let activeCategory = 'all';

// ── DESTINATION DATA ──────────────────────────────
const DEST_DATA = {
  pokhara: {
    name: 'Pokhara',
    emoji: '🏔️',
    region: 'Gandaki Province',
    distance: '200 km from Kathmandu (~5 hrs by road)',
    altitude: '822 m above sea level',
    duration: '5–7 days recommended',
    gfxClass: 'pokhara',
    desc: `Pokhara is Nepal's adventure capital and the most visited city outside Kathmandu. Nestled beside the serene Phewa Lake, it offers breathtaking reflections of the Annapurna range on calm mornings. The city is the launch point for several of the world's finest treks — the Annapurna Circuit, Annapurna Base Camp, and the Poon Hill trek all begin or pass through here.

Beyond trekking, Pokhara is famous for paragliding over terraced rice paddies, boating on Phewa Lake to the Tal Barahi temple island, and exploring the dramatic Gupteshwor cave and Davis Falls. The lakeside promenade buzzes with cafes, shops and a distinctly laid-back atmosphere that makes it easy to linger for days longer than planned.`,
    highlights: ['🏔 Annapurna Range', '🚣 Phewa Lake', '🪂 Paragliding', '🌊 Davis Falls', '🏕 Trek Gateway', '🛶 Temple Island'],
    links: [
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Pokhara', icon: 'fa-brands fa-wikipedia-w' },
      { label: 'Nepal Tourism Board', url: 'https://ntb.gov.np', icon: 'fa-solid fa-globe' },
    ]
  },
  mustang: {
    name: 'Mustang',
    emoji: '🏜️',
    region: 'Gandaki Province (Upper Mustang)',
    distance: '~320 km from Kathmandu (~7 hrs to Jomsom)',
    altitude: '3,750–4,500 m above sea level',
    duration: '10–14 days recommended',
    gfxClass: 'mustang',
    desc: `Once a sealed kingdom closed to outsiders until 1992, Mustang is unlike anywhere else on Earth. A high-altitude Tibetan plateau tucked behind the Annapurna and Dhaulagiri massifs, it lies in a rain shadow that gives it a dramatically arid landscape of deep red canyons, wind-sculpted cliffs and ancient cave systems carved with Buddhist art over a thousand years ago.

The walled city of Lo Manthang — still ruled by a ceremonial king — contains four monasteries, royal palace ruins, and whitewashed streets that feel completely unchanged from the 15th century. Upper Mustang requires a special restricted area permit (USD 500 per 10 days), making it one of Nepal's most exclusive and memorable destinations.`,
    highlights: ['🏯 Lo Manthang', '🗻 4,000m+ plateau', '🛕 Cave Monasteries', '🏜 Red Canyons', '🎭 Tiji Festival', '📜 Ancient Murals'],
    links: [
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Mustang_District', icon: 'fa-brands fa-wikipedia-w' },
      { label: 'Permit Info', url: 'https://ntb.gov.np', icon: 'fa-solid fa-passport' },
    ]
  },
  chitwan: {
    name: 'Chitwan National Park',
    emoji: '🦏',
    region: 'Bagmati Province',
    distance: '150 km from Kathmandu (~4 hrs by road)',
    altitude: '100–800 m above sea level',
    duration: '3–4 days recommended',
    gfxClass: 'chitwan',
    desc: `Chitwan is Nepal's first national park and a UNESCO World Heritage Site — a vast subtropical jungle teeming with remarkable wildlife. It is one of the last refuges of the endangered one-horned rhinoceros, with a thriving population of over 700 individuals. Bengal tigers, gharial crocodiles, sloth bears and hundreds of bird species also call it home.

Visitors explore on elephant-back safaris, jeep drives through tall elephant grass, and dugout canoe rides down the Rapti and Narayani rivers. The Tharu people, indigenous to the lowlands, offer a rich cultural experience through their unique dance traditions and village homestays. The best time to visit is October–March when wildlife congregates near water.`,
    highlights: ['🦏 One-horned Rhino', '🐯 Bengal Tigers', '🐊 Gharial Crocs', '🛶 River Canoe', '🌿 Jungle Walk', '🎭 Tharu Culture'],
    links: [
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Chitwan_National_Park', icon: 'fa-brands fa-wikipedia-w' },
      { label: 'Park Website', url: 'https://chitwannationalpark.gov.np', icon: 'fa-solid fa-globe' },
    ]
  },
  lumbini: {
    name: 'Lumbini',
    emoji: '🕌',
    region: 'Lumbini Province',
    distance: '280 km from Kathmandu (~6 hrs by road)',
    altitude: '93 m above sea level',
    duration: '2–3 days recommended',
    gfxClass: 'lumbini',
    desc: `Lumbini is the birthplace of Siddhartha Gautama — the Buddha — and one of the holiest pilgrimage sites in the world, designated a UNESCO World Heritage Site in 1997. The sacred Mayadevi Temple marks the exact spot where Queen Mayadevi gave birth to the future Buddha in 623 BC, beside a sacred pool where she bathed before the birth.

The surrounding Lumbini Development Zone stretches over 3 km and contains monasteries built by Buddhist nations from across the world — from Japan's shining white Nipponzan Myohoji pagoda to Sri Lanka's ornate temple to Germany's austere meditation centre. Emperor Ashoka's pillar, erected in 249 BC, still stands as testament to his pilgrimage here. The eternal flame burns in the garden day and night.`,
    highlights: ['🕌 Mayadevi Temple', '🏛 Ashoka Pillar 249BC', '🧘 Peace Pagoda', '🌏 40-nation Monasteries', '🔥 Eternal Flame', '💧 Sacred Pond'],
    links: [
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Lumbini', icon: 'fa-brands fa-wikipedia-w' },
      { label: 'Lumbini Dev Zone', url: 'https://lumbinidevtrust.gov.np', icon: 'fa-solid fa-globe' },
    ]
  },
  rara: {
    name: 'Rara Lake',
    emoji: '💧',
    region: 'Karnali Province',
    distance: '~480 km from Kathmandu (flight to Talcha + 2hr trek)',
    altitude: '2,990 m above sea level',
    duration: '7–10 days recommended',
    gfxClass: 'rara',
    desc: `Rara Lake is Nepal's largest and deepest lake — a jewel of the remote Karnali region, almost entirely off the tourist trail. At nearly 3,000m, surrounded by dense Himalayan pine and juniper forests that are home to red pandas, Himalayan black bears and over 200 bird species, it is one of the most pristine wilderness destinations in all of Asia.

The lake shifts between intense turquoise and deep navy depending on the light, and the surrounding Rara National Park protects an area of extraordinary biodiversity. Getting here requires effort — a short mountain flight to Talcha or a multiday trek through remote villages — which is precisely what keeps it so unspoiled. The reward is complete solitude beside one of the most beautiful bodies of water on Earth.`,
    highlights: ['💧 Nepal\'s Largest Lake', '🐼 Red Pandas', '🦅 200+ Bird Species', '🌲 Pine & Juniper', '🌌 Dark Sky Stargazing', '🏔 Remote Wilderness'],
    links: [
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Rara_Lake', icon: 'fa-brands fa-wikipedia-w' },
      { label: 'Nepal Tourism', url: 'https://welcomenepal.com', icon: 'fa-solid fa-globe' },
    ]
  },
  bandipur: {
    name: 'Bandipur',
    emoji: '⛩️',
    region: 'Gandaki Province',
    distance: '140 km from Kathmandu (~4 hrs by road)',
    altitude: '1,030 m above sea level',
    duration: '1–2 days recommended',
    gfxClass: 'bandipur',
    desc: `Bandipur is a perfectly preserved Newari hilltop town, perched on a ridge above the Marsyangdi river valley on the old Pokhara trade road. Once a major trading hub between India and Tibet, the town was bypassed when the modern highway was built, freezing it beautifully in time. Its stone-paved bazaar, lined with 18th and 19th-century merchant houses, pagoda temples and carved wooden windows, remains entirely traffic-free.

The main viewpoint at the edge of the ridge offers a 180-degree panorama of the central Himalayas from Dhaulagiri to Manaslu — an unobstructed wall of snow-capped giants that turns gold at dawn. The Thani Mai Temple, Mahalaxmi Temple and Khadga Devi temple are all within easy walking distance. Bandipur makes an ideal overnight stop between Kathmandu and Pokhara.`,
    highlights: ['⛩ Newari Architecture', '🏘 Traffic-free Bazaar', '🌄 360° Himalaya View', '🛕 Ancient Temples', '🔭 Siddha Cave', '🌅 Golden Sunrise'],
    links: [
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Bandipur', icon: 'fa-brands fa-wikipedia-w' },
      { label: 'Travel Guide', url: 'https://welcomenepal.com', icon: 'fa-solid fa-globe' },
    ]
  },
};

// ── INIT ──────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('gone');
    initAll();
  }, 2000);
});

function initAll() {
  initMap();
  initCursor();
  initNavbar();
  initHero();
  initTilt3D();
  initScrollReveal();
  initRadiusSlider();
  initSearch();
  initParallax();
}

// ── MAP ───────────────────────────────────────────
function initMap() {
  map = L.map('map', {
    center: [27.7172, 85.3240],
    zoom: 10,
    zoomControl: true,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  L.control.attribution({ position:'bottomright', prefix:'© <a href="https://openstreetmap.org">OpenStreetMap</a>' }).addTo(map);
  map.zoomControl.setPosition('topright');
}

// ── CURSOR ────────────────────────────────────────
function initCursor() {
  const cur = document.getElementById('cursor');
  if (!cur || window.innerWidth < 768) return;

  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cur.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  document.querySelectorAll('a,button,.tcard,.cat-item,.place-card,.how-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-big'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-big'));
  });
}

// ── NAVBAR ────────────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));

  const ham = document.getElementById('hamburger');
  if (ham) ham.addEventListener('click', () => {
    const ul = document.querySelector('.nav-links');
    if (!ul) return;
    const open = ul.style.display === 'flex';
    ul.style.cssText = open ? '' : `
      display:flex; flex-direction:column; position:fixed;
      top:64px; left:0; right:0; padding:24px 28px; gap:18px;
      background:rgba(251,246,238,0.97); backdrop-filter:blur(16px);
      box-shadow:0 8px 30px rgba(44,24,16,0.12);
      border-bottom:2px solid var(--border); z-index:999;
    `;
  });
}

// ── HERO ANIMATIONS ───────────────────────────────
function initHero() {
  // Sun rays
  const raysEl = document.getElementById('sunRays');
  if (raysEl) {
    for (let i = 0; i < 12; i++) {
      const ray = document.createElement('div');
      ray.className = 'sun-ray';
      const angle = i * 30;
      ray.style.cssText = `
        transform: rotate(${angle}deg) translateY(-44px);
        animation-delay: ${i * 0.08}s;
      `;
      raysEl.appendChild(ray);
    }
  }

  // Flying birds
  const birdsEl = document.getElementById('birds');
  if (birdsEl) {
    for (let i = 0; i < 8; i++) {
      const bird = document.createElement('div');
      bird.className = 'bird';
      const top = 10 + Math.random() * 30;
      bird.style.cssText = `
        top:${top}%;
        --fly-dur:${(18 + Math.random() * 20).toFixed(0)}s;
        --fly-delay:-${(Math.random() * 15).toFixed(0)}s;
      `;
      birdsEl.appendChild(bird);
    }
  }
}

// ── 3D TILT CARDS ────────────────────────────────
function initTilt3D() {
  document.querySelectorAll('[data-tilt], .tcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const tiltX = -dy * 10;
      const tiltY = dx * 10;
      card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-10px) scale(1.02)`;
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    });
  });
}

// ── SCROLL REVEAL ─────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12, rootMargin:'0px 0px -40px 0px' });
  document.querySelectorAll('.how-card').forEach(el => obs.observe(el));
}

// ── PARALLAX ─────────────────────────────────────
function initParallax() {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const content = document.querySelector('.hero-content');
    if (content) content.style.transform = `translateY(calc(-60px + ${y * 0.25}px))`;
    const far  = document.querySelector('.mtn-layer.far');
    const mid  = document.querySelector('.mtn-layer.mid');
    const near = document.querySelector('.mtn-layer.near');
    if (far)  far.style.transform  = `translateY(${y * 0.06}px)`;
    if (mid)  mid.style.transform  = `translateY(${y * 0.12}px)`;
    if (near) near.style.transform = `translateY(${y * 0.2}px)`;
  });
}

// ── RADIUS SLIDER ─────────────────────────────────
function initRadiusSlider() {
  const slider = document.getElementById('radiusSlider');
  const val    = document.getElementById('radiusVal');
  if (!slider) return;
  slider.addEventListener('input', () => {
    radiusKm = parseInt(slider.value);
    val.textContent = radiusKm + ' km';
    document.getElementById('scan-radius').textContent = radiusKm;
    if (radiusCircle) radiusCircle.setRadius(radiusKm * 1000);
  });
}

// ── SEARCH ────────────────────────────────────────
function initSearch() {
  const inp = document.getElementById('searchInput');
  if (!inp) return;
  inp.addEventListener('input', () => {
    const q = inp.value.toLowerCase().trim();
    if (!q) { renderPlaces(filterCat(allPlaces)); showMarkers(filterCat(allPlaces)); return; }
    const f = allPlaces.filter(p =>
      (p.name||'').toLowerCase().includes(q) ||
      (p.subtype||'').toLowerCase().includes(q) ||
      (p.type||'').toLowerCase().includes(q)
    );
    renderPlaces(f); showMarkers(f);
  });
}

function filterCat(arr) {
  return activeCategory === 'all' ? arr : arr.filter(p => p.type === activeCategory || p.subtype === activeCategory);
}

// ── LOCATE ME ─────────────────────────────────────
function initNearMe() {
  document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
  const btn = document.getElementById('locateBtn');
  if (btn) btn.classList.add('pulsing');
  showNotif('Requesting your location…', 'info', 'fa-location-crosshairs');

  if (!navigator.geolocation) {
    if (btn) btn.classList.remove('pulsing');
    showNotif('Geolocation is not supported by your browser.', 'error', 'fa-triangle-exclamation');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (btn) btn.classList.remove('pulsing');
      showNotif(`Location found! Scanning ${radiusKm} km…`, 'success', 'fa-check-circle');
      placeUserMarker(userCoords);
      fetchPlaces(userCoords, radiusKm);
    },
    err => {
      if (btn) btn.classList.remove('pulsing');
      const msgs = { 1:'Location permission denied.', 2:'Could not detect your location.', 3:'Location request timed out.' };
      showNotif(msgs[err.code] || 'Location error.', 'error', 'fa-triangle-exclamation');
    },
    { timeout: 12000, enableHighAccuracy: true }
  );
}

function placeUserMarker({ lat, lng }) {
  if (userMarker) map.removeLayer(userMarker);
  if (radiusCircle) map.removeLayer(radiusCircle);

  userMarker = L.marker([lat, lng], {
    icon: L.divIcon({ className:'', html:'<div class="m-dot m-user"></div>', iconSize:[18,18], iconAnchor:[9,9] })
  }).addTo(map).bindPopup('<div class="popup-h">📍 You Are Here</div>');

  radiusCircle = L.circle([lat, lng], {
    radius: radiusKm * 1000,
    color: '#E8854A', weight: 1.5, dashArray: '8 5',
    fillColor: '#E8854A', fillOpacity: 0.05,
  }).addTo(map);

  map.flyTo([lat, lng], zoomForRadius(radiusKm), { animate: true, duration: 1.6 });
}

function zoomForRadius(km) {
  if (km <= 10) return 12;
  if (km <= 25) return 11;
  if (km <= 50) return 10;
  if (km <= 75) return 9;
  return 8;
}

// ── OVERPASS API ──────────────────────────────────
async function fetchPlaces({ lat, lng }, km) {
  setMapLoading(true);
  setSidebarHead('Scanning…', `Looking within ${km} km`);

  const r = km * 1000;
  const q = `
    [out:json][timeout:30];
    (
      node["tourism"](around:${r},${lat},${lng});
      node["historic"](around:${r},${lat},${lng});
      node["natural"~"peak|waterfall|cave|beach|hot_spring|volcano|viewpoint|glacier"](around:${r},${lat},${lng});
      node["leisure"~"park|nature_reserve|garden"](around:${r},${lat},${lng});
      node["amenity"~"place_of_worship|museum|arts_centre|theatre"](around:${r},${lat},${lng});
      way["tourism"~"attraction|museum|viewpoint|zoo|gallery"](around:${r},${lat},${lng});
    );
    out center body 200;
  `;

  try {
    const res  = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST', body: 'data=' + encodeURIComponent(q),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    processPlaces(data.elements, { lat, lng });
  } catch (err) {
    setMapLoading(false);
    setSidebarHead('Error', 'Could not load data. Please try again.');
    showNotif('Failed to fetch places. Check your connection.', 'error', 'fa-triangle-exclamation');
    console.error(err);
  }
}

function processPlaces(els, uPos) {
  clearMarkers();
  allPlaces = [];

  els.forEach(el => {
    const lat = el.lat || el.center?.lat;
    const lng = el.lon || el.center?.lon;
    if (!lat || !lng) return;
    const tags = el.tags || {};
    const name = tags.name || tags['name:en'];
    if (!name) return;
    const dist = haversine(uPos.lat, uPos.lng, lat, lng);
    if (dist > radiusKm) return;
    const { type, subtype, icon } = classify(tags);
    allPlaces.push({
      id: el.id, name, lat, lng, type, subtype, icon, dist,
      desc: `A ${subtype || type} destination${tags.description ? ': ' + tags.description : '.'}`,
      wiki: tags.wikipedia ? 'https://en.wikipedia.org/wiki/' + encodeURIComponent(tags.wikipedia.replace(/^[a-z]+:/,'')) : null,
      website: tags.website || tags['contact:website'] || null,
    });
  });

  allPlaces.sort((a, b) => a.dist - b.dist).splice(150);
  const filtered = filterCat(allPlaces);
  renderPlaces(filtered);
  showMarkers(filtered);
  setMapLoading(false);
  setSidebarHead(`${allPlaces.length} Places Found`, `Within ${radiusKm} km of your location`);
  showNotif(`Discovered ${allPlaces.length} destinations!`, 'success', 'fa-map-pin');
}

function classify(tags) {
  const { tourism, historic, natural, leisure, amenity } = tags;
  if (natural) {
    const m = { peak:'fa-mountain', waterfall:'fa-water', cave:'fa-circle-half-stroke', beach:'fa-umbrella-beach', hot_spring:'fa-hot-tub-person', viewpoint:'fa-binoculars', glacier:'fa-snowflake' };
    return { type:'natural', subtype: natural, icon: m[natural] || 'fa-leaf' };
  }
  if (tourism === 'viewpoint') return { type:'viewpoint', subtype:'Viewpoint', icon:'fa-binoculars' };
  if (tourism) {
    const m = { museum:'fa-building-columns', attraction:'fa-star', artwork:'fa-palette', zoo:'fa-paw', gallery:'fa-image', camp_site:'fa-campground' };
    return { type:'tourism', subtype: tourism, icon: m[tourism] || 'fa-camera-retro' };
  }
  if (historic) {
    const m = { monument:'fa-monument', castle:'fa-chess-rook', ruins:'fa-archway', temple:'fa-place-of-worship', memorial:'fa-star' };
    return { type:'historic', subtype: historic, icon: m[historic] || 'fa-landmark' };
  }
  if (leisure) return { type:'leisure', subtype: leisure, icon:'fa-leaf' };
  if (amenity) {
    const m = { place_of_worship:'fa-place-of-worship', museum:'fa-building-columns', theatre:'fa-masks-theater', arts_centre:'fa-palette' };
    return { type:'amenity', subtype: amenity, icon: m[amenity] || 'fa-mug-hot' };
  }
  return { type:'other', subtype:'Point of Interest', icon:'fa-location-dot' };
}

// ── MARKERS ──────────────────────────────────────
function showMarkers(places) {
  clearMarkers();
  places.forEach(place => {
    const typeClass = `m-${place.type}`;
    const marker = L.marker([place.lat, place.lng], {
      icon: L.divIcon({ className:'', html:`<div class="m-dot ${typeClass}"></div>`, iconSize:[14,14], iconAnchor:[7,7] })
    }).addTo(map).bindPopup(buildPopup(place), { maxWidth:260 });

    marker.on('click', () => highlightCard(place.id));
    place.marker = marker;
    activeMarkers.push(marker);
  });
}

function clearMarkers() {
  activeMarkers.forEach(m => map.removeLayer(m));
  activeMarkers = [];
}

function buildPopup(p) {
  const dist = p.dist < 1 ? `${Math.round(p.dist*1000)} m away` : `${p.dist.toFixed(1)} km away`;
  const links = [
    p.wiki    ? `<a href="${p.wiki}" target="_blank" class="popup-link"><i class="fa-brands fa-wikipedia-w"></i> Wikipedia</a>` : '',
    p.website ? `<a href="${p.website}" target="_blank" class="popup-link"><i class="fa-solid fa-globe"></i> Website</a>` : '',
  ].filter(Boolean).join('');
  return `
    <div class="popup-h">${p.name}</div>
    <div class="popup-badge"><i class="fa-solid ${p.icon}"></i> ${cap(p.subtype || p.type)}</div>
    <div class="popup-dist"><i class="fa-solid fa-route"></i> ${dist}</div>
    ${links ? `<div class="popup-links">${links}</div>` : ''}
  `;
}

// ── SIDEBAR LIST ──────────────────────────────────
function renderPlaces(places) {
  const list = document.getElementById('place-list');
  if (!places.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div><p>No places found.</p></div>`;
    return;
  }
  list.innerHTML = '';
  places.forEach((p, i) => {
    const dist = p.dist < 1 ? `${Math.round(p.dist*1000)}m` : `${p.dist.toFixed(1)}km`;
    const card = document.createElement('div');
    card.className = 'place-card';
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="place-card-row">
        <h4>${p.name}</h4>
        <span class="place-dist"><i class="fa-solid fa-route"></i> ${dist}</span>
      </div>
      <div class="place-type"><i class="fa-solid ${p.icon}"></i> ${cap(p.subtype||p.type)}</div>
      <p>${p.desc.slice(0,80)}…</p>
    `;
    card.addEventListener('click', () => {
      map.flyTo([p.lat, p.lng], 14, { animate:true, duration:1 });
      setTimeout(() => p.marker?.openPopup(), 900);
      highlightCard(p.id);
    });
    list.appendChild(card);
  });
}

function highlightCard(id) {
  document.querySelectorAll('.place-card').forEach(c => c.classList.remove('active'));
  const c = document.querySelector(`.place-card[data-id="${id}"]`);
  if (c) { c.classList.add('active'); c.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
}

// ── CATEGORY FILTER ──────────────────────────────
function filterByCategory(cat, el) {
  activeCategory = cat;
  document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  if (!allPlaces.length) return;
  const f = filterCat(allPlaces);
  renderPlaces(f); showMarkers(f);
  setSidebarHead(`${f.length} Places`, cat === 'all' ? `All types · ${radiusKm} km` : `Category: ${cap(cat)}`);
}

// ── DESTINATION MODAL ─────────────────────────────
function openDestModal(key) {
  const d = DEST_DATA[key];
  if (!d) return;
  const modal = document.getElementById('dest-modal');
  const content = document.getElementById('modal-content');

  const linksHtml = d.links.map(l =>
    `<a href="${l.url}" target="_blank" class="modal-link-btn ${l === d.links[0] ? 'primary' : 'secondary'}">
      <i class="${l.icon}"></i> ${l.label}
    </a>`
  ).join('');

  const tagsHtml = d.highlights.map(h => `<span>${h}</span>`).join('');

  content.innerHTML = `
    <div class="modal-gfx ${d.gfxClass}" style="font-size:4rem;">${d.emoji}</div>
    <div class="modal-content-inner">
      <div class="modal-region"><i class="fa-solid fa-map-pin"></i> ${d.region}</div>
      <h2>${d.name}</h2>
      <div class="modal-info-row">
        <div class="modal-info-chip"><i class="fa-solid fa-route"></i> ${d.distance}</div>
        <div class="modal-info-chip"><i class="fa-solid fa-mountain"></i> ${d.altitude}</div>
        <div class="modal-info-chip"><i class="fa-regular fa-clock"></i> ${d.duration}</div>
      </div>
      <p class="modal-body-text">${d.desc.replace(/\n\n/g,'</p><p class="modal-body-text" style="margin-top:14px;">')}</p>
      <div class="modal-tags">${tagsHtml}</div>
      <div class="modal-links">${linksHtml}</div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDestModal() {
  document.getElementById('dest-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModal(e) {
  if (e.target === document.getElementById('dest-modal')) closeDestModal();
}

// Close modal on Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDestModal(); });

// ── HELPERS ───────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, dL = (lat2-lat1)*Math.PI/180, dO = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dL/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dO/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function cap(s) { return (s||'').replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()); }
function setSidebarHead(t, s) {
  const h = document.getElementById('result-count');
  const p = document.getElementById('result-sub');
  if (h) h.textContent = t;
  if (p) p.textContent = s;
}
function setMapLoading(show) {
  const el = document.getElementById('map-loading');
  if (el) el.classList.toggle('hidden', !show);
}

let notifTimer;
function showNotif(msg, type='info', icon='fa-circle-info') {
  let n = document.querySelector('.notif');
  if (!n) { n = document.createElement('div'); n.className='notif'; document.body.appendChild(n); }
  n.className = `notif ${type}`;
  n.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
  clearTimeout(notifTimer);
  requestAnimationFrame(() => { n.offsetHeight; n.classList.add('show'); });
  notifTimer = setTimeout(() => n.classList.remove('show'), 3500);
}
