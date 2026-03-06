import os
import glob
import pandas as pd
import geopandas as gpd
from Hackuj_stat.zpracovani_dat.main.nazvy_sad import nazvy_sad

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

def priprav_mapu_hodnot(df, klic_csv, nazev_indexu):
    pomocny = df[[klic_csv, "index"]].copy()
    pomocny[klic_csv] = pomocny[klic_csv].astype(str).str.strip()
    pomocny["index"] = pd.to_numeric(pomocny["index"], errors="coerce")
    pomocny = pomocny.dropna(subset=["index"])
    pomocny = pomocny.groupby(klic_csv, as_index=False)["index"].mean()
    return dict(zip(pomocny[klic_csv], pomocny["index"]))

for cesta_csv in soubory:
    nazev_souboru = os.path.basename(cesta_csv)
    nazev_indexu = nazvy_sad.get(nazev_souboru)

    if nazev_indexu is None:
        print(f"Soubor {nazev_souboru} není ve slovníku nazvy_sad, přeskakuji.")
        continue

    df = pd.read_csv(cesta_csv)
    df.columns = df.columns.str.strip()

    if "index" not in df.columns:
        print(f"Soubor {nazev_souboru} nemá sloupec 'index', přeskakuji.")
        continue

    uroven, klic_csv = najdi_uroven_a_klic(df)

    if uroven is None:
        print(f"Soubor {nazev_souboru} nemá rozpoznatelný územní klíč, přeskakuji.")
        continue

    mapa_hodnot = priprav_mapu_hodnot(df, klic_csv, nazev_indexu)

    print(f"Zpracovávám {nazev_souboru} -> {nazev_indexu} ({uroven})")

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

for sloupec in gdf.columns:
    if sloupec != "geometry" and pd.api.types.is_float_dtype(gdf[sloupec]):
        gdf[sloupec] = gdf[sloupec].round(3)

gdf.to_file(cesta_geojson_vystup, driver="GeoJSON")

print("Hotovo.")
print("Počet prvků:", len(gdf))
print("Uloženo do:", cesta_geojson_vystup)
print("Přidané indexy:", [nazvy_sad.get(os.path.basename(s)) for s in soubory if nazvy_sad.get(os.path.basename(s)) is not None])