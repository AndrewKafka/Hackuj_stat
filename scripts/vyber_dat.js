const datasets = [
    "Prague_Cycle_Paths.geojson",
    "Nature_Reserves.json",
    "City_Boundaries.geojson"
];

const selectMenu = document.getElementById('dataset-select');

datasets.forEach(fileName => {
    let option = document.createElement('option');
    option.value = fileName; // The actual file path/name
    option.textContent = fileName.replace('.geojson', '').replace('_', ' '); // The readable name
    selectMenu.appendChild(option);
});

// Listener to detect when a user selects a different dataset
selectMenu.addEventListener('change', (event) => {
    const selectedFile = event.target.value;
    if (selectedFile) {
        console.log("Loading:", selectedFile);
        // Call your map loading function here, e.g., loadLayer(selectedFile);
    }
});

// Crucial: Stop map zoom/drag when interacting with the dropdown
L.DomEvent.disableClickPropagation(document.getElementById('vyber_datasetu'));