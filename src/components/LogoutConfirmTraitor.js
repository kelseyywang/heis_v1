import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';

export default class LogoutConfirmTraitor extends React.Component {

  //Clears tracer's firebase stuff when logged out
  logOutActions() {
    let updates = {};
    updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/gameWinner/'] = "none";
    firebase.database().ref().update(updates);
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/`)
      .set({
        deflectOn: false,
        disguiseOn: false,
        latitude: 0,
        longitude: 0,
        traitorInGame: false,
      })
      .catch(() => {
        console.log("firebase reset failed");
      });
    firebase.auth().signOut();
    Actions.loginForm({type: ActionConst.RESET});
  }

  render() {
    return (
      <View style={styles.containerStyle}>
        <Text style={styles.textStyle}>WUZZUP WANNA LOG OUT!?</Text>
        <View style={styles.buttonsRowStyle}>
          <Button
            buttonStyle={styles.buttonAltStyle}
            onPress={this.logOutActions.bind(this)}
            title='Yes'
          />
          <Button
            buttonStyle={styles.buttonAltStyle}
            onPress={() => {Actions.pop();}}
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
