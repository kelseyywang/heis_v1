import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';
import GameStartedModal from './GameStartedModal';

export default class EndScreenTraitor extends React.Component {
  //TODO: refer to TODOs on EndScreenTracer

  constructor(props) {
    super(props);
    this.state = {
      tracerInGame: false,
      traitorInGame: false,
      newGameModalVisible: true,
    };
  }

  componentDidMount() {
    this.interval = setInterval(this.checkTracerInGame.bind(this), 3000);
  }

  componentWillUnmount() {
    this.clearIntervals();
  }

  checkTracerInGame() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      this.setState({
        tracerInGame: snapshot.val().tracerInGame,
        traitorInGame: snapshot.val().traitorInGame,
      });
    });
  }

  clearIntervals() {
    clearInterval(this.interval);
  }

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

  goToNewGame() {
    //Check if other player has chosen a role
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      //Even though tracerInGame/traitorInGame are set to state,
      //it's only set every 3 seconds, so this is more accurate
      let fbTracerInGame = snapshot.val().tracerInGame;
      let fbTraitorInGame = snapshot.val().traitorInGame;
      if (fbTracerInGame) {
        //Tracer has been taken, this user is traitor
        Actions.mapScreenTraitor({sessionKey: this.props.sessionKey, type: ActionConst.RESET});
      }
      else if (fbTraitorInGame) {
        //Traitor has been taken, this user is tracer
        Actions.mapScreenTracer({sessionKey: this.props.sessionKey, type: ActionConst.RESET});
      }
      else {
        //This user has first choice of role
        Actions.chooseRole({sessionKey: this.props.sessionKey, type: ActionConst.RESET});
      }
    });
  }

  goToLocate() {
    Actions.locateScreenTraitor({sessionKey: this.props.sessionKey, winner: this.props.winner, endTime: this.props.endTime, type: ActionConst.RESET});
  }

  exitNewGameModal() {
    this.setState({
      newGameModalVisible: false,
    });
  }

  renderModal() {
    if (this.state.newGameModalVisible) {
      if (this.state.traitorInGame) {
        return (
          <GameStartedModal
            onCloseModal={this.exitNewGameModal.bind(this)}
          >
            Yo friend started a new game. You are tracer.
          </GameStartedModal>
        );
      }
      else if (this.state.tracerInGame) {
        return (
          <GameStartedModal
            onCloseModal={this.exitNewGameModal.bind(this)}
          >
            Yo friend started a new game. You are traitor.
          </GameStartedModal>
        );
      }
    }
  }

  render() {
    return (
      <View style={styles.containerStyle}>
        {this.renderModal()}
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
