import React from 'react';
import firebase from 'firebase';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Button, Header, Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';
import SettingPicker from './SettingPicker';
import ModalWithButton from './ModalWithButton';
import strings from '../styles/strings';

export default class GameSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      countdown: -1,
      countdownLabel: 'default',
      gameTime: -1,
      gameTimeLabel: '10:00',
      captureDist: -1,
      captureDistLabel: '70',
      helpMode: false,
      countdownHelp: false,
      gameTimeHelp: false,
      captureDistHelp: false,
      modalShowing: 'none',
    };
  }

  componentDidMount() {
  }

  backActions() {
    this.updateFirebase();
    Actions.pop();
  }

  updateFirebase() {
    let updates = {};
    if (this.state.countdown !== -1) {
      updates[`/currentSessions/${this.props.sessionKey}/countdownTotal/`] = this.state.countdown * 60;
    }
    if (this.state.gameTime !== -1) {
      updates[`/currentSessions/${this.props.sessionKey}/gameTime/`] = this.state.gameTime * 60;
    }
    if (this.state.captureDist !== -1) {
      updates[`/currentSessions/${this.props.sessionKey}/captureDist/`] = this.state.captureDist;
    }
    firebase.database().ref().update(updates);
  }

  countdownHelpClose() {
    this.setState({
      countdownHelp: false,
    });
  }

  showCountdownHelp() {
    this.setState({
      modalShowing: 'countdownHelp',
      countdownHelp: true,
    });
  }

  gameTimeHelpClose() {
    this.setState({
      gameTimeHelp: false,
    });
  }

  showGameTimeHelp() {
    this.setState({
      modalShowing: 'gameTimeHelp',
      gameTimeHelp: true,
    });
  }

  captureDistHelpClose() {
    this.setState({
      captureDistHelp: false,
    });
  }

  showCaptureDistHelp() {
    this.setState({
      modalShowing: 'captureDistHelp',
      captureDistHelp: true,
    });
  }

  saveSettingsHelpClose() {
    this.setState({
      saveSettingsHelp: false,
    });
  }

  showSaveSettingsHelp() {
    this.setState({
      modalShowing: 'saveSettingsHelp',
      saveSettingsHelp: true,
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

  renderHelpMode(){
    return (
      <View style={commonStyles.setupStyle}>
        {this.renderHelpModal(this.state.modalShowing)}
        <Header
          headerText='Settings - Help Mode'
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
        <Placeholder flex={0.2} />
        <TouchableOpacity
          onPress={this.showCountdownHelp.bind(this)}
          style={commonStyles.placeholderStyle}
        >
          <SettingPicker
            disabled
            title='Adjust Countdown (min:sec):'
            data={countdownData}
            placeholder='default'
            value={this.state.countdownLabel}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={this.showGameTimeHelp.bind(this)}
          style={commonStyles.placeholderStyle}
        >
          <SettingPicker
            disabled
            title='Adjust Round Time (min:sec):'
            data={gameTimeData}
            placeholder='10:00'
            value={this.state.gameTimeLabel}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={this.showCaptureDistHelp.bind(this)}
          style={commonStyles.placeholderStyle}
        >
          <SettingPicker
            disabled
            title='Adjust Capture Distance (meters):'
            data={captureDistData}
            placeholder='70'
            value={this.state.captureDistLabel}
          />
        </TouchableOpacity>
        <Placeholder flex={0.5} >
          <Button
            onPress={this.showSaveSettingsHelp.bind(this)}
            title='Save'
            main
          >
          </Button>
        </Placeholder>
        <Placeholder flex={0.2} />
      </View>
    );
  }

  renderContent() {
    return (
      <View style={commonStyles.setupStyle}>
        <Header
          headerText='Settings'
          includeLeftButton
          leftButtonText='Help Mode'
          leftButtonAction={() =>
          {this.setState({helpMode: !this.state.helpMode});}}
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, fromRole: 'someone'});}}
        />
        <Placeholder flex={0.2} />
          <SettingPicker
            title='Adjust Countdown (min:sec):'
            data={countdownData}
            placeholder='default'
            value={this.state.countdownLabel}
            onChange={(option) => {
              this.setState({
              countdownLabel: option.label,
              countdown: option.key});}}
          />
          <SettingPicker
            title='Adjust Round Time (min:sec):'
            data={gameTimeData}
            placeholder='10:00'
            value={this.state.gameTimeLabel}
            onChange={(option) => {
              this.setState({
              gameTimeLabel: option.label,
              gameTime: option.key});}}
          />
          <SettingPicker
            title='Adjust Capture Distance (meters):'
            data={captureDistData}
            placeholder='70'
            value={this.state.captureDistLabel}
            onChange={(option) => {
              this.setState({
              captureDistLabel: option.label,
              captureDist: option.key});}}
          />
          <Placeholder flex={0.5} >
            <Button
              onPress={this.backActions.bind(this)}
              title='Save'
              main
            >
            </Button>
        </Placeholder>
        <Placeholder flex={0.2} />
      </View>
    );
  }

  render() {
    if (this.state.helpMode) {
      return (
        <View style={commonStyles.setupStyle}>
          {this.renderHelpMode()}
        </View>
      );
    }
    return (
      <View style={commonStyles.setupStyle}>
        {this.renderContent()}
      </View>
    );
  }
}

const countdownData = [
    { key: 0, label: ':00' },
    { key: 0.25, label: ':15' },
    { key: 0.5, label: ':30' },
    { key: 1, label: '1:00' },
    { key: 1.5, label: '1:30' },
    { key: 2, label: '2:00' },
    { key: 2.5, label: '2:30' },
    { key: 3, label: '3:00' },
    { key: 4, label: '4:00' },
    { key: 5, label: '5:00' },
    { key: 6, label: '6:00' },
    { key: 7, label: '7:00' },
    { key: 8, label: '8:00' },
    { key: 9, label: '9:00' },
    { key: 10, label: '10:00' },
    { key: 15, label: '15:00' },
    { key: 20, label: '20:00' },
    { key: 25, label: '25:00' },
    { key: 30, label: '30:00' },
];

const gameTimeData = [
    { key: 1, label: '1:00' },
    { key: 2, label: '2:00' },
    { key: 3, label: '3:00' },
    { key: 4, label: '4:00' },
    { key: 5, label: '5:00' },
    { key: 6, label: '6:00' },
    { key: 7, label: '7:00' },
    { key: 8, label: '8:00' },
    { key: 9, label: '9:00' },
    { key: 10, label: '10:00' },
    { key: 11, label: '11:00' },
    { key: 12, label: '12:00' },
    { key: 13, label: '13:00' },
    { key: 14, label: '14:00' },
    { key: 15, label: '15:00' },
    { key: 20, label: '20:00' },
    { key: 25, label: '25:00' },
    { key: 30, label: '30:00' },
    { key: 45, label: '45:00' },
    { key: 60, label: '60:00' },
];

const captureDistData = [
    { key: 20, label: '20' },
    { key: 30, label: '30' },
    { key: 40, label: '40' },
    { key: 50, label: '50' },
    { key: 60, label: '60' },
    { key: 70, label: '70' },
    { key: 80, label: '80' },
    { key: 90, label: '90' },
    { key: 100, label: '100' },
    { key: 150, label: '150' },
    { key: 200, label: '200' },
    { key: 250, label: '250' },
    { key: 500, label: '500' },
    { key: 1000, label: '1000' },
];

const styles = StyleSheet.create({
  inputStyle: {
    width: 150,
    backgroundColor: colors.inputFieldColor,
    paddingRight: 8,
    paddingLeft: 8,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 18,
    lineHeight: 23,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    textAlign: 'center',
    marginRight: 20,
    marginLeft: 20,
    borderRadius: 8,
  },
});
