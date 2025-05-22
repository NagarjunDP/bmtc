import pandas as pd
import json
import ast

# Input and output files
INPUT_FILE = '/Users/nagarjundp/bmtc/bmtc-route-finder/kml/route.csv'
OUTPUT_JSON = '/Users/nagarjundp/bmtc/bmtc-route-finder/kml/bmtc_stops2.json'

# Read the data
try:
    # Assume no header; skip rows with 'Stop Name' explicitly
    df = pd.read_csv(INPUT_FILE, header=None, names=['Stop Name', 'Latitude', 'Longitude', 'Num trips in stop', 'Boothcode', 'Routes with num trips'])
except Exception as e:
    print(f"Error reading {INPUT_FILE}: {e}")
    exit(1)

# Convert to JSON structure
stops_json = []
for idx, row in df.iterrows():
    try:
        # Skip header rows or invalid stop names
        if pd.isna(row['Stop Name']) or str(row['Stop Name']).strip() in ['', 'Stop Name']:
            print(f"Skipping row {idx}: Invalid stop name {row['Stop Name']} (row: {row.to_dict()})")
            continue
        # Handle routes
        routes = {}
        if pd.notna(row['Routes with num trips']):
            try:
                routes = ast.literal_eval(row['Routes with num trips'])
                if not isinstance(routes, dict):
                    routes = {}
            except (SyntaxError, ValueError) as e:
                print(f"Row {idx}: Error parsing routes for stop {row['Stop Name']}: {e} (row: {row.to_dict()})")
                routes = {}
        # Handle num_trips
        num_trips = 0
        if pd.notna(row['Num trips in stop']):
            try:
                num_trips = int(row['Num trips in stop'])
            except (ValueError, TypeError):
                print(f"Row {idx}: Error converting num_trips for stop {row['Stop Name']}: NaN or invalid value (row: {row.to_dict()})")
                num_trips = 0
        # Handle lat/lng
        lat = None
        lng = None
        try:
            lat = float(row['Latitude']) if pd.notna(row['Latitude']) else None
            lng = float(row['Longitude']) if pd.notna(row['Longitude']) else None
        except (ValueError, TypeError):
            print(f"Row {idx}: Invalid lat/lng for stop {row['Stop Name']}: {row['Latitude']}, {row['Longitude']} (row: {row.to_dict()})")
        if lat is None or lng is None:
            print(f"Row {idx}: Skipping stop {row['Stop Name']}: Invalid lat/lng ({row['Latitude']}, {row['Longitude']}) (row: {row.to_dict()})")
            continue
        stops_json.append({
            'name': row['Stop Name'],
            'lat': lat,
            'lng': lng,
            'num_trips': num_trips,
            'boothcode': str(row['Boothcode']) if pd.notna(row['Boothcode']) else '',
            'routes': routes
        })
    except Exception as e:
        print(f"Row {idx}: Error processing stop {row['Stop Name']}: {e} (row: {row.to_dict()})")

# Save to JSON
with open(OUTPUT_JSON, 'w') as f:
    json.dump(stops_json, f, indent=2)

print(f"Generated {OUTPUT_JSON} with {len(stops_json)} stops")