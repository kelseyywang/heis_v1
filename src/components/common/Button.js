import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import colors from '../../styles/colors';

const Button = (props) => {
  const {textStyle, buttonStyle } = styles;
  //const marginInt = parseInt(margin);
  if (props.main) {
    return (
      <TouchableOpacity
        onPress={props.onPress}
        style={[buttonStyle,
          {borderColor: colors.mainButtonTextColor,
            backgroundColor: colors.mainButtonColor,
            margin: (props.margin || 5),
          }]}
      >
        <Text style={[textStyle, {color: colors.mainButtonTextColor}]}>{props.title}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[buttonStyle,
        {borderColor: colors.secondaryButtonTextColor,
          backgroundColor: colors.secondaryButtonColor,
          margin: (props.margin || 5),
        }]}
    >
      <Text style={[textStyle, {color: colors.secondaryButtonTextColor}]}>{props.title}</Text>
    </TouchableOpacity>
  );
};

const styles = {
  textStyle: {
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonStyle: {
    borderWidth: 1,
    borderRadius: 8,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
};

export { Button };
