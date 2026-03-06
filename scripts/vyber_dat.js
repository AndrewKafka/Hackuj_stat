// Funkce pro načtení GeoJSON a naplnění dropdown menu
async function loadDropdown() {
  try {
    // Načteme GeoJSON soubor
    const response = await fetch('vysledna_mapa.geojson');
    const geojson = await response.json();

    // Předpokládáme, že pracujeme s prvním featurem
    const feature = geojson.features[0];
    const props = feature.properties;

    // Najdeme všechny klíče za "okres"
    const keys = Object.keys(props);
    const indexOkres = keys.indexOf('okres');
    const dropdownKeys = keys.slice(indexOkres + 1);

    // Vybereme select element z divu
    const select = document.getElementById('dataset-select');

    // Naplníme dropdown
    dropdownKeys.forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.text = key;
      select.appendChild(option);
    });

  } catch (error) {
    console.error('Chyba při načítání GeoJSON:', error);
  }
}

// Spustíme po načtení DOM
window.addEventListener('DOMContentLoaded', loadDropdown);