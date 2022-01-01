import React from 'react';
import {SERVER_URL} from '../config';
import MapboxGL from '@react-native-mapbox-gl/maps';

export default ({featureName, featureImage, style, visible}) => {
  const [stations, setStations] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const stations = await fetch(
        SERVER_URL + `point-features/${featureName}`,
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
          features: stations.map(({geo_json, name}) => ({
            type: 'Feature',
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
      />
      <MapboxGL.SymbolLayer
        id={featureName}
        sourceID={featureName}
        style={{
          visibility: visible ? 'visible' : 'none',
          iconImage: featureImage,
          iconSize: 0.05,
          iconAllowOverlap: true,
          ...style,
        }}
      />
    </>
  );
};
