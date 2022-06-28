```
curl http://download.geofabrik.de/north-america/us/ohio-latest.osm.pbf -o ohio-latest.osm.pbf
curl http://download.geofabrik.de/north-america/us/kentucky-latest.osm.pbf -o kentucky-latest.osm.pbf

osmium merge ohio-latest.osm.pbf kentucky-latest.osm.pbf -o oky.osm.pbf --overwrite
osmium extract -b -85.256183,38.823584,-83.830707,39.539452 oky.osm.pbf -o oky-cincy.osm.pbf --overwrite

# Optional - only if you haven't pulled data yet.
# python tag_with_tst.py

rm oky-cincy-tagged.osm.pbf
python apply_tags.py

docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /data/cincy-bike.lua /data/oky-cincy-tagged.osm.pbf
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/oky-cincy-tagged.osrm
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/oky-cincy-tagged.osrm
docker run -t -i -p 5005:5000 -v "${PWD}:/data" osrm/osrm-backend osrm-routed --algorithm mld /data/oky-cincy-tagged.osrm
```