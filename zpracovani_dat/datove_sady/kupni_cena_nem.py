import pandas as pd

df = pd.read_csv("/home/matous/Downloads/Hackujstat_DS/kupni_ceny_nem.csv", encoding="utf-8", sep=",")



df = df[["Uz023h22.OKRES", "Území-Okres", "Hodnota"]]

df = df[df["Uz023h22.OKRES"].notna()]
df = df[df["Uz023h22.OKRES"] != ""]

df["Hodnota"] = pd.to_numeric(df["Hodnota"], errors="coerce")

df = df.rename(columns={
    "Uz023h22.OKRES": "kod_okresu",
    "Území-Okres": "okres",
    "Hodnota": "cena"
})

df.to_csv("okresy_ceny.csv", index=False)