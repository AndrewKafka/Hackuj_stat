import csv
from collections import defaultdict
import json

soubor_csv = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/neupravena_data/KRI10.csv"
vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/csv_sad_upraveno/kriminalita.csv"
soubor_geojson = "/home/matous/Desktop/Hackujstat/Kraje_NUTS_3_multi_20260101.geojson"

roky = {2022, 2023, 2024}

kraje = {}

with open(soubor_geojson, encoding="utf-8") as f:
    geojson = json.load(f)

for prvek in geojson["features"]:
    vlastnosti = prvek["properties"]
    nazev_kraje = vlastnosti["naz_kraj"]
    kod_kraje = str(vlastnosti["kod_kraj"])
    pocet_obyvatel = int(vlastnosti["pocoby"])

    kraje[nazev_kraje] = {
        "kod_kraje": kod_kraje,
        "naz_kraj": nazev_kraje,
        "pocet_obyvatel": pocet_obyvatel
    }

kriminalita = defaultdict(list)

with open(soubor_csv, newline="", encoding="utf-8") as f:
    ctecka = csv.DictReader(f)
    for radek in ctecka:
        rok = int(radek["Roky"])
        uzemi = radek["Území"].strip()

        if rok not in roky:
            continue

        if uzemi == "Česko":
            continue

        if uzemi in kraje:
            kriminalita[uzemi].append(int(radek["Hodnota"]))

vysledky = []

for nazev_kraje, info in kraje.items():
    hodnoty = kriminalita.get(nazev_kraje, [])

    if len(hodnoty) == 0:
        continue

    prumerna_kriminalita = sum(hodnoty) / len(hodnoty)
    pocet_obyvatel = info["pocet_obyvatel"]
    kriminalita_na_cloveka = prumerna_kriminalita / pocet_obyvatel

    vysledky.append({
        "kod_kraje": info["kod_kraje"],
        "naz_kraj": info["naz_kraj"],
        "pocet_obyvatel": pocet_obyvatel,
        "prumerna_kriminalita_3_roky": prumerna_kriminalita,
        "kriminalita_na_cloveka": kriminalita_na_cloveka
    })

minimum = min(radek["kriminalita_na_cloveka"] for radek in vysledky)
maximum = max(radek["kriminalita_na_cloveka"] for radek in vysledky)

for radek in vysledky:
    if maximum == minimum:
        index = 1.0
    else:
        index = 1 - ((radek["kriminalita_na_cloveka"] - minimum) / (maximum - minimum))
    radek["index"] = index

with open(vystup, "w", newline="", encoding="utf-8") as f:
    zapis = csv.writer(f)
    zapis.writerow([
        "kod_kraje",
        "naz_kraj",
        "pocet_obyvatel",
        "prumerna_kriminalita_3_roky",
        "kriminalita_na_cloveka",
        "index"
    ])

    for radek in sorted(vysledky, key=lambda x: x["naz_kraj"]):
        zapis.writerow([
            radek["kod_kraje"],
            radek["naz_kraj"],
            radek["pocet_obyvatel"],
            round(radek["prumerna_kriminalita_3_roky"], 2),
            round(radek["kriminalita_na_cloveka"], 8),
            round(radek["index"], 6)
        ])