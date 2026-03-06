// Path relative to your HTML file
const geojsonPath = 'zpracovani_dat\\main\\mapa.geojson';


fetch(geojsonPath)
    .then(response => response.json())
    .then(data => {
        // Extract all 'naz_obec'
        const obce = data.features.map(f => f.properties.naz_obec);

        console.log("Number of obce:", obce.length);
        console.log(obce);

        // Example: populate dropdown
        const list = document.getElementById("location_list");
        obce.forEach(obec => {
            const item = document.createElement("div");
            item.className = "dropdown_item";
            item.textContent = obec;

            list.appendChild(item);
        });
    })
    .catch(err => console.error("Error loading GeoJSON:", err));

const list = document.getElementById("location_list");


const search = document.getElementById("location_search");


search.addEventListener("input", function() {

    const value = search.value.toLowerCase();
    const items = document.querySelectorAll(".dropdown_item");

    items.forEach(item => {

        if(item.textContent.toLowerCase().includes(value)){
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }

    });

});

list.addEventListener("click", function(e) {

    if(e.target.classList.contains("dropdown_item")){
        search.value = e.target.textContent;
    }

});


const copy_texts = document.querySelectorAll(".copy_text");
copy_texts.forEach(copyText => {
    copyText.addEventListener("click", () => {
        const number = copyText.textContent.replace(/^tel:\s*/, "").replace(/^email:\s*/, "").replace(/^adresa:\s*/, "");
        navigator.clipboard.writeText(number)
            .then(() => {
                alert("Text copied to clipboard!");
            })
        .catch(err => {
            console.error("Could not copy text: ", err);
        });
    });
});