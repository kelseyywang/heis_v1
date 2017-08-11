import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Button } from 'react-native-elements';

export default class EndScreenTraitor extends React.Component {
  //TODO: make a Restart button.
  //Upload #wins info to firebase so every time user
  //logs in, he has #wins against a specific opponent
  //and total #wins and losses.
  render() {
    return (
      <View style={styles.containerStyle}>
        <Text style={styles.textStyle}>{this.printMessage()}</Text>
        <Button
          buttonStyle={styles.buttonAltStyle}
          onPress={this.goBack.bind(this)}
          title='Back to game'
        />
      </View>
    );
  }

  printMessage() {
    const winner = this.props.winner;
    if (winner === "Tracer") {
      return `Tracer wins! You got caught, LOSER!!`;
    }
    else if (winner === "Traitor") {
      return "guud, you won! Tracer ran out of triggers... how irresponsible and SAD.";
    }
    else if (winner === "Traitor deflect") {
      return "nice, you deflected and won! woOoOooooOOOOOO";
    }
    return "There's something wrong here because I didn't get my winner prop.";
  }

  goBack() {
    Actions.mapScreenTraitor();
  }
}


const styles = StyleSheet.create({
  containerStyle: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'flex-start',
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
