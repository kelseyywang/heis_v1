import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Placeholder, Input, Header } from './common';
import ModalWithButton from './ModalWithButton';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';


export default class StartGame extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sessionKey: '',
      error: '',
      newUserModalVisible: true,
      helpMode: false,
      showSessionKeyHelp: false,
      showReadyHelp: false,
      showStatsHelp: false,
      modalShowing: 'none',
    };
    this.callb = null;
  }

  readyActions() {
    if (this.isSessionKeyValid(this.state.sessionKey)) {
      this.checkForRole();
    }
  }

  isSessionKeyValid(key) {
    if (key.includes('.') || key.includes('$') ||
      key.includes('#') || key.includes('[') ||
      key.includes(']') || key.includes('/')) {
        this.setState({
          error: "Don't use any special characters in your session key."
        });
        return false;
      }
    else if (typeof key === 'undefined' || key.length === 0) {
      this.setState({
        error: "Invalid session key."
      });
      return false;
    }
    return true;
  }

  exitNewUserModal() {
    this.setState({
      newUserModalVisible: false,
    });
  }

  //Check if other player has already chosen a role
  //and is already in game
  checkForRole() {
    firebase.database().ref(`/currentSessions/${this.state.sessionKey}`)
    .once('value', snapshot => {
      if (snapshot.val() !== null) {
        let fbTracerInGame = snapshot.val().tracerInGame;
        let fbTraitorInGame = snapshot.val().traitorInGame;
        let fbNumPlayers = snapshot.val().numPlayers;
        if (fbNumPlayers === 2) {
          //Game already has two players, can't join
          this.setState({
            error: 'There are already 2 players in that session',
          });
        }
        else {
          this.clearFirebaseActions(fbTracerInGame, fbTraitorInGame, fbNumPlayers + 1);
          if (fbNumPlayers === 1 && fbTracerInGame) {
            //Tracer has been taken, this user is traitor
            Actions.mapScreenTraitor({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
          }
          else if (fbNumPlayers === 1 && fbTraitorInGame) {
            //Traitor has been taken, this user is tracer
            Actions.mapScreenTracer({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
          }
          else {
            //This user has first choice of role
            Actions.chooseRole({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
          }
        }
      }
      else {
        //Game has not been created yet
        this.clearFirebaseActions(false, false, 1);
        Actions.chooseRole({sessionKey: this.state.sessionKey, type: ActionConst.RESET});
      }
    });
  }

  renderAModal(whichModal) {
    if (whichModal !== 'none') {
      if (eval(`this.state.${whichModal}`)) {
        console.log(`this.state.${whichModal} is true`);
        //can even add an eval for onbuttonpress
        return (
          <ModalWithButton
            onButtonPress={eval(`this.${whichModal}Close.bind(this)`)}
            buttonTitle='Okay'
          >
            Hello
          </ModalWithButton>
        );
      }
    }
  }

  showSessionKeyHelpClose() {
    this.setState({
      showSessionKeyHelp: false,
    });
  }

  sessionKeyHelp() {
    const closeThisModal = () => {
      console.log('lol');
      this.setState({
        showSessionKeyHelp: false,
      });
    this.callb = closeThisModal;
    };
    this.setState({
      modalShowing: 'showSessionKeyHelp',
      showSessionKeyHelp: true,
    });

    //this.renderHelpModal('dis is session key', 'showSessionKeyHelp', closeThisModal);
  }

  readyHelp() {
    const closeThisModal = () => {
      this.setState({
        showReadyHelp: false,
      });
    };
    this.setState({
      modalShowing: 'showReadyHelp',
      showReadyHelp: true,
    });
    //this.renderHelpModal('dis is ready', 'this.state.showReadyHelp', closeThisModal);
  }

  statsHelp() {
    const closeThisModal = () => {
      this.setState({
        showStatsHelp: false,
      });
    };
    this.setState({
      modalShowing: 'showStatsHelp',
      showStatsHelp: true,
    });
    //this.renderHelpModal('dis is session key', 'this.state.showStatsHelp', closeThisModal);
  }

  renderHelpMode() {
    return (
      <View style={commonStyles.setupStyle}>
        {this.renderAModal(this.state.modalShowing)}
        <Header
          headerText='Set Up Game'
          helpMode
          includeLeftButton
          leftButtonText='Help Mode'
          leftButtonAction={() =>
          {this.setState({helpMode: !this.state.helpMode});}}
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
          {Actions.logoutConfirm({hasEntered: 'none'});}}
        />
      <Placeholder flex={0.1} />
      <TouchableOpacity onPress={this.sessionKeyHelp.bind(this)} style={commonStyles.placeholderNJStyle}>
        <Placeholder noJustify >
          <Input
            placeholder='sessionKey'
            label='Session Key'
            editable={false}
          >
          </Input>
            <Text style={styles.altErrorTextStyle}>
              {this.state.error}
            </Text>
          </Placeholder>
        </TouchableOpacity>
        <Placeholder>
          <Text style={commonStyles.mainTextStyle}>Are you ready to start the game?</Text>
          <Button
            onPress={this.readyHelp.bind(this)}
            title='Ready'
            main
          />
        </Placeholder>
        <Placeholder
          flex={0.6}
        >
          <Button
            onPress={this.statsHelp.bind(this)}
            title='Stats'
            main={false}
          />
        </Placeholder>
        <Placeholder flex={0.1} />
      </View>
    );
  }

  renderModal() {
    if (this.props.newUser && this.state.newUserModalVisible) {
      return (
        <ModalWithButton
          onButtonPress={this.exitNewUserModal.bind(this)}
          buttonTitle='Okay'
        >
          I see you just made a new account here. Welcome to heis!
        </ModalWithButton>
      );
    }
  }

  //Resets game properties to default when game is over
  clearFirebaseActions(currTracerInGame, currTraitorInGame, currNumPlayers) {
    firebase.database().ref(`/currentSessions/${this.state.sessionKey}`)
      .set({
        traitorLatitude: 0,
        traitorLongitude: 0,
        traitorInGame: currTraitorInGame,
        tracerInGame: currTracerInGame,
        tracerLatitude: 0,
        tracerLongitude: 0,
        tracerInLocate: false,
        traitorInLocate: false,
        numPlayers: currNumPlayers,
      })
      .catch(() => {
        console.log("firebase reset failed");
      });
  }

  statsActions() {
    Actions.statsScreen({fromRole: 'none'});
  }

  renderContent() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={commonStyles.setupStyle}>
          {this.renderModal()}
          <Header
            headerText='Set Up Game'
            includeLeftButton
            leftButtonText='Help Mode'
            leftButtonAction={() =>
            {this.setState({helpMode: !this.state.helpMode});}}
            includeRightButton
            rightButtonText='Log Out'
            rightButtonAction={() =>
            {Actions.logoutConfirm({hasEntered: 'none'});}}
          />
        <Placeholder flex={0.1} />
        <Placeholder noJustify >
          <Input
            placeholder='sessionKey'
            label='Session Key'
            onChangeText={sessionKey => this.setState({ sessionKey })}
          >
          </Input>
            <Text style={styles.altErrorTextStyle}>
              {this.state.error}
            </Text>
          </Placeholder>
          <Placeholder>
            <Text style={commonStyles.mainTextStyle}>Are you ready to start the game?</Text>
            <Button
              onPress={this.readyActions.bind(this)}
              title='Ready'
              main
            />
          </Placeholder>
          <Placeholder
            flex={0.6}
          >
            <Button
              onPress={this.statsActions.bind(this)}
              title='Stats'
              main={false}
            />
          </Placeholder>
          <Placeholder flex={0.1} />
        </View>
      </TouchableWithoutFeedback>
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
  altErrorTextStyle: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 20,
    alignSelf: 'center',
    textAlign: 'center',
    color: colors.errorTextColor,
  },
});
