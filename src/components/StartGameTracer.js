import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';

export default class StartGameTracer extends React.Component {

  readyActions() {
    Actions.mapScreenTracer({type: ActionConst.RESET});
  }

  render() {
    return (
      <View style={styles.containerStyle}>
        <Text style={styles.textStyle}>Are you ready to start the game?</Text>
        <Button
          buttonStyle={styles.buttonAltStyle}
          onPress={this.readyActions.bind(this)}
          title='Ready'
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  containerStyle: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonsRowStyle: {
    flexDirection: 'row',
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
