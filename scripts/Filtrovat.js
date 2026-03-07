// Načtení GeoJSON souboru
async function vypocitejVzdalenostObci(kodA, kodB) {
    const response = await fetch('zpracovani_dat/main/mapa_100.geojson');
    const data = await response.json();

    // 1. Najdeme konkrétní obce v datasetu podle kódu (nebo jména)
    const obecA = data.features.find(f => f.properties.naz_obec === kodA);
    const obecB = data.features.find(f => f.properties.naz_obec === kodB);

    if (!obecA || !obecB) {
        console.error("Jedna z obcí nebyla v datasetu nalezena.");
        return;
    }

    // 2. Výpočet středů (centroidů) polygonů
    const stredA = turf.centroid(obecA);
    const stredB = turf.centroid(obecB);

    // 3. Výpočet samotné vzdálenosti (vzdušnou čarou)
    const vzdalenost = turf.distance(stredA, stredB, {units: 'kilometers'});

    console.log(`Vzdálenost mezi ${obecA.properties.naz_obec} a ${obecB.properties.naz_obec} je ${vzdalenost.toFixed(2)} km.`);
    return vzdalenost;
}

document.getElementById('apply_filters').addEventListener('click', async () => {
    const inputs = document.querySelectorAll('.panel_section input.location_search');

    // 1. Načtení názvů z inputů
    const homeName = inputs[0].value.trim(); 
    const workName = inputs[1].value.trim();

    if (!homeName || !workName) {
        alert("Prosím vyplňte obě pole (Bydliště i Práci).");
        return;
    }

    // 2. Najdeme objekty (Features) v cachedData podle jména
    const homeFeature = cachedData.features.find(f => 
        f.properties.naz_obec.toLowerCase() === homeName.toLowerCase()
    );
    const workFeature = cachedData.features.find(f => 
        f.properties.naz_obec.toLowerCase() === workName.toLowerCase()
    );

    if (homeFeature && workFeature) {
        // 3. Výpočet vzdálenosti mezi těmito dvěma body
        const pointHome = turf.centroid(homeFeature);
        const pointWork = turf.centroid(workFeature);
        
        // Nastavíme globální proměnné, které používá renderMap()
        filterCenter = pointWork; 
        filterRadius = turf.distance(pointHome, pointWork, {units: 'kilometers'});

        console.log(`Vzdálenost nastavena na: ${filterRadius.toFixed(2)} km`);

        // 4. Zavoláme renderMap, která nyní použije filterCenter a filterRadius
        renderMap();
        
    } else {
        alert("Jedna nebo obě obce nebyly v databázi nalezeny. Zkontrolujte diakritiku.");
    }
});

function zobrazObceVOkruhu(jmenoPrace, maxVzdalenost) {
    if (!cachedData) return;

    // 1. Najdeme objekt výchozí obce (práce), abychom znali její souřadnice
    const workObecFeature = cachedData.features.find(f => 
        f.properties.naz_obec.toLowerCase() === jmenoPrace.toLowerCase()
    );

    if (!workObecFeature) return console.error("Obec práce nebyla nalezena.");

    const stredPrace = turf.centroid(workObecFeature);

    // 2. Odstraníme aktuální vrstvu z mapy
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }

    // 3. Vytvoříme novou vrstvu, která filtruje data
    geoJsonLayer = L.geoJSON(cachedData, {
        filter: function(feature) {
            const stredAktualni = turf.centroid(feature);
            const d = turf.distance(stredPrace, stredAktualni, {units: 'kilometers'});
            
            // Ponechá pouze polygony, které jsou blíž než zadaný limit
            return d <= maxVzdalenost;
        },
        style: function(feature) {
            // Použije vaše barvy podle indexů
            const val = feature.properties?.[selectedAttribute];
            return {
                fillColor: getColorByIndex(val),
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            };
        },
        onEachFeature: function(feature, layer) {
            // Zde ponechte svou stávající logiku onEachFeature (hover, click, panely)
        }
    }).addTo(map);

    // 4. Automaticky mapu vycentruje na viditelné polygony
    const bounds = geoJsonLayer.getBounds();
    if (bounds.isValid()) {
        map.fitBounds(bounds);
    }
}