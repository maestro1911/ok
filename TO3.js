/* ═══════════════════════════════════════════════════════════════
   TO3.js  —  Nepal Tourism Explorer · WebGIS Dashboard
   Author  :  Sugam [Surname], BE Geomatics, Kathmandu University
   Course  :  WebGIS | Assignment TO3
   Map     :  OpenStreetMap tiles (natural colours)
   GeoJSON :  Tourist destination POINTS (TO3.geojson)
              Choropleth attribute: annual_visitors
              Preprocessing: QGIS Check Validity (GEOS engine)
   ═══════════════════════════════════════════════════════════════ */


/* ════════════════════════════════════════════════════════════════
   1.  EMBEDDED GEOJSON  — tourist destination points
       (Embedded for reliability; TO3.geojson is the source file)
       Choropleth: annual_visitors   CRS: WGS84 (EPSG:4326)
   ════════════════════════════════════════════════════════════════ */
var DEST_GEOJSON = {
  "type":"FeatureCollection",
  "features":[
    {"type":"Feature","properties":{"name":"Pashupatinath Temple",  "category":"religion", "district":"Kathmandu",      "annual_visitors":1500000,"elevation_m":1300,"rating":5,"best_season":"Oct–Mar",         "description":"Sacred Hindu temple on the Bagmati River, one of the holiest Shiva shrines in Asia."},"geometry":{"type":"Point","coordinates":[85.3484,27.7106]}},
    {"type":"Feature","properties":{"name":"Boudhanath Stupa",      "category":"heritage", "district":"Kathmandu",      "annual_visitors":1200000,"elevation_m":1310,"rating":5,"best_season":"Year-round",       "description":"UNESCO World Heritage — one of the largest Buddhist stupas in the world."},"geometry":{"type":"Point","coordinates":[85.3621,27.7215]}},
    {"type":"Feature","properties":{"name":"Kathmandu Durbar Square","category":"heritage","district":"Kathmandu",      "annual_visitors":700000, "elevation_m":1290,"rating":5,"best_season":"Year-round",       "description":"UNESCO World Heritage — royal palace square at the heart of old Kathmandu."},"geometry":{"type":"Point","coordinates":[85.3069,27.7042]}},
    {"type":"Feature","properties":{"name":"Swayambhunath Stupa",   "category":"heritage", "district":"Kathmandu",      "annual_visitors":900000, "elevation_m":1336,"rating":5,"best_season":"Year-round",       "description":"Ancient hilltop complex known as the Monkey Temple, UNESCO World Heritage."},"geometry":{"type":"Point","coordinates":[85.2904,27.7149]}},
    {"type":"Feature","properties":{"name":"Bhaktapur Durbar Square","category":"heritage","district":"Bhaktapur",      "annual_visitors":600000, "elevation_m":1401,"rating":5,"best_season":"Oct–May",          "description":"UNESCO World Heritage — medieval Newar city famed for crafts and temples."},"geometry":{"type":"Point","coordinates":[85.4277,27.6722]}},
    {"type":"Feature","properties":{"name":"Patan Durbar Square",   "category":"heritage", "district":"Lalitpur",       "annual_visitors":500000, "elevation_m":1305,"rating":5,"best_season":"Oct–May",          "description":"UNESCO World Heritage — finest surviving example of Newari palace architecture."},"geometry":{"type":"Point","coordinates":[85.3246,27.6727]}},
    {"type":"Feature","properties":{"name":"Phewa Lake",            "category":"nature",   "district":"Kaski",          "annual_visitors":500000, "elevation_m":820, "rating":5,"best_season":"Sep–May",          "description":"Pokhara's iconic lake with Machhapuchhre reflections — boating and lakeside walks."},"geometry":{"type":"Point","coordinates":[83.9500,28.2100]}},
    {"type":"Feature","properties":{"name":"Manakamana Temple",     "category":"religion", "district":"Gorkha",         "annual_visitors":450000, "elevation_m":1302,"rating":4,"best_season":"Year-round",       "description":"Goddess Bhagwati temple accessible by a dramatic aerial cable car."},"geometry":{"type":"Point","coordinates":[84.5250,27.9250]}},
    {"type":"Feature","properties":{"name":"Lumbini Sacred Garden", "category":"heritage", "district":"Rupandehi",      "annual_visitors":350000, "elevation_m":100, "rating":5,"best_season":"Oct–Mar",          "description":"Birthplace of Lord Buddha — UNESCO World Heritage Site."},"geometry":{"type":"Point","coordinates":[83.2763,27.4833]}},
    {"type":"Feature","properties":{"name":"Chitwan National Park", "category":"wildlife", "district":"Chitwan",        "annual_visitors":380000, "elevation_m":100, "rating":5,"best_season":"Oct–Mar",          "description":"UNESCO World Heritage — Bengal tigers, rhinos and jungle safari on elephant-back."},"geometry":{"type":"Point","coordinates":[84.4400,27.5758]}},
    {"type":"Feature","properties":{"name":"Nagarkot",              "category":"viewpoint","district":"Bhaktapur",      "annual_visitors":250000, "elevation_m":2175,"rating":5,"best_season":"Oct–Mar",          "description":"Sunrise panorama over 8 Himalayan ranges — from Everest to Dhaulagiri."},"geometry":{"type":"Point","coordinates":[85.5178,27.7151]}},
    {"type":"Feature","properties":{"name":"Budhanilkantha Temple", "category":"religion", "district":"Kathmandu",      "annual_visitors":200000, "elevation_m":1500,"rating":4,"best_season":"Year-round",       "description":"Open-air shrine with a giant reclining Vishnu statue in a lotus pond."},"geometry":{"type":"Point","coordinates":[85.3617,27.7800]}},
    {"type":"Feature","properties":{"name":"Sarangkot",             "category":"viewpoint","district":"Kaski",          "annual_visitors":200000, "elevation_m":1592,"rating":5,"best_season":"Oct–May",          "description":"Iconic sunrise viewpoint over Pokhara Valley and the Annapurna massif."},"geometry":{"type":"Point","coordinates":[83.9667,28.2333]}},
    {"type":"Feature","properties":{"name":"Shivapuri Nagarjun NP","category":"wildlife",  "district":"Kathmandu",      "annual_visitors":120000, "elevation_m":2732,"rating":4,"best_season":"Oct–May",          "description":"National park on Kathmandu's northern rim — forest trails and birdwatching."},"geometry":{"type":"Point","coordinates":[85.3700,27.8200]}},
    {"type":"Feature","properties":{"name":"Pokhara Paragliding",   "category":"adventure","district":"Kaski",          "annual_visitors":120000, "elevation_m":1600,"rating":5,"best_season":"Sep–May",          "description":"World-class tandem paragliding with Annapurna panorama and Phewa Lake below."},"geometry":{"type":"Point","coordinates":[83.9856,28.2096]}},
    {"type":"Feature","properties":{"name":"Changu Narayan Temple", "category":"heritage", "district":"Bhaktapur",      "annual_visitors":150000, "elevation_m":1541,"rating":4,"best_season":"Oct–May",          "description":"Oldest temple in Nepal, a UNESCO World Heritage Site on a forested hilltop."},"geometry":{"type":"Point","coordinates":[85.4524,27.7340]}},
    {"type":"Feature","properties":{"name":"Chandragiri Hills",     "category":"viewpoint","district":"Kathmandu",      "annual_visitors":150000, "elevation_m":2551,"rating":4,"best_season":"Oct–May",          "description":"Cable car ride to 2,551 m with sweeping Kathmandu Valley and Himalayan views."},"geometry":{"type":"Point","coordinates":[85.2100,27.6500]}},
    {"type":"Feature","properties":{"name":"Trishuli River Rafting","category":"adventure","district":"Dhading",        "annual_visitors":80000,  "elevation_m":500, "rating":4,"best_season":"Sep–Nov, Mar–Jun",  "description":"Most accessible white-water rafting from Kathmandu — Grade III–IV rapids."},"geometry":{"type":"Point","coordinates":[84.8800,27.8600]}},
    {"type":"Feature","properties":{"name":"Poon Hill",             "category":"trekking", "district":"Myagdi",         "annual_visitors":80000,  "elevation_m":3210,"rating":5,"best_season":"Oct–Apr",          "description":"Iconic sunrise viewpoint over Annapurna and Dhaulagiri at 3,210 m."},"geometry":{"type":"Point","coordinates":[83.6930,28.3990]}},
    {"type":"Feature","properties":{"name":"Muktinath Temple",      "category":"religion", "district":"Mustang",        "annual_visitors":80000,  "elevation_m":3760,"rating":5,"best_season":"May–Oct",          "description":"Sacred pilgrimage site at 3,760 m revered by both Hindus and Buddhists."},"geometry":{"type":"Point","coordinates":[83.8700,28.8169]}},
    {"type":"Feature","properties":{"name":"Dhulikhel",             "category":"viewpoint","district":"Kavrepalanchok", "annual_visitors":80000,  "elevation_m":1550,"rating":4,"best_season":"Oct–Apr",          "description":"Mountain town with spectacular Himalayan vista, a favourite weekend escape."},"geometry":{"type":"Point","coordinates":[85.5614,27.6228]}},
    {"type":"Feature","properties":{"name":"Kopan Monastery",       "category":"religion", "district":"Kathmandu",      "annual_visitors":50000,  "elevation_m":1430,"rating":4,"best_season":"Year-round",       "description":"Tibetan Buddhist monastery offering meditation and philosophy courses."},"geometry":{"type":"Point","coordinates":[85.3680,27.7320]}},
    {"type":"Feature","properties":{"name":"Lukla (EBC Gateway)",   "category":"trekking", "district":"Solukhumbu",     "annual_visitors":55000,  "elevation_m":2860,"rating":5,"best_season":"Mar–May, Sep–Nov", "description":"Starting point of the Everest Base Camp trek — the famous Hillary airstrip."},"geometry":{"type":"Point","coordinates":[86.7298,27.6867]}},
    {"type":"Feature","properties":{"name":"Namche Bazaar",         "category":"trekking", "district":"Solukhumbu",     "annual_visitors":50000,  "elevation_m":3440,"rating":5,"best_season":"Mar–May, Sep–Nov", "description":"Sherpa capital and acclimatisation hub on the classic EBC trail."},"geometry":{"type":"Point","coordinates":[86.7140,27.8050]}},
    {"type":"Feature","properties":{"name":"Sagarmatha National Park","category":"wildlife","district":"Solukhumbu",    "annual_visitors":50000,  "elevation_m":2845,"rating":5,"best_season":"Mar–May, Oct–Nov", "description":"UNESCO World Heritage — the Himalayan ecosystem surrounding Mount Everest."},"geometry":{"type":"Point","coordinates":[86.7500,27.9800]}},
    {"type":"Feature","properties":{"name":"Begnas Lake",           "category":"nature",   "district":"Kaski",          "annual_visitors":50000,  "elevation_m":827, "rating":4,"best_season":"Sep–May",          "description":"Tranquil lake 15 km east of Pokhara — quieter than Phewa with fishing villages."},"geometry":{"type":"Point","coordinates":[84.0833,28.2167]}},
    {"type":"Feature","properties":{"name":"Annapurna Base Camp",   "category":"trekking", "district":"Kaski",          "annual_visitors":60000,  "elevation_m":4130,"rating":5,"best_season":"Mar–May, Sep–Nov", "description":"Classic trek through rhododendron forest and moraines to 4,130 m."},"geometry":{"type":"Point","coordinates":[83.8770,28.5300]}},
    {"type":"Feature","properties":{"name":"Bandipur Village",      "category":"cultural", "district":"Tanahun",        "annual_visitors":60000,  "elevation_m":1030,"rating":5,"best_season":"Oct–May",          "description":"Perfectly preserved Newari hilltop trading village — traffic-free and timeless."},"geometry":{"type":"Point","coordinates":[84.4030,27.9350]}},
    {"type":"Feature","properties":{"name":"Bandipur Viewpoint",    "category":"viewpoint","district":"Tanahun",        "annual_visitors":60000,  "elevation_m":1040,"rating":4,"best_season":"Oct–May",          "description":"Panoramic view of the Marsyangdi Valley and Himalayan peaks above Bandipur."},"geometry":{"type":"Point","coordinates":[84.4020,27.9330]}},
    {"type":"Feature","properties":{"name":"Zip Flyer Pokhara",     "category":"adventure","district":"Kaski",          "annual_visitors":30000,  "elevation_m":1400,"rating":5,"best_season":"Year-round",       "description":"World's steepest zip-line — 1.8 km at up to 120 km/h over Sarangkot hill."},"geometry":{"type":"Point","coordinates":[83.9650,28.1900]}},
    {"type":"Feature","properties":{"name":"Phulchoki Hill",        "category":"viewpoint","district":"Lalitpur",       "annual_visitors":30000,  "elevation_m":2762,"rating":4,"best_season":"Mar–May, Oct–Nov", "description":"Highest hill surrounding the Kathmandu Valley with diverse flora and mountain views."},"geometry":{"type":"Point","coordinates":[85.4167,27.5667]}},
    {"type":"Feature","properties":{"name":"Panauti",               "category":"cultural", "district":"Kavrepalanchok", "annual_visitors":30000,  "elevation_m":1480,"rating":4,"best_season":"Oct–May",          "description":"Pristine medieval town at river confluence with intact triple-roofed temples."},"geometry":{"type":"Point","coordinates":[85.5167,27.5833]}},
    {"type":"Feature","properties":{"name":"Halesi Mahadev Cave",   "category":"religion", "district":"Khotang",        "annual_visitors":40000,  "elevation_m":1340,"rating":4,"best_season":"Oct–Mar",          "description":"Sacred cave temple revered as the Pashupatinath of the Eastern Hills."},"geometry":{"type":"Point","coordinates":[86.6183,27.4789]}},
    {"type":"Feature","properties":{"name":"Kakani Viewpoint",      "category":"viewpoint","district":"Nuwakot",        "annual_visitors":40000,  "elevation_m":2073,"rating":4,"best_season":"Oct–Apr",          "description":"Peaceful hilltop with panoramic Central Himalayan views, 30 km from Kathmandu."},"geometry":{"type":"Point","coordinates":[85.2700,27.8800]}},
    {"type":"Feature","properties":{"name":"Kirtipur",              "category":"cultural", "district":"Kathmandu",      "annual_visitors":40000,  "elevation_m":1395,"rating":4,"best_season":"Oct–May",          "description":"Ancient twin-hilltop Newar town with living Newari traditions and crafts."},"geometry":{"type":"Point","coordinates":[85.2833,27.6667]}},
    {"type":"Feature","properties":{"name":"Gosaikunda Lake",       "category":"religion", "district":"Rasuwa",         "annual_visitors":20000,  "elevation_m":4380,"rating":5,"best_season":"Jun–Sep",          "description":"Sacred alpine lake at 4,380 m — major pilgrimage destination during Janai Purnima."},"geometry":{"type":"Point","coordinates":[85.4167,28.0667]}},
    {"type":"Feature","properties":{"name":"Langtang Valley Trek",  "category":"trekking", "district":"Rasuwa",         "annual_visitors":20000,  "elevation_m":3500,"rating":4,"best_season":"Mar–May, Oct–Nov", "description":"Stunning high valley 2–3 days from Kathmandu, rich in Tibetan culture."},"geometry":{"type":"Point","coordinates":[85.5153,28.2133]}},
    {"type":"Feature","properties":{"name":"Langtang National Park","category":"wildlife",  "district":"Rasuwa",         "annual_visitors":20000,  "elevation_m":3500,"rating":4,"best_season":"Mar–May, Oct–Nov", "description":"Rich high-altitude biodiversity — red pandas, snow leopards and Himalayan tahr."},"geometry":{"type":"Point","coordinates":[85.3500,28.2000]}},
    {"type":"Feature","properties":{"name":"Thimi",                 "category":"cultural", "district":"Bhaktapur",      "annual_visitors":20000,  "elevation_m":1310,"rating":3,"best_season":"Oct–May",          "description":"Town of masks, pottery and papier-mâché — finest Newari craft traditions."},"geometry":{"type":"Point","coordinates":[85.3956,27.6778]}},
    {"type":"Feature","properties":{"name":"Taudaha Lake",          "category":"nature",   "district":"Kathmandu",      "annual_visitors":25000,  "elevation_m":1289,"rating":3,"best_season":"Nov–Feb",          "description":"Small natural lake on the Valley floor — excellent winter birdwatching spot."},"geometry":{"type":"Point","coordinates":[85.2900,27.6500]}},
    {"type":"Feature","properties":{"name":"Tansen (Palpa)",        "category":"cultural", "district":"Palpa",          "annual_visitors":25000,  "elevation_m":1371,"rating":4,"best_season":"Oct–May",          "description":"Historic hillside town famed for Dhaka weaving, metalwork and Newari heritage."},"geometry":{"type":"Point","coordinates":[83.5500,27.8667]}},
    {"type":"Feature","properties":{"name":"Gokyo Lakes Trek",      "category":"trekking", "district":"Solukhumbu",     "annual_visitors":15000,  "elevation_m":4700,"rating":5,"best_season":"Mar–May, Oct–Nov", "description":"Turquoise glacial lakes at 4,700 m with panorama of four 8,000 m peaks."},"geometry":{"type":"Point","coordinates":[86.6791,27.9622]}},
    {"type":"Feature","properties":{"name":"Bardia National Park",  "category":"wildlife", "district":"Bardiya",        "annual_visitors":15000,  "elevation_m":152, "rating":5,"best_season":"Oct–Mar",          "description":"Nepal's largest Terai park — best chance to spot Bengal tigers in the wild."},"geometry":{"type":"Point","coordinates":[81.5000,28.3500]}},
    {"type":"Feature","properties":{"name":"Last Resort Bungee",    "category":"adventure","district":"Sindhupalchok",  "annual_visitors":10000,  "elevation_m":1050,"rating":5,"best_season":"Sep–Jun",          "description":"160 m bungee jump over the Bhote Koshi gorge — among Asia's highest bungees."},"geometry":{"type":"Point","coordinates":[85.9767,27.9167]}},
    {"type":"Feature","properties":{"name":"Bhote Koshi Rafting",   "category":"adventure","district":"Sindhupalchok",  "annual_visitors":8000,   "elevation_m":900, "rating":5,"best_season":"Sep–Nov, Mar–Jun",  "description":"Thrilling Grade IV–V white-water rafting on a steep Himalayan river."},"geometry":{"type":"Point","coordinates":[85.9800,27.9800]}},
    {"type":"Feature","properties":{"name":"Manaslu Circuit",       "category":"trekking", "district":"Gorkha",         "annual_visitors":8000,   "elevation_m":5106,"rating":5,"best_season":"Mar–May, Sep–Nov", "description":"Remote circuit around the 8th highest peak crossing the 5,106 m Larkya La."},"geometry":{"type":"Point","coordinates":[84.5600,28.5500]}},
    {"type":"Feature","properties":{"name":"Koshi Tappu Reserve",   "category":"wildlife", "district":"Sunsari",        "annual_visitors":8000,   "elevation_m":75,  "rating":4,"best_season":"Oct–Mar",          "description":"Ramsar wetland — critical habitat for migratory birds and wild water buffalo."},"geometry":{"type":"Point","coordinates":[87.0000,26.6500]}},
    {"type":"Feature","properties":{"name":"Kali Gandaki Rafting",  "category":"adventure","district":"Myagdi",         "annual_visitors":5000,   "elevation_m":900, "rating":4,"best_season":"Sep–Nov",          "description":"Rafting through one of the world's deepest gorges between Annapurna and Dhaulagiri."},"geometry":{"type":"Point","coordinates":[83.7000,28.1000]}},
    {"type":"Feature","properties":{"name":"Upper Mustang Trek",    "category":"trekking", "district":"Mustang",        "annual_visitors":5000,   "elevation_m":3840,"rating":5,"best_season":"May–Oct",          "description":"Restricted-area trek to the ancient walled Kingdom of Lo Manthang."},"geometry":{"type":"Point","coordinates":[83.9700,29.1800]}},
    {"type":"Feature","properties":{"name":"Rara Lake",             "category":"nature",   "district":"Mugu",           "annual_visitors":3000,   "elevation_m":2990,"rating":5,"best_season":"May–Oct",          "description":"Nepal's largest lake at 2,990 m — pristine, remote and hauntingly beautiful."},"geometry":{"type":"Point","coordinates":[82.0872,29.5271]}}
  ]
};


/* ════════════════════════════════════════════════════════════════
   2.  CATEGORY CONFIG
   ════════════════════════════════════════════════════════════════ */
var CAT = {
  heritage:  { color:'#b57010', label:'Heritage',  emoji:'🏛' },
  religion:  { color:'#a8321c', label:'Religion',  emoji:'🛕' },
  trekking:  { color:'#3d6e45', label:'Trekking',  emoji:'🥾' },
  wildlife:  { color:'#245c38', label:'Wildlife',  emoji:'🦏' },
  adventure: { color:'#9a3515', label:'Adventure', emoji:'🪂' },
  viewpoint: { color:'#3a62a0', label:'Viewpoint', emoji:'🔭' },
  nature:    { color:'#28807a', label:'Nature',    emoji:'🏞' },
  cultural:  { color:'#6a4ea0', label:'Cultural',  emoji:'🎭' }
};


/* ════════════════════════════════════════════════════════════════
   3.  CHOROPLETH COLOR SCALE  — visitor density
       Blue (fewest) → Green → Yellow → Orange → Deep Red (most)
   ════════════════════════════════════════════════════════════════ */
function getDestColor(v) {
  return v > 1000000 ? '#7f0e0e' :   /* ultra-popular — deep crimson  */
         v > 500000  ? '#b01c1c' :   /* very popular  — dark red      */
         v > 200000  ? '#c84020' :   /* popular       — red-orange    */
         v > 100000  ? '#d46818' :   /* busy          — orange        */
         v > 50000   ? '#d49820' :   /* moderate      — amber         */
         v > 20000   ? '#b8b030' :   /* light traffic — yellow-olive  */
         v > 10000   ? '#70a848' :   /* low traffic   — sage green    */
         v > 5000    ? '#3a8878' :   /* quiet         — muted teal    */
                       '#3468a0';    /* remote        — steel blue    */
}

/* Radius scales proportionally to visitor count */
function getDestRadius(v) {
  return v > 500000  ? 16 :
         v > 200000  ? 14 :
         v > 100000  ? 12 :
         v > 50000   ? 10 :
         v > 20000   ?  8 :
         v > 5000    ?  7 :
                        6;
}


/* ════════════════════════════════════════════════════════════════
   4.  HAVERSINE DISTANCE (km)
   ════════════════════════════════════════════════════════════════ */
function haversine(lat1, lon1, lat2, lon2) {
  var R = 6371, r = Math.PI / 180;
  var dLat = (lat2 - lat1) * r, dLon = (lon2 - lon1) * r;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
          Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}


/* ════════════════════════════════════════════════════════════════
   5.  APP STATE
   ════════════════════════════════════════════════════════════════ */
var map, infoControl, legendControl;
var radiusCircle   = null;
var centerMarker   = null;
var destLayer      = null;   /* active L.geoJSON choropleth layer   */
var foundFeatures  = [];     /* GeoJSON features within radius      */
var currentCat     = 'all';
var searchCenter   = null;


/* ════════════════════════════════════════════════════════════════
   6.  MAP — OpenStreetMap natural colour tiles
   ════════════════════════════════════════════════════════════════ */
var map = L.map('map', { center:[28.0, 84.2], zoom:7, minZoom:5, maxZoom:18 });

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
  maxZoom: 19
}).addTo(map);


/* ════════════════════════════════════════════════════════════════
   7.  INFO CONTROL — real-time hover panel
   ════════════════════════════════════════════════════════════════ */
infoControl = L.control({ position:'topright' });
infoControl.onAdd = function() {
  this._div = L.DomUtil.create('div', 'info-panel');
  this.update(null);
  return this._div;
};
infoControl.update = function(payload) {
  if (!payload) {
    this._div.innerHTML = '<p class="info-placeholder">Hover over a destination<br>to view details</p>';
    return;
  }
  var p    = payload.props;
  var cfg  = CAT[p.category] || { color:'#888', label:p.category, emoji:'◉' };
  var col  = getDestColor(p.annual_visitors);
  var stars = '';
  for (var i = 0; i < 5; i++) stars += i < p.rating ? '★' : '☆';
  var fmt  = function(n){ return Number(n).toLocaleString('en-IN'); };

  this._div.innerHTML =
    '<span class="info-type" style="color:'+cfg.color+'">'+cfg.emoji+' '+cfg.label+'</span>'+
    '<h4>'+p.name+'</h4>'+
    '<p><strong>District:</strong> '+p.district+'</p>'+
    '<p><strong>Elevation:</strong> '+p.elevation_m.toLocaleString()+' m ASL</p>'+
    '<p><strong>Best Season:</strong> '+p.best_season+'</p>'+
    '<p style="color:'+cfg.color+';letter-spacing:.06em;margin:4px 0">'+stars+'</p>'+
    '<div style="border-top:1px solid rgba(0,0,0,0.1);margin:7px 0 6px"></div>'+
    '<p style="margin-bottom:4px"><strong>Annual Visitors</strong></p>'+
    '<p style="font-size:1.05rem;font-weight:700;color:'+col+'">'+fmt(p.annual_visitors)+'</p>'+
    '<div style="height:6px;background:#e8e0d0;border-radius:3px;overflow:hidden;margin:5px 0 8px">'+
      '<div style="height:100%;width:'+Math.round(p.annual_visitors/15000)+
        '%;max-width:100%;background:'+col+';border-radius:3px"></div></div>'+
    (payload.dist ? '<p><strong>Distance:</strong> <span style="color:'+col+';font-weight:600">'+payload.dist.toFixed(1)+' km</span> away</p>' : '')+
    '<p style="margin-top:6px;font-size:.74rem;color:#6b5c48;line-height:1.55">'+p.description+'</p>';
};
infoControl.addTo(map);


/* ════════════════════════════════════════════════════════════════
   8.  LEGEND CONTROL
   ════════════════════════════════════════════════════════════════ */
legendControl = L.control({ position:'bottomright' });
legendControl.onAdd = function() {
  var div    = L.DomUtil.create('div', 'legend-panel');
  var grades = [0,      5000,   10000,  20000,  50000,
                100000, 200000, 500000, 1000000];
  var labels = ['< 5K','5K–10K','10K–20K','20K–50K',
                '50K–100K','100K–200K','200K–500K','500K–1M','> 1M'];

  div.innerHTML = '<span class="legend-section-title">Visitor Density (Choropleth)</span>';
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<div class="legend-item">'+
        '<span class="legend-swatch" style="background:'+getDestColor(grades[i]+1)+'"></span>'+
        '<span>'+labels[i]+'</span>'+
      '</div>';
  }
  div.innerHTML += '<hr class="legend-divider"><span class="legend-section-title">Category</span>';
  for (var k in CAT) {
    div.innerHTML +=
      '<div class="legend-item">'+
        '<span class="legend-dot" style="background:'+CAT[k].color+';border-color:'+CAT[k].color+'"></span>'+
        '<span>'+CAT[k].emoji+' '+CAT[k].label+'</span>'+
      '</div>';
  }
  return div;
};
legendControl.addTo(map);


/* ════════════════════════════════════════════════════════════════
   9.  CREATE CHOROPLETH DESTINATION LAYER
       Uses L.geoJSON with pointToLayer — choropleth by annual_visitors
   ════════════════════════════════════════════════════════════════ */
function buildDestLayer(features) {
  /* Remove existing layer */
  if (destLayer) map.removeLayer(destLayer);

  destLayer = L.geoJSON({ type:'FeatureCollection', features:features }, {

    /* ── pointToLayer: circle marker sized + coloured by visitor count */
    pointToLayer: function(feature, latlng) {
      var v = feature.properties.annual_visitors;
      return L.circleMarker(latlng, {
        radius:      getDestRadius(v),
        fillColor:   getDestColor(v),
        fillOpacity: 0.88,
        color:       '#ffffff',
        weight:      1.8,
        opacity:     0.9
      });
    },

    /* ── onEachFeature: hover → update info panel; click → zoom */
    onEachFeature: function(feature, layer) {
      var dist = feature.properties._dist;

      layer.on('mouseover', function() {
        layer.setStyle({ weight:3, color:'#1c1710', fillOpacity:1 });
        infoControl.update({ props:feature.properties, dist:dist });
        highlightListItem(feature.properties.name);
      });

      layer.on('mouseout', function() {
        /* Only reset if layer still exists (not removed by filter) */
        if (destLayer && destLayer.hasLayer(layer)) {
          layer.setStyle({
            weight:1.8, color:'#ffffff',
            fillOpacity:0.88, opacity:0.9
          });
        }
        infoControl.update(null);
        clearHighlight();
      });

      layer.on('click', function() {
        map.setView(layer.getLatLng(), 13);
        infoControl.update({ props:feature.properties, dist:dist });
        highlightListItem(feature.properties.name);
      });
    }
  }).addTo(map);
}


/* ════════════════════════════════════════════════════════════════
   10. RESULTS LIST — sorted by annual_visitors descending
   ════════════════════════════════════════════════════════════════ */
function renderList(features) {
  var list = document.getElementById('sp-dest-list');
  list.innerHTML = '';

  if (!features || features.length === 0) {
    list.innerHTML = '<p style="font-size:.78rem;color:#9e8e7a;padding:.6rem .2rem;font-style:italic">No destinations match this filter.</p>';
    return;
  }

  /* Sort most-visited first */
  var sorted = features.slice().sort(function(a, b) {
    return b.properties.annual_visitors - a.properties.annual_visitors;
  });

  sorted.forEach(function(feat) {
    var p   = feat.properties;
    var cfg = CAT[p.category] || { color:'#888', label:p.category, emoji:'◉' };
    var col = getDestColor(p.annual_visitors);
    var stars = '';
    for (var i = 0; i < p.rating; i++) stars += '★';
    var fmt = Number(p.annual_visitors).toLocaleString('en-IN');

    var el = document.createElement('div');
    el.className    = 'dest-item';
    el.dataset.name = p.name;
    el.innerHTML =
      '<div class="dest-dot-wrap">'+
        '<span class="dest-color-dot" style="background:'+col+';border-color:'+col+'"></span>'+
      '</div>'+
      '<div class="dest-info">'+
        '<div class="dest-name">'+cfg.emoji+' '+p.name+'</div>'+
        '<div class="dest-meta">'+
          '<span class="dest-cat-badge cat-'+p.category+'">'+cfg.label+'</span>'+
          '<span class="dest-dist mono">'+p._dist.toFixed(1)+' km</span>'+
          '<span class="dest-visitors" style="color:'+col+'">'+fmt+' visitors</span>'+
          '<span class="dest-rating">'+stars+'</span>'+
        '</div>'+
      '</div>';

    el.addEventListener('click', function() {
      var coords = feat.geometry.coordinates;   /* [lon, lat] */
      map.setView([coords[1], coords[0]], 13);
      infoControl.update({ props:p, dist:p._dist });
      highlightListItem(p.name);
    });
    el.addEventListener('mouseenter', function() {
      infoControl.update({ props:p, dist:p._dist });
      highlightListItem(p.name);
    });
    el.addEventListener('mouseleave', function() {
      infoControl.update(null);
      clearHighlight();
    });

    list.appendChild(el);
  });
}

function highlightListItem(name) {
  document.querySelectorAll('.dest-item').forEach(function(el) {
    el.classList.toggle('highlighted', el.dataset.name === name);
  });
}
function clearHighlight() {
  document.querySelectorAll('.dest-item').forEach(function(el) {
    el.classList.remove('highlighted');
  });
}


/* ════════════════════════════════════════════════════════════════
   11. CATEGORY FILTER
   ════════════════════════════════════════════════════════════════ */
function applyFilter(cat) {
  currentCat = cat;
  var filtered = (cat === 'all')
    ? foundFeatures
    : foundFeatures.filter(function(f) { return f.properties.category === cat; });

  buildDestLayer(filtered);
  renderList(filtered);

  var countEl = document.getElementById('filter-count');
  countEl.textContent = (cat === 'all')
    ? ''
    : 'Showing ' + filtered.length + ' of ' + foundFeatures.length;
}

document.getElementById('cat-select').addEventListener('change', function() {
  applyFilter(this.value);
});


/* ════════════════════════════════════════════════════════════════
   12. RADIUS SEARCH
   ════════════════════════════════════════════════════════════════ */
function runSearch() {
  if (!searchCenter) return;
  var radiusKm = parseInt(document.getElementById('radius-range').value, 10);

  /* Remove old circle */
  if (radiusCircle) map.removeLayer(radiusCircle);

  /* Draw dashed radius circle */
  radiusCircle = L.circle([searchCenter.lat, searchCenter.lon], {
    radius:      radiusKm * 1000,
    color:       '#b57010',
    weight:      2,
    opacity:     0.8,
    fillColor:   '#b57010',
    fillOpacity: 0.04,
    dashArray:   '7,7'
  }).addTo(map);

  /* Find features within radius — stamp _dist onto properties */
  foundFeatures = [];
  DEST_GEOJSON.features.forEach(function(feat) {
    var coords = feat.geometry.coordinates;   /* [lon, lat] */
    var d = haversine(searchCenter.lat, searchCenter.lon, coords[1], coords[0]);
    if (d <= radiusKm) {
      feat.properties._dist = d;
      foundFeatures.push(feat);
    }
  });

  /* Update panel */
  document.getElementById('result-total').textContent = foundFeatures.length;
  document.getElementById('sp-results-block').style.display = 'block';

  /* Reset filter, build choropleth layer, render list */
  document.getElementById('cat-select').value = 'all';
  currentCat = 'all';
  buildDestLayer(foundFeatures);
  renderList(foundFeatures);
  document.getElementById('filter-count').textContent = '';

  /* Fit map to radius circle */
  map.fitBounds(radiusCircle.getBounds(), { padding:[20,20] });
}

document.getElementById('btn-search').addEventListener('click', runSearch);


/* ════════════════════════════════════════════════════════════════
   13. RADIUS SLIDER — live label + track gradient
   ════════════════════════════════════════════════════════════════ */
var rangeEl = document.getElementById('radius-range');
rangeEl.addEventListener('input', function() {
  document.getElementById('radius-live').textContent = this.value + ' km';
  var pct = ((this.value - 10) / (500 - 10)) * 100;
  this.style.background =
    'linear-gradient(to right,#b57010 0%,#b57010 '+pct+'%,#e2d9ca '+pct+'%)';
});


/* ════════════════════════════════════════════════════════════════
   14. GEOLOCATION
   ════════════════════════════════════════════════════════════════ */
function setSearchCenter(lat, lon) {
  searchCenter = { lat:lat, lon:lon };

  if (centerMarker) map.removeLayer(centerMarker);
  centerMarker = L.circleMarker([lat, lon], {
    radius:8, fillColor:'#b57010', fillOpacity:0.3,
    color:'#b57010', weight:2, opacity:0.9
  }).addTo(map);

  document.getElementById('loc-text').textContent =
    lat.toFixed(4)+'° N, '+lon.toFixed(4)+'° E';
  document.getElementById('loc-display').style.display = 'flex';
  document.getElementById('btn-search').disabled = false;
  map.setView([lat, lon], 9);
}

document.getElementById('btn-geolocate').addEventListener('click', function() {
  if (!navigator.geolocation) { alert('Geolocation not supported by your browser.'); return; }
  var btn = this;
  btn.textContent = '⊙  Locating…'; btn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      setSearchCenter(pos.coords.latitude, pos.coords.longitude);
      btn.textContent = '⊕  Use My Location'; btn.disabled = false;
    },
    function() {
      alert('Location unavailable. Click on the map to set your search centre.');
      btn.textContent = '⊕  Use My Location'; btn.disabled = false;
    }
  );
});

/* Click map to set centre */
map.on('click', function(e) { setSearchCenter(e.latlng.lat, e.latlng.lng); });