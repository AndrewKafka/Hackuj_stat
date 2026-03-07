/**
 * Logika pro výpočet kombinovaného indexu s využitím existující funkce renderMap()
 */

document.querySelector('.final_index_box').addEventListener('click', function() {
    if (!cachedData) {
        console.error("Data ještě nejsou načtena.");
        return;
    }

    // 1. Definice mapování checkboxů na názvy vlastností v GeoJSONu
    const checkboxMap = {
        'index_ceny_bydleni_checkbox': 'Index ceny',
        'index_kvality_ovzdusi_checkbox': 'Kvalita ovzduší',
        'Ekonomicky_index_checkbox': 'Ekonomický index',
        'index_bezpecnosti_checkbox': 'Index bezpečnosti'
    };

    // 2. Zjištění, které indexy uživatel vybral
    const activeAttributes = [];
    for (const [id, propertyName] of Object.entries(checkboxMap)) {
        if (document.getElementById(id).checked) {
            activeAttributes.push(propertyName);
        }
    }

    if (activeAttributes.length === 0) {
        alert("Prosím, vyberte alespoň jeden index pro výpočet.");
        return;
    }

    // 3. VÝPOČET: Projdeme všechny prvky v cachedData a uložíme průměr do nové property
    let celkovySoucetVsech = 0;
    let pocetPrvku = 0;

    cachedData.features.forEach(feature => {
        let sum = 0;
        let count = 0;

        activeAttributes.forEach(attr => {
            const val = feature.properties[attr];
            if (val != null) {
                sum += val;
                count++;
            }
        });

        // Uložíme vypočítaný průměr přímo do objektu v paměti
        const prumer = count > 0 ? (sum / count) : 0;
        feature.properties["vypocitany_kombinovany_index"] = prumer;

        celkovySoucetVsech += prumer;
        pocetPrvku++;
    });

    // 4. AKTUALIZACE UI: Zobrazení průměru v tlačítku (volitelné)
    const celkovyPrumer = pocetPrvku > 0 ? (celkovySoucetVsech / pocetPrvku).toFixed(2) : 0;
    document.getElementById("vysledek").textContent = celkovyPrumer;

    // 5. REUSE: Nastavíme selectedAttribute na náš nový klíč a zavoláme vaši původní funkci
    selectedAttribute = "vypocitany_kombinovany_index";
    
    console.log("Spouštím renderMap() pro kombinovaný index...");
    renderMap();
});