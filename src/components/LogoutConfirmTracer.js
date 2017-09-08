import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Header, Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

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
      <View style={commonStyles.setupStyle}>
        <Header
          headerText='Log Out?'
          includeRightButton={false}
        />
      <Placeholder>
        <Text style={commonStyles.mainTextStyle}>Do you really want to log out?</Text>
          <View style={styles.buttonsRowStyle}>
            <Button
              onPress={this.logOutActions.bind(this)}
              title='Yes'
              main
            />
            <Button
              onPress={() => {Actions.pop();}}
              title='No'
              main
            />
          </View>
        </Placeholder>
        <Placeholder
          flex={0.2}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    flexDirection: 'column',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSetupColor,
  },
  buttonsRowStyle: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
});
