function getUserInputLocations() {
    const inputs = document.querySelectorAll(".panel_section input.location_search")

    if (inputs.length < 2) {
        console.error("Nebyly nalezeny oba vstupy pro lokace.")
        return null
    }

    const homeName = inputs[0].value.trim()
    const workName = inputs[1].value.trim()

    if (!homeName && !workName) {
        alert("Prosím vyplňte alespoň obec bydliště nebo pracoviště.")
        return null
    }

    return { homeName, workName }
}

function calculateCentroidDistance(homeFeature, workFeature) {
    const pointHome = turf.centroid(homeFeature)
    const pointWork = turf.centroid(workFeature)

    const distance = turf.distance(pointHome, pointWork, { units: "kilometers" })

    return {
        pointHome,
        pointWork,
        distance
    }
}

function applyDistanceFilter(pointWork, distance) {
    window.filterCenter = pointWork
    window.filterRadius = distance

    console.log(`Vzdálenost nastavena na: ${window.filterRadius.toFixed(2)} km`)
}

function processLocations() {
    const locations = getUserInputLocations()
    if (!locations) return

    if (!window.cachedData || !window.cachedData.features) {
        console.error("GeoJSON data nejsou načtená.")
        return
    }

    const { homeName, workName } = locations

    const homeFeature = window.cachedData.features.find(f =>
        f.properties.naz_obec?.toLowerCase() === homeName.toLowerCase()
    )

    const workFeature = window.cachedData.features.find(f =>
        f.properties.naz_obec?.toLowerCase() === workName.toLowerCase()
    )

    if (homeFeature && workFeature) {
        const { pointWork, distance } = calculateCentroidDistance(homeFeature, workFeature)
        applyDistanceFilter(pointWork, distance)
        return
    }

    alert("Jedna nebo obě obce nebyly v databázi nalezeny. Zkontrolujte diakritiku.")
}

function processFilterRadius() {
    const dobaDojezduInput = document.getElementById("doba_dojezdu")
    const timeDistanceInput = (Number(dobaDojezduInput?.value || 0) / 60) * 50

    const locations = getUserInputLocations()
    if (!locations) return

    if (!window.cachedData || !window.cachedData.features) {
        console.error("GeoJSON data nejsou načtená.")
        return
    }

    const { homeName, workName } = locations

    const homeFeature = window.cachedData.features.find(f =>
        f.properties.naz_obec?.toLowerCase() === homeName.toLowerCase()
    )

    const workFeature = window.cachedData.features.find(f =>
        f.properties.naz_obec?.toLowerCase() === workName.toLowerCase()
    )

    if (homeFeature && workFeature) {
        const { pointWork, distance } = calculateCentroidDistance(homeFeature, workFeature)

        if (timeDistanceInput < distance) {
            applyDistanceFilter(pointWork, distance)
        } else {
            applyDistanceFilter(pointWork, timeDistanceInput)
        }
        return
    }

    if (!homeFeature && workFeature) {
        applyDistanceFilter(turf.centroid(workFeature), timeDistanceInput)
        return
    }

    alert("Jedna nebo obě obce nebyly v databázi nalezeny. Zkontrolujte diakritiku.")
}

document.addEventListener("DOMContentLoaded", () => {
    const applyButton = document.getElementById("apply_filters")

    if (!applyButton) {
        console.error("Tlačítko apply_filters nebylo nalezeno.")
        return
    }

    applyButton.addEventListener("click", () => {
        processFilterRadius()

        if (window.renderMap) {
            window.renderMap()
        }
    })
})