import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';

export default class LogoutConfirmTraitor extends React.Component {

  render() {
    return (
      <View style={styles.containerStyle}>
        <Text style={styles.textStyle}>WUZZUP WANNA LOG OUT!?</Text>
        <View style={styles.buttonsRowStyle}>
          <Button
            buttonStyle={styles.buttonAltStyle}
            onPress={() => {console.log("traitor yes");}}
            title='Yes'
          />
          <Button
            buttonStyle={styles.buttonAltStyle}
            onPress={() => {console.log("traitor no");}}
            title='No'
          />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  containerStyle: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonsRowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonAltStyle: {
    marginTop: 20,
    borderRadius: 2,
    backgroundColor: 'rgba(64, 52, 109, 1)',
  },
  textStyle: {
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 40
  }
});
