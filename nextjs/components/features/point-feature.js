import React from "react";
import { SERVER_URL } from "../config";
import { Layer, Source } from "react-map-gl";

const PointFeature = ({ featureName, featureImage, style, visible }) => {
  const [stations, setStations] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const stations = await fetch(
        SERVER_URL + `point-features/${featureName}`
      ).then((r) => r.json());
      setStations(stations);
    })();
  }, []);

  return (
    <>
      <Source
        type="geojson"
        id={featureName}
        key={featureName}
        data={{
          type: "FeatureCollection",
          features: stations.map(({ geo_json, name }) => ({
            type: "Feature",
            properties: {
              type: featureName,
              name,
              tappable: true,
            },
            geometry: {
              ...geo_json,
            },
          })),
        }}
      >
        <Layer
          id={featureName}
          type={"symbol"}
          key={featureName}
          layout={{
            visibility: visible ? "visible" : "none",
            'icon-allow-overlap': true,
            'icon-image': featureImage,
            'icon-size': 0.05,            
            ...style,
          }}
          paint={{
            
          }}
        />
      </Source>
    </>
  );
};

export default PointFeature;