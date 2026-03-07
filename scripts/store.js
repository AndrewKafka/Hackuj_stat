let mapa = null

export async function initMapa() {
    if (!mapa) {
        console.log("Načítám GeoJSON data...")
        const response = await fetch('./zpracovani_dat/main/mapa.geojson')
        if (!response.ok) throw new Error("Chyba při načítání GeoJSONu")
        mapa = await response.json()
    }
    return mapa
}

export function getMapa() {
    return mapa
}

export function updateMapa(novaData) {
    console.log("Aktualizuji GeoJSON data...")
    mapa = novaData
}