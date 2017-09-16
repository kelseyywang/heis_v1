import React from 'react';
import { StyleSheet, Text, View, Modal } from 'react-native';
import { Button } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class ModalWithButton extends React.Component {
  render() {
    return (
      <Modal
        visible
        transparent
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={commonStyles.modalStyle}>
          <View style={this.props.modalSectionStyle || commonStyles.longModalSectionStyle}>
            <Text style={commonStyles.mainTextStyle}>
              {this.props.children}
            </Text>
            <Button
              onPress={this.props.onButtonPress}
              title={this.props.buttonTitle}
              main
            >
            </Button>
          </View>
        </View>
      </Modal>
    );
  }
}
