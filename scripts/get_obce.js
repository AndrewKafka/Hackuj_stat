async function loadDropdown() {
    try {
        const response = await fetch('zpracovani_dat/main/mapa_100.geojson');
        const geojson = await response.json();

        const feature = geojson.features[0];
        const props = feature.properties;
        const keys = Object.keys(props);
        const indexSkip = keys.indexOf('vymera');
        const dropdownKeys = keys.slice(indexSkip + 1);

        const select = document.querySelector('.dataset-options');
        const selectedDiv = document.querySelector('.custom-select .selected');

        // populate options
        dropdownKeys.forEach(key => {
            const option = document.createElement('div');
            option.className = 'option';
            option.textContent = key;
            option.dataset.value = key;
            select.appendChild(option);

            option.addEventListener('click', () => {
                selectedDiv.textContent = key;
                selectedAttribute = key;     // update global variable
                renderMap();                // redraw map with new attribute
                document.querySelector('.custom-select').classList.remove('active');
            });
        });

        // toggle dropdown
        selectedDiv.addEventListener('click', () => {
            document.querySelector('.custom-select').classList.toggle('active');
        });

        // close dropdown if clicked outside
        document.addEventListener('click', (e) => {
            if (!document.querySelector('.custom-select').contains(e.target)) {
                document.querySelector('.custom-select').classList.remove('active');
            }
        });

        // Set initial selectedAttribute and render map for first time
        selectedAttribute = dropdownKeys[0];
        selectedDiv.textContent = selectedAttribute;

        cachedData = geojson;      // store the data
        renderMap();               // draw map for the first time

    } catch (error) {
        console.error('Chyba při načítání GeoJSON:', error);
    }
}

window.addEventListener('DOMContentLoaded', loadDropdown);