import { getMapa } from "./store.js"

export function initSidebitch() {
    const data = getMapa()

    if (!data || !data.features || data.features.length === 0) {
        console.error("Mapa ještě není načtená nebo nemá features.")
        return
    }

    const obce = data.features
        .map(f => f.properties.naz_obec)
        .filter(obec => obec)

    console.log("Number of obce:", obce.length)
    console.log(obce)

    const dropdowns = document.querySelectorAll(".location_list")
    dropdowns.forEach(list => {
        list.innerHTML = ""

        obce.forEach(obec => {
            const item = document.createElement("div")
            item.className = "dropdown_item"
            item.textContent = obec
            list.appendChild(item)
        })
    })

    const searches = document.querySelectorAll(".location_search")

    searches.forEach((search, index) => {
        const dropdown = dropdowns[index]

        if (!dropdown) {
            return
        }

        search.addEventListener("input", function () {
            const value = search.value.toLowerCase()
            const items = dropdown.querySelectorAll(".dropdown_item")

            items.forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(value)
                    ? "block"
                    : "none"
            })
        })

        dropdown.addEventListener("click", function (e) {
            if (e.target.classList.contains("dropdown_item")) {
                search.value = e.target.textContent
            }
        })
    })

    const copy_texts = document.querySelectorAll(".copy_text")
    copy_texts.forEach(copyText => {
        copyText.addEventListener("click", () => {
            const text = copyText.textContent
                .replace(/^tel:\s*/i, "")
                .replace(/^email:\s*/i, "")
                .replace(/^adresa:\s*/i, "")

            navigator.clipboard.writeText(text)
                .then(() => alert("Text copied to clipboard!"))
                .catch(err => console.error("Could not copy text: ", err))
        })
    })
}