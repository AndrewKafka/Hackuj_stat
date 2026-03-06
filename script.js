const sidePanel = document.getElementById('side_panel');
const toggleBtn = document.getElementById('toggle_panel');
const mapDiv = document.getElementById('main_map');
const offset = "-240px";


toggleBtn.addEventListener('click', () => {
    sidePanel.classList.toggle('collapsed');
    
    if(sidePanel.classList.contains('collapsed')){
        // collapsed → leave 40px visible
        mapDiv.style.marginLeft = offset;
    } else {
        mapDiv.style.marginLeft = '0px'; // full sidebar width
    }

    // refresh leaflet map
    setTimeout(() => map.invalidateSize(), 310);
});


