import React, {useRef, useState} from 'react';
import PointFeature from '../components/features/point-feature';
import LineFeature from '../components/features/line-feature';
// import SelectedFeatureCallout from '../components/features/selected-feature-callout';
// import LegendButton from './ui/legend-button';
// import UserLocationButton from './ui/user-location-button';
// import Legend from './ui/legend';
// import BottomSheet from '@gorhom/bottom-sheet';
import {COLORS, ICONS} from '../components/config.js';
import Map from 'react-map-gl';
import maplibregl from 'maplibre-gl';

// MapboxGL.setAccessToken(Config.MAP_TILER_TOKEN);

// const styles = StyleSheet.create({
//   map: {
//     flex: 1,
//   },
//   infoContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     justifyContent: 'flex-end',
//     zIndex: 10,
//   },
//   info: {
//     backgroundColor: 'white',
//     padding: 30,
//     // flex: 1,
//   },
// });

function MapView() {
  const _map = useRef(null);
  const camera = useRef(null);
  const bottomSheet = useRef(null);
  const legendSheet = useRef(null);
  const userLocation = useRef(null);

  const [selectedFeature, setSelectedFeature] = useState(null);

  const handlePress = async ({properties}) => {
    const {screenPointX, screenPointY} = properties;
    const {features} = await _map.current.queryRenderedFeaturesAtPoint(
      [screenPointX, screenPointY],
      ['==', ['get', 'tappable'], true],
    );

    if (features.length) {
      bottomSheet.current.expand();
      setSelectedFeature(features[0]);
    } else {
      bottomSheet.current.close();
      setSelectedFeature(null);
    }
  };

  const navigateToSelectedFeature = () => {
    const {
      geometry: {coordinates},
    } = selectedFeature;
    const gmapsLink = `https://www.google.com/maps/dir/?api=1&destination=${
      coordinates[1] + '%2C' + coordinates[0]
    }&travelmode=bicycling`;
    // Linking.openURL(gmapsLink);
  };

  const [bikeLaneShown, setBikeLaneShown] = useState(true);
  const [slowStreetShown, setSlowStreetShown] = useState(true);
  const [cautionStreetShown, setCautionStreetShown] = useState(true);
  const [redBikeShown, setRedBikeShown] = useState(false);
  const [bikeRepairShown, setBikeRepairShown] = useState(true);
  const [bikeShopShown, setBikeShopShown] = useState(true);


  const mapRef = React.useCallback((ref) => {
    let hoveredFeatureIds = [];
    if (ref) {
      const map = ref.getMap();
      if (!map) return;
      map.loadImage(ICONS.RED_BIKE.default.src, (error, image) => {
          if (error) throw error;
          if (!map.hasImage('red-bike')) map.addImage('red-bike', image, { sdf: false });
      });
      map.loadImage(ICONS.BIKE_REPAIR.default.src, (error, image) => {
        if (error) throw error;
        if (!map.hasImage('bike-repair')) map.addImage('bike-repair', image, { sdf: false });
      });
      map.loadImage(ICONS.BIKE_SHOP.default.src, (error, image) => {
        console.log(error, image, ICONS.BIKE_SHOP, 'error')
        if (error) throw error;
        console.log(image, 'image')
        if (!map.hasImage('bike-shop')) map.addImage('bike-shop', image, { sdf: false });
      });  
      ['bike-lane', 'multi-use-path', 'tst-slow-street', 'tst-use-with-caution'].forEach((layer) => {
        map.on('mousemove', layer, ({ features }) => {
          if (features.length > 0){
            const hoveredFeature = features[0];
            if (hoveredFeature.properties.name){
              const relatedFeatures = map.querySourceFeatures(layer, {
                filter: ['==', ["get", 'name'], hoveredFeature.properties.name]
              });          
              hoveredFeatureIds = relatedFeatures.map(({id}) => id);
              hoveredFeatureIds.forEach((id) => {
                map.setFeatureState(
                  { source: layer, id },
                  { hover: true }
                  );
              })
            }
          }
        })
        map.on('mouseleave', layer, ({ features }) => {
            hoveredFeatureIds.forEach((id) => {
              map.setFeatureState(
                { source: layer, id },
                { hover: false }
                );
            })
        }) 
      })     
    }
  }, []);

  const lineWidth = ['step', ['zoom'],
  ['+', 2, ['case', ['boolean', ['feature-state', 'hover'], false], 3, 0]], 12,
  ['+', 4, ['case', ['boolean', ['feature-state', 'hover'], false], 3, 0]], 13.5,
  ['+', 5, ['case', ['boolean', ['feature-state', 'hover'], false], 3, 0]]
]
  return (
    <>
      <Map
        mapLib={maplibregl}
        ref={mapRef}
        mapStyle={`https://api.maptiler.com/maps/11e6eaeb-2b76-4eab-b098-bc0b0b1840cc/style.json?key=N2nAGwZyiTGggBTwzZcv`}
        onDidFailLoadingMap={e => console.log('failed', e)}
        logoEnabled={false}
        showUserLocation
        compassEnabled
        compassViewPosition={0}
        minZoomLevel={10}
        style={{width: '100vw', height: '100vw'}}
        onZoom={console.log}
        maxBounds={[
          -86.024447, 37.426663,-83.008239 , 39.824396
        
        ]}
        initialViewState={{
          longitude: -84.5191,
          latitude: 39.0653,
          zoom: 12
        }}        
        onPress={handlePress}>
        {/* <MapboxGL.UserLocation renderMode={'normal'} ref={userLocation} /> */}
        <LineFeature
          featureName="bike-lane"
          style={{
            // 'line-dash-array': [2, 4],
            'line-color': COLORS.BIKE_LANE,
            'line-width': lineWidth,
          }}
          visible={bikeLaneShown}
        />
        <LineFeature
          featureName="multi-use-path"
          style={{
            'line-width': lineWidth,
            'line-color': COLORS.BIKE_LANE,
          }}
          visible={bikeLaneShown}
        />
        <LineFeature
          featureName="tst-slow-street"
          style={{
            'line-width': lineWidth,
            'line-color': COLORS.SLOW_STREET,
          }}
          visible={slowStreetShown}
        />
        <LineFeature
          featureName="tst-use-with-caution"
          style={{
            // 'line-width': ['step', {input: ['get', 'zoom'], stop_output_0: 2, stop_input_1: 13.5, stop_output_1: 5}],
            'line-width': lineWidth,
            'line-color': COLORS.USE_WITH_CAUTION,
          }}
          visible={cautionStreetShown}
        />
        <PointFeature
          featureName="bike-repair-station"
          featureImage={'bike-repair'}
          visible={bikeRepairShown}
        />
        <PointFeature
          featureName="bike-shop"
          featureImage={'bike-shop'}
          style={{'icon-size': 0.15}}
          visible={bikeShopShown}
        />
        <PointFeature
          featureName="red-bike-station"
          featureImage={'red-bike'}
          style={{'icon-size': 0.2}}
          visible={redBikeShown}
        />
      </Map>
      <div className='absolute bottom-2 left-2 p-2 bg-white w-60'>
          <div className='text-center m-2'>Legend</div>
          <div className='flex justify-items-center items-center'>
            <span className="m-2">Bike Lane</span>
            <div className="h-1 flex-1" style={{ backgroundColor: COLORS.BIKE_LANE }}></div>
          </div>
          <div className='flex justify-items-center items-center'>
            <span className="m-2">Slow Street</span>
            <div className="h-1 flex-1" style={{ backgroundColor: COLORS.SLOW_STREET }}></div>
          </div>          
          <div className='flex justify-items-center items-center'>
            <span className="m-2">Use Caution</span>
            <div className="h-1 flex-1" style={{ backgroundColor: COLORS.USE_WITH_CAUTION }}></div>
          </div>                    
      </div>
    </>
  );
}

export default MapView;
