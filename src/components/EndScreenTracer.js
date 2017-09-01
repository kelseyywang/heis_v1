import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';

export default class EndScreenTracer extends React.Component {
  //TODO: Upload #wins info to firebase so every time user
  //logs in, he has #wins against a specific opponent
  //and total #wins and losses.

  printMessage() {
    const winner = this.props.winner;
    if (winner === "Tracer") {
      return `u win! u fired at a range of ${this.props.endDistance} meters n caught that traitorous lil bitch! Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Traitor") {
      return `u lose u peasant bc u ran out of triggers. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Traitor deflect") {
      return `u lose bc traitor deflected ur trigger bitch. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Traitor time") {
      return `u lose bc u ran outta time. u slow bro. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Countdown move") {
      return `u moved too much during the countdown... cheater`;
    }
    return "There's something wrong here because I didn't get my winner prop.";
  }

  goToNewGame() {
    this.clearFirebaseActions();
    Actions.mapScreenTracer({type: ActionConst.RESET});
  }

  goToLocate() {
    Actions.locateScreenTracer();
  }

  clearFirebaseActions() {
    let fbTraitorInGame;
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      //Get current value of traitorInGame and keep it that way
      fbTraitorInGame = snapshot.val().traitorInGame;
    })
    .then(() => {
      firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/`)
        .set({
          deflectOn: false,
          disguiseOn: false,
          latitude: 0,
          longitude: 0,
          traitorInGame: fbTraitorInGame,
        })
        .catch(() => {
          console.log("firebase reset failed");
        });
    });
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/`)
      .set({
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
      })
      .catch(() => {
        console.log("firebase reset failed");
      });
  }

  render() {
    return (
      <View style={styles.containerStyle}>
        <Text style={styles.textStyle}>{this.printMessage()}</Text>
        <View style={styles.buttonsContainerStyle}>
          <Button
            buttonStyle={styles.buttonAltStyle}
            onPress={this.goToNewGame.bind(this)}
            title='New game'
          />
          <Button
            buttonStyle={styles.buttonAltStyle}
            onPress={this.goToLocate.bind(this)}
            title='Locate Traitor'
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    margin: 20,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonsContainerStyle: {
    flex: 1,
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
