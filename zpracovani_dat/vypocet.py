import pandas as pd
import glob



soubory = glob.glob("Hackuj_stat/zpracovani_dat/csv_sad/*.csv")

data = [pd.read_csv(s) for s in soubory]

df = pd.concat(data)
vysledek = df.groupby(["kod_okresu", "okres"], as_index=False)["index"].mean()


vysledek.to_csv("vysledek.csv", index=False)