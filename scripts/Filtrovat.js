const geoData = {/* váš GeoJSON */};

// získáme všechny hodnoty cena_za_m2 z datasetu
const cenyZaM2 = geoData.features.map(f => f.properties.cena_za_m2);
const minCenaZaM2 = Math.min(...cenyZaM2);

const cenaInput = document.getElementById('cena_nemovitosti');
const rozlohaInput = document.getElementById('rozloha_text');

// Při zadání ceny se upraví max rozloha a placeholder
cenaInput.addEventListener('input', () => {
    const cena = Number(cenaInput.value);
    if (cena > 0) {
        const maxRozloha = Math.floor(cena / minCenaZaM2);
        rozlohaInput.max = maxRozloha;
        rozlohaInput.placeholder = `max: ${maxRozloha} m²`;
        if (rozlohaInput.value > maxRozloha) {
            rozlohaInput.value = maxRozloha;
        }
    } else {
        rozlohaInput.removeAttribute('max');
        rozlohaInput.placeholder = '1000000';
    }
});

// Při zadání rozlohy se upraví min cena a placeholder
rozlohaInput.addEventListener('input', () => {
    const rozloha = Number(rozlohaInput.value);
    if (rozloha > 0) {
        const minCena = Math.ceil(rozloha * minCenaZaM2);
        cenaInput.min = minCena;
        cenaInput.placeholder = `min: ${minCena} Kč`;
        if (cenaInput.value < minCena) {
            cenaInput.value = minCena;
        }
    } else {
        cenaInput.removeAttribute('min');
        cenaInput.placeholder = '1000000';
    }
});