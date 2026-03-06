import pandas as pd
import geopandas as gpd

vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/vysledna_mapa.geojson"

data = pd.read_csv("/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/vysledek.csv", sep=",")
okresy = gpd.read_file("/home/matous/Desktop/Hackujstat/Hackuj_stat/okresy_glob.geojson")

data["kod_okresu"] = data["kod_okresu"].astype(str).str.strip()
okresy["lau1"] = okresy["lau1"].astype(str).str.strip()

geo = okresy[["lau1", "naz_okres", "geometry"]].merge(
    data,
    left_on="lau1",
    right_on="kod_okresu",
    how="left"
)

print(geo[["lau1", "kod_okresu", "okres", "index"]].head(20))
print("Nepřiřazené řádky:", geo["index"].isna().sum())

geo.to_file(vystup, driver="GeoJSON")