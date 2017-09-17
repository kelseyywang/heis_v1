import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import colors from '../../styles/colors';

const Header = (props) => {
  const { titleText, leftText, rightText,
    viewStyle, helpViewStyle, placeholderStyle } = styles;
  if (props.helpMode) {
    return (
      <View style={helpViewStyle}>
        <View style={placeholderStyle}>
          {props.includeLeftButton &&
            <TouchableOpacity
              onPress={props.leftButtonAction}
            >
              <Text style={leftText}>{props.leftButtonText}</Text>
            </TouchableOpacity>
          }
        </View>
        <View style={placeholderStyle}>
          <Text style={titleText}>{props.headerText}</Text>
        </View>
        <View style={placeholderStyle}>
          {props.includeRightButton &&
            <TouchableOpacity
              onPress={props.rightButtonAction}
            >
              <Text style={rightText}>{props.rightButtonText}</Text>
            </TouchableOpacity>
          }
        </View>
      </View>
    );
  }
  return (
    <View style={viewStyle}>
      <View style={placeholderStyle}>
        {props.includeLeftButton &&
          <TouchableOpacity
            onPress={props.leftButtonAction}
          >
            <Text style={leftText}>{props.leftButtonText}</Text>
          </TouchableOpacity>
        }
      </View>
      <View style={placeholderStyle}>
        <Text style={titleText}>{props.headerText}</Text>
      </View>
      <View style={placeholderStyle}>
        {props.includeRightButton &&
          <TouchableOpacity
            onPress={props.rightButtonAction}
          >
            <Text style={rightText}>{props.rightButtonText}</Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  viewStyle: {
    ...Platform.select({
      ios: {
        paddingTop: 20,
        height: 70,
      },
      android: {
        paddingTop: 25,
        height: 75,
      },
      windows: {
        paddingTop: 25,
        height: 75,
      },
    }),
    alignSelf: 'stretch',
    backgroundColor: colors.headerColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpViewStyle: {
    ...Platform.select({
      ios: {
        paddingTop: 20,
        height: 70,
      },
      android: {
        paddingTop: 25,
        height: 75,
      },
      windows: {
        paddingTop: 25,
        height: 75,
      },
    }),
    alignSelf: 'stretch',
    backgroundColor: colors.helpHeaderColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderStyle: {
    flex: 1,
    alignSelf: 'stretch',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftText: {
    paddingRight: 15,
    alignSelf: 'center',
    color: colors.clickTextColor,
  },
  rightText: {
    paddingLeft: 15,
    alignSelf: 'center',
    color: colors.clickTextColor,
  },
  titleText: {
    alignSelf: 'center',
    textAlign: 'center',
    color: colors.lightTextColor,
  },
});

export { Header };
