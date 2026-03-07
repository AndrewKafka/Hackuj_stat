const cenaInput = document.getElementById('cena_nemovitosti');
const rozlohaInput = document.getElementById('rozloha_text');

fetch('zpracovani_dat/main/mapa.geojson')
  .then(response => response.json())
  .then(geoData => {
    // ověření, že GeoJSON má data
    if (!geoData.features || geoData.features.length === 0) {
        console.error('GeoJSON nemá žádné features.');
        return;
    }

    // získáme všechny čísla cena_za_m2
    const cenyZaM2 = geoData.features
        .map(f => Number(f.properties["Cena za m2"]))
        .filter(v => !isNaN(v));

    if (cenyZaM2.length === 0) {
        console.error('GeoJSON neobsahuje platné hodnoty cena_za_m2.');
        return;
    }

    const minCenaZaM2 = Math.min(...cenyZaM2);

    // --- Event listener pro cenu ---
    cenaInput.addEventListener('input', () => {
        const cena = Number(cenaInput.value);
        if (cena > 0 && !isNaN(minCenaZaM2)) {
            const maxRozloha = Math.floor(cena / minCenaZaM2);
            rozlohaInput.max = maxRozloha;
            rozlohaInput.placeholder = `max: ${maxRozloha} m²`;
            if (rozlohaInput.value > maxRozloha) rozlohaInput.value = maxRozloha;

            console.log(`Zadaná cena: ${cena} Kč`);
            console.log(`Maximální možná rozloha: ${maxRozloha} m²`);
        } else {
            rozlohaInput.removeAttribute('max');
            rozlohaInput.placeholder = '1000000';
            console.log('Cena nebyla zadána nebo je 0 / minCenaZaM2 neplatná.');
        }
    });
    // --- Event listener pro rozlohu ---
    rozlohaInput.addEventListener('input', () => {
        const rozloha = Number(rozlohaInput.value);
        
        // Pokud máme zadanou rozlohu a známe minimální cenu za m2
        if (rozloha > 0 && !isNaN(minCenaZaM2)) {
            // Výpočet: Minimální rozpočet potřebný pro tuto rozlohu
            const minPotrebnaCena = Math.ceil(rozloha * minCenaZaM2);
            
            // Nastavíme minimum pro input ceny (volitelné, záleží na UX)
            cenaInput.min = minPotrebnaCena;
            
            // Pokud je aktuální cena nižší než minimum pro tuto rozlohu, upozorníme nebo upravíme
            if (Number(cenaInput.value) < minPotrebnaCena && cenaInput.value !== "") {
                // Možnost A: Automaticky navýšit cenu (agresivní UX)
                // cenaInput.value = minPotrebnaCena; 
                
                // Možnost B: Jen vizuální placeholder/nápověda
                console.warn(`Při této rozloze začínají ceny na: ${minPotrebnaCena} Kč`);
            }

            console.log(`Zadaná rozloha: ${rozloha} m²`);
            console.log(`Minimální cena pro tuto plochu: ${minPotrebnaCena} Kč`);
            cenaInput.placeholder = minPotrebnaCena;
        } else {
            cenaInput.placeholder = '1000000';
            cenaInput.removeAttribute('min');
        }
    });
  })
  .catch(err => console.error('Chyba při načítání GeoJSON:', err));