import pandas as pd

vstup = "/home/matous/Downloads/Hackujstat_DS/kupni_ceny_nem.csv"
vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/csv_sad_upraveno/okresy_ceny.csv"


df = pd.read_csv("/home/matous/Downloads/Hackujstat_DS/kupni_ceny_nem.csv", encoding="utf-8", sep=",")



df = df[["Uz023h22.OKRES", "Území-Okres", "Hodnota"]]

df = df[df["Uz023h22.OKRES"].notna()]
df = df[df["Uz023h22.OKRES"] != ""]

df["Hodnota"] = pd.to_numeric(df["Hodnota"], errors="coerce")

min_cena = df["Hodnota"].min()
max_cena = df["Hodnota"].max()
df["index"] = (max_cena - df["Hodnota"]) / (max_cena - min_cena)



df = df.rename(columns={
    "Uz023h22.OKRES": "kod_okresu",
    "Území-Okres": "okres"
})

df = df[["kod_okresu", "okres", "index", "Hodnota"]]

df.to_csv(vystup, index=False)