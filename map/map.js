var map = L.map('main_map').setView([50.08804, 14.42076], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

// L.marker([50.08804, 14.42076]).addTo(map)
//     .bindPopup("Hello from Prague!")
//     .openPopup();

