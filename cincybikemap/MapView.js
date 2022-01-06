import React, {useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableHighlight,
  Linking,
} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import PointFeature from './features/point-feature';
import LineFeature from './features/line-feature';
import SelectedFeatureCallout from './selected-feature-callout';
import LegendButton from './ui/legend-button';
import UserLocationButton from './ui/user-location-button';
import Legend from './ui/legend';
import BottomSheet from '@gorhom/bottom-sheet';
import {COLORS, ICONS} from './config.js';

MapboxGL.setAccessToken('N2nAGwZyiTGggBTwzZcv');

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  info: {
    backgroundColor: 'white',
    padding: 30,
    // flex: 1,
  },
});

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
    Linking.openURL(gmapsLink);
  };

  const [bikeLaneShown, setBikeLaneShown] = useState(true);
  const [slowStreetShown, setSlowStreetShown] = useState(true);
  const [cautionStreetShown, setCautionStreetShown] = useState(true);
  const [redBikeShown, setRedBikeShown] = useState(true);
  const [bikeRepairShown, setBikeRepairShown] = useState(true);

  return (
    <>
      <MapboxGL.MapView
        ref={_map}
        style={styles.map}
        styleJSON={
          'https://api.maptiler.com/maps/streets/style.json?key=N2nAGwZyiTGggBTwzZcv'
        }
        onDidFailLoadingMap={console.log}
        logoEnabled={false}
        showUserLocation
        compassEnabled
        compassViewPosition={0}
        onPress={handlePress}
        
        >
        <MapboxGL.UserLocation renderMode={'normal'} ref={userLocation}/>
        <MapboxGL.Camera
          ref={camera}
          minZoomLevel={10}
          maxBounds={{
            ne: [-83.008239, 39.824396],
            sw: [-86.024447, 38.426663]
          }}
          defaultSettings={{
            centerCoordinate: [-84.512016, 39.143119],
            zoomLevel: 11,
          }}
        />
        <LineFeature
          featureName="bike-lane"
          style={{
            lineDasharray: [2, 4],
            lineWidth: 2,
            lineColor: COLORS.BIKE_LANE,
          }}
          visible={bikeLaneShown}
        />
        <LineFeature
          featureName="multi-use-path"
          style={{
            lineWidth: 2,
            lineColor: COLORS.BIKE_LANE,
          }}
          visible={bikeLaneShown}
        />
        <LineFeature
          featureName="tst-slow-street"
          style={{
            lineWidth: 2,
            lineColor: COLORS.SLOW_STREET,
          }}
          visible={slowStreetShown}
        />
        <LineFeature
          featureName="tst-use-with-caution"
          style={{
            lineWidth: 2,
            lineColor: COLORS.USE_WITH_CAUTION,
          }}
          visible={cautionStreetShown}
        />
        <PointFeature
          featureName="bike-repair-station"
          featureImage={ICONS.BIKE_REPAIR}
          visible={bikeRepairShown}
        />
        <PointFeature
          featureName="bike-shop"
          featureImage={ICONS.BIKE_SHOP}
          visible={bikeRepairShown}
        />
        <PointFeature
          featureName="red-bike-station"
          featureImage={ICONS.RED_BIKE}
          style={{iconSize: 0.2}}
          visible={redBikeShown}
        />
      </MapboxGL.MapView>
      <LegendButton onPress={() => legendSheet?.current?.expand()} />
      <UserLocationButton onPress={() => camera?.current?.flyTo(userLocation?.current?.state?.coordinates)} />
      <BottomSheet
        ref={bottomSheet}
        enablePanDownToClose
        index={-1}
        snapPoints={['20%']}>
        <SelectedFeatureCallout
          {...selectedFeature?.properties}
          handleNavigate={navigateToSelectedFeature}
        />
      </BottomSheet>
      <BottomSheet
        ref={legendSheet}
        enablePanDownToClose
        index={-1}
        snapPoints={['40%', '60%']}>
        <Legend
          bikeLaneShown={bikeLaneShown}
          slowStreetShown={slowStreetShown}
          cautionStreetShown={cautionStreetShown}
          redBikeShown={redBikeShown}
          bikeRepairShown={bikeRepairShown}
          setBikeLaneShown={setBikeLaneShown}
          setSlowStreetShown={setSlowStreetShown}
          setCautionStreetShown={setCautionStreetShown}
          setRedBikeShown={setRedBikeShown}
          setBikeRepairShown={setBikeRepairShown}
        />
      </BottomSheet>
    </>
  );
}

export default MapView;
