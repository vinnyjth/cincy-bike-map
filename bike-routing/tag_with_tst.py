import psycopg2
import requests
import json
from dotenv import load_dotenv
import os
import polyline

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
        



def match_line_nodes(coords, route):
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


def match_line_ways(coordinates, route):
    response = requests.post(
                url="http://164.90.158.147:8002/trace_attributes",
                headers={
                    "Content-Type": "application/json; charset=utf-8",
                },
                data=json.dumps({
                    "filters": {
                        "attributes": [
                            "edge.way_id"
                        ],
                        "action": "include"
                    },
                    "shape_match": "map_snap",
                    "encoded_polyline": polyline.encode(coordinates, 6, geojson=True),
                    "costing": "bicycle"
                })
            )


    try:
        ret = [e["way_id"] for e in response.json()["edges"]]
        print(".", end="", flush=True)
        return ret
    except KeyError:
        print("Key Error")
        print(polyline.encode(coordinates))
        return []        
        

node_data = {}     
way_data ={}   
lines = get_tst_data()
for route in lines:
    if route[2] not in node_data:
        node_data[route[2]] = []

    if route[2] not in way_data:
        way_data[route[2]] = []

    # points = match_line_nodes(json.loads(route[1])["coordinates"], route)
    # node_data[route[2]].append(points)

    ways = match_line_ways(json.loads(route[1])["coordinates"], route)
    way_data[route[2]].append(ways)
    
with open('tst_tagged_ways.json', 'w') as outfile:
    json.dump(way_data, outfile)    

with open('tst_tagged_nodes.json', 'w') as outfile:
    json.dump(node_data, outfile)

