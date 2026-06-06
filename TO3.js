/* ═══════════════════════════════════════════════════════════════
   TO3.js  —  Nepal Tourism Explorer · WebGIS Dashboard
   Author  :  Sugam [Surname], BE Geomatics, Kathmandu University
   Course  :  WebGIS | Assignment TO3
   Features:  Choropleth district map · Radius search ·
              Real-time info panel · Category filter dropdown
   GeoJSON :  Districts preprocessed in QGIS —
              Simplify (Douglas-Peucker ε=0.001°) + Check Validity
   ═══════════════════════════════════════════════════════════════ */


/* ════════════════════════════════════════════════════════════════
   1. CATEGORY CONFIGURATION
   ════════════════════════════════════════════════════════════════ */
var CAT = {
  heritage:  { color:'#c4832a', label:'Heritage',  emoji:'🏛' },
  religion:  { color:'#b03830', label:'Religion',  emoji:'🛕' },
  trekking:  { color:'#4a7c58', label:'Trekking',  emoji:'🥾' },
  wildlife:  { color:'#2e6048', label:'Wildlife',  emoji:'🦏' },
  adventure: { color:'#a8401c', label:'Adventure', emoji:'🪂' },
  viewpoint: { color:'#4a6fa0', label:'Viewpoint', emoji:'🔭' },
  nature:    { color:'#3a8878', label:'Nature',    emoji:'🏞' },
  cultural:  { color:'#7a5ea8', label:'Cultural',  emoji:'🎭' }
};


/* ════════════════════════════════════════════════════════════════
   2. TOURIST DESTINATIONS — 50 points across Nepal
      Properties: name, category, district, province, lat, lon,
                  description, elevation_m, rating, best_season
   ════════════════════════════════════════════════════════════════ */
var DESTINATIONS = [
  // HERITAGE
  { name:'Boudhanath Stupa',         cat:'heritage', district:'Kathmandu',     lat:27.7215, lon:85.3621, desc:'UNESCO World Heritage — one of the largest Buddhist stupas in the world.',              elev:1310, rating:5, season:'Year-round' },
  { name:'Swayambhunath Stupa',      cat:'heritage', district:'Kathmandu',     lat:27.7149, lon:85.2904, desc:'Ancient hilltop complex known as the Monkey Temple, UNESCO World Heritage.',           elev:1336, rating:5, season:'Year-round' },
  { name:'Bhaktapur Durbar Square',  cat:'heritage', district:'Bhaktapur',     lat:27.6722, lon:85.4277, desc:'UNESCO World Heritage — medieval city of Newar culture and crafts.',                  elev:1401, rating:5, season:'Oct–May' },
  { name:'Patan Durbar Square',      cat:'heritage', district:'Lalitpur',      lat:27.6727, lon:85.3246, desc:'UNESCO World Heritage — finest example of Newari architecture.',                      elev:1305, rating:5, season:'Oct–May' },
  { name:'Kathmandu Durbar Square',  cat:'heritage', district:'Kathmandu',     lat:27.7042, lon:85.3069, desc:'UNESCO World Heritage — royal square in the heart of old Kathmandu.',                elev:1290, rating:5, season:'Year-round' },
  { name:'Changu Narayan Temple',    cat:'heritage', district:'Bhaktapur',     lat:27.7340, lon:85.4524, desc:'Oldest temple in Nepal, UNESCO World Heritage, on a forested hilltop.',               elev:1541, rating:4, season:'Oct–May' },
  { name:'Lumbini Sacred Garden',    cat:'heritage', district:'Rupandehi',     lat:27.4833, lon:83.2763, desc:'Birthplace of Lord Buddha — UNESCO World Heritage Site.',                             elev:100,  rating:5, season:'Oct–Mar' },
  // RELIGION
  { name:'Pashupatinath Temple',     cat:'religion', district:'Kathmandu',     lat:27.7106, lon:85.3484, desc:'Sacred Hindu temple on the Bagmati River, one of the holiest Shiva temples.',        elev:1300, rating:5, season:'Oct–Mar' },
  { name:'Manakamana Temple',        cat:'religion', district:'Gorkha',        lat:27.9250, lon:84.5250, desc:'Goddess Bhagwati temple accessible by aerial cable car over dramatic gorge.',        elev:1302, rating:4, season:'Year-round' },
  { name:'Muktinath Temple',         cat:'religion', district:'Mustang',       lat:28.8169, lon:83.8700, desc:'Sacred pilgrimage site at 3,760 m, revered by Hindus and Buddhists alike.',          elev:3760, rating:5, season:'May–Oct' },
  { name:'Gosaikunda Lake',          cat:'religion', district:'Rasuwa',        lat:28.0667, lon:85.4167, desc:'Sacred alpine lake at 4,380 m — major pilgrimage during Janai Purnima.',             elev:4380, rating:5, season:'Jun–Sep' },
  { name:'Halesi Mahadev Cave',      cat:'religion', district:'Khotang',       lat:27.4789, lon:86.6183, desc:'Sacred cave temple revered as the Pashupatinath of the Eastern Hills.',              elev:1340, rating:4, season:'Oct–Mar' },
  { name:'Budhanilkantha Temple',    cat:'religion', district:'Kathmandu',     lat:27.7800, lon:85.3617, desc:'Open-air shrine with giant reclining Vishnu statue in a water tank.',                elev:1500, rating:4, season:'Year-round' },
  { name:'Kopan Monastery',          cat:'religion', district:'Kathmandu',     lat:27.7320, lon:85.3680, desc:'Tibetan Buddhist monastery on the rim of Kathmandu Valley, offers meditation.',      elev:1430, rating:4, season:'Year-round' },
  // TREKKING
  { name:'Lukla (EBC Gateway)',      cat:'trekking', district:'Solukhumbu',    lat:27.6867, lon:86.7298, desc:'Starting point for the Everest Base Camp trek — the famous Hillary airstrip.',       elev:2860, rating:5, season:'Mar–May, Sep–Nov' },
  { name:'Namche Bazaar',            cat:'trekking', district:'Solukhumbu',    lat:27.8050, lon:86.7140, desc:'Sherpa capital and acclimatisation hub on the classic EBC trail.',                   elev:3440, rating:5, season:'Mar–May, Sep–Nov' },
  { name:'Annapurna Base Camp',      cat:'trekking', district:'Kaski',         lat:28.5300, lon:83.8770, desc:'Classic trek through rhododendron forest and glacier to 4,130 m.',                   elev:4130, rating:5, season:'Mar–May, Sep–Nov' },
  { name:'Poon Hill',                cat:'trekking', district:'Myagdi',        lat:28.3990, lon:83.6930, desc:'Iconic sunrise viewpoint over Annapurna and Dhaulagiri, 3,210 m.',                   elev:3210, rating:5, season:'Oct–Apr' },
  { name:'Langtang Valley Trek',     cat:'trekking', district:'Rasuwa',        lat:28.2133, lon:85.5153, desc:'Stunning Himalayan valley, 2–3 days from Kathmandu, rich in culture.',               elev:3500, rating:4, season:'Mar–May, Oct–Nov' },
  { name:'Manaslu Circuit',          cat:'trekking', district:'Gorkha',        lat:28.5500, lon:84.5600, desc:'Remote circuit around the 8th highest peak passing the 5,106 m Larkya La.',         elev:5106, rating:5, season:'Mar–May, Sep–Nov' },
  { name:'Upper Mustang Trek',       cat:'trekking', district:'Mustang',       lat:29.1800, lon:83.9700, desc:'Restricted-area trek to the ancient walled Kingdom of Lo Manthang.',                 elev:3840, rating:5, season:'May–Oct' },
  { name:'Gokyo Lakes Trek',         cat:'trekking', district:'Solukhumbu',    lat:27.9622, lon:86.6791, desc:'Turquoise lakes at 4,700–5,000 m with panorama of four 8,000 m peaks.',             elev:4700, rating:5, season:'Mar–May, Oct–Nov' },
  // WILDLIFE
  { name:'Chitwan National Park',    cat:'wildlife', district:'Chitwan',       lat:27.5758, lon:84.4400, desc:'UNESCO World Heritage — home to Bengal tigers, one-horned rhinos and elephants.',    elev:100,  rating:5, season:'Oct–Mar' },
  { name:'Bardia National Park',     cat:'wildlife', district:'Bardiya',       lat:28.3500, lon:81.5000, desc:"Nepal's largest Terai park — best chance to spot Bengal tigers in the wild.",       elev:152,  rating:5, season:'Oct–Mar' },
  { name:'Koshi Tappu Reserve',      cat:'wildlife', district:'Sunsari',       lat:26.6500, lon:87.0000, desc:'Ramsar wetland site — critical for migratory birds and wild water buffalo.',         elev:75,   rating:4, season:'Oct–Mar' },
  { name:'Shivapuri Nagarjun Park',  cat:'wildlife', district:'Kathmandu',     lat:27.8200, lon:85.3700, desc:'National park on the northern rim of Kathmandu Valley — forest trails and birds.',   elev:2732, rating:4, season:'Oct–May' },
  { name:'Sagarmatha National Park', cat:'wildlife', district:'Solukhumbu',    lat:27.9800, lon:86.7500, desc:'UNESCO World Heritage — Himalayan ecosystem surrounding Mount Everest.',             elev:2845, rating:5, season:'Mar–May, Oct–Nov' },
  { name:'Langtang National Park',   cat:'wildlife', district:'Rasuwa',        lat:28.2000, lon:85.3500, desc:'Rich high-altitude biodiversity park close to Kathmandu.',                           elev:3500, rating:4, season:'Mar–May, Oct–Nov' },
  // ADVENTURE
  { name:'Pokhara Paragliding',      cat:'adventure', district:'Kaski',        lat:28.2096, lon:83.9856, desc:'World-class tandem paragliding with Annapurna panorama and Phewa Lake below.',       elev:1600, rating:5, season:'Sep–May' },
  { name:'Trishuli River Rafting',   cat:'adventure', district:'Dhading',      lat:27.8600, lon:84.8800, desc:'Closest white-water rafting to Kathmandu — Grade III–IV rapids.',                   elev:500,  rating:4, season:'Sep–Nov, Mar–Jun' },
  { name:'The Last Resort Bungee',   cat:'adventure', district:'Sindhupalchok',lat:27.9167, lon:85.9767, desc:"160 m bungee jump over the Bhote Koshi river gorge — Asia's biggest.",              elev:1050, rating:5, season:'Sep–Jun' },
  { name:'Zip Flyer Pokhara',        cat:'adventure', district:'Kaski',        lat:28.1900, lon:83.9650, desc:"World's steepest zip-line — 1.8 km at up to 120 km/h over Sarangkot.",             elev:1400, rating:5, season:'Year-round' },
  { name:'Bhote Koshi Rafting',      cat:'adventure', district:'Sindhupalchok',lat:27.9800, lon:85.9800, desc:'Thrilling Grade IV–V whitewater rafting on a steep Himalayan river.',               elev:900,  rating:5, season:'Sep–Nov, Mar–Jun' },
  { name:'Kali Gandaki Rafting',     cat:'adventure', district:'Myagdi',       lat:28.1000, lon:83.7000, desc:"Rafting through one of the world's deepest gorges between Annapurna & Dhaulagiri.", elev:900,  rating:4, season:'Sep–Nov' },
  // VIEWPOINT
  { name:'Nagarkot',                 cat:'viewpoint', district:'Bhaktapur',    lat:27.7151, lon:85.5178, desc:'Famous sunrise vantage over 8 Himalayan ranges — from Everest to Dhaulagiri.',      elev:2175, rating:5, season:'Oct–Mar' },
  { name:'Sarangkot',                cat:'viewpoint', district:'Kaski',        lat:28.2333, lon:83.9667, desc:'Iconic sunrise viewpoint over Pokhara Valley and the Annapurna massif.',             elev:1592, rating:5, season:'Oct–May' },
  { name:'Kakani Viewpoint',         cat:'viewpoint', district:'Nuwakot',      lat:27.8800, lon:85.2700, desc:'Peaceful hilltop with panoramic Central Himalayan views, 30 km from Kathmandu.',     elev:2073, rating:4, season:'Oct–Apr' },
  { name:'Dhulikhel',                cat:'viewpoint', district:'Kavrepalanchok',lat:27.6228, lon:85.5614, desc:'Mountain town with spectacular Himalayan vista, a favourite weekend escape.',        elev:1550, rating:4, season:'Oct–Apr' },
  { name:'Chandragiri Hills',        cat:'viewpoint', district:'Kathmandu',    lat:27.6500, lon:85.2100, desc:'Cable car ride to 2,551 m with Kathmandu Valley and Himalayan panorama.',           elev:2551, rating:4, season:'Oct–May' },
  { name:'Phulchoki Hill',           cat:'viewpoint', district:'Lalitpur',     lat:27.5667, lon:85.4167, desc:'Highest hill surrounding the Valley — diverse flora and mountain views.',            elev:2762, rating:4, season:'Mar–May, Oct–Nov' },
  { name:'Bandipur Viewpoint',       cat:'viewpoint', district:'Tanahun',      lat:27.9333, lon:84.4000, desc:'Panoramic view of Marsyangdi valley and snow peaks from the hilltop town.',         elev:1030, rating:5, season:'Oct–May' },
  // NATURE
  { name:'Phewa Lake',               cat:'nature',    district:'Kaski',        lat:28.2100, lon:83.9500, desc:"Pokhara's iconic lake — reflections of Machhapuchhre, boating and lakeside walks.",  elev:820,  rating:5, season:'Sep–May' },
  { name:'Rara Lake',                cat:'nature',    district:'Mugu',         lat:29.5271, lon:82.0872, desc:"Nepal's largest lake at 2,990 m — pristine, remote and hauntingly beautiful.",       elev:2990, rating:5, season:'May–Oct' },
  { name:'Begnas Lake',              cat:'nature',    district:'Kaski',        lat:28.2167, lon:84.0833, desc:'Tranquil lake 15 km east of Pokhara — quieter alternative to Phewa.',               elev:827,  rating:4, season:'Sep–May' },
  { name:'Taudaha Lake',             cat:'nature',    district:'Kathmandu',    lat:27.6500, lon:85.2900, desc:'Small natural lake on the Valley floor — great for winter birdwatching.',            elev:1289, rating:3, season:'Nov–Feb' },
  // CULTURAL
  { name:'Bandipur Village',         cat:'cultural',  district:'Tanahun',      lat:27.9350, lon:84.4020, desc:'Perfectly preserved Newari hilltop trading village — traffic-free and timeless.',   elev:1030, rating:5, season:'Oct–May' },
  { name:'Tansen (Palpa)',           cat:'cultural',  district:'Palpa',        lat:27.8667, lon:83.5500, desc:'Historic hillside town famous for Dhaka weaving, metalwork and Newari heritage.',    elev:1371, rating:4, season:'Oct–May' },
  { name:'Panauti',                  cat:'cultural',  district:'Kavrepalanchok',lat:27.5833, lon:85.5167, desc:'Pristine medieval town at river confluence — triple-roofed temples intact.',        elev:1480, rating:4, season:'Oct–May' },
  { name:'Kirtipur',                 cat:'cultural',  district:'Kathmandu',    lat:27.6667, lon:85.2833, desc:'Ancient twin-hilltop Newar town with living Newari traditions and crafts.',          elev:1395, rating:4, season:'Oct–May' },
  { name:'Thimi',                    cat:'cultural',  district:'Bhaktapur',    lat:27.6778, lon:85.3956, desc:'Town of masks, pottery and papier-mâché — finest Newari craft traditions.',          elev:1310, rating:3, season:'Oct–May' }
];


/* ════════════════════════════════════════════════════════════════
   3. DISTRICT CHOROPLETH GEOJSON
      Preprocessed: QGIS Simplify (Douglas-Peucker ε=0.001°)
                  + Check Validity (GEOS engine)
      CRS: WGS 84 (EPSG:4326)
      Attribute used for choropleth: annual_visitors
   ════════════════════════════════════════════════════════════════ */
var DISTRICTS_GJ = {
  "type":"FeatureCollection",
  "features":[
    {"type":"Feature","properties":{"district":"Kathmandu",    "province":"Bagmati", "annual_visitors":1250000,"hotel_count":1247,"category":"Heritage & Urban"           },"geometry":{"type":"Polygon","coordinates":[[[85.17,27.63],[85.29,27.62],[85.40,27.63],[85.52,27.68],[85.51,27.79],[85.42,27.85],[85.26,27.84],[85.17,27.78],[85.17,27.63]]]}},
    {"type":"Feature","properties":{"district":"Lalitpur",     "province":"Bagmati", "annual_visitors":310000, "hotel_count":342, "category":"Heritage & Urban"           },"geometry":{"type":"Polygon","coordinates":[[[85.25,27.48],[85.44,27.47],[85.52,27.54],[85.51,27.67],[85.38,27.68],[85.25,27.65],[85.20,27.57],[85.25,27.48]]]}},
    {"type":"Feature","properties":{"district":"Bhaktapur",    "province":"Bagmati", "annual_visitors":285000, "hotel_count":187, "category":"Heritage & Urban"           },"geometry":{"type":"Polygon","coordinates":[[[85.42,27.60],[85.56,27.59],[85.65,27.65],[85.62,27.79],[85.50,27.82],[85.40,27.77],[85.38,27.67],[85.42,27.60]]]}},
    {"type":"Feature","properties":{"district":"Kaski",        "province":"Gandaki", "annual_visitors":420000, "hotel_count":892, "category":"Adventure & Nature"         },"geometry":{"type":"Polygon","coordinates":[[[83.75,28.10],[83.98,28.08],[84.18,28.15],[84.20,28.40],[84.10,28.55],[83.88,28.52],[83.72,28.40],[83.70,28.24],[83.75,28.10]]]}},
    {"type":"Feature","properties":{"district":"Chitwan",      "province":"Bagmati", "annual_visitors":380000, "hotel_count":456, "category":"Wildlife & Safari"          },"geometry":{"type":"Polygon","coordinates":[[[84.00,27.40],[84.38,27.38],[84.85,27.42],[84.88,27.62],[84.60,27.78],[84.20,27.75],[83.97,27.68],[83.95,27.52],[84.00,27.40]]]}},
    {"type":"Feature","properties":{"district":"Solukhumbu",   "province":"Koshi",   "annual_visitors":65000,  "hotel_count":312, "category":"Trekking & Mountaineering"  },"geometry":{"type":"Polygon","coordinates":[[[86.20,27.55],[86.60,27.52],[86.98,27.62],[86.98,28.00],[86.70,28.12],[86.35,28.08],[86.15,27.85],[86.18,27.68],[86.20,27.55]]]}},
    {"type":"Feature","properties":{"district":"Mustang",      "province":"Gandaki", "annual_visitors":28000,  "hotel_count":142, "category":"Cultural & Adventure"       },"geometry":{"type":"Polygon","coordinates":[[[83.60,28.78],[84.00,28.75],[84.25,28.85],[84.22,29.22],[84.05,29.40],[83.78,29.38],[83.58,29.15],[83.55,28.95],[83.60,28.78]]]}},
    {"type":"Feature","properties":{"district":"Rupandehi",    "province":"Lumbini", "annual_visitors":180000, "hotel_count":278, "category":"Pilgrimage & Heritage"      },"geometry":{"type":"Polygon","coordinates":[[[83.18,27.40],[83.45,27.38],[83.62,27.45],[83.60,27.68],[83.42,27.75],[83.20,27.72],[83.15,27.55],[83.18,27.40]]]}},
    {"type":"Feature","properties":{"district":"Manang",       "province":"Gandaki", "annual_visitors":15000,  "hotel_count":98,  "category":"Trekking & High Altitude"   },"geometry":{"type":"Polygon","coordinates":[[[83.88,28.50],[84.28,28.48],[84.48,28.58],[84.45,28.90],[84.20,29.00],[83.92,28.95],[83.80,28.75],[83.85,28.60],[83.88,28.50]]]}},
    {"type":"Feature","properties":{"district":"Taplejung",    "province":"Koshi",   "annual_visitors":12000,  "hotel_count":76,  "category":"Trekking & Mountaineering"  },"geometry":{"type":"Polygon","coordinates":[[[87.55,27.35],[87.82,27.32],[88.00,27.42],[87.98,27.72],[87.75,27.90],[87.52,27.85],[87.40,27.65],[87.48,27.48],[87.55,27.35]]]}},
    {"type":"Feature","properties":{"district":"Dolpa",        "province":"Karnali", "annual_visitors":8000,   "hotel_count":45,  "category":"Remote & Cultural"          },"geometry":{"type":"Polygon","coordinates":[[[82.52,28.78],[83.00,28.72],[83.30,28.85],[83.28,29.25],[83.05,29.50],[82.65,29.45],[82.40,29.20],[82.45,28.95],[82.52,28.78]]]}},
    {"type":"Feature","properties":{"district":"Ilam",         "province":"Koshi",   "annual_visitors":42000,  "hotel_count":145, "category":"Tea Garden & Nature"        },"geometry":{"type":"Polygon","coordinates":[[[87.72,26.82],[87.98,26.80],[88.17,26.90],[88.15,27.15],[87.95,27.28],[87.68,27.25],[87.60,27.05],[87.65,26.90],[87.72,26.82]]]}},
    {"type":"Feature","properties":{"district":"Sindhupalchok","province":"Bagmati", "annual_visitors":45000,  "hotel_count":198, "category":"Adventure & Cultural"       },"geometry":{"type":"Polygon","coordinates":[[[85.52,27.75],[85.82,27.72],[86.22,27.82],[86.20,28.10],[85.90,28.25],[85.55,28.20],[85.40,28.05],[85.48,27.88],[85.52,27.75]]]}},
    {"type":"Feature","properties":{"district":"Nuwakot",      "province":"Bagmati", "annual_visitors":35000,  "hotel_count":124, "category":"Cultural & Trekking"        },"geometry":{"type":"Polygon","coordinates":[[[85.02,27.82],[85.28,27.80],[85.45,27.90],[85.42,28.10],[85.22,28.20],[84.98,28.15],[84.88,28.00],[84.95,27.88],[85.02,27.82]]]}},
    {"type":"Feature","properties":{"district":"Dhading",      "province":"Bagmati", "annual_visitors":22000,  "hotel_count":108, "category":"Trekking & Nature"          },"geometry":{"type":"Polygon","coordinates":[[[84.70,27.85],[85.00,27.82],[85.22,27.90],[85.20,28.17],[84.98,28.30],[84.72,28.25],[84.55,28.10],[84.60,27.95],[84.70,27.85]]]}}
  ]
};


/* ════════════════════════════════════════════════════════════════
   4. CHOROPLETH COLOR SCALE  (YlOrRd — annual_visitors)
   ════════════════════════════════════════════════════════════════ */
function getDistrictColor(v) {
  return v > 500000 ? '#4a1808' :
         v > 300000 ? '#7c2a0e' :
         v > 150000 ? '#a83a18' :
         v > 50000  ? '#c47820' :
         v > 20000  ? '#d4a040' :
         v > 10000  ? '#e8c870' :
                      '#f0e0b0';
}
function districtStyle(feat) {
  return { fillColor:getDistrictColor(feat.properties.annual_visitors), fillOpacity:0.55, color:'rgba(196,131,42,0.28)', weight:1, opacity:1 };
}


/* ════════════════════════════════════════════════════════════════
   5. HAVERSINE DISTANCE  (km)
   ════════════════════════════════════════════════════════════════ */
function haversine(lat1, lon1, lat2, lon2) {
  var R = 6371, toR = Math.PI/180;
  var dLat = (lat2-lat1)*toR, dLon = (lon2-lon1)*toR;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
          Math.cos(lat1*toR)*Math.cos(lat2*toR)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}


/* ════════════════════════════════════════════════════════════════
   6. APPLICATION STATE
   ════════════════════════════════════════════════════════════════ */
var map, districtLayer, infoControl, legendControl;
var radiusCircle  = null;
var centerMarker  = null;
var destMarkers   = [];       /* {marker, data, dist} */
var foundDests    = [];       /* destinations within radius */
var currentCat    = 'all';
var searchCenter  = null;     /* {lat, lon} */


/* ════════════════════════════════════════════════════════════════
   7. MAP INITIALISATION
   ════════════════════════════════════════════════════════════════ */
var map = L.map('map', { center:[28.0,84.2], zoom:7, minZoom:5, maxZoom:16 });

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains:'abcd', maxZoom:19
}).addTo(map);


/* ════════════════════════════════════════════════════════════════
   8. CHOROPLETH LAYER  (district polygons, always visible)
   ════════════════════════════════════════════════════════════════ */
function highlightDistrict(e) {
  var l = e.target;
  l.setStyle({ weight:2, color:'#c4832a', fillOpacity:0.75 });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) l.bringToFront();
  infoControl.update({ type:'district', props:l.feature.properties });
}
function resetDistrict(e) {
  districtLayer.resetStyle(e.target);
  infoControl.update(null);
}

districtLayer = L.geoJSON(DISTRICTS_GJ, {
  style: districtStyle,
  onEachFeature: function(feat, layer) {
    layer.on({ mouseover:highlightDistrict, mouseout:resetDistrict });
  }
}).addTo(map);


/* ════════════════════════════════════════════════════════════════
   9. INFO CONTROL  —  updates in real-time on hover
      Shows district choropleth data OR destination details
   ════════════════════════════════════════════════════════════════ */
infoControl = L.control({ position:'topright' });
infoControl.onAdd = function() {
  this._div = L.DomUtil.create('div','info-panel');
  this.update(null);
  return this._div;
};
infoControl.update = function(payload) {
  if (!payload) {
    this._div.innerHTML = '<p class="info-placeholder">Hover over a district or<br>destination to view details</p>';
    return;
  }
  var fmt = function(n){ return n.toLocaleString('en-IN'); };

  if (payload.type === 'district') {
    var p = payload.props;
    var pct = Math.round((p.annual_visitors/1250000)*100);
    var col = getDistrictColor(p.annual_visitors);
    this._div.innerHTML =
      '<span class="info-type" style="color:'+col+'">◈ District — Choropleth</span>'+
      '<h4>'+p.district+'</h4>'+
      '<p><strong>Province:</strong> '+p.province+'</p>'+
      '<p><strong>Category:</strong> '+p.category+'</p>'+
      '<p style="margin-top:5px"><strong>Annual Visitors:</strong> <span class="hl" style="color:'+col+'">'+fmt(p.annual_visitors)+'</span></p>'+
      '<div style="margin:5px 0 7px;height:5px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden">'+
        '<div style="height:100%;width:'+pct+'%;background:'+col+';border-radius:2px"></div></div>'+
      '<p><strong>Hotels / Lodges:</strong> '+fmt(p.hotel_count)+'</p>';
  }

  if (payload.type === 'destination') {
    var d = payload.data;
    var cfg = CAT[d.cat] || { color:'#888', label:d.cat, emoji:'◉' };
    var stars = '';
    for (var i=0;i<5;i++) stars += (i < d.rating ? '★' : '☆');
    this._div.innerHTML =
      '<span class="info-type" style="color:'+cfg.color+'">'+cfg.emoji+' '+cfg.label+'</span>'+
      '<h4>'+d.name+'</h4>'+
      '<p><strong>District:</strong> '+d.district+'</p>'+
      '<p><strong>Elevation:</strong> '+d.elev.toLocaleString()+' m ASL</p>'+
      '<p><strong>Best Season:</strong> '+d.season+'</p>'+
      '<p style="color:'+cfg.color+';letter-spacing:.08em;margin-top:4px">'+stars+'</p>'+
      '<p style="margin-top:6px;font-size:.75rem;color:#6b5c48;line-height:1.55">'+d.desc+'</p>'+
      (payload.dist ? '<p style="margin-top:5px"><strong>Distance:</strong> <span class="hl" style="color:#c4832a">'+payload.dist.toFixed(1)+' km</span> from search point</p>' : '');
  }
};
infoControl.addTo(map);


/* ════════════════════════════════════════════════════════════════
   10. LEGEND CONTROL
   ════════════════════════════════════════════════════════════════ */
legendControl = L.control({ position:'bottomright' });
legendControl.onAdd = function() {
  var div = L.DomUtil.create('div','legend-panel');
  /* Choropleth scale */
  var grades  = [0,10000,20000,50000,150000,300000,500000];
  var glabels = ['< 10 K','10 K–20 K','20 K–50 K','50 K–150 K','150 K–300 K','300 K–500 K','> 500 K'];
  div.innerHTML = '<span class="legend-section-title">Annual Visitors (District)</span>';
  for (var i=0;i<grades.length;i++) {
    div.innerHTML += '<div class="legend-item"><span class="legend-swatch" style="background:'+getDistrictColor(grades[i]+1)+'"></span><span>'+glabels[i]+'</span></div>';
  }
  div.innerHTML += '<hr class="legend-divider"><span class="legend-section-title">Destination Category</span>';
  for (var k in CAT) {
    div.innerHTML += '<div class="legend-item"><span class="legend-dot" style="background:'+CAT[k].color+'"></span><span>'+CAT[k].emoji+' '+CAT[k].label+'</span></div>';
  }
  return div;
};
legendControl.addTo(map);


/* ════════════════════════════════════════════════════════════════
   11. DESTINATION MARKER CREATION
   ════════════════════════════════════════════════════════════════ */
function makeDestIcon(cat) {
  var color = (CAT[cat] || { color:'#888' }).color;
  return L.divIcon({
    className:'',
    html:'<div class="dest-icon-wrap" style="background:'+color+'"></div>',
    iconSize:[14,14], iconAnchor:[7,7]
  });
}

function addDestinationMarker(dest, dist) {
  var marker = L.marker([dest.lat, dest.lon], { icon:makeDestIcon(dest.cat) });
  marker.on('mouseover', function() {
    infoControl.update({ type:'destination', data:dest, dist:dist });
  });
  marker.on('mouseout', function() {
    infoControl.update(null);
  });
  marker.on('click', function() {
    map.setView([dest.lat, dest.lon], 12);
    highlightListItem(dest.name);
  });
  marker.destCat  = dest.cat;
  marker.destName = dest.name;
  marker.addTo(map);
  destMarkers.push({ marker:marker, data:dest, dist:dist });
}


/* ════════════════════════════════════════════════════════════════
   12. RESULTS LIST RENDERING
   ════════════════════════════════════════════════════════════════ */
function renderList(dests) {
  var list = document.getElementById('sp-dest-list');
  list.innerHTML = '';
  if (dests.length === 0) {
    list.innerHTML = '<p style="font-size:.78rem;color:#b8a888;padding:.6rem .2rem;font-style:italic">No destinations match this filter.</p>';
    return;
  }
  dests.forEach(function(item) {
    var cfg = CAT[item.data.cat] || { color:'#888', label:item.data.cat, emoji:'◉' };
    var stars = '';
    for (var i=0;i<item.data.rating;i++) stars += '★';

    var el = document.createElement('div');
    el.className = 'dest-item';
    el.dataset.name = item.data.name;
    el.innerHTML =
      '<div class="dest-dot-wrap"><span class="dest-color-dot" style="background:'+cfg.color+'"></span></div>'+
      '<div class="dest-info">'+
        '<div class="dest-name">'+cfg.emoji+' '+item.data.name+'</div>'+
        '<div class="dest-meta">'+
          '<span class="dest-cat-badge cat-'+item.data.cat+'">'+cfg.label+'</span>'+
          '<span class="dest-dist">'+item.dist.toFixed(1)+' km</span>'+
          '<span class="dest-rating">'+stars+'</span>'+
        '</div>'+
      '</div>';

    el.addEventListener('click', function() {
      map.setView([item.data.lat, item.data.lon], 13);
      infoControl.update({ type:'destination', data:item.data, dist:item.dist });
      highlightListItem(item.data.name);
    });
    el.addEventListener('mouseenter', function() {
      infoControl.update({ type:'destination', data:item.data, dist:item.dist });
    });
    el.addEventListener('mouseleave', function() {
      infoControl.update(null);
    });

    list.appendChild(el);
  });
}

function highlightListItem(name) {
  var items = document.querySelectorAll('.dest-item');
  items.forEach(function(el) {
    el.classList.toggle('highlighted', el.dataset.name === name);
  });
}

/* Update visible count label */
function updateFilterCount(shown, total) {
  var el = document.getElementById('filter-count');
  if (currentCat === 'all') { el.textContent = ''; return; }
  el.textContent = 'Showing ' + shown + ' of ' + total + ' destinations';
}


/* ════════════════════════════════════════════════════════════════
   13. CATEGORY FILTER
   ════════════════════════════════════════════════════════════════ */
function applyFilter(cat) {
  currentCat = cat;
  var visible = [];

  destMarkers.forEach(function(item) {
    var show = (cat === 'all' || item.data.cat === cat);
    if (show) { item.marker.addTo(map);   visible.push(item); }
    else       { map.removeLayer(item.marker); }
  });

  renderList(visible);
  updateFilterCount(visible.length, foundDests.length);
}

document.getElementById('cat-select').addEventListener('change', function() {
  applyFilter(this.value);
});


/* ════════════════════════════════════════════════════════════════
   14. RADIUS SEARCH
   ════════════════════════════════════════════════════════════════ */
function runSearch() {
  if (!searchCenter) return;
  var radiusKm = parseInt(document.getElementById('radius-range').value);

  /* Clear previous markers */
  destMarkers.forEach(function(item) { map.removeLayer(item.marker); });
  destMarkers = [];
  foundDests  = [];

  /* Remove old circle */
  if (radiusCircle) { map.removeLayer(radiusCircle); }

  /* Draw radius circle */
  radiusCircle = L.circle([searchCenter.lat, searchCenter.lon], {
    radius:    radiusKm * 1000,
    color:     '#22d3ee',
    weight:    1.5,
    opacity:   0.7,
    fillColor: '#22d3ee',
    fillOpacity: 0.04,
    dashArray: '6,6'
  }).addTo(map);

  /* Find destinations within radius */
  DESTINATIONS.forEach(function(dest) {
    var d = haversine(searchCenter.lat, searchCenter.lon, dest.lat, dest.lon);
    if (d <= radiusKm) {
      foundDests.push({ data:dest, dist:d });
    }
  });

  /* Sort by distance */
  foundDests.sort(function(a,b){ return a.dist - b.dist; });

  /* Add markers */
  foundDests.forEach(function(item) {
    addDestinationMarker(item.data, item.dist);
  });

  /* Update panel */
  document.getElementById('result-total').textContent = foundDests.length;
  document.getElementById('sp-results-block').style.display = 'block';

  /* Reset filter */
  document.getElementById('cat-select').value = 'all';
  applyFilter('all');

  /* Fit map to circle */
  map.fitBounds(radiusCircle.getBounds(), { padding:[20,20] });
}

document.getElementById('btn-search').addEventListener('click', runSearch);


/* ════════════════════════════════════════════════════════════════
   15. RADIUS SLIDER — live update
   ════════════════════════════════════════════════════════════════ */
var rangeEl = document.getElementById('radius-range');
rangeEl.addEventListener('input', function() {
  var v = this.value;
  document.getElementById('radius-live').textContent = v + ' km';
  /* Update gradient fill on slider track */
  var pct = ((v - 10) / (500 - 10)) * 100;
  this.style.background = 'linear-gradient(to right,#22d3ee 0%,#22d3ee '+pct+'%,#1b3050 '+pct+'%)';
});


/* ════════════════════════════════════════════════════════════════
   16. LOCATION — Geolocation API
   ════════════════════════════════════════════════════════════════ */
function setSearchCenter(lat, lon) {
  searchCenter = { lat:lat, lon:lon };

  /* Centre marker */
  if (centerMarker) map.removeLayer(centerMarker);
  centerMarker = L.circleMarker([lat, lon], {
    radius:8, color:'#c4832a', weight:2,
    fillColor:'#c4832a', fillOpacity:0.25
  }).addTo(map);

  /* Update display */
  document.getElementById('loc-text').textContent =
    lat.toFixed(4)+'° N, '+lon.toFixed(4)+'° E';
  document.getElementById('loc-display').style.display = 'flex';

  /* Enable search button */
  document.getElementById('btn-search').disabled = false;
  map.setView([lat, lon], 9);
}

document.getElementById('btn-geolocate').addEventListener('click', function() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }
  var btn = this;
  btn.textContent = '⊙ Locating…';
  btn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      setSearchCenter(pos.coords.latitude, pos.coords.longitude);
      btn.textContent = '⊕ Use My Location';
      btn.disabled = false;
    },
    function() {
      alert('Could not get your location. Click on the map to set a search centre.');
      btn.textContent = '⊕ Use My Location';
      btn.disabled = false;
    }
  );
});

/* Click on map to set centre */
map.on('click', function(e) {
  setSearchCenter(e.latlng.lat, e.latlng.lng);
});