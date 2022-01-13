import React from 'react';
import {View, Text, SafeAreaView, TouchableHighlight} from 'react-native';

const LegendButton = ({onPress}) => {
  return (
    <View
      style={{
        position: 'absolute',
        right: 0,
        top: 100,
      }}>
      <SafeAreaView style={{margin: 10}}>
        <TouchableHighlight
          onPress={onPress}
          style={{
            backgroundColor: 'white',
            padding: 5,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: 'black',
            width: 50,
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{fontSize: 30}}>⌖</Text>
        </TouchableHighlight>
      </SafeAreaView>
    </View>
  );
};

export default LegendButton;
