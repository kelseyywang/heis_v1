import React from 'react';
import { StyleSheet, Text, View, Modal } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import { Spinner } from './common';

export default class GameStartedModal extends React.Component {
  renderCurrentUser() {
    return (
      <Modal
        visible
        transparent
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={styles.modalStyle}>
          <View style={styles.modalSectionStyle}>
            <Text style={styles.textStyle}>
              {this.props.children}
            </Text>
            <Button
              style={styles.buttonStyle}
              onPress={this.props.onCloseModal}
              title='OKAY'
            >
            </Button>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    return (
      <View style={styles.containerStyle}>
        {this.renderCurrentUser()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
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
  modalSectionStyle: {
    borderBottomWidth: 1,
    padding: 15,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    flexDirection: 'column',
    borderColor: '#ddd',
    height: 150
  },
  modalShortSectionStyle: {
    borderBottomWidth: 1,
    padding: 15,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    flexDirection: 'column',
    borderColor: '#ddd',
    height: 70
  },
  textStyle: {
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 40
  },
  modalStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
});
