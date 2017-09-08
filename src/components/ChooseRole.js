import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Header, Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class ChooseRole extends React.Component {
  componentDidMount() {
  }

  componentWillUnmount() {
  }

  tracerChosen() {
    Actions.mapScreenTracer({sessionKey: this.props.sessionKey, type: ActionConst.RESET});
  }

  traitorChosen() {
    Actions.mapScreenTraitor({sessionKey: this.props.sessionKey, type: ActionConst.RESET});
  }

  render() {
    return (
      <View style={commonStyles.setupStyle}>
        <Header
          headerText='Choose Side'
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirmTracer({sessionKey: this.props.sessionKey});}}
        />
      <Placeholder>
        <Text style={commonStyles.mainTextStyle}>Which side are you on?</Text>
          <View style={styles.buttonsRowStyle}>
            <Button
              onPress={this.tracerChosen.bind(this)}
              title='Tracer'
              main
            />
            <Button
              onPress={this.traitorChosen.bind(this)}
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
