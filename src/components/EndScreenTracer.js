import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import GameStartedModal from './GameStartedModal';
import { Button, Header, Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class EndScreenTracer extends React.Component {
  //TODO: Upload #wins info to firebase so every time user
  //logs in, he has #wins against a specific opponent
  //and total #wins and losses.
  constructor(props) {
    super(props);
    this.state = {
      traitorInGame: false,
      tracerInGame: false,
      newGameModalVisible: true,
    };
  }

  componentDidMount() {
    this.interval = setInterval(this.checkTraitorInGame.bind(this), 3000);
  }

  componentWillUnmount() {
    this.clearIntervals();
  }

  checkTraitorInGame() {
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
    Actions.locateScreenTracer({
      sessionKey: this.props.sessionKey,
      winner: this.props.winner,
      endDistance: this.props.endDistance,
      endTime: this.props.endTime,
      type: ActionConst.RESET
    });
  }

  exitNewGameModal() {
    this.setState({
      newGameModalVisible: false,
    });
  }

  //TODO 9/3: WHY IS THERE A BIG SPACE UNDER THE TIMER WHEN MODAL RENDERS?!
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
      <View style={commonStyles.setupStyle}>
        {this.renderModal()}
        <Header
          headerText='Choose Side'
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirmTracer({sessionKey: this.props.sessionKey});}}
        />
      <Placeholder>
        <Text style={commonStyles.mainTextStyle}>{this.printMessage()}</Text>
          <View style={styles.buttonsRowStyle}>
            <Button
              onPress={this.goToNewGame.bind(this)}
              title='New Game'
              main
            />
            <Button
              onPress={this.goToLocate.bind(this)}
              title='Find Your Friend'
              margin='30'
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
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
});
