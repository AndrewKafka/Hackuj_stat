// Initialize the map
const map = L.map('main_map').setView([50.0, 15.0], 7);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load and display GeoJSON
fetch('datasets/kraje.geojson')
    .then(response => response.json())
    .then(data => {
        const geojsonLayer = L.geoJSON(data, {
            style: {
                color: "#ff7800",
                weight: 2,
                opacity: 0.65
            },
            onEachFeature: (feature, layer) => {
                // Show popup for feature properties
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(feature.properties.name);
                } else if (feature.id) {
                    layer.bindPopup("Feature ID: " + feature.id);
                }
            },
            pointToLayer: function(feature, latlng) {
                // If points, display as circle markers
                return L.circleMarker(latlng, {
                    radius: 6,
                    color: "#ff0000",
                    fillOpacity: 0.8
                });
            }
        }).addTo(map);

        // Zoom map to fit all GeoJSON features
        map.fitBounds(geojsonLayer.getBounds());
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
