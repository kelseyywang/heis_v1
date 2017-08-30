import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';


export default class EndScreenTraitor extends React.Component {
  //TODO: refer to TODOs on EndScreenTracer

  printMessage() {
    const winner = this.props.winner;
    if (winner === "Tracer") {
      return `u lose bitch - got caught by tracer. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Traitor") {
      return `gud shit you won bc tracer ran out of triggers. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Traitor deflect") {
      return `yoo you deflected and won. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Traitor time") {
      return `u win bc lil bitch tracer ran outta time. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Countdown move") {
      return `the tracer moved during the countdown what a bitch... yall gotta restart`;
    }
    return "There's something wrong here because I didn't get my winner prop.";
  }

  goBack() {
    this.clearFirebaseActions();
    Actions.mapScreenTraitor({type: ActionConst.RESET});
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

      let fbTracerInGame;
      firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333`)
      .once('value', snapshot => {
        //Get current value of tracerInGame and keep it that way
        fbTracerInGame = snapshot.val().tracerInGame;
      })
      .then(() => {
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
            tracerInGame: fbTracerInGame,
            gameWinner: "none",
            countdownTotal: -1,
          })
          .catch(() => {
            console.log("firebase reset failed");
          });
      });
  }

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
}

const styles = StyleSheet.create({
  containerStyle: {
    margin: 20,
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
