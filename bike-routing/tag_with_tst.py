import psycopg2
import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()  # take environment variables from .env.
print("Database URL: ", os.getenv("DATABASE_URL"))

def get_tst_data():
    lines = []
    try:
        connection = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = connection.cursor()
        map_features = "select data, ST_AsGeoJSON(geog_line), type from features where type like 'tst%'"

        cursor.execute(map_features)
        lines = cursor.fetchall()


    except (Exception, psycopg2.Error) as error:
        print("Error while fetching data from PostgreSQL", error)

    finally:
        # closing database connection.
        if connection:
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")
    return lines
        



def match_line(coords, route):
    parsed_coords = ";".join([",".join([str(c) for c in coord]) for coord in coords])
    matches = requests.get(
        f"http://router.project-osrm.org/match/v1/bike/{parsed_coords}?steps=false&geometries=geojson&overview=false&annotations=true"
    )

    try:
        return matches.json()["matchings"][0]["legs"][0]["annotation"]["nodes"]
    except KeyError:
        print("Key Error")
        print(matches.json())
        print(route)
        return []
        

data = {}        
lines = get_tst_data()
for route in lines:
    if route[2] not in data:
        data[route[2]] = []
    points = match_line(json.loads(route[1])["coordinates"], route)
    data[route[2]].append(points)

with open('tst_tagged_nodes.json', 'w') as outfile:
    json.dump(data, outfile)
