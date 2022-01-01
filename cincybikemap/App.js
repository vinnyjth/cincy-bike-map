import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import MapView from './MapView';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
});

export default class App extends Component {
  render() {
    return (
      <GestureHandlerRootView style={styles.page}>
        <View style={styles.container}>
          <MapView />
        </View>
      </GestureHandlerRootView>
    );
  }
}
