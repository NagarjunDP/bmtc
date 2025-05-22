import geopandas as gpd
import json
import glob
from collections import defaultdict
from fuzzywuzzy import fuzz
import os

# Configuration
KML_FOLDER = '/Users/nagarjundp/bmtc/bmtc-route-finder/kml'  # Updated to match KML files
BBUS_JSON = '/Users/nagarjundp/bmtc/bmtc-route-finder/kml/bmtc_stops.json'  # Correct path
OUTPUT_JSON = 'public/routes.json'
FUZZY_THRESHOLD = 80

# Ensure output directory exists
os.makedirs('public', exist_ok=True)

# Step 1: Extract stops and route mappings from all KML files
stops = []
route_stops = defaultdict(list)
for kml_file in glob.glob(os.path.join(KML_FOLDER, '*.kml')):  # Correct

    try:
        gdf = gpd.read_file(kml_file, driver='KML')  # Explicitly specify KML driver
        for _, row in gdf.iterrows():
            if 'Name' in row and row.geometry and row.geometry.type == 'Point':
                stop_name = row['Name']
                coords = row.geometry.coords[0]  # (lon, lat)
                routes = eval(row.get('routes', '{}'))  # Convert string dict to dict
                stops.append({
                    'name': stop_name,
                    'lat': coords[1],
                    'lng': coords[0]
                })
                for route_no in routes.keys():
                    route_stops[route_no].append(stop_name)
        print(f"Processed {kml_file}: {len(gdf)} placemarks")
    except Exception as e:
        print(f"Error processing {kml_file}: {e}")

# Step 2: Remove duplicate stops (keep first occurrence)
stop_dict = {}
for stop in stops:
    if stop['name'] not in stop_dict:
        stop_dict[stop['name']] = stop
print(f"Found {len(stop_dict)} unique stops")

# Step 3: Load bbus.in routes for accurate origin/destination/via
# Step 3: Load bmtc_stops.json (this is stop-wise, not route-wise)
try:
    with open(BBUS_JSON, 'r') as f:
        stops_data = json.load(f)
        print(f"Loaded {len(stops_data)} stops from {BBUS_JSON}")
except Exception as e:
    print(f"Error loading stops: {e}")
    stops_data = []

# Step 4: Convert stop-wise data into route-wise structure
routes_dict = defaultdict(list)

for stop in stops_data:
    stop_name = stop.get("name")
    lat = stop.get("lat")
    lng = stop.get("lng")
    for route_no in stop.get("routes", {}):
        routes_dict[route_no].append({
            "name": stop_name,
            "lat": lat,
            "lng": lng
        })

# Step 5: Create route list
combined_routes = []
for route_no, stop_list in routes_dict.items():
    if not stop_list:
        continue
    combined_routes.append({
        "route_no": route_no,
        "origin": stop_list[0]["name"],
        "destination": stop_list[-1]["name"],
        "via": [s["name"] for s in stop_list[1:-1]],
        "stops": stop_list
    })

# Step 6: Save to routes.json
with open(OUTPUT_JSON, 'w') as f:
    json.dump(combined_routes, f, indent=2)

print(f"Created {OUTPUT_JSON} with {len(combined_routes)} routes")
