

import { getMapa, updateMapa } from "./store.js"

export function updateFinalIndex() {
    const ceny = document.getElementById("index_ceny_bydleni_checkbox")?.checked
    const kvalita = document.getElementById("index_kvality_ovzdusi_checkbox")?.checked
    const ekonomicky = document.getElementById("Ekonomicky_index_checkbox")?.checked
    const bezpecnost = document.getElementById("index_bezpecnosti_checkbox")?.checked

    const data = getMapa()

    if (!data || !data.features) {
        console.error("Data mapy nejsou načtená")
        return
    }

    data.features.forEach(feature => {
        const hodnoty = []

        if (ceny && feature.properties["Index ceny"] != null) {
            hodnoty.push(Number(feature.properties["Index ceny"]))
        }

        if (kvalita && feature.properties["Kvalita ovzduší"] != null) {
            hodnoty.push(Number(feature.properties["Kvalita ovzduší"]))
        }

        if (ekonomicky && feature.properties["Ekonomický index"] != null) {
            hodnoty.push(Number(feature.properties["Ekonomický index"]))
        }

        if (bezpecnost && feature.properties["Index bezpečnosti"] != null) {
            hodnoty.push(Number(feature.properties["Index bezpečnosti"]))
        }

        feature.properties.index = hodnoty.length
            ? hodnoty.reduce((a, b) => a + b, 0) / hodnoty.length
            : null
    })

    updateMapa(data)
    window.selectedAttribute = "index"

    if (window.renderMap) {
        window.renderMap()
    }

    console.log("Index přepočítán")
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("prepocet_index")

    if (!btn) {
        console.error("Tlačítko prepocet_index nebylo nalezeno")
        return
    }

    btn.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("klik na Kombinovaný Index")
        updateFinalIndex()
    })
})