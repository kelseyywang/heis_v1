import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';


export default class EndScreenTraitor extends React.Component {
  //TODO: refer to TODOs on EndScreenTracer
  render() {
    return (
      <View style={styles.containerStyle}>
        <Text style={styles.textStyle}>{this.printMessage()}</Text>
        <Button
          buttonStyle={styles.buttonAltStyle}
          onPress={this.goBack.bind(this)}
          title='New game'
        />
      </View>
    );
  }

  printMessage() {
    const winner = this.props.winner;
    if (winner === "Tracer") {
      return `Tracer wins! You got caught, LOSER!!`;
    }
    else if (winner === "Traitor") {
      return "guud, you won! Tracer ran out of triggers... how irresponsible and SAD.";
    }
    else if (winner === "Traitor deflect") {
      return "nice, you deflected and won! woOoOooooOOOOOO";
    }
    return "There's something wrong here because I didn't get my winner prop.";
  }

  goBack() {
    //TODO: fix bc super glitchy... even when traitor pressed this
    //the scene goes back to the end screen and vibrates like crazy
    //bc of the logic in mapscreentraitor... need to unmount and reset...
    //it only works if the tracer goes back to game and presses distance
    //or direction.
    this.clearFirebaseActions();
    Actions.mapScreenTraitor({reset: true});
  }

  clearFirebaseActions() {
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
