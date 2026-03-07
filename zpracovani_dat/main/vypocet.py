import geopandas as gpd
import pandas as pd
from nazvy_dat import nazvy_sad, indexy_pro_vypocet


cesta_vstup = "/home/matous/Desktop/Hackujstat/rozsireno.geojson"
cesta_vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/main/mapa.geojson"


def zplostit_sloupce(hodnoty):
    vysledek = []

    for polozka in hodnoty:
        if isinstance(polozka, str):
            vysledek.append(polozka)
        elif isinstance(polozka, (list, tuple, set)):
            for hodnota in polozka:
                if isinstance(hodnota, str):
                    vysledek.append(hodnota)

    return vysledek


def vypocitej_celkovy_index(gdf, pouzite_sloupce):

    pouzite_sloupce = zplostit_sloupce(pouzite_sloupce)

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



gdf, pouzite = vypocitej_celkovy_index(gdf, indexy_pro_vypocet)

gdf.to_file(cesta_vystup, driver="GeoJSON")

print("Sloupce použité pro výpočet indexu:")
for s in pouzite:
    print("-", s)

print("Počet prvků:", len(gdf))
print("Uloženo do:", cesta_vystup)