import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Placeholder, Input, Header } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class StartGame extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sessionKey: '',
      error: '',
    };
  }

  readyActions() {
    if (this.isSessionKeyValid(this.state.sessionKey)) {
      this.checkForRole();
    }
  }

  isSessionKeyValid(key) {
    if (key.includes('.') || key.includes('$') ||
      key.includes('#') || key.includes('[') ||
      key.includes(']') || key.includes('/')) {
        this.setState({
          error: "Don't use any special characters in your session key."
        });
        return false;
      }
    else if (typeof key === 'undefined' || key.length === 0) {
      this.setState({
        error: "Invalid session key."
      });
      return false;
    }
    return true;
  }

  //Check if other player has already chosen a role
  //and is already in game
  checkForRole() {
    firebase.database().ref(`/currentSessions/${this.state.sessionKey}`)
    .once('value', snapshot => {
      if (snapshot.val() !== null) {
        let fbTracerInGame = snapshot.val().tracerInGame;
        let fbTraitorInGame = snapshot.val().traitorInGame;
        let fbNumPlayers = snapshot.val().numPlayers;
        if (fbNumPlayers === 2) {
          //Game already has two players, can't join
          this.setState({
            error: 'There are already 2 players in that session',
          });
        }
        else {
          this.clearFirebaseActions(fbTracerInGame, fbTraitorInGame, fbNumPlayers + 1);
          if (fbNumPlayers === 1 && fbTracerInGame) {
            //Tracer has been taken, this user is traitor
            Actions.mapScreenTraitor({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
          }
          else if (fbNumPlayers === 1 && fbTraitorInGame) {
            //Traitor has been taken, this user is tracer
            Actions.mapScreenTracer({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
          }
          else {
            //This user has first choice of role
            Actions.chooseRole({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
          }
        }
      }
      else {
        //Game has not been created yet
        this.clearFirebaseActions(false, false, 1);
        Actions.chooseRole({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
      }
    });
  }

  updateNumPlayers(num) {
    let updates = {};
    updates[`/currentSessions/${this.state.sessionKey}/numPlayers/`] = num;
    firebase.database().ref().update(updates);
  }

  //Resets game properties to default when game is over
  clearFirebaseActions(currTracerInGame, currTraitorInGame, currNumPlayers) {
    firebase.database().ref(`/currentSessions/${this.state.sessionKey}`)
      .set({
        deflectOn: false,
        disguiseOn: false,
        traitorLatitude: 0,
        traitorLongitude: 0,
        traitorInGame: currTraitorInGame,
        showDirection: false,
        showDistance: false,
        distance: 0,
        directionCoordsForTraitor: [{
          latitude: 0,
          longitude: 0
        },
        {
          latitude: 0,
          longitude: 0
        }],
        //Arbitrary values here!
        lastClickLatTraitor: 0,
        lastClickLonTraitor: 0,
        tracerInGame: currTracerInGame,
        gameWinner: "none",
        countdownTotal: -1,
        tracerLatitude: 0,
        tracerLongitude: 0,
        tracerInLocate: false,
        traitorInLocate: false,
        numPlayers: currNumPlayers,
      })
      .catch(() => {
        console.log("firebase reset failed");
      });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={commonStyles.setupStyle}>
          <Header
            headerText='Set Up Game'
            includeRightButton
            rightButtonText='Log Out'
            rightButtonAction={() =>
              {Actions.logoutConfirmTracer({sessionKey: this.state.sessionKey});}}
          />
          <Placeholder
            flex={0.3}
          />
          <Placeholder noJustify>
              <Input
                placeholder='sessionKey'
                label='Session Key'
                onChangeText={sessionKey => this.setState({ sessionKey })}
              >
            </Input>
            <Text style={styles.altErrorTextStyle}>
              {this.state.error}
            </Text>
          </Placeholder>
          <Placeholder
            flex={0.2}
          />
          <Placeholder>
            <Text style={commonStyles.mainTextStyle}>Are you ready to start the game?</Text>
            <Button
              onPress={this.readyActions.bind(this)}
              title='Ready'
              main
            />
          </Placeholder>
          <Placeholder
            flex={0.8}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
const styles = StyleSheet.create({
  altErrorTextStyle: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 20,
    alignSelf: 'center',
    textAlign: 'center',
    color: colors.errorTextColor,
  },
});
