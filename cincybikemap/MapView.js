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

  const [selectedFeature, setSelectedFeature] = useState(null);

  const handlePress = async ({properties}) => {
    const {screenPointX, screenPointY} = properties;
    const {features} = await _map.current.queryRenderedFeaturesAtPoint(
      [screenPointX, screenPointY],
      ['==', ['get', 'tappable'], true],
    );

    if (features.length) {
      console.log(features[0]);
      setSelectedFeature(features[0]);
    } else {
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

  return (
    <>
      <View style={styles.infoContainer}>
        <View
          style={[
            styles.info,
            {transform: [{translateY: selectedFeature ? 0 : 300}]},
          ]}>
          <SafeAreaView>
            <View>
              <Text>Test</Text>
              <TouchableHighlight onPress={navigateToSelectedFeature}>
                <Text>Navigate Here</Text>
              </TouchableHighlight>
            </View>
          </SafeAreaView>
        </View>
      </View>
      <MapboxGL.MapView
        ref={_map}
        style={styles.map}
        styleJSON={
          'https://api.maptiler.com/maps/streets/style.json?key=N2nAGwZyiTGggBTwzZcv'
        }
        logoEnabled={false}
        onPress={handlePress}>
        <MapboxGL.Camera
          defaultSettings={{
            centerCoordinate: [-84.512016, 39.143119],
            zoomLevel: 11,
          }}
        />
        <PointFeature
          featureName="bike-repair-station"
          featureImage={require('./features/support.png')}
        />
        <PointFeature
          featureName="red-bike-station"
          featureImage={require('./features/red-bike.png')}
          style={{iconSize: 0.2}}
        />
      </MapboxGL.MapView>
    </>
  );
}

export default MapView;
