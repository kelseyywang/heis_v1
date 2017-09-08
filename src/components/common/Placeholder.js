import React from 'react';
import { View } from 'react-native';

const Placeholder = (props) => {
  if (props.noJustify) {
    return (
      <View style={[{flex: (props.flex || 1)}, styles.placeholderNJStyle]}>
        {props.children}
      </View>
    );
  }
  return (
    <View style={[{flex: (props.flex || 1)}, styles.placeholderStyle]}>
      {props.children}
    </View>
  );
};

const styles = {
  placeholderStyle: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderNJStyle: {
    alignSelf: 'stretch',
  },
};

export { Placeholder };
