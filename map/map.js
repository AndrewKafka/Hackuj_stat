// Initialize the map
const map = L.map('main_map').setView([50.0, 15.0], 7);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to get color based on numeric index property
function getColorByIndex(index) {
    if (index == null) index = 0;        // default if missing
    index = Math.min(Math.max(index, 0), 1); // clamp between 0 and 1

    // red decreases, green increases
    const r = Math.round(255 * (1 - index)); // red = 255 → 0
    const g = Math.round(255 * index);       // green = 0 → 255
    const b = 0;                              // blue = 0

    return `rgb(${r},${g},${b})`;
}

// Load and display GeoJSON
fetch('prevedena_mapa.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            // Style for polygons/lines
            style: function(feature) {
                const index = feature.properties?.index;
                return {
                    color: getColorByIndex(index),
                    weight: 2,
                    opacity: 0.65,
                    fillOpacity: 0.4
                };
            },
            // Style for points
            pointToLayer: function(feature, latlng) {
                const index = feature.properties?.index;
                return L.circleMarker(latlng, {
                    radius: 6,
                    color: getColorByIndex(index),
                    fillColor: getColorByIndex(index),
                    fillOpacity: 0.8
                });
            },
            // Popups
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(feature.properties.name);
                } else if (feature.id) {
                    layer.bindPopup("Feature ID: " + feature.id);
                }
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
