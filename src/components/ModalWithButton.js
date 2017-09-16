import React from 'react';
import { Text, View, Modal } from 'react-native';
import { Button } from './common';
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
