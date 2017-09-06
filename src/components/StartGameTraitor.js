import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import { Card, CardSection, Input, Spinner } from './common';
import firebase from 'firebase';

export default class StartGameTraitor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sessionKey: "sessionKey",
    };
  }

  readyActions() {
    this.clearFirebaseActions();
    Actions.mapScreenTraitor({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
  }

  //Resets game properties to default when game is over
  clearFirebaseActions() {
    firebase.database().ref(`/currentSessions/${this.state.sessionKey}`)
      .set({
        deflectOn: false,
        disguiseOn: false,
        traitorLatitude: 0,
        traitorLongitude: 0,
        traitorInGame: false,
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
        tracerInGame: false,
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
  }
});
