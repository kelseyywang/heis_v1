import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Button } from 'react-native-elements';

export default class MapScreen extends React.Component {
  render() {
    return (
      <View>
        <Text>Da game Is ovEr, BITCH!</Text>
        <Button
          buttonStyle={{backgroundColor: 'green', borderRadius: 4, marginBottom: 20}}
          onPress={this.goBack.bind(this)}
          title='Back to Map'
        />
      </View>
    );
  }

  goBack() {
    Actions.mapScreen();
  }
}
