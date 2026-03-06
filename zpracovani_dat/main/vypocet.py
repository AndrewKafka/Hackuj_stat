import geopandas as gpd
import pandas as pd
from nazvy_sad import nazvy_sad


cesta_vstup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/main/rozsireno_100.geojson"
cesta_vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/main/mapa.geojson"




def vypocitej_celkovy_index(gdf, pouzite_sloupce):

    sloupce = [s for s in pouzite_sloupce if s in gdf.columns]

    if not sloupce:
        raise ValueError("Žádný ze zadaných sloupců nebyl nalezen v GeoJSON.")

    gdf["index"] = (
        gdf[sloupce]
        .apply(pd.to_numeric, errors="coerce")
        .mean(axis=1, skipna=True)
        .round(3)
    )

    return gdf, sloupce


gdf = gpd.read_file(cesta_vstup)

pouzite_sloupce = list(nazvy_sad.values())

gdf, pouzite = vypocitej_celkovy_index(gdf, pouzite_sloupce)

gdf.to_file(cesta_vystup, driver="GeoJSON")

print("Sloupce použité pro výpočet indexu:")
for s in pouzite:
    print("-", s)

print("Počet prvků:", len(gdf))
print("Uloženo do:", cesta_vystup)