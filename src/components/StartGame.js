import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View, TouchableWithoutFeedback, Keyboard, Modal } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Placeholder, Input, Header } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class StartGame extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sessionKey: '',
      error: '',
      newUserModalVisible: true,
    };
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

  renderModal() {
    if (this.props.newUser) {
      return (
        <Modal
          visible={this.state.newUserModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {}}
        >
          <View style={commonStyles.modalStyle}>
            <View style={commonStyles.longModalSectionStyle}>
              <Text style={commonStyles.mainTextStyle}>
                I see you just made a new account here. Welcome to heis!
              </Text>
              <Button
                onPress={this.exitNewUserModal.bind(this)}
                title='Okay'
                main
              >
              </Button>
            </View>
          </View>
        </Modal>
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
    Actions.statsScreen({role: 'none'});
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={commonStyles.setupStyle}>
          {this.renderModal()}
          <Header
            headerText='Set Up Game'
            includeRightButton
            rightButtonText='Log Out'
            rightButtonAction={() =>
            {Actions.logoutConfirm({role: 'none'});}}
          />
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

        </View>
      </TouchableWithoutFeedback>
    );
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
