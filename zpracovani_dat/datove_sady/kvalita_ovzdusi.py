import pandas as pd

# vstupní soubor z předchozího výpočtu
vstup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/neupravena_data/ovzdusi.csv"

# výstupní soubor
vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/csv_sad_upraveno/ovzdusi.csv"

df = pd.read_csv(vstup)

# použij hlavní index znečištění
sloupec_index = "vysledny_index"

min_hodnota = df[sloupec_index].min()
max_hodnota = df[sloupec_index].max()

# normalizace (1 = čistý vzduch)
df["Kvalita ovzduší"] = 1 - (df[sloupec_index] - min_hodnota) / (max_hodnota - min_hodnota)

# výstupní tabulka ve stejném stylu jako ekonomická
vystup_df = df[
    [
        "kod_obec",
        "naz_obec",
        "kod_okres",
        "naz_okres",
        "kod_kraj",
        "naz_kraj"
    ]
].copy()

vystup_df["Kvalita ovzduší"] = df["Kvalita ovzduší"].round(6)

# uložit
vystup_df.to_csv(vystup, index=False)

print("Hotovo.")
print("Min index:", min_hodnota)
print("Max index:", max_hodnota)
print()
print(vystup_df.head(10).to_string(index=False))