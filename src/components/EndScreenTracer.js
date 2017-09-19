import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Header, Placeholder } from './common';
import ModalWithButton from './ModalWithButton';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';
import strings from '../styles/strings';

export default class EndScreenTracer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      traitorInGame: false,
      tracerInGame: false,
      traitorInLocate: false,
      newGameModalVisible: true,
      locateModalVisible: true,
      message: '',
      helpMode: false,
      newGameHelp: false,
      locateHelp: false,
      statsHelp: false,
      modalShowing: 'none',
    };
  }

  componentDidMount() {
    this.interval = setInterval(this.checkInGame.bind(this), 1000);
    if (this.props.fromGame) {
      this.setState({
        message: this.informWinOrLoss(true),
      });
    }
    else {
      this.setState({
        message: this.informWinOrLoss(false),
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
          traitorInLocate: snapshot.val().traitorInLocate,
        });
      }
    });
  }

  informWinOrLoss(updateWins) {
    const winner = this.props.winner;
    let gameTimeSeconds = Math.floor(this.props.endTime);
    const messages = {
      triggerAndTime:
      `Triggered at ${this.props.triggerDistance} meters. Game time: ${Math.floor(gameTimeSeconds / 60)} minutes, ${gameTimeSeconds % 60} seconds.`,
      time:
      `Game time: ${Math.floor(gameTimeSeconds / 60)} minutes, ${gameTimeSeconds % 60} seconds.`,
    };
    if (winner === "Tracer") {
      if (updateWins) this.updateWinsInfo(true);
      return `${strings.tracer1} ${messages.triggerAndTime}`;
    }
    else if (winner === "Traitor") {
      if (updateWins) this.updateWinsInfo(false);
      return `${strings.traitor1} ${messages.time}`;
    }
    else if (winner === "Traitor deflect") {
      if (updateWins) this.updateWinsInfo(false);
      return `${strings.deflect1} ${messages.triggerAndTime}`;
    }
    else if (winner === "Traitor time") {
      if (updateWins) this.updateWinsInfo(false);
      return `${strings.time1}`;
    }
    else if (winner === "Countdown move") {
      return `${strings.move1}`;
    }
    return "Sorry, something went wrong. Try again.";
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
          newWins = (snapshot.val().tracerWins || 0) + 1;
        }
        let updates = {};
        updates[`/users/${currentUser.uid}/tracerWins/`] = newWins;
        firebase.database().ref().update(updates);
      }
      else {
        let newLosses;
        if (snapshot.val() === null) {
          newLosses = 1;
        }
        else {
          newLosses = (snapshot.val().tracerLosses || 0) + 1;
        }
        let updates = {};
        updates[`/users/${currentUser.uid}/tracerLosses/`] = newLosses;
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
    Actions.locateScreenTracer({
      sessionKey: this.props.sessionKey,
      winner: this.props.winner,
      triggerDistance: this.props.triggerDistance,
      endTime: this.props.endTime,
      type: ActionConst.RESET
    });
  }

  goToStats() {
    Actions.statsScreen({sessionKey: this.props.sessionKey, fromRole: 'someone'});
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

  newGameHelpClose() {
    this.setState({
      newGameHelp: false,
    });
  }

  showNewGameHelp() {
    this.setState({
      modalShowing: 'newGameHelp',
      newGameHelp: true,
    });
  }

  locateHelpClose() {
    this.setState({
      locateHelp: false,
    });
  }

  showLocateHelp() {
    this.setState({
      modalShowing: 'locateHelp',
      locateHelp: true,
    });
  }

  statsHelpClose() {
    this.setState({
      statsHelp: false,
    });
  }

  showStatsHelp() {
    this.setState({
      modalShowing: 'statsHelp',
      statsHelp: true,
    });
  }

  renderHelpModal(whichModal) {
    if (whichModal !== 'none') {
      if (eval(`this.state.${whichModal}`)) {
        return (
          <ModalWithButton
            onButtonPress={eval(`this.${whichModal}Close.bind(this)`)}
            buttonTitle='Okay'
          >
            {strings[whichModal]}
          </ModalWithButton>
        );
      }
    }
  }

  renderHelpMode() {
    return (
      <View style={commonStyles.setupStyle}>
        {this.renderHelpModal(this.state.modalShowing)}
        <Header
          headerText='Game Over - Help Mode'
          helpMode
          includeLeftButton
          leftButtonText='Help Mode'
          leftButtonAction={() =>
          {this.setState({helpMode: !this.state.helpMode});}}
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, fromRole: 'someone'});}}
        />
      <Placeholder flex={0.1} />
      <Placeholder>
        <Text style={commonStyles.mainTextStyle}>{this.state.message}</Text>
          <View style={styles.buttonsColumnStyle}>
            <Button
              onPress={this.showNewGameHelp.bind(this)}
              title='New Round'
              main
            />
            <Button
              onPress={this.showLocateHelp.bind(this)}
              title='Find Your Opponent'
              margin={30}
              main
            />
          </View>
        </Placeholder>
        <Placeholder
          flex={0.3}
        >
          <Button
            onPress={this.showStatsHelp.bind(this)}
            title='Stats'
          />
        </Placeholder>
        <Placeholder flex={0.1} />
      </View>
    );
  }

  renderModal() {
    if (this.state.locateModalVisible && this.state.traitorInLocate) {
      return (
        <ModalWithButton
          onButtonPress={this.exitLocateModal.bind(this)}
          buttonTitle='Okay'
        >
          {strings.locateModalText}
        </ModalWithButton>
      );
    }
    if (this.state.newGameModalVisible) {
      if (this.state.traitorInGame) {
        return (
          <ModalWithButton
            onButtonPress={this.exitNewGameModal.bind(this)}
            buttonTitle='Okay'
          >
            {strings.newRoundTracer}
          </ModalWithButton>
        );
      }
      else if (this.state.tracerInGame) {
        return (
          <ModalWithButton
            onButtonPress={this.exitNewGameModal.bind(this)}
            buttonTitle='Okay'
          >
            {strings.newRoundTraitor}
          </ModalWithButton>
        );
      }
    }
  }

  renderContent() {
    return (
      <View style={commonStyles.setupStyle}>
        {this.renderModal()}
        <Header
          headerText='Game Over'
          includeLeftButton
          leftButtonText='Help Mode'
          leftButtonAction={() =>
          {this.setState({helpMode: !this.state.helpMode});}}
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, fromRole: 'someone'});}}
        />
      <Placeholder flex={0.1} />
      <Placeholder>
        <Text style={commonStyles.mainTextStyle}>{this.state.message}</Text>
          <View style={styles.buttonsColumnStyle}>
            <Button
              onPress={this.goToNewGame.bind(this)}
              title='New Round'
              main
            />
            <Button
              onPress={this.goToLocate.bind(this)}
              title='Find Your Opponent'
              margin={30}
              main
            />
          </View>
        </Placeholder>
        <Placeholder
          flex={0.3}
        >
          <Button
            onPress={this.goToStats.bind(this)}
            title='Stats'
          />
        </Placeholder>
        <Placeholder flex={0.1} />
      </View>
    );
  }

  render() {
    if (this.state.helpMode) {
      return this.renderHelpMode();
    }
    return this.renderContent();
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
  buttonsColumnStyle: {
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
});
