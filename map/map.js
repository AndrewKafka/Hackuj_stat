var map = L.map('main_map').setView([50.08804, 14.42076], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

// L.marker([50.08804, 14.42076]).addTo(map)
//     .bindPopup("Hello from Prague!")
//     .openPopup();

const sidePanel = document.getElementById('side_panel');
const toggleBtn = document.getElementById('toggle_panel');
const mapDiv = document.getElementById('main_map');

toggleBtn.addEventListener('click', () => {
    sidePanel.classList.toggle('collapsed');
    
    if(sidePanel.classList.contains('collapsed')){
        // collapsed → leave 40px visible
        mapDiv.style.marginLeft = '-240px';
        console.log('collapsed');
    } else {
        mapDiv.style.marginLeft = '0px'; // full sidebar width
    }

    // refresh leaflet map
    setTimeout(() => map.invalidateSize(), 310);
});