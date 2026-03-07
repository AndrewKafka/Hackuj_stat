import { getMapa } from "./store.js"

const cenaInput = document.getElementById('cena_nemovitosti')
const rozlohaInput = document.getElementById('rozloha_text')

export function initUpravaCen() {
    const geoData = getMapa()

    if (!geoData || !geoData.features || geoData.features.length === 0) {
        console.error('GeoJSON nemá žádné features.')
        return
    }

    const cenyZaM2 = geoData.features
        .map(f => Number(f.properties["Cena za m2"]))
        .filter(v => !isNaN(v))

    if (cenyZaM2.length === 0) {
        console.error('GeoJSON neobsahuje platné hodnoty Cena za m2.')
        return
    }

    const minCenaZaM2 = Math.min(...cenyZaM2)

    cenaInput.addEventListener('input', () => {
        const cena = Number(cenaInput.value)

        if (cena > 0 && !isNaN(minCenaZaM2)) {
            const maxRozloha = Math.floor(cena / minCenaZaM2)
            rozlohaInput.max = maxRozloha
            rozlohaInput.placeholder = `max: ${maxRozloha} m²`

            if (Number(rozlohaInput.value) > maxRozloha) {
                rozlohaInput.value = maxRozloha
            }

            console.log(`Zadaná cena: ${cena} Kč`)
            console.log(`Maximální možná rozloha: ${maxRozloha} m²`)
        } else {
            rozlohaInput.removeAttribute('max')
            rozlohaInput.placeholder = '1000000'
            console.log('Cena nebyla zadána nebo je 0 / minCenaZaM2 neplatná.')
        }
    })
}
