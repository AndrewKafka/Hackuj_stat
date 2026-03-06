import pandas as pd
import geopandas as gpd

cesta_mereni = "/home/matous/Desktop/Hackujstat/Hackuj_stat/mereni_stanice_filtr.csv"
cesta_okresy = "/home/matous/Desktop/Hackujstat/okresy.geojson"
cesta_vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/csv_sad_upraveno/okresy_kvalita_ovzdusi.csv"

df = pd.read_csv(cesta_mereni)
df.columns = df.columns.str.strip()

df["lat"] = pd.to_numeric(df["lat"], errors="coerce")
df["lon"] = pd.to_numeric(df["lon"], errors="coerce")
df["value"] = pd.to_numeric(df["value"], errors="coerce")

df = df.dropna(subset=["lat", "lon", "value"])

body = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(df["lon"], df["lat"]),
    crs="EPSG:4326"
)

okresy = gpd.read_file(cesta_okresy)

if okresy.crs is None:
    raise ValueError("Vrstva okresů nemá nastavené CRS.")

okresy = okresy[["lau1", "naz_okres", "geometry"]].to_crs(epsg=4326)

stanice_okres = gpd.sjoin(
    body,
    okresy,
    how="left",
    predicate="intersects"
)

vysledek = (
    stanice_okres
    .dropna(subset=["lau1"])
    .groupby(["lau1", "naz_okres"], as_index=False)["value"]
    .mean()
    .rename(columns={
        "lau1": "kod_okresu",
        "naz_okres": "okres",
        "value": "hodnota"
    })
)

if vysledek.empty:
    raise ValueError("Nepodařilo se přiřadit žádné stanice k okresům.")

minimum = vysledek["hodnota"].min()
maximum = vysledek["hodnota"].max()
print(f"Minimální hodnota: {minimum}")
print(f"Maximální hodnota: {maximum}")

if maximum == minimum:
    vysledek["index"] = 1.0
else:
    vysledek["index"] = (maximum - vysledek["hodnota"]) / (maximum - minimum)

vysledek["index"] = vysledek["index"].round(3)
vysledek = vysledek[["kod_okresu", "okres", "index"]]

vysledek.to_csv(cesta_vystup, index=False)

print(vysledek.head())
print("Počet okresů:", len(vysledek))
print("Uloženo do:", cesta_vystup)