import geopandas as gpd
import pandas as pd
import numpy as np

cesta_obce = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/main/mapa.geojson"
cesta_stanice = "/home/matous/Desktop/Hackujstat/index_ovzdusi/vysledny_index_ovzdusi_2024.gpkg"
cesta_vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/csv_sad_upraveno/ovzdusi.csv"

max_vzdalenost_km = 25
sloupce_latky = ["pm25", "pm10", "no2", "so2"]

limity = {
    "pm25": 25.0,
    "pm10": 40.0,
    "no2": 40.0,
    "so2": 20.0
}

def urci_kategorii(hodnota):
    if pd.isna(hodnota):
        return "bez dat"
    if hodnota <= 25:
        return "vyborne"
    if hodnota <= 50:
        return "dobre"
    if hodnota <= 75:
        return "mirne zhorsene"
    if hodnota <= 100:
        return "zhorsene"
    return "spatne"

def pocet_dostupnych_latek(radek):
    return sum(pd.notna(radek.get(latka)) for latka in sloupce_latky)

obce = gpd.read_file(cesta_obce)
stanice_raw = gpd.read_file(cesta_stanice)

# Klíčová oprava:
# GeoJSON i stanice ber jako longitude, latitude
obce = obce.set_crs("OGC:CRS84", allow_override=True)

stanice_tab = pd.DataFrame(stanice_raw.drop(columns="geometry")).copy()
stanice_tab = stanice_tab.dropna(subset=["zem_delka", "zem_sirka"]).copy()

stanice = gpd.GeoDataFrame(
    stanice_tab,
    geometry=gpd.points_from_xy(stanice_tab["zem_delka"], stanice_tab["zem_sirka"]),
    crs="OGC:CRS84"
)

obce = obce.to_crs("EPSG:5514").copy()
stanice = stanice.to_crs("EPSG:5514").copy()

obce = obce.reset_index(drop=True)
stanice = stanice.reset_index(drop=True)

obce["id_obec"] = obce.index
obce["bod_obce"] = obce.representative_point()
stanice["pocet_latek"] = stanice.apply(pocet_dostupnych_latek, axis=1)

prumery = {
    latka: float(stanice[latka].dropna().mean()) if stanice[latka].notna().any() else np.nan
    for latka in sloupce_latky
}

obce_body = gpd.GeoDataFrame(
    obce[["id_obec", "kod_obec", "naz_obec"]].copy(),
    geometry=obce["bod_obce"],
    crs=obce.crs
)

stanice_min = stanice[["KMPL", "nazev_loka", "pocet_latek", "geometry"] + sloupce_latky].copy()

vnitrni = gpd.sjoin(
    stanice_min,
    obce[["id_obec", "geometry"]],
    how="left",
    predicate="within"
)

vnitrni = vnitrni.dropna(subset=["id_obec"]).copy()

if len(vnitrni) > 0:
    vnitrni["id_obec"] = vnitrni["id_obec"].astype(int)
    body_map = obce_body.set_index("id_obec").geometry

    vnitrni["vzdalenost_bod_m"] = vnitrni.apply(
        lambda r: r.geometry.distance(body_map.loc[r["id_obec"]]),
        axis=1
    )

    vnitrni = vnitrni.sort_values(
        ["id_obec", "pocet_latek", "vzdalenost_bod_m"],
        ascending=[True, False, True]
    ).drop_duplicates("id_obec")

nejblizsi = gpd.sjoin_nearest(
    obce_body,
    stanice_min,
    how="left",
    distance_col="vzdalenost_m"
)

nejblizsi = nejblizsi.sort_values(
    ["id_obec", "vzdalenost_m", "pocet_latek"],
    ascending=[True, True, False]
).drop_duplicates("id_obec")

mapa_vnitrni = {}
if len(vnitrni) > 0:
    for _, r in vnitrni.iterrows():
        mapa_vnitrni[int(r["id_obec"])] = {
            "KMPL": r["KMPL"],
            "nazev_loka": r["nazev_loka"],
            "vzdalenost_m": float(r["vzdalenost_bod_m"])
        }

mapa_nejblizsi = {}
for _, r in nejblizsi.iterrows():
    mapa_nejblizsi[int(r["id_obec"])] = {
        "KMPL": r["KMPL"],
        "nazev_loka": r["nazev_loka"],
        "vzdalenost_m": float(r["vzdalenost_m"])
    }

stanice_podle_kmpl = {r["KMPL"]: r for _, r in stanice.iterrows()}

def vyber_zakladni_stanici(id_obce):
    if id_obce in mapa_vnitrni:
        z = mapa_vnitrni[id_obce]
        return stanice_podle_kmpl[z["KMPL"]], z["vzdalenost_m"], "uvnitr"

    z = mapa_nejblizsi[id_obce]
    return stanice_podle_kmpl[z["KMPL"]], z["vzdalenost_m"], "nejblizsi"

def najdi_hodnotu_latky(id_obce, latka, zakladni_stanice):
    if zakladni_stanice is not None and pd.notna(zakladni_stanice[latka]):
        return float(zakladni_stanice[latka]), zakladni_stanice["KMPL"], "zakladni"

    kandidati = stanice[stanice[latka].notna()].copy()
    if len(kandidati) == 0:
        return prumery[latka], None, "prumer_bez_stanic"

    bod = obce_body[obce_body["id_obec"] == id_obce]

    nej = gpd.sjoin_nearest(
        bod,
        kandidati[["KMPL", "nazev_loka", latka, "geometry"]],
        how="left",
        distance_col="vzdalenost_m"
    )

    radek = nej.sort_values("vzdalenost_m").iloc[0]

    if float(radek["vzdalenost_m"]) <= max_vzdalenost_km * 1000:
        return float(radek[latka]), radek["KMPL"], "blizka_stanice"

    return prumery[latka], None, "prumer"

vysledky = []

for _, obec in obce.iterrows():
    id_obce = int(obec["id_obec"])
    zakladni_stanice, vzdalenost_m, typ_prirazeni = vyber_zakladni_stanici(id_obce)

    zaznam = {}
    for sloupec in obce.columns:
        if sloupec not in ["geometry", "bod_obce", "id_obec"]:
            zaznam[sloupec] = obec[sloupec]

    zaznam["stanice_kmpl"] = zakladni_stanice["KMPL"]
    zaznam["stanice_nazev"] = zakladni_stanice["nazev_loka"]
    zaznam["typ_prirazeni_stanice"] = typ_prirazeni
    zaznam["vzdalenost_zakladni_stanice_km"] = round(vzdalenost_m / 1000, 2)

    indexy = {}

    for latka in sloupce_latky:
        hodnota, kmpl_zdroj, zdroj = najdi_hodnotu_latky(id_obce, latka, zakladni_stanice)
        index = hodnota / limity[latka] * 100 if pd.notna(hodnota) else np.nan

        zaznam[latka] = round(hodnota, 2) if pd.notna(hodnota) else np.nan
        zaznam[f"index_{latka}"] = round(index, 2) if pd.notna(index) else np.nan
        zaznam[f"zdroj_{latka}"] = zdroj
        zaznam[f"stanice_{latka}"] = kmpl_zdroj

        indexy[latka] = index

    hodnoty = pd.Series(indexy, dtype="float64").dropna()

    if len(hodnoty) == 0:
        index_max = np.nan
        index_prumer = np.nan
        vysledny_index = np.nan
        hlavni_latka = None
    else:
        index_max = float(hodnoty.max())
        index_prumer = float(hodnoty.mean())
        vysledny_index = 0.5 * index_max + 0.5 * index_prumer
        hlavni_latka = hodnoty.idxmax()

    zaznam["index_max"] = round(index_max, 2) if pd.notna(index_max) else np.nan
    zaznam["index_prumer"] = round(index_prumer, 2) if pd.notna(index_prumer) else np.nan
    zaznam["vysledny_index"] = round(vysledny_index, 2) if pd.notna(vysledny_index) else np.nan
    zaznam["hlavni_latka"] = hlavni_latka
    zaznam["kategorie_ovzdusi"] = urci_kategorii(vysledny_index)

    vysledky.append(zaznam)

vystup = pd.DataFrame(vysledky)
vystup.to_csv(cesta_vystup, index=False, encoding="utf-8")

print("Hotovo:", cesta_vystup)
print()
print(vystup[[
    "kod_obec", "naz_obec", "stanice_kmpl", "stanice_nazev",
    "typ_prirazeni_stanice", "vzdalenost_zakladni_stanice_km"
]].head(20).to_string(index=False))