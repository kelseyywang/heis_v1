import React from 'react';
import ModalSelector from 'react-native-modal-selector';
import { StyleSheet, Text, TextInput } from 'react-native';
import { Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class SettingPicker extends React.Component {
  render() {
    return (
      <Placeholder>
        <Placeholder flex={0.3} >
          <Text style={commonStyles.mainTextStyle}>
            {this.props.title}
          </Text>
        </Placeholder>
        <Placeholder flex={0.7}>
          <ModalSelector
            cancelText="Cancel"
            optionTextStyle={{color: colors.pickerOptionColor}}
            data={this.props.data}
            onChange={this.props.onChange}
            disabled={this.props.disabled}
          >
            <TextInput
              placeholder={this.props.placeholder}
              value={this.props.value}
              style={styles.inputStyle}
            />
          </ModalSelector>
        </Placeholder>
      </Placeholder>
    );
  }
}

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
