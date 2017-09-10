import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Header, Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';
import GameStartedModal from './GameStartedModal';

export default class ChooseRole extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      traitorInGame: false,
      tracerInGame: false,
      newGameModalVisible: true,
    };
  }

  componentDidMount() {
    this.interval = setInterval(this.checkInGame.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  checkInGame() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      this.setState({
        tracerInGame: snapshot.val().tracerInGame,
        traitorInGame: snapshot.val().traitorInGame,
      });
    });
  }

  goToTracer() {
    Actions.mapScreenTracer({sessionKey: this.props.sessionKey, type: ActionConst.RESET});
  }

  goToTraitor() {
    Actions.mapScreenTraitor({sessionKey: this.props.sessionKey, type: ActionConst.RESET});
  }

  renderModal() {
    if (this.state.traitorInGame) {
      return (
        <GameStartedModal
          onButtonPress={this.goToTracer.bind(this)}
          buttonTitle='Go to game'
        >
          Your opponent started a new game. You are the Tracer.
        </GameStartedModal>
      );
    }
    else if (this.state.tracerInGame) {
      return (
        <GameStartedModal
          onButtonPress={this.goToTraitor.bind(this)}
          buttonTitle='Go to game'
        >
          Your opponent started a new game. You are the Traitor.
        </GameStartedModal>
      );
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
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, role: 'unknown'});}}
        />
      <Placeholder>
        <Text style={commonStyles.mainTextStyle}>Which side are you on?</Text>
          <View style={styles.buttonsRowStyle}>
            <Button
              onPress={this.goToTracer.bind(this)}
              title='Tracer'
              main
            />
            <Button
              onPress={this.goToTraitor.bind(this)}
              title='Traitor'
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
});
