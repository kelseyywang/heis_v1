import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Header, Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class LogoutConfirmTracer extends React.Component {

  //Clears tracer's firebase stuff when logged out
  logOutActions() {
    //If player logged out before/at StartGame, don't need to subtract from numPlayers
    //since she was never added to numPlayers
    if (this.props.role !== 'none' && this.props.role !== null) {
      firebase.database().ref(`/currentSessions/${this.props.sessionKey}/numPlayers`)
      .once('value', snapshot => {
        let fbNumPlayers = snapshot.val();
        if (fbNumPlayers <= 1) {
          this.zeroPlayersActions();
        }
        else {
          if (this.props.role === 'tracer' || this.props.role === 'traitor') {
            let updates = {};
            updates[`/currentSessions/${this.props.sessionKey}/${this.props.role}InGame/`] = false;
            firebase.database().ref().update(updates);
          }
          let updates = {};
          updates[`/currentSessions/${this.props.sessionKey}/numPlayers/`] = fbNumPlayers - 1;
          firebase.database().ref().update(updates);
        }
      });
    }
    firebase.auth().signOut();
    Actions.loginForm({type: ActionConst.RESET});
  }

  //Deletes session node
  zeroPlayersActions() {
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/`] = null;
    firebase.database().ref().update(updates);
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
