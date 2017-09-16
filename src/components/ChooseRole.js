import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Header, Placeholder, ModalWithButton } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

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
        });
      }
    });
  }

  tracerPressed() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}/tracerInGame/`)
    .once('value', snapshot => {
      if (snapshot.val()) {
        //Other user already picked Tracer. Show ModalWithButton
        this.setState({
          tracerInGame: snapshot.val(),
        });
      }
      else {
        this.goToTracer();
      }
    });
  }

  traitorPressed() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}/traitorInGame/`)
    .once('value', snapshot => {
      if (snapshot.val()) {
        //Other user already picked Traitor. Show ModalWithButton
        this.setState({
          traitorInGame: snapshot.val(),
        });
      }
      else {
        this.goToTraitor();
      }
    });
  }

  goToTracer() {
    this.unmountActions();
    Actions.mapScreenTracer({sessionKey: this.props.sessionKey, type: ActionConst.RESET});
  }

  goToTraitor() {
    this.unmountActions();
    Actions.mapScreenTraitor({sessionKey: this.props.sessionKey, type: ActionConst.RESET});
  }

  goToGameSettings() {
    this.unmountActions();
    Actions.gameSettings({sessionKey: this.props.sessionKey});
  }

  renderModal() {
    if (this.state.traitorInGame) {
      return (
        <ModalWithButton
          onButtonPress={this.goToTracer.bind(this)}
          buttonTitle='Go to game'
        >
          Your opponent started a new round. You are the Tracer.
        </ModalWithButton>
      );
    }
    else if (this.state.tracerInGame) {
      return (
        <ModalWithButton
          onButtonPress={this.goToTraitor.bind(this)}
          buttonTitle='Go to game'
        >
          Your opponent started a new round. You are the Traitor.
        </ModalWithButton>
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
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, hasEntered: true});}}
        />
      <Placeholder>
        <Text style={commonStyles.mainTextStyle}>Which side are you on?</Text>
          <View style={styles.buttonsRowStyle}>
            <Button
              onPress={this.tracerPressed.bind(this)}
              title='Tracer'
              main
            />
            <Button
              onPress={this.traitorPressed.bind(this)}
              title='Traitor'
              main
            />
          </View>
        </Placeholder>
        <Placeholder
          flex={0.3}
        >
          <Button
            onPress={this.goToGameSettings.bind(this)}
            title='Game Settings'
          />
        </Placeholder>
        <Placeholder flex={0.2} />
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
