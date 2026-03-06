import json
import pandas as pd

with open("/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/sad_original/metadata_kvalita_ovzdusi.json", "r", encoding="utf-8") as f:
    data = json.load(f)

radky = []

for lokalita in data["data"]["Localities"]:
    locality_code = lokalita.get("LocalityCode")
    nazev = lokalita.get("Name")
    district = lokalita.get("BasicInfo", {}).get("District")
    lat = lokalita.get("Localization", {}).get("LatAsNumber")
    lon = lokalita.get("Localization", {}).get("LonAsNumber")

    for program in lokalita.get("MeasuringPrograms", []):
        for mereni in program.get("Measurements", []):
            radky.append({
                "idRegistration": str(mereni.get("IdRegistration")),
                "componentCode": mereni.get("ComponentCode"),
                "localityCode": locality_code,
                "nazev": nazev,
                "district": district,
                "lat": lat,
                "lon": lon
            })

stanice = pd.DataFrame(radky)

print(stanice.head())
stanice.to_csv("stanice_id_okres.csv", index=False)