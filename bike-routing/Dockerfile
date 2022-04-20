FROM osrm/osrm-backend as puller

WORKDIR /data

RUN apt-get update && apt-get install -y --no-install-recommends curl osmium-tool

RUN curl http://download.geofabrik.de/north-america/us/ohio-latest.osm.pbf -o ohio-latest.osm.pbf && \
    curl http://download.geofabrik.de/north-america/us/kentucky-latest.osm.pbf -o kentucky-latest.osm.pbf

RUN osmium merge ohio-latest.osm.pbf kentucky-latest.osm.pbf -o oky.osm.pbf --overwrite && \
    osmium extract -b -85.256183,38.823584,-83.830707,39.539452 oky.osm.pbf -o oky-cincy.osm.pbf --overwrite    

### Swap over to tag application
FROM python:slim-bullseye as tagger
WORKDIR /data
COPY --from=puller /data/oky-cincy.osm.pbf .

RUN apt-get update && apt-get install -y  \
    build-essential cmake libboost-dev \
    libexpat1-dev zlib1g-dev libbz2-dev

RUN pip3 install wheel nose setuptools
RUN pip3 install osmium
COPY apply_tags.py /data/apply_tags.py
COPY tst_tagged_nodes.json /data/tst_tagged_nodes.json
RUN python3 ./apply_tags.py    


FROM osrm/osrm-backend
COPY --from=tagger /data/oky-cincy-tagged.osm.pbf .
COPY cincy-bike.lua cincy-bike.lua
RUN osrm-extract -p cincy-bike.lua oky-cincy-tagged.osm.pbf && \
    osrm-partition oky-cincy-tagged.osrm && \
    osrm-customize oky-cincy-tagged.osrm

# RUN curl http://download.geofabrik.de/asia/nepal-latest.osm.pbf --output np-latest.osm.pbf && \
#     osrm-extract -p /opt/car.lua np-latest.osm.pbf && \
#     osrm-partition np-latest.osrm && \
#     osrm-customize np-latest.osrm

CMD ["osrm-routed", "--algorithm", "mld", "oky-cincy-tagged.osrm", "--max-matching-size","1000", "--max-table-size","1000"]