import json
from pyproj import Transformer
from shapely.geometry import shape, mapping
from shapely.ops import transform

input_file = "mapa.geojson"
output_file = "prevedena_mapa.geojson"

transformer = Transformer.from_crs("EPSG:5514", "EPSG:4326", always_xy=True)

def project(x, y, z=None):
    return transformer.transform(x, y)

with open(input_file, "r", encoding="utf-8") as f:
    geojson = json.load(f)

for feature in geojson["features"]:
    geom = shape(feature["geometry"])
    geom_transformed = transform(project, geom)
    feature["geometry"] = mapping(geom_transformed)

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False)

print("Conversion finished:", output_file)