/* ═══════════════════════════════════════════
   WANDERLUST NEPAL — script.js  v3
   ═══════════════════════════════════════════ */
'use strict';

// ── STATE ─────────────────────────────────────────
let map, userCoords, userMarker, radiusCircle;
let allPlaces = [], activeMarkers = [];
let radiusKm = 50, activeCategory = 'all';

// ── DESTINATION DATA (with images + attractions) ──
const DEST = {
  pokhara:{
    name:'Pokhara',
    region:'Gandaki Province · 822 m altitude',
    distance:'200 km from Kathmandu · ~5 hrs by road',
    duration:'5–7 days recommended',
    img:'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80&auto=format&fit=crop',
    desc:`Nepal's adventure capital and its most-visited city outside Kathmandu. Perched beside the serene Phewa Lake, Pokhara offers breathtaking reflections of the Annapurna massif on still mornings, and is the gateway to some of the world's finest trekking routes — the Annapurna Circuit, Annapurna Base Camp trek, and Poon Hill sunrise trek all begin here.`,
    desc2:`Beyond trekking, the city is famous for paragliding over terraced rice paddies, boating to the Tal Barahi island temple on Phewa Lake, exploring Gupteshwor Cave and witnessing Davis Falls plunge into an underground tunnel. The Lakeside promenade buzzes with cafés, music and a thoroughly relaxed energy that makes it easy to stay longer than planned.`,
    attractions:['🏔 Annapurna Range Views','🚣 Phewa Lake Boating','🪂 Paragliding / Zip-line','🌊 Davis Falls','🕌 Tal Barahi Temple','🦇 Gupteshwor Cave','🌅 Sarangkot Sunrise','🏕 Annapurna Base Camp Trek'],
    links:[
      {label:'Wikipedia',url:'https://en.wikipedia.org/wiki/Pokhara',icon:'fa-brands fa-wikipedia-w',primary:true},
      {label:'Nepal Tourism',url:'https://welcomenepal.com/places-to-see/pokhara/',icon:'fa-solid fa-globe',primary:false},
    ]
  },
  mustang:{
    name:'Mustang',
    region:'Gandaki Province · 3,750–4,500 m altitude',
    distance:'~320 km from Kathmandu · ~7 hrs to Jomsom',
    duration:'10–14 days recommended',
    img:'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800&q=80&auto=format&fit=crop',
    desc:`Once a sealed kingdom closed to outsiders until 1992, Mustang is unlike anywhere else on Earth. A high-altitude Tibetan plateau tucked behind the Annapurna and Dhaulagiri massifs, it sits in a rain shadow that creates a dramatically arid landscape of deep crimson canyons, wind-sculpted cliffs, and ancient cave systems with Buddhist art over a thousand years old.`,
    desc2:`The walled city of Lo Manthang — still presided over by a ceremonial king — holds four monasteries, a royal palace, and whitewashed streets unchanged since the 15th century. Upper Mustang requires a special restricted area permit (USD 500/10 days), making it one of Nepal's most exclusive and extraordinary destinations. The annual Tiji Festival here is among Asia's most spectacular events.`,
    attractions:['🏯 Lo Manthang Walled City','🛕 Thubchen Monastery','🏜 Crimson Canyon Trails','🎭 Tiji Festival (May)','🗻 Thorong La Pass','🏛 Ancient Cave Frescoes','🐴 Horse Culture & Polo','🌄 Kaligandaki Gorge'],
    links:[
      {label:'Wikipedia',url:'https://en.wikipedia.org/wiki/Mustang_District',icon:'fa-brands fa-wikipedia-w',primary:true},
      {label:'Permit Info',url:'https://ntb.gov.np',icon:'fa-solid fa-passport',primary:false},
    ]
  },
  chitwan:{
    name:'Chitwan National Park',
    region:'Bagmati Province · 100–800 m altitude',
    distance:'150 km from Kathmandu · ~4 hrs by road',
    duration:'3–4 days recommended',
    img:'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80&auto=format&fit=crop',
    desc:`Nepal's first national park and a UNESCO World Heritage Site — a vast subtropical jungle teeming with remarkable wildlife. It is one of the last refuges of the endangered one-horned rhinoceros, with a population of over 700 individuals. Bengal tigers, gharial crocodiles, sloth bears, and more than 500 species of birds also call this forest home.`,
    desc2:`Explore on jeep drives through tall elephant grass, guided jungle walks with naturalists, and dugout canoe rides along the Rapti and Narayani rivers. The Tharu people — indigenous to the lowlands — offer cultural experiences through their unique stick-dance traditions and village homestays. Best visited October to March when wildlife gathers near water.`,
    attractions:['🦏 One-horned Rhino Safari','🐯 Bengal Tiger Spotting','🛶 Rapti River Canoe','🦅 Bird Watching (500+ species)','🌿 Guided Jungle Walk','🐊 Gharial Crocodile River','🎭 Tharu Cultural Dance','🏘 Tharu Village Homestay'],
    links:[
      {label:'Wikipedia',url:'https://en.wikipedia.org/wiki/Chitwan_National_Park',icon:'fa-brands fa-wikipedia-w',primary:true},
      {label:'Park Website',url:'https://chitwannationalpark.gov.np',icon:'fa-solid fa-globe',primary:false},
    ]
  },
  lumbini:{
    name:'Lumbini',
    region:'Lumbini Province · 93 m altitude',
    distance:'280 km from Kathmandu · ~6 hrs by road',
    duration:'2–3 days recommended',
    img:'https://images.unsplash.com/photo-1590050753481-35a76a5f3f9a?w=800&q=80&auto=format&fit=crop',
    desc:`Lumbini is the birthplace of Siddhartha Gautama — the Buddha — and one of the most sacred pilgrimage sites in the world, designated a UNESCO World Heritage Site in 1997. The Mayadevi Temple marks the exact spot where Queen Mayadevi gave birth to the future Buddha in 623 BC, beside the sacred Puskarini Pond where she bathed before the birth.`,
    desc2:`The surrounding Lumbini Development Zone spans 3 km and contains monasteries built by Buddhist nations from across the world — from Japan's gleaming Nipponzan Myohoji pagoda to Sri Lanka's ornate temple. Emperor Ashoka's 23-metre sandstone pillar, erected in 249 BC to commemorate his pilgrimage, still stands in the garden. The eternal flame burns day and night.`,
    attractions:['🕌 Mayadevi Temple (623 BC birthplace)','🏛 Ashoka Pillar · 249 BC','🔥 Eternal Peace Flame','💧 Sacred Puskarini Pond','🌏 40-Nation Monastery Zone','🇯🇵 Japanese Peace Pagoda','🇨🇳 Chinese Monastery','🧘 Meditation Gardens'],
    links:[
      {label:'Wikipedia',url:'https://en.wikipedia.org/wiki/Lumbini',icon:'fa-brands fa-wikipedia-w',primary:true},
      {label:'Lumbini Dev Trust',url:'https://lumbinidevtrust.gov.np',icon:'fa-solid fa-globe',primary:false},
    ]
  },
  rara:{
    name:'Rara Lake',
    region:'Karnali Province · 2,990 m altitude',
    distance:'~480 km · Flight to Talcha + 2 hr trek',
    duration:'7–10 days recommended',
    img:'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80&auto=format&fit=crop',
    desc:`Rara Lake is Nepal's largest and deepest lake — a jewel of the remote Karnali region, almost entirely off the tourist trail. At nearly 3,000m above sea level, surrounded by dense Himalayan pine and juniper forest, it is one of the most pristine wilderness destinations in all of Asia. The lake changes colour throughout the day, shifting from turquoise to cobalt to deep navy.`,
    desc2:`The surrounding Rara National Park protects an area of extraordinary biodiversity: red pandas, Himalayan black bears, musk deer, over 200 bird species, and endemic fish found nowhere else on Earth. Getting here requires effort — a short mountain flight or a multi-day trek through remote villages — which is precisely what keeps it so unspoiled. The dark sky at night is among Asia's most spectacular.`,
    attractions:['💧 Nepal\'s Largest Lake','🐼 Red Panda Sightings','🦅 200+ Bird Species','🌲 Ancient Pine & Juniper','🌌 World-class Stargazing','🏔 Himalayan Panorama','🦌 Musk Deer & Black Bear','🏕 Remote Wilderness Trek'],
    links:[
      {label:'Wikipedia',url:'https://en.wikipedia.org/wiki/Rara_Lake',icon:'fa-brands fa-wikipedia-w',primary:true},
      {label:'Explore Nepal',url:'https://welcomenepal.com',icon:'fa-solid fa-globe',primary:false},
    ]
  },
  bandipur:{
    name:'Bandipur',
    region:'Gandaki Province · 1,030 m altitude',
    distance:'140 km from Kathmandu · ~4 hrs by road',
    duration:'1–2 days recommended',
    img:'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80&auto=format&fit=crop',
    desc:`Bandipur is a perfectly preserved Newari hilltop trading town frozen beautifully in the 18th century. Perched on a ridge above the Marsyangdi river valley on the old Pokhara trade road, it was bypassed when the modern highway was built — and that mistake is now its greatest treasure. The stone-paved bazaar, lined with merchant houses, pagoda temples and intricately carved wooden windows, remains entirely traffic-free.`,
    desc2:`The main viewpoint at the ridge edge offers a 180-degree panorama of the central Himalayas from Dhaulagiri to Manaslu — an unobstructed golden wall of peaks at sunrise. The nearby Siddha Cave is one of Nepal's largest, stretching 450 metres into the hillside. Bandipur makes a perfect overnight stop between Kathmandu and Pokhara, and an unforgettable place to watch the Himalaya turn gold.`,
    attractions:['🏘 Traffic-free Newari Bazaar','🌄 180° Himalayan Sunrise','⛩ Bindebasini Temple','🛕 Mahalaxmi Temple','🦇 Siddha Cave (450m)','🏺 Traditional Craft Shops','🎨 Newari Architecture','🌺 Thani Mai Viewpoint'],
    links:[
      {label:'Wikipedia',url:'https://en.wikipedia.org/wiki/Bandipur',icon:'fa-brands fa-wikipedia-w',primary:true},
      {label:'Travel Guide',url:'https://welcomenepal.com',icon:'fa-solid fa-globe',primary:false},
    ]
  },
};

// ── BOOT ──────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('gone');
    init();
  }, 2000);
});

function init() {
  initMap();
  initCursor();
  initNavbar();
  initHero();
  initTilt();
  initReveal();
  initSlider();
  initSearch();
  initParallax();
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDestModal(); });
}

// ── MAP ───────────────────────────────────────────
function initMap() {
  map = L.map('map', { center:[27.7172,85.324], zoom:10, zoomControl:true, attributionControl:false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);
  L.control.attribution({ position:'bottomright', prefix:'© <a href="https://openstreetmap.org">OpenStreetMap</a>' }).addTo(map);
  map.zoomControl.setPosition('topright');
}

// ── CURSOR (GPU-based, no lag) ─────────────────────
function initCursor() {
  const c = document.getElementById('cursor');
  if (!c || window.innerWidth < 768) return;
  document.addEventListener('mousemove', e => {
    c.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  }, { passive: true });
  document.querySelectorAll('a,button,.tcard,.cat-item,.place-card,.how-card,.ps-item').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-big'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-big'));
  });
}

// ── NAVBAR ────────────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive:true });
  document.getElementById('hamburger')?.addEventListener('click', () => {
    const ul = document.querySelector('.nav-links');
    if (!ul) return;
    const open = ul.style.display === 'flex';
    ul.style.cssText = open ? '' : `display:flex;flex-direction:column;position:fixed;top:64px;left:0;right:0;padding:24px 28px;gap:18px;background:rgba(251,246,238,0.97);backdrop-filter:blur(16px);box-shadow:0 8px 30px rgba(44,24,16,0.12);border-bottom:2px solid var(--border);z-index:999;`;
  });
}

// ── HERO ──────────────────────────────────────────
function initHero() {
  const b = document.getElementById('birds');
  if (!b) return;
  for (let i=0; i<8; i++) {
    const el = document.createElement('div');
    el.className='bird';
    el.style.cssText = `top:${10+Math.random()*35}%;--dur:${(18+Math.random()*20).toFixed(0)}s;--delay:-${(Math.random()*16).toFixed(0)}s;`;
    b.appendChild(el);
  }
}

// ── 3D TILT ───────────────────────────────────────
function initTilt() {
  document.querySelectorAll('.tcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2) / (r.width/2);
      const dy = (e.clientY - r.top  - r.height/2) / (r.height/2);
      card.style.transform = `perspective(900px) rotateX(${-dy*9}deg) rotateY(${dx*9}deg) translateY(-10px) scale(1.02)`;
      card.style.transition = 'transform 0.08s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    });
  });
}

// ── SCROLL REVEAL ─────────────────────────────────
function initReveal() {
  const obs = new IntersectionObserver(entries =>
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold:0.12, rootMargin:'0px 0px -40px 0px' }
  );
  document.querySelectorAll('.how-card').forEach(el => obs.observe(el));
}

// ── PARALLAX ─────────────────────────────────────
function initParallax() {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const hc = document.querySelector('.hero-content');
    if (hc) hc.style.transform = `translateY(calc(-40px + ${y*0.2}px))`;
  }, { passive:true });
}

// ── SLIDER ────────────────────────────────────────
function initSlider() {
  const s = document.getElementById('radiusSlider');
  const v = document.getElementById('radiusVal');
  if (!s) return;
  s.addEventListener('input', () => {
    radiusKm = parseInt(s.value);
    v.textContent = radiusKm + ' km';
    const sr = document.getElementById('scan-radius');
    if (sr) sr.textContent = radiusKm;
    if (radiusCircle) radiusCircle.setRadius(radiusKm * 1000);
  });
}

// ── SEARCH ────────────────────────────────────────
function initSearch() {
  document.getElementById('searchInput')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    const src = q ? allPlaces.filter(p =>
      (p.name||'').toLowerCase().includes(q) ||
      (p.subtype||'').toLowerCase().includes(q)
    ) : catFilter(allPlaces);
    renderList(src);
    showMarkers(src);
  });
}

function catFilter(arr) {
  return activeCategory === 'all' ? arr : arr.filter(p => p.type === activeCategory || p.subtype === activeCategory);
}

// ── NEAR ME ───────────────────────────────────────
function initNearMe() {
  document.getElementById('map-section')?.scrollIntoView({ behavior:'smooth' });
  const btn = document.getElementById('locateBtn');
  btn?.classList.add('pulsing');
  toast('Requesting your location…','info','fa-location-crosshairs');

  if (!navigator.geolocation) {
    btn?.classList.remove('pulsing');
    toast('Geolocation not supported.','error','fa-triangle-exclamation');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      userCoords = { lat:pos.coords.latitude, lng:pos.coords.longitude };
      btn?.classList.remove('pulsing');
      toast(`Found you! Scanning ${radiusKm} km…`,'success','fa-check-circle');
      placeUser(userCoords);
      fetchPlaces(userCoords, radiusKm);
    },
    err => {
      btn?.classList.remove('pulsing');
      const m = {1:'Location permission denied.',2:'Position unavailable.',3:'Request timed out.'};
      toast(m[err.code]||'Location error.','error','fa-triangle-exclamation');
    },
    { timeout:12000, enableHighAccuracy:true }
  );
}

function placeUser({ lat, lng }) {
  if (userMarker) map.removeLayer(userMarker);
  if (radiusCircle) map.removeLayer(radiusCircle);
  userMarker = L.marker([lat,lng], {
    icon:L.divIcon({ className:'', html:'<div class="m-dot m-user"></div>', iconSize:[18,18], iconAnchor:[9,9] })
  }).addTo(map).bindPopup('<b style="font-family:\'Playfair Display\',serif">📍 You Are Here</b>');
  radiusCircle = L.circle([lat,lng], {
    radius:radiusKm*1000, color:'#E8854A', weight:1.5,
    dashArray:'8 5', fillColor:'#E8854A', fillOpacity:0.05,
  }).addTo(map);
  map.flyTo([lat,lng], zoomFor(radiusKm), { animate:true, duration:1.6 });
}

function zoomFor(km) {
  return km<=10?12:km<=25?11:km<=50?10:km<=75?9:8;
}

// ── OVERPASS ──────────────────────────────────────
async function fetchPlaces({ lat, lng }, km) {
  setLoading(true);
  setHead('Scanning…', `Searching within ${km} km`);
  const r = km * 1000;
  const q = `[out:json][timeout:30];(
    node["tourism"](around:${r},${lat},${lng});
    node["historic"](around:${r},${lat},${lng});
    node["natural"~"peak|waterfall|cave|beach|hot_spring|volcano|viewpoint|glacier"](around:${r},${lat},${lng});
    node["leisure"~"park|nature_reserve|garden"](around:${r},${lat},${lng});
    node["amenity"~"place_of_worship|museum|arts_centre|theatre"](around:${r},${lat},${lng});
    way["tourism"~"attraction|museum|viewpoint|zoo|gallery"](around:${r},${lat},${lng});
  );out center body 200;`;

  try {
    const res  = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', body:'data='+encodeURIComponent(q) });
    if (!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    processPlaces(data.elements, { lat, lng });
  } catch(err) {
    setLoading(false);
    setHead('Error','Could not load data. Please try again.');
    toast('Failed to fetch places.','error','fa-triangle-exclamation');
  }
}

function processPlaces(els, uPos) {
  clearMarkers(); allPlaces = [];
  els.forEach(el => {
    const lat = el.lat || el.center?.lat;
    const lng = el.lon || el.center?.lon;
    if (!lat||!lng) return;
    const tags = el.tags||{};
    const name = tags.name || tags['name:en'];
    if (!name) return;
    const dist = haversine(uPos.lat, uPos.lng, lat, lng);
    if (dist > radiusKm) return;
    const { type, subtype, icon } = classify(tags);
    const website = tags.website || tags['contact:website'] || null;
    const wiki = tags.wikipedia
      ? 'https://en.wikipedia.org/wiki/'+encodeURIComponent(tags.wikipedia.replace(/^[a-z]+:/,''))
      : null;
    const desc = tags.description || tags['description:en'] || tags.note || `A ${subtype||type} point of interest in this area.`;
    allPlaces.push({ id:el.id, name, lat, lng, type, subtype, icon, dist, website, wiki, desc, tags });
  });
  allPlaces.sort((a,b)=>a.dist-b.dist).splice(150);
  const filtered = catFilter(allPlaces);
  renderList(filtered);
  showMarkers(filtered);
  setLoading(false);
  setHead(`${allPlaces.length} Places Found`, `Within ${radiusKm} km of your location`);
  toast(`Found ${allPlaces.length} destinations!`,'success','fa-map-pin');
}

function classify(t) {
  const { tourism, historic, natural, leisure, amenity } = t;
  if (natural) { const m={peak:'fa-mountain',waterfall:'fa-water',cave:'fa-circle-half-stroke',beach:'fa-umbrella-beach',hot_spring:'fa-hot-tub-person',viewpoint:'fa-binoculars',glacier:'fa-snowflake'}; return {type:'natural',subtype:natural,icon:m[natural]||'fa-leaf'}; }
  if (tourism==='viewpoint') return {type:'viewpoint',subtype:'Viewpoint',icon:'fa-binoculars'};
  if (tourism) { const m={museum:'fa-building-columns',attraction:'fa-star',artwork:'fa-palette',zoo:'fa-paw',gallery:'fa-image',camp_site:'fa-campground'}; return {type:'tourism',subtype:tourism,icon:m[tourism]||'fa-camera-retro'}; }
  if (historic) { const m={monument:'fa-monument',castle:'fa-chess-rook',ruins:'fa-archway',temple:'fa-place-of-worship',memorial:'fa-star'}; return {type:'historic',subtype:historic,icon:m[historic]||'fa-landmark'}; }
  if (leisure) return {type:'leisure',subtype:leisure,icon:'fa-leaf'};
  if (amenity) { const m={place_of_worship:'fa-place-of-worship',museum:'fa-building-columns',theatre:'fa-masks-theater',arts_centre:'fa-palette'}; return {type:'amenity',subtype:amenity,icon:m[amenity]||'fa-mug-hot'}; }
  return {type:'other',subtype:'Point of Interest',icon:'fa-location-dot'};
}

// ── MARKERS WITH BIG HOVER TOOLTIP ────────────────
function showMarkers(places) {
  clearMarkers();
  places.forEach(p => {
    const marker = L.marker([p.lat, p.lng], {
      icon: L.divIcon({ className:'', html:`<div class="m-dot m-${p.type}"></div>`, iconSize:[14,14], iconAnchor:[7,7] })
    }).addTo(map);

    // BIG TOOLTIP on hover
    const tipHtml = buildBigTip(p);
    marker.bindTooltip(tipHtml, {
      className:'big-tip',
      direction:'top',
      offset:[0,-10],
      opacity:1,
      sticky:false,
    });

    // Click: go to website or Google search
    marker.on('click', () => {
      openPlaceLink(p);
      highlightCard(p.id);
    });

    p.marker = marker;
    activeMarkers.push(marker);
  });
}

function buildBigTip(p) {
  const dist = p.dist < 1 ? `${Math.round(p.dist*1000)} m away` : `${p.dist.toFixed(1)} km away`;
  const extra = p.tags;
  const details = [];
  if (extra.opening_hours) details.push(`🕐 ${extra.opening_hours}`);
  if (extra.phone || extra['contact:phone']) details.push(`📞 ${extra.phone||extra['contact:phone']}`);
  if (extra.fee) details.push(`💰 Fee: ${extra.fee}`);
  if (extra.access) details.push(`🚶 Access: ${extra.access}`);
  const detailsHtml = details.map(d=>`<span>${d}</span>`).join('');
  const url = p.website || p.wiki || `https://www.google.com/search?q=${encodeURIComponent(p.name+' '+p.subtype)}`;
  const urlLabel = p.website ? 'Official Website' : p.wiki ? 'Wikipedia' : 'Search on Google';

  return `<div class="big-tip-inner">
    <div class="bt-name">${p.name}</div>
    <div class="bt-badge"><i class="fa-solid ${p.icon}"></i> ${cap(p.subtype||p.type)}</div>
    <div class="bt-dist"><i class="fa-solid fa-route"></i> ${dist}</div>
    <div class="bt-desc">${p.desc.slice(0,160)}${p.desc.length>160?'…':''}</div>
    ${details.length?`<div class="bt-tags">${detailsHtml}</div>`:''}
    <div class="bt-click"><i class="fa-solid fa-arrow-up-right-from-square"></i> Click marker to open: <b>${urlLabel}</b></div>
  </div>`;
}

function clearMarkers() {
  activeMarkers.forEach(m => map.removeLayer(m));
  activeMarkers = [];
}

// ── SIDEBAR LIST ──────────────────────────────────
function renderList(places) {
  const list = document.getElementById('place-list');
  if (!places.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div><p>No places match your search.</p></div>`;
    return;
  }
  list.innerHTML = '';
  places.forEach(p => {
    const dist = p.dist<1 ? `${Math.round(p.dist*1000)}m` : `${p.dist.toFixed(1)}km`;
    // Determine the link
    const url = p.website
      ? p.website
      : p.wiki
      ? p.wiki
      : `https://www.google.com/search?q=${encodeURIComponent(p.name+' '+cap(p.subtype||p.type))}`;
    const urlLabel = p.website ? 'Visit Website' : p.wiki ? 'Wikipedia' : 'Search on Google';
    const urlIcon  = p.website ? 'fa-globe' : p.wiki ? 'fa-wikipedia-w' : 'fa-magnifying-glass';
    const iconClass = p.website ? 'fa-solid' : p.wiki ? 'fa-brands' : 'fa-solid';

    const card = document.createElement('div');
    card.className = 'place-card';
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="place-card-row">
        <h4>${p.name}</h4>
        <span class="place-dist"><i class="fa-solid fa-route"></i> ${dist}</span>
      </div>
      <div class="place-type"><i class="fa-solid ${p.icon}"></i> ${cap(p.subtype||p.type)}</div>
      <p>${p.desc.slice(0,100)}${p.desc.length>100?'…':''}</p>
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="place-link-btn" onclick="event.stopPropagation()">
        <i class="${iconClass} ${urlIcon}"></i> ${urlLabel}
      </a>
    `;
    // Click card body: fly map to location
    card.addEventListener('click', () => {
      map.flyTo([p.lat, p.lng], 14, { animate:true, duration:1 });
      setTimeout(() => p.marker?.openTooltip(), 1000);
      highlightCard(p.id);
    });
    list.appendChild(card);
  });
}

function highlightCard(id) {
  document.querySelectorAll('.place-card').forEach(c=>c.classList.remove('active'));
  const c = document.querySelector(`.place-card[data-id="${id}"]`);
  if (c) { c.classList.add('active'); c.scrollIntoView({behavior:'smooth',block:'nearest'}); }
}

// Opens website or Google search in new tab when marker is clicked
function openPlaceLink(p) {
  const url = p.website
    ? p.website
    : p.wiki
    ? p.wiki
    : `https://www.google.com/search?q=${encodeURIComponent(p.name+' '+cap(p.subtype||p.type)+' Nepal')}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ── CATEGORY FILTER ──────────────────────────────
function filterByCategory(cat, el) {
  activeCategory = cat;
  document.querySelectorAll('.cat-item').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  if (!allPlaces.length) return;
  const f = catFilter(allPlaces);
  renderList(f); showMarkers(f);
  setHead(`${f.length} Places`, cat==='all'?`All types · ${radiusKm} km`:`${cap(cat)} · ${radiusKm} km`);
}

// ── DESTINATION MODAL ─────────────────────────────
function openDestModal(key) {
  const d = DEST[key];
  if (!d) return;
  const linksHtml = d.links.map(l=>
    `<a href="${l.url}" target="_blank" rel="noopener" class="mlink ${l.primary?'primary':'secondary'}">
      <i class="${l.icon}"></i>${l.label}
    </a>`
  ).join('');
  const attrsHtml = d.attractions.map(a=>`<div class="attr-item">${a}</div>`).join('');

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-hero-img">
      <img src="${d.img}" alt="${d.name}"
           onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'"/>
      <div class="modal-hero-img-overlay"></div>
    </div>
    <div class="modal-inner">
      <div class="modal-region"><i class="fa-solid fa-map-pin"></i> ${d.region}</div>
      <h2>${d.name}</h2>
      <div class="modal-chips">
        <div class="chip"><i class="fa-solid fa-route"></i> ${d.distance}</div>
        <div class="chip"><i class="fa-regular fa-clock"></i> ${d.duration}</div>
      </div>
      <p class="modal-body-text">${d.desc}</p>
      <p class="modal-body-text" style="margin-top:12px">${d.desc2}</p>
      <div class="modal-attractions">
        <h4>Top Attractions</h4>
        <div class="modal-attractions-grid">${attrsHtml}</div>
      </div>
      <div class="modal-links">${linksHtml}</div>
    </div>
  `;
  document.getElementById('dest-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDestModal() {
  document.getElementById('dest-modal').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModal(e) { if (e.target===document.getElementById('dest-modal')) closeDestModal(); }

// ── HELPERS ───────────────────────────────────────
function haversine(a,b,c,d){
  const R=6371,dL=(c-a)*Math.PI/180,dO=(d-b)*Math.PI/180;
  const x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dO/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function cap(s){return (s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function setHead(t,s){
  const h=document.getElementById('result-count'),p=document.getElementById('result-sub');
  if(h) h.textContent=t; if(p) p.textContent=s;
}
function setLoading(show){ document.getElementById('map-loading')?.classList.toggle('hidden',!show); }

let _nt;
function toast(msg,type='info',icon='fa-circle-info'){
  let n=document.querySelector('.notif');
  if(!n){n=document.createElement('div');n.className='notif';document.body.appendChild(n);}
  n.className=`notif ${type}`;
  n.innerHTML=`<i class="fa-solid ${icon}"></i> ${msg}`;
  clearTimeout(_nt);
  requestAnimationFrame(()=>{n.offsetHeight;n.classList.add('show');});
  _nt=setTimeout(()=>n.classList.remove('show'),3600);
}
