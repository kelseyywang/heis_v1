import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';

export default class LogoutConfirmTracer extends React.Component {

  //TODO: This logout doesn't really work because it's connected via the Router
  //and won't get the sessionKey prop, so can't set the InGame to false on fb...
  //Same for LogoutConfirmTraitor

  //Clears tracer's firebase stuff when logged out
  logOutActions() {
    /*let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/tracerInGame/`] = false;
    firebase.database().ref().update(updates);*/
    firebase.auth().signOut();
    Actions.loginForm({type: ActionConst.RESET});
  }

  render() {
    return (
      <View style={styles.containerStyle}>
        <Text style={styles.textStyle}>Do you really want to log out?</Text>
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
