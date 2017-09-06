import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import { Card, CardSection, Input, Spinner } from './common';
import firebase from 'firebase';

export default class StartGameTracer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sessionKey: "sessionKey",
      error: 'orig error',
    };
  }

  readyActions() {
    if (this.isSessionKeyValid(this.state.sessionKey)) {
      this.checkForRole();
    }
    //Actions.mapScreenTracer({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
  }

  isSessionKeyValid(key) {
    if (key.includes('.') || key.includes('$') ||
      key.includes('#') || key.includes('[') ||
      key.includes(']') || key.includes('/') ||
      typeof key === 'undefined') {
        this.setState({
          error: "Don't use any special characters in your session key"
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
        let fbTracerInGame = (snapshot.val().tracerInGame || false);
        let fbTraitorInGame = (snapshot.val().traitorInGame || false);
        this.clearFirebaseActions(fbTracerInGame, fbTraitorInGame);
        if (fbTracerInGame && fbTraitorInGame) {
          //Game already has two players, can't join
          this.setState({
            error: 'There are already 2 players in that session',
          });
        }
        else if (fbTracerInGame) {
          //Tracer has been taken, this user is traitor
          Actions.mapScreenTraitor({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
        }
        else if (fbTraitorInGame) {
          //Traitor has been taken, this user is tracer
          Actions.mapScreenTracer({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
        }
        else {
          //This user has first choice of role
          Actions.chooseRole({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
        }
      }
      else {
        //Game has not been created yet
        this.clearFirebaseActions(false, false);
        Actions.chooseRole({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
      }
    });
  }

  //Resets game properties to default when game is over
  clearFirebaseActions(currTracerInGame, currTraitorInGame) {
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
      })
      .catch(() => {
        console.log("firebase reset failed");
      });
  }

  render() {
    return (
      <View style={styles.containerStyle}>
        <CardSection>
          <Input
            placeholder="sessionKey"
            label="Session Key (one word):"
            value={this.state.email}
            onChangeText={sessionKey => this.setState({ sessionKey })}
          >
          </Input>
        </CardSection>
        <Text style={styles.errorTextStyle}>
          {this.state.error}
        </Text>
        <Text style={styles.textStyle}>Are you ready to start the game?</Text>
        <Button
          buttonStyle={styles.buttonAltStyle}
          onPress={this.readyActions.bind(this)}
          title='Ready'
        />
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
  },
  errorTextStyle: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'red',
  },
});
