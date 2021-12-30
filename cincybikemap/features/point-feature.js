import React from 'react';
import {SERVER_URL} from '../config';
import MapboxGL from '@react-native-mapbox-gl/maps';

export default ({featureName, featureImage, style}) => {
  const [stations, setStations] = React.useState([]);

  React.useEffect(async () => {
    const stations = await fetch(SERVER_URL + `features/${featureName}`).then(
      r => r.json(),
    );

    setStations(stations);
  }, []);

  return (
    <>
      <MapboxGL.ShapeSource
        id={featureName}
        shape={{
          type: 'FeatureCollection',
          features: stations.map(({lat, long}) => ({
            type: 'Feature',
            properties: {
              type: featureName,
              tappable: true,
            },
            geometry: {
              type: 'Point',
              coordinates: [long, lat],
            },
          })),
        }}
      />
      <MapboxGL.SymbolLayer
        id={featureName}
        sourceID={featureName}
        style={{
          iconImage: featureImage,
          iconSize: 0.05,
          iconAllowOverlap: true,
          ...style,
        }}
      />
    </>
  );
};
