import pandas as pd

vstup = "/home/matous/Downloads/Hackujstat_DS/kupni_ceny_nem.csv"
vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/csv_sad_upraveno/okresy_ceny.csv"

df = pd.read_csv(vstup, encoding="utf-8", sep=",")

print(df.columns)
print(df["CAS1R3R1"].unique())

df = df[df["CAS1R3R1"] == "2024"]

print(len(df["CAS1R3R1"].values))

df = df[["Uz023h22.KRAJ","Území-Kraj","Uz023h22.OKRES","Území-Okres","Hodnota"]]

chybi_okres = df["Uz023h22.OKRES"].isna() | (df["Uz023h22.OKRES"] == "")

praha_maska = chybi_okres & (df["Uz023h22.KRAJ"] == "CZ010")

df.loc[praha_maska, "Uz023h22.OKRES"] = "CZ0100"
df.loc[praha_maska, "Území-Okres"] = "Praha"

df = df[~(chybi_okres & (df["Uz023h22.KRAJ"] != "CZ010"))]

df["Hodnota"] = pd.to_numeric(df["Hodnota"], errors="coerce")

min_cena = df["Hodnota"].min()
max_cena = df["Hodnota"].max()
df["Index ceny"] = (max_cena - df["Hodnota"]) / (max_cena - min_cena)

df = df.rename(columns={
    "Uz023h22.KRAJ": "kod_kraj",
    "Území-Kraj": "kraj",
    "Uz023h22.OKRES": "kod_okresu",
    "Území-Okres": "okres",
    "Hodnota": "Cena za m2"
})

df = df[["kod_kraj","kraj","kod_okresu","okres","Index ceny","Cena za m2"]]

df.to_csv(vystup, index=False)