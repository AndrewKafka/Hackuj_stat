// 1. Inicializace mapy
const map = L.map('main_map').setView([50.0, 15.0], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 2. Globální proměnné
let geoJsonLayer = null;   // Reference na Leaflet vrstvu
let cachedData = null;      // Zde uložíme stažená GeoJSON data
let selectedAttribute = null;

// 3. Pomocná funkce pro barvy (beze změny)
function getColorByIndex(index, min = 0, max = 1) {
    if (index == null) return "rgb(150,150,150)";

    // 1. Ošetření případu, kdy jsou všechna čísla stejná (dělení nulou)
    if (max === min) return "rgb(127,127,0)"; 

    // 2. Normalizace: převede index z rozsahu [min, max] na [0, 1]
    const normalizedIndex = (index - min) / (max - min);
    
    // 3. Omezení (clamping) pro jistotu, aby hodnota nevytekla z 0-1
    const t = Math.min(Math.max(normalizedIndex, 0), 1);

    // Výpočet barev (Červená -> Zelená)
    const r = Math.round(255 * (1 - t));
    const g = Math.round(255 * t);
    const b = 0;

    return `rgb(${r},${g},${b})`;
}
// 4. Funkce pro (pře)kreslení mapy
let filterCenter = null; 
let filterRadius = null; 

function renderMap() {
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }

    if (!cachedData) return;

    // 1️⃣ Nejprve vyfiltrujeme obce
    const filteredFeatures = cachedData.features.filter(feature => {

        if (!filterCenter || !filterRadius) return true;

        const currentPoint = turf.centroid(feature);
        const d = turf.distance(filterCenter, currentPoint, {units: 'kilometers'});

        return d <= filterRadius;
    });

    // 2️⃣ Najdeme MIN a MAX index mezi vyfiltrovanými obcemi
    let min = Infinity;
    let max = -Infinity;

    filteredFeatures.forEach(feature => {
        const val = feature.properties?.[selectedAttribute];
        if (val == null) return;

        if (val < min) min = val;
        if (val > max) max = val;
    });

    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 1;

    console.log("Min index:", min, "Max index:", max);

    // 3️⃣ Vytvoříme nový GeoJSON pouze s filtrem
    const filteredData = {
        type: "FeatureCollection",
        features: filteredFeatures
    };

    // 4️⃣ Vykreslíme mapu
    geoJsonLayer = L.geoJSON(filteredData, {

        style: function(feature) {
            const val = feature.properties?.[selectedAttribute];
            return {
                color: getColorByIndex(val, min, max),
                weight: 2,
                opacity: 0.65,
                fillOpacity: 0.4,
                fillColor: getColorByIndex(val, min, max)
            };
        },

        pointToLayer: function(feature, latlng) {
            const val = feature.properties?.[selectedAttribute];
            return L.circleMarker(latlng, {
                radius: 6,
                fillColor: getColorByIndex(val, min, max),
                color: "#fff",
                weight: 1,
                fillOpacity: 0.8
            });
        },

        onEachFeature: function(feature, layer) {

            layer.on('click', function(e) {
                document.getElementById('okres_name').textContent = feature.properties.naz_obec || "NaN";

                function updateSlider(id, value) {
                    const percent = Math.min(Math.max(value, 0), 1) * 100;
                    document.getElementById(id).style.width = percent + "%";
                }

                updateSlider("index_zivota", feature.properties.index || 0);
                updateSlider("index_ceny_bydleni", feature.properties["Cena bydlení"] || 0);
                updateSlider("index_kvality_ovzdusi", feature.properties["Kvalita ovzduší"] || 0);
                updateSlider("index_economy", feature.properties["Ekonomický index"] || 0);
            });

            layer.on('mouseover', function(e) {
                layer.setStyle({ weight: 3, fillOpacity: 0.7 });
            });

            layer.on('mouseout', function(e) {
                geoJsonLayer.resetStyle(layer);
            });
        }

    }).addTo(map);

    // 5️⃣ Přiblížení mapy na výsledek
    if (filterCenter && filterRadius) {
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds);
        }
    }
}
// 5. Logika přepínání atributů
function updateSelectedAttribute() {
    const select = document.getElementById('dataset-select');
    selectedAttribute = select.value;
    console.log("Aktivní atribut:", selectedAttribute);
    
    // Překreslíme mapu s novým atributem
    renderMap();
}

// Event listener pro dropdown
document.getElementById('dataset-select').addEventListener('change', updateSelectedAttribute);

// 6. Načtení dat (proběhne jen jednou)
fetch('zpracovani_dat/main/mapa_100.geojson')
    .then(response => {
        if (!response.ok) throw new Error("Chyba při načítání GeoJSONu");
        return response.json();
    })
    .then(data => {
        cachedData = data; // Uložíme data do paměti
        
        // Inicializujeme selectedAttribute z dropdownu
        const select = document.getElementById('dataset-select');
        selectedAttribute = select.value;

        // První vykreslení
        renderMap();
    })
    .catch(error => console.error('Error loading GeoJSON:', error));