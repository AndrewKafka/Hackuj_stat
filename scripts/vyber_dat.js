// Function to calculate the combined index
function updateFinalIndex() {
    // Example: calculate based on checkboxes
    const ceny = document.getElementById("index_ceny_bydleni_checkbox").checked ? true : false;
    const kvalita = document.getElementById("index_kvality_ovzdusi_checkbox").checked ? true : false;
    const ekonomicky = document.getElementById("Ekonomicky_index_checkbox").checked ? true : false;
    const bezpecnost = document.getElementById("index_bezpecnosti_checkbox").checked ? true : false;


    // Update the displayed value
    document.getElementById("vysledek").textContent = "";
}