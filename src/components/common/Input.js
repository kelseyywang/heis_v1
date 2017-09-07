import React from 'react';
import { TextInput, View, Text } from 'react-native';

const Input = ({label, value, onChangeText, placeholder, secureTextEntry}) => {
  const {inputStyle, labelStyle, containerStyle } = styles;
  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
        <TextInput
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        style={inputStyle}
        />
    </View>
  );
};

const styles = {
  inputStyle: {
    backgroundColor: '#FFFFFF',
    color: '#000',
    paddingRight:5,
    paddingLeft:5,
    fontSize:18,
    lineHeight:23,
    flex:2,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  labelStyle:{
    fontSize:18,
    flex:1
  },
  containerStyle: {
    height:40,
    flex:1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
};
export {Input};
