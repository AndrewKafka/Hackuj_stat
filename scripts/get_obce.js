import { getMapa } from "./store.js"

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function loadDropdown() {
    try {
        const geojson = getMapa()

        if (!geojson || !geojson.features || geojson.features.length === 0) {
            console.error("GeoJSON nemá žádné features.")
            return
        }

        const feature = geojson.features[0]
        const props = feature.properties
        const keys = Object.keys(props)
        const indexSkip = keys.indexOf("vymera")
        const dropdownKeys = keys.slice(indexSkip + 1)

        const select = document.querySelector(".dataset-options")
        const selectedDiv = document.querySelector(".custom-select .selected")
        const customSelect = document.querySelector(".custom-select")
        const panel = document.getElementById("panel_data")

        if (!select || !selectedDiv || !customSelect) {
            console.error("Chybí potřebné elementy pro dropdown.")
            return
        }

        select.innerHTML = ""

        dropdownKeys.forEach(key => {
            if (!key.includes("za m2")) {
                key = capitalize(key);
                const option = document.createElement("div")
                option.className = "option"
                option.textContent = key
                option.dataset.value = key
                select.appendChild(option)

                option.addEventListener("click", () => {
                    selectedDiv.textContent = key
                    window.selectedAttribute = key
                    renderMap()
                    customSelect.classList.remove("active")
                })
            }
        })

        selectedDiv.addEventListener("click", () => {
            customSelect.classList.toggle("active")

            if (panel) {
                const isHidden = panel.style.transform === "translateY(105%)"
            }
        })

        document.addEventListener("click", e => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove("active")
            }
        })

        if (dropdownKeys.length > 0) {
            window.selectedAttribute = dropdownKeys[0]
            selectedDiv.textContent = window.selectedAttribute
        }

        window.cachedData = geojson
        renderMap()

    } catch (error) {
        console.error("Chyba při načítání GeoJSON:", error)
    }
}