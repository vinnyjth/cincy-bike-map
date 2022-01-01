import React from 'react';
import {SERVER_URL} from '../config';
import MapboxGL from '@react-native-mapbox-gl/maps';

export default ({featureName, featureImage, style, visible}) => {
  const [stations, setStations] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const stations = await fetch(
        SERVER_URL + `line-features/${featureName}`,
      ).then(r => r.json());
      setStations(stations);
    })();
  }, []);

  return (
    <>
      <MapboxGL.ShapeSource
        id={featureName}
        shape={{
          type: 'FeatureCollection',
          features: stations.map(({geo_json}) => ({
            type: 'Feature',
            properties: {
              type: featureName,
            },
            geometry: {
              ...geo_json,
            },
          })),
        }}
      />
      <MapboxGL.LineLayer
        id={featureName}
        sourceID={featureName}
        style={{
          visibility: visible ? 'visible' : 'none',
          ...style,
        }}
      />
    </>
  );
};
