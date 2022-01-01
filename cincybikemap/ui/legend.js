import React from 'react';

import {ScrollView, View, StyleSheet, Text, Image} from 'react-native';
import {COLORS, ICONS} from '../config';
import CheckBox from '@react-native-community/checkbox';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    borderBottomWidth: 1,
    paddingVertical: 20,
    borderBottomColor: '#5f5f5f',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
  },
});

const LineRow = ({label, lineColor, checked, onCheck}) => {
  return (
    <View style={styles.container}>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>{label}</Text>
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center', flex: 2}}>
        <View style={{width: '100%', height: 2, backgroundColor: lineColor}} />
      </View>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <CheckBox
          value={checked}
          onValueChange={onCheck}
          boxType="square"
          style={{width: 20, height: 20}}
        />
      </View>
    </View>
  );
};

const IconRow = ({label, iconSrc, checked, onCheck}) => {
  return (
    <View style={styles.container}>
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text>{label}</Text>
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center', flex: 2}}>
        <Image source={iconSrc} style={{width: 35, height: 35}} />
      </View>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <CheckBox
          value={checked}
          onValueChange={onCheck}
          boxType="square"
          style={{width: 20, height: 20}}
        />
      </View>
    </View>
  );
};

const Legend = props => {
  const {
    bikeLaneShown,
    slowStreetShown,
    cautionStreetShown,
    redBikeShown,
    bikeRepairShown,
    setBikeLaneShown,
    setSlowStreetShown,
    setCautionStreetShown,
    setRedBikeShown,
    setBikeRepairShown,
  } = props;
  return (
    <ScrollView style={styles.scrollView}>
      <Text style={{width: '100%', textAlign: 'center', fontSize: 20}}>
        Legend
      </Text>
      <LineRow
        label="Bike Lane"
        lineColor={COLORS.BIKE_LANE}
        checked={bikeLaneShown}
        onCheck={setBikeLaneShown}
      />
      <LineRow
        label="Slow Street"
        lineColor={COLORS.SLOW_STREET}
        checked={slowStreetShown}
        onCheck={setSlowStreetShown}
      />
      <LineRow
        label="Use With Caution"
        lineColor={COLORS.USE_WITH_CAUTION}
        checked={cautionStreetShown}
        onCheck={setCautionStreetShown}
      />
      <IconRow
        label="Red Bike Terminal"
        iconSrc={ICONS.RED_BIKE}
        checked={redBikeShown}
        onCheck={setRedBikeShown}
      />
      <IconRow
        label="Bike Repair Station"
        iconSrc={ICONS.BIKE_REPAIR}
        checked={bikeRepairShown}
        onCheck={setBikeRepairShown}
      />
    </ScrollView>
  );
};

export default Legend;
