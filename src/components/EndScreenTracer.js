import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';

export default class EndScreenTracer extends React.Component {
  //TODO: improve Restart button.
  //TODO: Upload #wins info to firebase so every time user
  //logs in, he has #wins against a specific opponent
  //and total #wins and losses.
  render() {
    return (
      <View style={styles.containerStyle}>
        <Text style={styles.textStyle}>{this.printMessage()}</Text>
        <Button
          buttonStyle={styles.buttonAltStyle}
          onPress={this.goBack.bind(this)}
          title='Back to game'
        />
      </View>
    );
  }

  printMessage() {
    const winner = this.props.winner;
    if (winner === "Tracer") {
      return `Nice, you won! You fired at a range of ${this.props.endDistance} meters n caught that traitorous lil bitch!`;
    }
    else if (winner === "Traitor") {
      return "Traitor wins! You ran out of triggers... how irresponsible and SAD.";
    }
    else if (winner === "Traitor deflect") {
      return "Traitor wins by deflect! How does it feel to have your weapon used against you, LOSER!?";
    }
    return "There's something wrong here because I didn't get my winner prop.";
  }

  goBack() {
    this.clearFirebaseActions();
    Actions.mapScreenTracer({reset: true});
  }

  clearFirebaseActions() {
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/`)
      .set({
        deflectOn: false,
        disguiseOn: false,
        latitude: 0,
        longitude: 0,
      })
      .catch(() => {
        console.log("firebase reset failed");
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
        tracerLoggedIn: false,
        gameWinner: "none",
      })
      .catch(() => {
        console.log("firebase reset failed");
      });
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'flex-start',
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
