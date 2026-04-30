/* ═══════════════════════════════════════════════
   WANDERLUST — script.js
   Features: Leaflet map, Geolocation, Overpass API,
   Animations, Scroll effects, Custom cursor
   ═══════════════════════════════════════════════ */

'use strict';

// ── STATE ──────────────────────────────────────────
let map = null;
let userMarker = null;
let userCoords = null;
let allPlaces = [];
let activeMarkers = [];
let activeCategory = 'all';
let radiusKm = 50;
let radiusCircle = null;
let activeCard = null;

// ── LOADER ────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    initApp();
  }, 1800);
});

function initApp() {
  initMap();
  initStars();
  initScrollEffects();
  initCursor();
  initNavbar();
  initCounters();
  initRadiusSlider();
  initSearch();
}

// ── MAP INIT ──────────────────────────────────────
function initMap() {
  map = L.map('map', {
    center: [27.7172, 85.3240], // Default: Kathmandu
    zoom: 10,
    zoomControl: true,
    attributionControl: false,
  });

  // Dark styled tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  // Attribution (bottom-right)
  L.control.attribution({
    position: 'bottomright',
    prefix: '© <a href="https://openstreetmap.org" style="color:#c9a84c">OpenStreetMap</a> contributors · <a href="https://carto.com" style="color:#c9a84c">CARTO</a>'
  }).addTo(map);

  map.zoomControl.setPosition('topright');
}

// ── STARS BACKGROUND ─────────────────────────────
function initStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 120; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    star.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      --dur:${(Math.random()*3+2).toFixed(1)}s;
      --delay:${(Math.random()*4).toFixed(1)}s;
      --base:${(Math.random()*0.4+0.1).toFixed(2)};
    `;
    container.appendChild(star);
  }
}

// ── CUSTOM CURSOR ─────────────────────────────────
function initCursor() {
  const cur = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');
  if (!cur || window.innerWidth < 768) return;

  document.addEventListener('mousemove', (e) => {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
    setTimeout(() => {
      trail.style.left = e.clientX + 'px';
      trail.style.top  = e.clientY + 'px';
    }, 80);
  });

  document.querySelectorAll('a,button,.feat-card,.cat-item,.place-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cur.style.width = '24px';
      cur.style.height = '24px';
      trail.style.width = '60px';
      trail.style.height = '60px';
    });
    el.addEventListener('mouseleave', () => {
      cur.style.width = '12px';
      cur.style.height = '12px';
      trail.style.width = '36px';
      trail.style.height = '36px';
    });
  });
}

// ── NAVBAR ────────────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  });
  document.getElementById('hamburger').addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    if (links) {
      links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'fixed';
      links.style.top = '70px';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'rgba(6,13,10,0.97)';
      links.style.padding = '30px 40px';
      links.style.gap = '20px';
      links.style.backdropFilter = 'blur(20px)';
      links.style.borderBottom = '1px solid rgba(201,168,76,0.2)';
    }
  });
}

// ── SCROLL EFFECTS ────────────────────────────────
function initScrollEffects() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-card').forEach(el => observer.observe(el));
}

// ── COUNTER ANIMATION ─────────────────────────────
function initCounters() {
  const nums = document.querySelectorAll('.stat-num');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        animateCounter(el, 0, target, 1800);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));
}

function animateCounter(el, start, end, duration) {
  const startTime = performance.now();
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const val = Math.floor(easeOutQuart(progress) * (end - start) + start);
    el.textContent = val;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function easeOutQuart(x) { return 1 - Math.pow(1 - x, 4); }

// ── RADIUS SLIDER ─────────────────────────────────
function initRadiusSlider() {
  const slider = document.getElementById('radiusSlider');
  const valDisplay = document.getElementById('radiusVal');
  slider.addEventListener('input', () => {
    radiusKm = parseInt(slider.value);
    valDisplay.textContent = radiusKm + ' km';
    document.getElementById('scan-radius').textContent = radiusKm;
    if (radiusCircle) {
      radiusCircle.setRadius(radiusKm * 1000);
    }
  });
}

// ── SEARCH ────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
    if (query.length === 0) {
      renderPlaces(allPlaces);
      showAllMarkers();
    } else {
      const filtered = allPlaces.filter(p =>
        (p.name || '').toLowerCase().includes(query) ||
        (p.type || '').toLowerCase().includes(query) ||
        (p.subtype || '').toLowerCase().includes(query)
      );
      renderPlaces(filtered);
      highlightMarkers(filtered);
    }
  });
}

// ── SCROLL TO MAP ─────────────────────────────────
function scrollToMap() {
  document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
}

// ── GEO LOCATE & FETCH ───────────────────────────
function initNearMe() {
  scrollToMap();
  const btn = document.getElementById('locateBtn');
  btn.classList.add('pulsing');
  showNotif('Requesting your location…', 'info', 'fa-location-crosshairs');

  if (!navigator.geolocation) {
    showNotif('Geolocation not supported by your browser.', 'error', 'fa-triangle-exclamation');
    btn.classList.remove('pulsing');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      btn.classList.remove('pulsing');
      showNotif(`Location found! Scanning ${radiusKm}km…`, 'success', 'fa-check');
      placeUserMarker(userCoords);
      fetchNearbyPlaces(userCoords, radiusKm);
    },
    (err) => {
      btn.classList.remove('pulsing');
      const msgs = {
        1: 'Location permission denied. Please allow access.',
        2: 'Location unavailable. Try again.',
        3: 'Location request timed out.',
      };
      showNotif(msgs[err.code] || 'Location error.', 'error', 'fa-triangle-exclamation');
    },
    { timeout: 12000, enableHighAccuracy: true }
  );
}

// ── PLACE USER MARKER ────────────────────────────
function placeUserMarker({ lat, lng }) {
  if (userMarker) map.removeLayer(userMarker);
  if (radiusCircle) map.removeLayer(radiusCircle);

  const icon = L.divIcon({
    className: '',
    html: '<div class="user-marker"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  userMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 })
    .addTo(map)
    .bindPopup('<div class="popup-inner"><h4>📍 You Are Here</h4><p>Your current GPS position</p></div>');

  radiusCircle = L.circle([lat, lng], {
    radius: radiusKm * 1000,
    color: '#c9a84c',
    fillColor: 'rgba(201,168,76,0.06)',
    fillOpacity: 1,
    weight: 1.5,
    dashArray: '8 6',
  }).addTo(map);

  map.flyTo([lat, lng], getZoomForRadius(radiusKm), { animate: true, duration: 1.5 });
}

function getZoomForRadius(km) {
  if (km <= 10) return 12;
  if (km <= 25) return 11;
  if (km <= 50) return 10;
  if (km <= 75) return 9;
  return 8;
}

// ── OVERPASS API ─────────────────────────────────
async function fetchNearbyPlaces({ lat, lng }, km) {
  showMapLoading(true);
  updateSidebarHeader('Scanning…', `Looking for places within ${km} km`);

  const rad = km * 1000;
  const query = `
    [out:json][timeout:30];
    (
      node["tourism"](around:${rad},${lat},${lng});
      node["historic"](around:${rad},${lat},${lng});
      node["natural"~"peak|waterfall|cave|beach|hot_spring|volcano|geyser|viewpoint|glacier"](around:${rad},${lat},${lng});
      node["leisure"~"park|nature_reserve|garden|beach_resort"](around:${rad},${lat},${lng});
      node["tourism"="viewpoint"](around:${rad},${lat},${lng});
      node["amenity"~"place_of_worship|arts_centre|theatre|museum"](around:${rad},${lat},${lng});
      way["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery|artwork"](around:${rad},${lat},${lng});
    );
    out center body 200;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query),
    });

    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    processPlaces(data.elements, { lat, lng });
  } catch (err) {
    showMapLoading(false);
    updateSidebarHeader('Error', 'Could not fetch data. Try again later.');
    showNotif('Failed to fetch places. Check connection.', 'error', 'fa-triangle-exclamation');
    console.error(err);
  }
}

// ── PROCESS PLACES ───────────────────────────────
function processPlaces(elements, userPos) {
  clearMarkers();
  allPlaces = [];

  elements.forEach(el => {
    const lat = el.lat || el.center?.lat;
    const lng = el.lon || el.center?.lon;
    if (!lat || !lng) return;

    const tags = el.tags || {};
    const name = tags.name || tags['name:en'] || null;
    if (!name) return; // skip unnamed

    const dist = haversine(userPos.lat, userPos.lng, lat, lng);
    if (dist > radiusKm) return;

    const { type, subtype, icon } = classifyPlace(tags);
    const desc = tags.description || tags['description:en'] ||
                 tags.note || tags.wikipedia
                 ? `Explore this ${subtype || type} destination.` : '';
    const wiki = tags.wikipedia
      ? 'https://en.wikipedia.org/wiki/' + encodeURIComponent(tags.wikipedia.replace(/^[a-z]+:/, ''))
      : null;
    const website = tags.website || tags['contact:website'] || null;

    allPlaces.push({
      id: el.id,
      name, lat, lng, type, subtype, icon, dist,
      desc: desc || `A ${subtype || type} point of interest.`,
      wiki, website,
      tags,
    });
  });

  // Sort by distance
  allPlaces.sort((a, b) => a.dist - b.dist);

  // Limit to 150 most relevant
  allPlaces = allPlaces.slice(0, 150);

  renderPlaces(allPlaces);
  renderMarkers(allPlaces);
  showMapLoading(false);

  const count = allPlaces.length;
  updateSidebarHeader(
    `${count} Place${count !== 1 ? 's' : ''} Found`,
    `Within ${radiusKm} km of your location`
  );
  showNotif(`Discovered ${count} destinations nearby!`, 'success', 'fa-map-pin');
}

function classifyPlace(tags) {
  const { tourism, historic, natural, leisure, amenity } = tags;

  if (natural) {
    const icons = { peak:'fa-mountain', waterfall:'fa-water', cave:'fa-circle-half-stroke',
      beach:'fa-umbrella-beach', hot_spring:'fa-hot-tub-person', volcano:'fa-fire-flame-curved',
      geyser:'fa-droplet', viewpoint:'fa-binoculars', glacier:'fa-snowflake' };
    return { type:'natural', subtype: natural, icon: icons[natural] || 'fa-leaf' };
  }
  if (tourism === 'viewpoint') return { type:'viewpoint', subtype:'Viewpoint', icon:'fa-binoculars' };
  if (tourism) {
    const icons = { museum:'fa-building-columns', attraction:'fa-star', artwork:'fa-palette',
      zoo:'fa-paw', theme_park:'fa-ferris-wheel', gallery:'fa-image',
      information:'fa-circle-info', camp_site:'fa-campground', picnic_site:'fa-apple-whole' };
    return { type:'tourism', subtype: tourism, icon: icons[tourism] || 'fa-camera-retro' };
  }
  if (historic) {
    const icons = { monument:'fa-monument', castle:'fa-chess-rook', ruins:'fa-archway',
      temple:'fa-place-of-worship', memorial:'fa-star-of-david', battlefield:'fa-shield-halved' };
    return { type:'historic', subtype: historic, icon: icons[historic] || 'fa-landmark' };
  }
  if (leisure) {
    return { type:'leisure', subtype: leisure, icon:'fa-leaf' };
  }
  if (amenity) {
    const icons = { place_of_worship:'fa-place-of-worship', museum:'fa-building-columns',
      theatre:'fa-masks-theater', arts_centre:'fa-palette' };
    return { type:'amenity', subtype: amenity, icon: icons[amenity] || 'fa-mug-hot' };
  }
  return { type:'other', subtype:'Point of Interest', icon:'fa-location-dot' };
}

// ── MARKERS ──────────────────────────────────────
function renderMarkers(places) {
  clearMarkers();
  places.forEach(place => {
    const markerClass = `custom-marker marker-${place.type}`;
    const icon = L.divIcon({
      className: '',
      html: `<div class="${markerClass}" title="${place.name}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const marker = L.marker([place.lat, place.lng], { icon })
      .addTo(map)
      .bindPopup(buildPopup(place), { maxWidth: 260, className: 'wanderlust-popup' });

    marker.on('click', () => highlightCard(place.id));
    place.marker = marker;
    activeMarkers.push(marker);
  });
}

function clearMarkers() {
  activeMarkers.forEach(m => map.removeLayer(m));
  activeMarkers = [];
}

function showAllMarkers() {
  renderMarkers(allPlaces.filter(p => activeCategory === 'all' || p.type === activeCategory));
}

function highlightMarkers(places) {
  activeMarkers.forEach(m => map.removeLayer(m));
  activeMarkers = [];
  renderMarkers(places);
}

function buildPopup(place) {
  const distText = place.dist < 1
    ? `${Math.round(place.dist * 1000)} m away`
    : `${place.dist.toFixed(1)} km away`;

  const wikiLink = place.wiki
    ? `<a href="${place.wiki}" target="_blank" class="popup-wiki"><i class="fa-brands fa-wikipedia-w"></i> Wikipedia</a>`
    : '';
  const webLink = place.website
    ? `<a href="${place.website}" target="_blank" class="popup-wiki"><i class="fa-solid fa-globe"></i> Website</a>`
    : '';

  return `
    <div class="popup-inner">
      <h4>${place.name}</h4>
      <div class="popup-badge"><i class="fa-solid ${place.icon}"></i> ${place.subtype || place.type}</div>
      <p>${place.desc}</p>
      <div class="popup-dist"><i class="fa-solid fa-route"></i> ${distText}</div>
      <div style="display:flex;gap:10px;margin-top:8px;">${wikiLink}${webLink}</div>
    </div>
  `;
}

// ── SIDEBAR PLACE LIST ────────────────────────────
function renderPlaces(places) {
  const list = document.getElementById('place-list');

  if (places.length === 0) {
    list.innerHTML = `
      <div class="placeholder-state">
        <div class="placeholder-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
        <p>No places found matching your criteria.</p>
      </div>`;
    return;
  }

  list.innerHTML = '';
  places.forEach((place, i) => {
    const distText = place.dist < 1
      ? `${Math.round(place.dist * 1000)}m`
      : `${place.dist.toFixed(1)}km`;

    const card = document.createElement('div');
    card.className = 'place-card';
    card.dataset.id = place.id;
    card.style.animationDelay = (i * 0.03) + 's';
    card.innerHTML = `
      <div class="place-card-head">
        <h4>${place.name}</h4>
        <span class="place-dist"><i class="fa-solid fa-route"></i> ${distText}</span>
      </div>
      <div class="place-type-badge">
        <i class="fa-solid ${place.icon}"></i>
        ${capitalise(place.subtype || place.type)}
      </div>
      <p>${place.desc.slice(0, 80)}${place.desc.length > 80 ? '…' : ''}</p>
    `;
    card.addEventListener('click', () => focusPlace(place));
    list.appendChild(card);
  });
}

function focusPlace(place) {
  // Fly to marker
  map.flyTo([place.lat, place.lng], 14, { animate: true, duration: 1 });
  // Open popup
  if (place.marker) {
    setTimeout(() => place.marker.openPopup(), 800);
  }
  // Highlight card
  highlightCard(place.id);
}

function highlightCard(id) {
  document.querySelectorAll('.place-card').forEach(c => c.classList.remove('active'));
  const card = document.querySelector(`.place-card[data-id="${id}"]`);
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ── CATEGORY FILTER ──────────────────────────────
function filterByCategory(cat, el) {
  activeCategory = cat;
  document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  if (allPlaces.length === 0) return;

  const filtered = cat === 'all' ? allPlaces : allPlaces.filter(p => p.type === cat || p.subtype === cat);
  renderPlaces(filtered);
  highlightMarkers(filtered);
  updateSidebarHeader(
    `${filtered.length} Place${filtered.length !== 1 ? 's' : ''}`,
    cat === 'all' ? `All categories within ${radiusKm} km` : `Category: ${capitalise(cat)}`
  );
}

// ── HELPERS ───────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function deg2rad(d) { return d * (Math.PI / 180); }
function capitalise(s) {
  if (!s) return '';
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function updateSidebarHeader(title, sub) {
  document.getElementById('result-count').textContent = title;
  document.getElementById('result-sub').textContent = sub;
}

function showMapLoading(show) {
  const el = document.getElementById('map-loading');
  el.classList.toggle('hidden', !show);
}

// ── NOTIFICATION ──────────────────────────────────
let notifTimeout;
function showNotif(msg, type = 'info', iconClass = 'fa-circle-info') {
  let notif = document.querySelector('.notif');
  if (!notif) {
    notif = document.createElement('div');
    notif.className = 'notif';
    document.body.appendChild(notif);
  }
  notif.className = `notif ${type}`;
  notif.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${msg}`;

  clearTimeout(notifTimeout);
  setTimeout(() => notif.classList.add('show'), 10);
  notifTimeout = setTimeout(() => notif.classList.remove('show'), 3500);
}

// ── PARALLAX ON SCROLL ────────────────────────────
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const hero = document.querySelector('.hero-content');
  if (hero) hero.style.transform = `translateY(${y * 0.3}px)`;

  const mtnFar = document.querySelector('.layer-far');
  const mtnMid = document.querySelector('.layer-mid');
  if (mtnFar) mtnFar.style.transform = `translateY(${y * 0.05}px)`;
  if (mtnMid) mtnMid.style.transform = `translateY(${y * 0.1}px)`;
});
