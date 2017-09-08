import React from 'react';
import { StyleSheet, Text, View, Modal } from 'react-native';
import { Button } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class GameStartedModal extends React.Component {
  renderCurrentUser() {
    return (
      <Modal
        visible
        transparent
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={commonStyles.modalStyle}>
          <View style={commonStyles.modalSectionStyle}>
            <Text style={commonStyles.mainTextStyle}>
              {this.props.children}
            </Text>
            <Button
              onPress={this.props.onCloseModal}
              title='Okay'
              main
            >
            </Button>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    return this.renderCurrentUser();
  }
}
