import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';

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
      <View style={styles.containerStyle}>
        <Text style={styles.textStyle}>Which side are you on?</Text>
        <View style={styles.buttonsContainerStyle}>
          <Button
            buttonStyle={styles.buttonAltStyle}
            onPress={this.tracerChosen.bind(this)}
            title='Tracer'
          />
          <Button
            buttonStyle={styles.buttonAltStyle}
            onPress={this.traitorChosen.bind(this)}
            title='Traitor'
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
