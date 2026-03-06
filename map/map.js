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
function renderMap() {
    // Pokud už na mapě nějaká vrstva je, odstraníme ji, abychom nekreslili vrstvy přes sebe
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }

    if (!cachedData) return;

    geoJsonLayer = L.geoJSON(cachedData, {
        // Styl pro polygony/linie
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
        // Styl pro body
        pointToLayer: function(feature, latlng) {
            const val = feature.properties?.[selectedAttribute];
            return L.circleMarker(latlng, {
                radius: 6,
                fillColor: getColorByIndex(val),
                color: "#fff", // bílé ohraničení pro lepší viditelnost
                weight: 1,
                fillOpacity: 0.8
            });
        },
        // Popupy
        onEachFeature: function(feature, layer) {
            let popupContent = "<b>" + (feature.properties.name || "ID: " + feature.id) + "</b>";
            if (selectedAttribute) {
                popupContent += `<br>${selectedAttribute}: ${feature.properties[selectedAttribute]}`;
            }
            layer.bindPopup(popupContent);
        }
    }).addTo(map);
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
fetch('vysledna_mapa.geojson')
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
// Tlačítko pro překreslení všech vrstev žlutě
document.getElementById('apply_filters').addEventListener('click', () => {
    if (!cachedData) return; // počkáme, až jsou data načtena

    // odstraníme starou vrstvu
    if (geoJsonLayer) map.removeLayer(geoJsonLayer);

    // vytvoříme novou vrstvu žlutě
    geoJsonLayer = L.geoJSON(cachedData, {
        style: { color: 'yellow', fillColor: 'yellow', weight: 2, fillOpacity: 0.5 },
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
            radius: 6,
            color: 'yellow',
            fillColor: 'yellow',
            fillOpacity: 0.8
        }),
        onEachFeature: function(feature, layer) {
            let popupContent = "<b>" + (feature.properties.name || "ID: " + feature.id) + "</b>";
            layer.bindPopup(popupContent);
        }
    }).addTo(map);

    console.log("MAPA NAHRANA žlutě po stisku tlačítka");
});