import geopandas as gpd

cesta_vstup = "/home/matous/Downloads/Hackujstat_DS/Obce_a_vojenske_ujezdy_multi_20260101.geojson"
cesta_vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/main/zakladni.geojson"

vybrane_indexy = [
    "pocobyev",
    "pocbyt",
    "pocbytob",
    "vymera"
]

povinne_sloupce = [
    "geometry",
    "kod_cast_d",
    "naz_cast_d",
    "kod_cast",
    "naz_cast",
    "kod_obec",
    "naz_obec",
    "kod_zuj",
    "naz_zuj",
    "lau1",
    "kod_okres",
    "naz_okres",
    "nuts3_kraj",
    "kod_kraj",
    "naz_kraj",
    "platiod",
    "neplatipo"
]

gdf = gpd.read_file(cesta_vstup)

if gdf.crs is None:
    raise ValueError("Vstupní soubor nemá nastavené CRS.")

if gdf.crs.to_epsg() != 5514:
    gdf = gdf.to_crs(epsg=5514)

chybejici = [sloupec for sloupec in vybrane_indexy if sloupec not in gdf.columns]
if chybejici:
    raise ValueError(f"Ve vstupním souboru chybí sloupce: {chybejici}")

vsechny_sloupce = []
for sloupec in povinne_sloupce + vybrane_indexy:
    if sloupec in gdf.columns and sloupec not in vsechny_sloupce:
        vsechny_sloupce.append(sloupec)

vysledek = gdf[vsechny_sloupce].copy()

vysledek.to_file(cesta_vystup, driver="GeoJSON")

print("CRS:", vysledek.crs)
print("Počet prvků:", len(vysledek))
print("Sloupce:", vysledek.columns.tolist())
print("Uloženo do:", cesta_vystup)