import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import firebase from 'firebase';
import GameStartedModal from './GameStartedModal';
import { Button, Header, Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class EndScreenTraitor extends React.Component {
  //TODO: refer to TODOs on EndScreenTracer

  constructor(props) {
    super(props);

    this.state = {
      tracerInGame: false,
      traitorInGame: false,
      tracerInLocate: false,
      newGameModalVisible: true,
      locateModalVisible: true,
      message: '',
    };
  }

  componentDidMount() {
    this.interval = setInterval(this.checkInGame.bind(this), 1000);
    if (this.props.fromGame) {
      this.setState({
        message: this.printMessage(true),
      });
    }
    else {
      this.setState({
        message: this.printMessage(false),
      });
    }
  }

  componentWillUnmount() {
    this.unmountActions();
  }

  unmountActions() {
    clearInterval(this.interval);
  }

  checkInGame() {
    let ret = false;
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      if (snapshot.val() === null) {
        this.unmountActions();
        ret = true;
        return;
      }
      if (!ret) {
        this.setState({
          tracerInGame: snapshot.val().tracerInGame,
          traitorInGame: snapshot.val().traitorInGame,
          tracerInLocate: snapshot.val().tracerInLocate,
        });
      }
    });
  }


  printMessage(updateWins) {
    const winner = this.props.winner;
    if (winner === "Tracer") {
      if (updateWins) this.updateWinsInfo(false);
      return `u lose bitch - got caught by tracer. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Traitor") {
      if (updateWins) this.updateWinsInfo(true);
      return `gud shit you won bc tracer ran out of triggers. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Traitor deflect") {
      if (updateWins) this.updateWinsInfo(true);
      return `yoo you deflected and won. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Traitor time") {
      if (updateWins) this.updateWinsInfo(true);
      return `u win bc lil bitch tracer ran outta time. Game time: ${Math.floor(this.props.endTime)}`;
    }
    else if (winner === "Countdown move") {
      return `the tracer moved during the countdown what a bitch... yall gotta restart`;
    }
    return "There's something wrong here because I didn't get my winner prop.";
  }

  updateWinsInfo(isWin) {
    const { currentUser } = firebase.auth();
    firebase.database().ref(`/users/${currentUser.uid}`)
    .once('value', snapshot => {
      if (isWin) {
        let newWins;
        if (snapshot.val() === null) {
          newWins = 1;
        }
        else {
          newWins = (snapshot.val().traitorWins || 0) + 1;
        }
        let updates = {};
        updates[`/users/${currentUser.uid}/traitorWins/`] = newWins;
        firebase.database().ref().update(updates);
      }
      else {
        let newLosses;
        if (snapshot.val() === null) {
          newLosses = 1;
        }
        else {
          newLosses = (snapshot.val().traitorLosses || 0) + 1;
        }
        let updates = {};
        updates[`/users/${currentUser.uid}/traitorLosses/`] = newLosses;
        firebase.database().ref().update(updates);
      }
    });
  }

  goToNewGame() {
    //Check if other player has chosen a role
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      //Even though tracerInGame/traitorInGame are set to state,
      //it's only set every 3 seconds, so this is more accurate
      let fbTracerInGame = snapshot.val().tracerInGame;
      let fbTraitorInGame = snapshot.val().traitorInGame;
      this.unmountActions();
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
    this.unmountActions();
    Actions.locateScreenTraitor({
      sessionKey: this.props.sessionKey,
      winner: this.props.winner,
      endTime: this.props.endTime,
      type: ActionConst.RESET
    });
  }

  goToStats() {
    //Don't really even need to say 'traitor', just something that's not 'none'
    Actions.statsScreen({sessionKey: this.props.sessionKey, role: 'traitor'});
  }

  exitNewGameModal() {
    this.setState({
      newGameModalVisible: false,
    });
  }

  exitLocateModal() {
    this.setState({
      locateModalVisible: false,
    });
  }

  renderModal() {
    if (this.state.locateModalVisible && this.state.tracerInLocate) {
      return (
        <GameStartedModal
          onButtonPress={this.exitLocateModal.bind(this)}
          buttonTitle='Okay'
        >
          Your friend is looking for you. Go to 'Find My Opponent'
        </GameStartedModal>
      );
    }
    if (this.state.newGameModalVisible) {
      if (this.state.traitorInGame) {
        return (
          <GameStartedModal
            onButtonPress={this.exitNewGameModal.bind(this)}
            buttonTitle='Okay'
          >
            Your opponent started a new game. You are the Tracer.
          </GameStartedModal>
        );
      }
      else if (this.state.tracerInGame) {
        return (
          <GameStartedModal
            onButtonPress={this.exitNewGameModal.bind(this)}
            buttonTitle='Okay'
          >
            Your friend started a new game. You are the Traitor.
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
          headerText='Game Over'
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, role: 'traitor'});}}
        />
      <Placeholder>
        <Text style={commonStyles.mainTextStyle}>{this.state.message}</Text>
          <View style={styles.buttonsRowStyle}>
            <Button
              onPress={this.goToNewGame.bind(this)}
              title='New Game'
              main
            />
            <Button
              onPress={this.goToLocate.bind(this)}
              title='Find Your Opponent'
              margin={20}
              main
            />
            <Button
              onPress={this.goToStats.bind(this)}
              title='Stats'
              margin={20}
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
