import os
import glob
import pandas as pd
from nazvy_sad import nazvy_sad

slozka = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/csv_sad_upraveno"
cesta_vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/vysledek.csv"

soubory = glob.glob(os.path.join(slozka, "*.csv"))

if not soubory:
    raise ValueError("Nebyly nalezeny žádné CSV soubory.")

tabulky = []

for cesta in soubory:
    nazev_souboru = os.path.basename(cesta)
    nazev_indexu = nazvy_sad.get(nazev_souboru)

    if nazev_indexu is None:
        print(f"Soubor {nazev_souboru} není ve slovníku, přeskakuji.")
        continue

    df = pd.read_csv(cesta)
    df.columns = df.columns.str.strip()

    pozadovane = {"kod_okresu", "okres", "index"}
    if not pozadovane.issubset(df.columns):
        print(f"Soubor {nazev_souboru} nemá požadované sloupce, přeskakuji.")
        continue

    df = df[["kod_okresu", "okres", "index"]].copy()
    df["index"] = pd.to_numeric(df["index"], errors="coerce")

    df = (
        df.groupby(["kod_okresu", "okres"], as_index=False)["index"]
        .mean()
        .rename(columns={"index": nazev_indexu})
    )

    tabulky.append(df)

if not tabulky:
    raise ValueError("Po filtrování nezůstaly žádné použitelné tabulky.")

vysledek = tabulky[0]

for tabulka in tabulky[1:]:
    vysledek = vysledek.merge(tabulka, on=["kod_okresu", "okres"], how="outer")

sloupce_indexu = [sloupec for sloupec in vysledek.columns if sloupec not in ["kod_okresu", "okres"]]

vysledek["index"] = vysledek[sloupce_indexu].mean(axis=1)
vysledek["index"] = vysledek["index"].round(3)

for sloupec in sloupce_indexu:
    vysledek[sloupec] = vysledek[sloupec].round(3)

vysledek = vysledek[["kod_okresu", "okres"] + sloupce_indexu + ["index"]]

vysledek.to_csv(cesta_vystup, index=False, encoding="utf-8")

print(vysledek.head(20))
print("Uloženo do:", cesta_vystup)