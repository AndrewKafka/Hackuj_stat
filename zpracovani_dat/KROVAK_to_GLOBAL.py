import json
from pyproj import Transformer
from shapely.geometry import shape, mapping
from shapely.ops import transform

vstup = "/home/matous/Desktop/Hackujstat/zakladni.geojson"
vystup = "/home/matous/Desktop/Hackujstat/Hackuj_stat/zpracovani_dat/main/zakladni.geojson"

transformer = Transformer.from_crs("EPSG:5514", "EPSG:4326", always_xy=True)

def preved_geometrii(geom_json):
    geom = shape(geom_json)
    geom2 = transform(transformer.transform, geom)
    return mapping(geom2)

with open(vstup, "r", encoding="utf-8") as f:
    geojson = json.load(f)

if "features" in geojson:
    for feature in geojson["features"]:
        if feature.get("geometry") is not None:
            feature["geometry"] = preved_geometrii(feature["geometry"])
else:
    if geojson.get("geometry") is not None:
        geojson["geometry"] = preved_geometrii(geojson["geometry"])

with open(vystup, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, separators=(",", ":"))

print("Hotovo:", vystup)