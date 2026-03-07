function getUserInputLocations() {
    const inputs = document.querySelectorAll('.panel_section input.location_search');

    const homeName = inputs[0].value.trim();
    const workName = inputs[1].value.trim();

    if (!homeName || !workName) {
        alert("Prosím vyplňte obě pole (Bydliště i Práci).");
        return null;
    }

    return { homeName, workName };
}


function calculateCentroidDistance(homeFeature, workFeature) {
    const pointHome = turf.centroid(homeFeature);
    const pointWork = turf.centroid(workFeature);

    const distance = turf.distance(pointHome, pointWork, { units: 'kilometers' });

    return {
        pointHome,
        pointWork,
        distance
    };
}



function applyDistanceFilter(pointWork, distance) {

    // používá globální proměnné ze scriptu
    filterCenter = pointWork;
    filterRadius = distance;

    console.log(`Vzdálenost nastavena na: ${filterRadius.toFixed(2)} km`);

    // funkce z jiného scriptu
    renderMap();
}


function processLocations() {

    const locations = getUserInputLocations();
    if (!locations) return;

    const { homeName, workName } = locations;

    const homeFeature = cachedData.features.find(f =>
        f.properties.naz_obec.toLowerCase() === homeName.toLowerCase()
    );

    const workFeature = cachedData.features.find(f =>
        f.properties.naz_obec.toLowerCase() === workName.toLowerCase()
    );

    if (homeFeature && workFeature) {

        const { pointHome, pointWork, distance } =
            calculateCentroidDistance(homeFeature, workFeature);

        applyDistanceFilter(pointWork, distance);

    } else {
        alert("Jedna nebo obě obce nebyly v databázi nalezeny. Zkontrolujte diakritiku.");
    }
}

function processFilterRadius() {

    const TimeDistanceInput = (Number(document.getElementById('doba_dojezdu').value)/60)*50;
    const locations = getUserInputLocations();
    if (!locations) return;

    const { homeName, workName } = locations;

    const homeFeature = cachedData.features.find(f =>
        f.properties.naz_obec.toLowerCase() === homeName.toLowerCase()
    );

    const workFeature = cachedData.features.find(f =>
        f.properties.naz_obec.toLowerCase() === workName.toLowerCase()
    );

    if (homeFeature && workFeature) {     
        const { pointHome, pointWork, distance } =
            calculateCentroidDistance(homeFeature, workFeature);

        if (TimeDistanceInput <distance) {
            applyDistanceFilter(pointWork, distance);
        }
        else{
            applyDistanceFilter(pointWork, TimeDistanceInput);
        }
    } else {
        alert("Jedna nebo obě obce nebyly v databázi nalezeny. Zkontrolujte diakritiku.");
    }   
}

document.getElementById('apply_filters').addEventListener('click', processFilterRadius);
