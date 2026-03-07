import "../scripts/Filtrovat.js"
import { initMapa, getMapa } from "../scripts/store.js"
import { initSidebitch } from "../scripts/sidebitch.js"
import { initUpravaCen } from "../scripts/uprava_cen.js"
import { loadDropdown } from "../scripts/get_obce.js"
import "../scripts/vyber_dat.js"

window.selectedAttribute = null
window.cachedData = null
window.filterCenter = null
window.filterRadius = null
window.compareSlot = 1

let geoJsonLayer = null

const mapElement = document.getElementById("main_map")
const map = L.map(mapElement).setView([50.0, 15.0], 7)

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map)

function fillComparison(feature, slot) {
    const p = feature.properties

    const okres = document.getElementById("okres_name" + slot)
    if (okres) {
        okres.textContent = p.naz_obec
    }

    updateSlider("index_zivota" + slot, p.index || 0)
    updateSlider("index_ceny_bydleni" + slot, p["Index ceny"] || 0)
    updateSlider("index_kvality_ovzdusi" + slot, p["Kvalita ovzduší"] || 0)
    updateSlider("Ekonomicky_index" + slot, p["Ekonomický index"] || 0)
    updateSlider("cigani" + slot, p["Index bezpečnosti"] || 0)
}

function updateSlider(id, value) {
    const slider = document.getElementById(id)
    if (!slider) return

    if (value == null || value === 0) {
        slider.style.width = "100%"
        slider.classList.add("empty")
        slider.style.backgroundColor = "#ddd"
    } else {
        const percent = Math.min(Math.max(value, 0), 1) * 100
        slider.style.width = percent + "%"
        slider.classList.remove("empty")
        slider.style.backgroundColor = "#007bff"
    }
}

function getColorByIndex(index, min = 0, max = 1) {
    if (index == null) return "rgb(150,150,150)"
    if (max === min) return "rgb(127,127,0)"

    const normalizedIndex = (index - min) / (max - min)
    const t = Math.min(Math.max(normalizedIndex, 0), 1)

    const r = Math.round(255 * (1 - t))
    const g = Math.round(255 * t)
    const b = 0

    return `rgb(${r},${g},${b})`
}

function renderMap() {
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer)
    }

    if (!window.cachedData || !window.selectedAttribute) return

    const filteredFeatures = window.cachedData.features.filter(feature => {
        if (!window.filterCenter || !window.filterRadius) return true

        const currentPoint = turf.centroid(feature)
        const d = turf.distance(window.filterCenter, currentPoint, { units: "kilometers" })

        return d <= window.filterRadius
    })

    let min = Infinity
    let max = -Infinity

    filteredFeatures.forEach(feature => {
        const val = feature.properties?.[window.selectedAttribute]
        if (val == null) return
        if (val < min) min = val
        if (val > max) max = val
    })

    if (min === Infinity) min = 0
    if (max === -Infinity) max = 1

    const filteredData = {
        type: "FeatureCollection",
        features: filteredFeatures
    }

    geoJsonLayer = L.geoJSON(filteredData, {
        style: function (feature) {
            const val = feature.properties?.[window.selectedAttribute]
            return {
                color: getColorByIndex(val, min, max),
                weight: 2,
                opacity: 0.65,
                fillOpacity: 0.4,
                fillColor: getColorByIndex(val, min, max)
            }
        },

        pointToLayer: function (feature, latlng) {
            const val = feature.properties?.[window.selectedAttribute]
            return L.circleMarker(latlng, {
                radius: 6,
                fillColor: getColorByIndex(val, min, max),
                color: "#fff",
                weight: 1,
                fillOpacity: 0.8
            })
        },

        onEachFeature: function (feature, layer) {
            layer.on("click", function () {
                fillComparison(feature, "")
                fillComparison(feature, window.compareSlot)

                if (window.compareSlot === 1) {
                    window.compareSlot = 2
                } else {
                    window.compareSlot = 1
                }
            })

            layer.on("mouseover", function () {
                layer.setStyle({ weight: 3, fillOpacity: 0.7 })
            })

            layer.on("mouseout", function () {
                geoJsonLayer.resetStyle(layer)
            })
        }
    }).addTo(map)

    if (window.filterCenter && window.filterRadius) {
        const bounds = geoJsonLayer.getBounds()
        if (bounds.isValid()) {
            map.fitBounds(bounds)
        }
    }
}

window.renderMap = renderMap

async function start() {
    await initMapa()

    window.cachedData = getMapa()

    initUpravaCen()
    initSidebitch()
    loadDropdown()
}

start()