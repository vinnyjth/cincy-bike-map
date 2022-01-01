import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableHighlight,
  Linking,
} from 'react-native';

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
  },
  container: {
    // marginBottom: 50,
    flexDirection: 'row',
    padding: 20,
  },
  button: Platform.select({
    ios: {
      backgroundColor: '#2196F3',
      borderRadius: 2,
    },
    android: {
      elevation: 4,
      // Material design blue from https://material.google.com/style/color.html#color-color-palette
      backgroundColor: '#2196F3',
      borderRadius: 2,
    },
  }),
  buttonText: {
    textAlign: 'center',
    margin: 8,
    ...Platform.select({
      ios: {
        // iOS blue from https://developer.apple.com/ios/human-interface-guidelines/visual-design/color/
        color: 'white',
        fontSize: 18,
      },
      android: {
        color: 'white',
        fontWeight: '500',
      },
    }),
  },
});

const SelectedFeatureCallout = ({handleNavigate, name}) => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={{flex: 1, paddingRight: 10}}>
          <Text style={styles.header}>{name}</Text>
        </View>
        <View style={{flex: 1, paddingLeft: 10}}>
          <TouchableHighlight style={styles.button} onPress={handleNavigate}>
            <Text style={styles.buttonText}>Navigate Here</Text>
          </TouchableHighlight>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SelectedFeatureCallout;
