import React from "react";
import { SERVER_URL } from "../config";
import { Layer, Source } from "react-map-gl";

const LineFeature = ({
  featureName,
  featureImage,
  category,
  style,
  visible,
}) => {
  const [stations, setStations] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const stations = await fetch(
        SERVER_URL + `line-features/${featureName}`
      ).then((r) => r.json());
      setStations(stations);
    })();
  }, []);

  return (
    <>
      <Source
        generateId
        id={featureName}
        type="geojson"
        data={{
          type: "FeatureCollection",
          features: stations.map(({ geo_json, name }) => ({
            type: "Feature",
            properties: {
              type: featureName,
              name: name,
              category,
            },
            geometry: {
              ...geo_json,
            },
          })),
        }}
      >
        <Layer
          id={featureName}
          beforeId="poi_transit"
          type="line"
          layout={{
            visibility: visible ? "visible" : "none",
            "line-cap": "round",
          }}
          paint={{
            ...style,
          }}
        />
      </Source>
    </>
  );
};

export default LineFeature;
