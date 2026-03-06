import os
import glob
import pandas as pd
import geopandas as gpd
from nazvy_dat import nazvy_sad

cesta_geojson_vstup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/main/zakladni_100.geojson"
slozka_csv = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/csv_sad_upraveno"
cesta_geojson_vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/main/rozsireno_100.geojson"

gdf = gpd.read_file(cesta_geojson_vstup)

gdf.columns = gdf.columns.str.strip()

for sloupec in ["kod_obec", "lau1", "kod_okres", "kod_kraj", "nuts3_kraj"]:
    if sloupec in gdf.columns:
        gdf[sloupec] = gdf[sloupec].astype(str).str.strip()

soubory = glob.glob(os.path.join(slozka_csv, "*.csv"))

if not soubory:
    raise ValueError("Nebyly nalezeny žádné CSV soubory.")


def najdi_uroven_a_klic(df):
    sloupce = set(df.columns)

    if "kod_obec" in sloupce:
        return "obec", "kod_obec"
    if "lau1" in sloupce:
        return "okres", "lau1"
    if "kod_okresu" in sloupce:
        return "okres", "kod_okresu"
    if "kod_okres" in sloupce:
        return "okres", "kod_okres"
    if "nuts3_kraj" in sloupce:
        return "kraj", "nuts3_kraj"
    if "kod_kraj" in sloupce:
        return "kraj", "kod_kraj"

    return None, None


def preved_nazvy_indexu(hodnota):
    if hodnota is None:
        return []
    if isinstance(hodnota, str):
        return [hodnota]
    if isinstance(hodnota, (list, tuple, set)):
        return list(hodnota)
    return []


def priprav_mapy_hodnot(df, klic_csv, nazvy_indexu):
    mapy_hodnot = {}

    for nazev_indexu in nazvy_indexu:
        if nazev_indexu not in df.columns:
            continue

        pomocny = df[[klic_csv, nazev_indexu]].copy()
        pomocny[klic_csv] = pomocny[klic_csv].astype(str).str.strip()
        pomocny[nazev_indexu] = pd.to_numeric(pomocny[nazev_indexu], errors="coerce")
        pomocny = pomocny.dropna(subset=[nazev_indexu])
        pomocny = pomocny.groupby(klic_csv, as_index=False)[nazev_indexu].mean()
        mapy_hodnot[nazev_indexu] = dict(zip(pomocny[klic_csv], pomocny[nazev_indexu]))

    return mapy_hodnot


pridane_indexy = []

for cesta_csv in soubory:
    nazev_souboru = os.path.basename(cesta_csv)
    nazvy_indexu = preved_nazvy_indexu(nazvy_sad.get(nazev_souboru))

    if not nazvy_indexu:
        print(f"Soubor {nazev_souboru} není ve slovníku nazvy_sad, přeskakuji.")
        continue

    df = pd.read_csv(cesta_csv)
    df.columns = df.columns.str.strip()

    uroven, klic_csv = najdi_uroven_a_klic(df)

    if uroven is None:
        print(f"Soubor {nazev_souboru} nemá rozpoznatelný územní klíč, přeskakuji.")
        continue

    dostupne_indexy = [nazev for nazev in nazvy_indexu if nazev in df.columns]

    if not dostupne_indexy:
        print(f"Soubor {nazev_souboru} nemá žádný očekávaný datový sloupec {nazvy_indexu}, přeskakuji.")
        continue

    mapy_hodnot = priprav_mapy_hodnot(df, klic_csv, dostupne_indexy)

    print(f"Zpracovávám {nazev_souboru} -> {dostupne_indexy} ({uroven})")

    for nazev_indexu, mapa_hodnot in mapy_hodnot.items():
        if uroven == "obec":
            if "kod_obec" not in gdf.columns:
                print(f"GeoJSON nemá sloupec kod_obec, {nazev_souboru} přeskočen.")
                continue
            gdf[nazev_indexu] = gdf["kod_obec"].map(mapa_hodnot)

        elif uroven == "okres":
            if "lau1" in gdf.columns and any(str(k).startswith("CZ") for k in mapa_hodnot.keys()):
                gdf[nazev_indexu] = gdf["lau1"].map(mapa_hodnot)
            elif "lau1" in gdf.columns and klic_csv == "lau1":
                gdf[nazev_indexu] = gdf["lau1"].map(mapa_hodnot)
            elif "kod_okres" in gdf.columns:
                gdf[nazev_indexu] = gdf["kod_okres"].map(mapa_hodnot)
            elif "lau1" in gdf.columns:
                gdf[nazev_indexu] = gdf["lau1"].map(mapa_hodnot)
            else:
                print(f"GeoJSON nemá okresní klíč, {nazev_souboru} přeskočen.")
                continue

        elif uroven == "kraj":
            if "nuts3_kraj" in gdf.columns and any(str(k).startswith("CZ") for k in mapa_hodnot.keys()):
                gdf[nazev_indexu] = gdf["nuts3_kraj"].map(mapa_hodnot)
            elif "kod_kraj" in gdf.columns:
                gdf[nazev_indexu] = gdf["kod_kraj"].map(mapa_hodnot)
            elif "nuts3_kraj" in gdf.columns:
                gdf[nazev_indexu] = gdf["nuts3_kraj"].map(mapa_hodnot)
            else:
                print(f"GeoJSON nemá krajský klíč, {nazev_souboru} přeskočen.")
                continue

        print(f"  -> {nazev_indexu}: {gdf[nazev_indexu].notna().sum()} přiřazených hodnot")
        pridane_indexy.append(nazev_indexu)

for sloupec in gdf.columns:
    if sloupec != "geometry" and pd.api.types.is_float_dtype(gdf[sloupec]):
        gdf[sloupec] = gdf[sloupec].round(3)

gdf.to_file(cesta_geojson_vystup, driver="GeoJSON")

print("Hotovo.")
print("Počet prvků:", len(gdf))
print("Uloženo do:", cesta_geojson_vystup)
print("Přidané indexy:", pridane_indexy)