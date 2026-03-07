var compareSlot = 1;

function fillComparison(feature, slot){

    const p = feature.properties;

    document.getElementById("okres_name"+slot).textContent = p.naz_obec;

    updateSlider("index_zivota"+slot, feature.properties.index || 0);
    updateSlider("index_ceny_bydleni"+slot, feature.properties["Cena bydlení"] || 0);
    updateSlider("index_kvality_ovzdusi"+slot, feature.properties["Kvalita ovzduší"] || 0);
}

function styleFunction(feature) {
    return {
        color: "#007bff",   // border color
        weight: 2,
        fillColor: "#00bfff",
        fillOpacity: 0.3
    };
}

function updateSlider(id, value) {
    // Assuming value is 0-1, scale to 0%-100%
    const percent = Math.min(Math.max(value, 0), 1) * 100;
    document.getElementById(id).style.width = percent + "%";
}






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
function getColorByIndex(index) {
    if (index == null) return "rgb(150,150,150)";
    index = Math.min(Math.max(index, 0), 1);

    const r = Math.round(255 * (1 - index));
    const g = Math.round(255 * index);
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

    geoJsonLayer = L.geoJSON(cachedData, {
        // --- TATO ČÁST FILTRUJE POLYGONY ---
        filter: function(feature) {
            // Pokud filtr není aktivní (např. po načtení), vykresli vše
            if (!filterCenter || !filterRadius) return true;

            const currentPoint = turf.centroid(feature);
            const d = turf.distance(filterCenter, currentPoint, {units: 'kilometers'});
            
            return d <= filterRadius;
        },
        // --- KONEC FILTRACE ---

        style: function(feature) {
            const val = feature.properties?.[selectedAttribute];
            return {
                color: getColorByIndex(val),
                weight: 2,
                opacity: 0.65,
                fillOpacity: 0.4,
                fillColor: getColorByIndex(val)
            };
        },
        pointToLayer: function(feature, latlng) {
            const val = feature.properties?.[selectedAttribute];
            return L.circleMarker(latlng, {
                radius: 6,
                fillColor: getColorByIndex(val),
                color: "#fff",
                weight: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            // CLICK event: update bottom panel
            layer.on('click', function(e) {
                console.log("Clicked region data:", feature.properties);
                // Okres name
                document.getElementById('okres_name').textContent = feature.properties.naz_obec || "NaN";


                updateSlider("index_zivota", feature.properties.index || 0);
                updateSlider("index_ceny_bydleni", feature.properties["Cena bydlení"] || 0);
                updateSlider("index_kvality_ovzdusi", feature.properties["Kvalita ovzduší"] || 0);

                
                fillComparison(feature, compareSlot);
                console.log("Clicked feature:", compareSlot);
                if(compareSlot === 1){
                    compareSlot = 2;
                } else {
                    compareSlot = 1;
                }


            });

            layer.on('mouseover', function(e) {
                layer.setStyle({ weight: 3, fillOpacity: 0.7 });
            });

            layer.on('mouseout', function(e) {
                geoJsonLayer.resetStyle(layer);
            });
        }
    }).addTo(map);

    // Pokud filtrujeme, automaticky přiblížíme mapu na výsledek
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