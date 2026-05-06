/* ═══════════════════════════════════════════
   WANDERLUST NEPAL — TO3.js  v4
   Pure frontend. All data & classification
   logic now lives in TO3.py (Flask backend).
   ═══════════════════════════════════════════ */
'use strict';

// ── STATE ─────────────────────────────────────────
let map, userCoords, userMarker, radiusCircle;
let allPlaces = [], activeMarkers = [];
let radiusKm = 50, activeCategory = 'all';
let routeLayer = null, routeInfoEl = null;
let selectedPlace = null;

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
    el.className = 'bird';
    el.style.cssText = `top:${10+Math.random()*35}%;--dur:${(18+Math.random()*20).toFixed(0)}s;--delay:-${(Math.random()*16).toFixed(0)}s;`;
    b.appendChild(el);
  }
}

// ── 3D TILT ───────────────────────────────────────
function initTilt() {
  document.querySelectorAll('.tcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2)  / (r.width/2);
      const dy = (e.clientY - r.top  - r.height/2) / (r.height/2);
      card.style.transform  = `perspective(900px) rotateX(${-dy*9}deg) rotateY(${dx*9}deg) translateY(-10px) scale(1.02)`;
      card.style.transition = 'transform 0.08s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    });
  });
}

// ── SCROLL REVEAL ─────────────────────────────────
function initReveal() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold:0.12, rootMargin:'0px 0px -40px 0px' }
  );
  document.querySelectorAll('.how-card').forEach(el => obs.observe(el));
}

// ── PARALLAX ─────────────────────────────────────
function initParallax() {
  window.addEventListener('scroll', () => {
    const hc = document.querySelector('.hero-content');
    if (hc) hc.style.transform = `translateY(calc(-40px + ${window.scrollY * 0.2}px))`;
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
    const src = q
      ? allPlaces.filter(p =>
          (p.name||'').toLowerCase().includes(q) ||
          (p.subtype||'').toLowerCase().includes(q))
      : catFilter(allPlaces);
    renderList(src);
    showMarkers(src);
  });
}

function catFilter(arr) {
  return activeCategory === 'all'
    ? arr
    : arr.filter(p => p.type === activeCategory || p.subtype === activeCategory);
}

// ── NEAR ME ───────────────────────────────────────
function initNearMe() {
  document.getElementById('map-section')?.scrollIntoView({ behavior:'smooth' });
  const btn = document.getElementById('locateBtn');
  btn?.classList.add('pulsing');
  toast('Requesting your location…', 'info', 'fa-location-crosshairs');

  if (!navigator.geolocation) {
    btn?.classList.remove('pulsing');
    toast('Geolocation not supported.', 'error', 'fa-triangle-exclamation');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      btn?.classList.remove('pulsing');
      toast(`Found you! Scanning ${radiusKm} km…`, 'success', 'fa-check-circle');
      placeUser(userCoords);
      fetchPlaces(userCoords, radiusKm);
    },
    err => {
      btn?.classList.remove('pulsing');
      const m = { 1:'Location permission denied.', 2:'Position unavailable.', 3:'Request timed out.' };
      toast(m[err.code] || 'Location error.', 'error', 'fa-triangle-exclamation');
    },
    { timeout:12000, enableHighAccuracy:true }
  );
}

function placeUser({ lat, lng }) {
  if (userMarker)  map.removeLayer(userMarker);
  if (radiusCircle) map.removeLayer(radiusCircle);
  userMarker = L.marker([lat, lng], {
    icon: L.divIcon({ className:'', html:'<div class="m-dot m-user"></div>', iconSize:[18,18], iconAnchor:[9,9] })
  }).addTo(map).bindPopup('<b style="font-family:\'Playfair Display\',serif">📍 You Are Here</b>');
  radiusCircle = L.circle([lat, lng], {
    radius: radiusKm * 1000, color:'#E8854A', weight:1.5,
    dashArray:'8 5', fillColor:'#E8854A', fillOpacity:0.05,
  }).addTo(map);
  map.flyTo([lat, lng], zoomFor(radiusKm), { animate:true, duration:1.6 });
}

function zoomFor(km) {
  return km<=10 ? 12 : km<=25 ? 11 : km<=50 ? 10 : km<=75 ? 9 : 8;
}

// ── PLACES — backend first, Overpass fallback ─────
async function fetchPlaces({ lat, lng }, km) {
  setLoading(true);
  setHead('Scanning…', `Searching within ${km} km`);

  // 1. Try the Flask backend (/api/nearby) — fast path with cache + parallel mirrors
  try {
    const res = await fetch(`/api/nearby?lat=${lat}&lng=${lng}&radius_km=${km}&limit=30`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data.places) {
      if (data.cached) toast('Loaded from cache ⚡', 'success', 'fa-bolt');
      processPlaces(data.places);
      return;
    }
  } catch (_) {
    // Flask not running — fall through to direct Wikipedia Geosearch
  }

  // 2. Fallback: Wikipedia Geosearch directly from browser (~300 ms)
  //    Shows only notable, must-visit places — much faster than Overpass.
  try {
    toast('Searching notable places…', 'info', 'fa-magnifying-glass');
    const places = await wikiGeoSearch(lat, lng, km);
    processPlaces(places);
  } catch (err) {
    setLoading(false);
    setHead('Error', 'Could not load places. Please try again.');
    toast('Search failed. Check connection.', 'error', 'fa-triangle-exclamation');
  }
}

// Wikipedia Geosearch — returns only places famous enough to have a Wikipedia article.
// Runs in ~300 ms. For large radii, tiles the area with offset calls to widen coverage.
async function wikiGeoSearch(lat, lng, km) {
  const tileRadius = Math.min(km * 1000, 10000); // Wikipedia caps at 10 000 m
  const offsets    = [[0, 0]];
  if (km > 15) {
    const step = km * 0.45 / 111;
    offsets.push([step, 0], [-step, 0], [0, step], [0, -step]);
  }

  const seenIds = new Set();
  const places  = [];

  await Promise.all(offsets.map(async ([dlat, dlng]) => {
    const coord = `${lat + dlat}|${lng + dlng}`;
    const url   = `https://en.wikipedia.org/w/api.php`
      + `?action=query&generator=geosearch`
      + `&ggscoord=${coord}&ggsradius=${tileRadius}&ggslimit=20`
      + `&prop=pageimages|coordinates|extracts`
      + `&pithumbsize=500&exintro=1&exchars=500&format=json&origin=*`;

    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const pages = Object.values((data.query || {}).pages || {});

    pages.forEach(page => {
      if (seenIds.has(page.pageid)) return;
      seenIds.add(page.pageid);
      const coords = (page.coordinates || [{}])[0];
      const p_lat  = coords.lat;
      const p_lng  = coords.lon;
      if (!p_lat || !p_lng) return;
      const dist = haversine(lat, lng, p_lat, p_lng);
      if (dist > km) return;
      const title   = page.title || '';
      const extract = (page.extract || '').trim();
      const img     = (page.thumbnail || {}).source || null;
      places.push({
        id:           `wiki_${page.pageid}`,
        name:         title,
        lat:          p_lat,
        lng:          p_lng,
        dist:         Math.round(dist * 1000) / 1000,
        type:         'attraction',
        subtype:      'attraction',
        icon:         'fa-star',
        website:      null,
        wiki:         `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g,'_'))}`,
        img,
        desc:         extract || 'A notable attraction near your location.',
        opening_hours:null, phone:null, fee:null, access:null,
      });
    });
  }));

  places.sort((a, b) => a.dist - b.dist);
  return places.slice(0, 30);
}

// Called when data arrives (from Flask or direct Wikipedia)
function processPlaces(places) {
  clearMarkers();
  allPlaces = places;
  const filtered = catFilter(allPlaces);
  renderList(filtered);
  showMarkers(filtered);
  setLoading(false);
  setHead(`${allPlaces.length} Places Found`, `Within ${radiusKm} km of your location`);
  toast(`Found ${allPlaces.length} places!`, 'success', 'fa-map-pin');
}



function haversine(a, b, c, d) {
  const R=6371, dL=(c-a)*Math.PI/180, dO=(d-b)*Math.PI/180;
  const x = Math.sin(dL/2)**2 + Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dO/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

// ── ROUTING ───────────────────────────────────────
async function fetchRoute(destLat, destLng, destName) {
  if (!userCoords) {
    toast('Use Locate Me first to get directions.', 'info', 'fa-location-crosshairs');
    return;
  }
  clearRoute();
  toast('Calculating route…', 'info', 'fa-route');

  const { lat: uLat, lng: uLng } = userCoords;
  const url = `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${destLng},${destLat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error('OSRM ' + res.status);
    const data = await res.json();
    if (!data.routes?.length) throw new Error('No route');

    const route   = data.routes[0];
    const coords  = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const distKm  = (route.distance / 1000).toFixed(1);
    const mins    = Math.round(route.duration / 60);

    // Animated dashed route line
    routeLayer = L.polyline(coords, {
      color:     '#0dff00',
      weight:    5,
      opacity:   0.9,
      lineJoin:  'round',
      lineCap:   'round',
      className: 'route-line',
    }).addTo(map);

    // Fit map to show the full route
    map.fitBounds(routeLayer.getBounds(), { padding:[60,60], animate:true, duration:1.2 });
    showRouteInfo(distKm, mins, destName);
    toast(`Route to ${destName} ready!`, 'success', 'fa-route');
  } catch {
    toast('Could not calculate route.', 'error', 'fa-triangle-exclamation');
  }
}

function clearRoute() {
  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
  routeInfoEl?.remove();
  routeInfoEl = null;
}

function showRouteInfo(distKm, mins, name) {
  routeInfoEl?.remove();
  const timeStr = mins >= 60 ? `${Math.floor(mins/60)}h ${mins%60}m` : `${mins} min`;
  const el = document.createElement('div');
  el.className = 'route-info';
  el.innerHTML = `
    <div class="ri-inner">
      <div class="ri-dest"><i class="fa-solid fa-map-pin"></i>${name}</div>
      <div class="ri-stats">
        <span><i class="fa-solid fa-route"></i>${distKm} km</span>
        <span><i class="fa-regular fa-clock"></i>${timeStr} by road</span>
      </div>
      <button class="ri-close" onclick="clearRoute()"><i class="fa-solid fa-xmark"></i> Clear</button>
    </div>`;
  document.getElementById('map').appendChild(el);
  routeInfoEl = el;
}

// ── MARKERS WITH BIG HOVER TOOLTIP ────────────────
// Builds a Leaflet divIcon — red pin when selected, type dot otherwise
function makeIcon(type, selected = false) {
  if (selected) return L.divIcon({
    className:'', iconSize:[28,28], iconAnchor:[14,28],
    html:`<div class="m-dot m-selected"><i class="fa-solid fa-location-dot"></i></div>`
  });
  return L.divIcon({
    className:'', iconSize:[14,14], iconAnchor:[7,7],
    html:`<div class="m-dot m-${type}"></div>`
  });
}

function showMarkers(places) {
  clearMarkers();
  selectedPlace = null;
  places.forEach(p => {
    const marker = L.marker([p.lat, p.lng], { icon: makeIcon(p.type) }).addTo(map);
    marker.bindTooltip(buildBigTip(p), {
      className:'big-tip', direction:'top', offset:[0,-10], opacity:1, sticky:false,
    });
    marker.on('click', () => { selectPlace(p); openPlaceModal(p); });
    p.marker = marker;
    activeMarkers.push(marker);
  });
}

function selectPlace(p) {
  clearRoute();
  activeMarkers.forEach(m => m.closeTooltip());
  if (selectedPlace?.marker) {
    selectedPlace.marker.setIcon(makeIcon(selectedPlace.type, false));
    selectedPlace.marker.setZIndexOffset(0);
  }
  selectedPlace = p;
  if (p.marker) {
    p.marker.setIcon(makeIcon(p.type, true));
    p.marker.setZIndexOffset(1000);
    setTimeout(() => p.marker?.openTooltip(), 400);
  }
  highlightCard(p.id);
}

function buildBigTip(p) {
  const dist = p.dist < 1 ? `${Math.round(p.dist*1000)} m away` : `${p.dist.toFixed(1)} km away`;
  const details = [];
  if (p.opening_hours) details.push(`🕐 ${p.opening_hours}`);
  if (p.phone)         details.push(`📞 ${p.phone}`);
  if (p.fee)           details.push(`💰 Fee: ${p.fee}`);
  if (p.access)        details.push(`🚶 Access: ${p.access}`);
  const detailsHtml = details.map(d => `<span>${d}</span>`).join('');
  const url      = p.website || p.wiki || `https://www.google.com/search?q=${encodeURIComponent(p.name+' '+p.subtype)}`;
  const urlLabel = p.website ? 'Official Website' : p.wiki ? 'Wikipedia' : 'Search on Google';
  return `<div class="big-tip-inner">
    <div class="bt-name">${p.name}</div>
    <div class="bt-badge"><i class="fa-solid ${p.icon}"></i> ${cap(p.subtype||p.type)}</div>
    <div class="bt-dist"><i class="fa-solid fa-route"></i> ${dist}</div>
    <div class="bt-desc">${p.desc.slice(0,160)}${p.desc.length>160?'…':''}</div>
    ${details.length ? `<div class="bt-tags">${detailsHtml}</div>` : ''}
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
    const dist     = p.dist < 1 ? `${Math.round(p.dist*1000)}m` : `${p.dist.toFixed(1)}km`;
    const url      = p.website || p.wiki || `https://www.google.com/search?q=${encodeURIComponent(p.name+' '+cap(p.subtype||p.type))}`;
    const urlLabel = p.website ? 'Visit Website' : p.wiki ? 'Wikipedia' : 'Search on Google';
    const urlIcon  = p.website ? 'fa-globe' : p.wiki ? 'fa-wikipedia-w' : 'fa-magnifying-glass';
    const iconClass = p.website ? 'fa-solid' : p.wiki ? 'fa-brands' : 'fa-solid';
    const card = document.createElement('div');
    card.className  = 'place-card';
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="place-card-row">
        <h4>${p.name}</h4>
        <span class="place-dist"><i class="fa-solid fa-route"></i> ${dist}</span>
      </div>
      <div class="place-type"><i class="fa-solid ${p.icon}"></i> ${cap(p.subtype||p.type)}</div>
      <p>${p.desc.slice(0,100)}${p.desc.length>100?'…':''}</p>
      <div class="place-card-actions">
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="place-link-btn" onclick="event.stopPropagation()">
          <i class="${iconClass} ${urlIcon}"></i> ${urlLabel}
        </a>
        <button class="place-dir-btn" onclick="event.stopPropagation();fetchRoute(${p.lat},${p.lng},'${p.name.replace(/'/g,"\\'")}')">
          <i class="fa-solid fa-diamond-turn-right"></i> Directions
        </button>
      </div>`;
    card.addEventListener('click', () => {
      map.flyTo([p.lat, p.lng], 14, { animate:true, duration:1 });
      selectPlace(p);
      openPlaceModal(p);
    });
    list.appendChild(card);
  });
}

function highlightCard(id) {
  document.querySelectorAll('.place-card').forEach(c => c.classList.remove('active'));
  const c = document.querySelector(`.place-card[data-id="${id}"]`);
  if (c) { c.classList.add('active'); c.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
}

// ── PLACE DETAIL MODAL ────────────────────────────
// Image priority: 1) p.img already on the object (Wikipedia Geosearch)
//                 2) Backend /api/place-detail (3-step Wiki/Commons search)
//                 3) contextualImg type-based Unsplash fallback

function contextualImg(p) {
  const MAP = {
    peak:'photo-1516912481808-3406841bd33c', waterfall:'photo-1504701954957-2010ec3bcec1',
    cave:'photo-1520206183501-b80df61043c2', viewpoint:'photo-1464822759023-fed622ff2c3b',
    glacier:'photo-1551524163-b5df2c9ef5c4', beach:'photo-1507525428034-b723cf961d3e',
    hot_spring:'photo-1548013146-72479768bada', museum:'photo-1554907984-15263bfd63bd',
    monument:'photo-1564507592333-c60657eea523', castle:'photo-1548625149-720f89a9d753',
    ruins:'photo-1548625149-720f89a9d753', temple:'photo-1590050753481-35a76a5f3f9a',
    place_of_worship:'photo-1590050753481-35a76a5f3f9a', memorial:'photo-1515191107209-c28698631303',
    park:'photo-1469474968028-56623f02e42e', nature_reserve:'photo-1426604966848-d7adac402bff',
    garden:'photo-1585320806297-9794b3e4eeae', zoo:'photo-1503919545889-aef636e10ad4',
    theatre:'photo-1503095396549-807759245b35', arts_centre:'photo-1531243269054-5ebf3f408be2',
    attraction:'photo-1476514525535-07fb3b4ae5f1',
  };
  const id = MAP[p.subtype] || MAP[p.type] || 'photo-1506905925346-21bda4d32df4';
  return `https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop`;
}

async function openPlaceModal(p) {
  const modal   = document.getElementById('dest-modal');
  const content = document.getElementById('modal-content');
  content.innerHTML = `<div class="pm-loading"><i class="fa-solid fa-spinner fa-spin"></i><span>Loading…</span></div>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // If p.img already exists (from Wikipedia Geosearch), skip the backend call
  let wiki = { summary: p.desc || null, extract2: null, img: p.img || null, url: p.wiki || null };
  if (!wiki.img) wiki = await fetchWikiData(p.name);

  const dist     = p.dist < 1 ? `${Math.round(p.dist*1000)} m away` : `${p.dist.toFixed(1)} km away`;
  const extUrl   = p.website || p.wiki || `https://www.google.com/search?q=${encodeURIComponent(p.name+' Nepal')}`;
  const extLabel = p.website ? 'Visit Website' : p.wiki ? 'Wikipedia' : 'Search Google';
  const extIcon  = p.website ? 'fa-globe' : p.wiki ? 'fa-wikipedia-w' : 'fa-magnifying-glass';
  const extClass = p.wiki ? 'fa-brands' : 'fa-solid';

  const chips = [
    { icon:'fa-route', val:dist },
    { icon:'fa-tag',   val:cap(p.subtype||p.type) },
    p.opening_hours && { icon:'fa-clock',          val:p.opening_hours },
    p.phone         && { icon:'fa-phone',          val:p.phone },
    p.fee           && { icon:'fa-coins',          val:`Fee: ${p.fee}` },
    p.access        && { icon:'fa-person-walking', val:`Access: ${p.access}` },
  ].filter(Boolean);

  const imgSrc  = wiki.img || contextualImg(p);
  const summary = wiki.summary || p.desc;

  content.innerHTML = `
    <div class="modal-hero-img pm-hero">
      <img src="${imgSrc}" alt="${p.name}" onerror="this.src='${contextualImg(p)}'"/>
      <div class="modal-hero-img-overlay"></div>
      <div class="pm-type-badge"><i class="fa-solid ${p.icon}"></i> ${cap(p.subtype||p.type)}</div>
    </div>
    <div class="modal-inner">
      <div class="modal-region"><i class="fa-solid fa-location-dot"></i> ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</div>
      <h2>${p.name}</h2>
      <div class="modal-chips">${chips.map(c=>`<div class="chip"><i class="fa-solid ${c.icon}"></i>${c.val}</div>`).join('')}</div>
      <p class="modal-body-text">${summary || ''}</p>
      ${wiki.extract2 ? `<p class="modal-body-text" style="margin-top:12px">${wiki.extract2}</p>` : ''}
      <div class="modal-links">
        <button class="mlink primary" onclick="fetchRoute(${p.lat},${p.lng},'${p.name.replace(/'/g,"\\'")}');closeDestModal()">
          <i class="fa-solid fa-diamond-turn-right"></i>Get Directions
        </button>
        <a href="${extUrl}" target="_blank" rel="noopener" class="mlink secondary">
          <i class="${extClass} ${extIcon}"></i>${extLabel}
        </a>
      </div>
    </div>`;
}

async function fetchWikiData(name) {
  try {
    const res = await fetch(`/api/place-detail/${encodeURIComponent(name)}`, { signal:AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return { summary:null, extract2:null, img:null, url:null };
  }
}

// ── CATEGORY FILTER ──────────────────────────────
function filterByCategory(cat, el) {
  activeCategory = cat;
  document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  clearRoute();
  if (!allPlaces.length) return;
  const f = catFilter(allPlaces);
  renderList(f); showMarkers(f);
  setHead(`${f.length} Places`, cat==='all' ? `All types · ${radiusKm} km` : `${cap(cat)} · ${radiusKm} km`);
}

// ── DESTINATION MODAL — data fetched from /api/destinations/:key ──────────
async function openDestModal(key) {
  const modal = document.getElementById('dest-modal');
  document.getElementById('modal-content').innerHTML = '<div style="padding:40px;text-align:center"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  try {
    const res = await fetch(`/api/destinations/${key}`);
    if (!res.ok) throw new Error('Not found');
    const d = await res.json();

    const linksHtml = d.links.map(l =>
      `<a href="${l.url}" target="_blank" rel="noopener" class="mlink ${l.primary?'primary':'secondary'}">
        <i class="${l.icon}"></i>${l.label}
      </a>`
    ).join('');
    const attrsHtml = d.attractions.map(a => `<div class="attr-item">${a}</div>`).join('');

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
      </div>`;
  } catch {
    document.getElementById('modal-content').innerHTML = '<div style="padding:40px;text-align:center">Could not load destination.</div>';
  }
}

function closeDestModal() {
  document.getElementById('dest-modal').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModal(e) { if (e.target === document.getElementById('dest-modal')) closeDestModal(); }

// ── HELPERS ───────────────────────────────────────
function cap(s) { return (s||'').replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()); }

function setHead(t, s) {
  const h = document.getElementById('result-count');
  const p = document.getElementById('result-sub');
  if (h) h.textContent = t;
  if (p) p.textContent = s;
}

function setLoading(show) {
  document.getElementById('map-loading')?.classList.toggle('hidden', !show);
}

let _nt;
function toast(msg, type='info', icon='fa-circle-info') {
  let n = document.querySelector('.notif');
  if (!n) { n = document.createElement('div'); n.className='notif'; document.body.appendChild(n); }
  n.className = `notif ${type}`;
  n.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
  clearTimeout(_nt);
  requestAnimationFrame(() => { n.offsetHeight; n.classList.add('show'); });
  _nt = setTimeout(() => n.classList.remove('show'), 3600);
}