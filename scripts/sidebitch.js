const locations = [
    "Prague",
    "Brno",
    "Ostrava",
    "Plzeň",
    "Olomouc",
    "Liberec",
    "České Budějovice",
    "Hradec Králové",
    "Pardubice",
    "Zlín",
    "Karlovy Vary"
];

const list = document.getElementById("location_list");

locations.forEach(location => {

    const item = document.createElement("div");

    item.className = "dropdown_item";
    item.textContent = location;

    list.appendChild(item);

});


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