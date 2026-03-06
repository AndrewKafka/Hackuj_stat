// Path relative to your HTML file
const geojsonPath = 'zpracovani_dat\\main\\mapa.geojson';

fetch(geojsonPath)
    .then(response => response.json())
    .then(data => {
        const obce = data.features.map(f => f.properties.naz_obec);

        console.log("Number of obce:", obce.length);
        console.log(obce);

        // Populate all dropdowns
        const dropdowns = document.querySelectorAll(".location_list");
        dropdowns.forEach(list => {
            obce.forEach(obec => {
                const item = document.createElement("div");
                item.className = "dropdown_item";
                item.textContent = obec;
                list.appendChild(item);
            });
        });

        // Add search functionality for each input
        const searches = document.querySelectorAll(".location_search");

        searches.forEach((search, index) => {
            const dropdown = dropdowns[index]; // tie input to its dropdown

            search.addEventListener("input", function() {
                const value = search.value.toLowerCase();
                const items = dropdown.querySelectorAll(".dropdown_item");

                items.forEach(item => {
                    item.style.display = item.textContent.toLowerCase().includes(value)
                        ? "block"
                        : "none";
                });
            });

            dropdown.addEventListener("click", function(e) {
                if (e.target.classList.contains("dropdown_item")) {
                    search.value = e.target.textContent;
                }
            });
        });
    })
    .catch(err => console.error("Error loading GeoJSON:", err));

// Copy text functionality (unchanged)
const copy_texts = document.querySelectorAll(".copy_text");
copy_texts.forEach(copyText => {
    copyText.addEventListener("click", () => {
        const number = copyText.textContent.replace(/^tel:\s*/, "")
                                           .replace(/^email:\s*/, "")
                                           .replace(/^adresa:\s*/, "");
        navigator.clipboard.writeText(number)
            .then(() => alert("Text copied to clipboard!"))
            .catch(err => console.error("Could not copy text: ", err));
    });
});