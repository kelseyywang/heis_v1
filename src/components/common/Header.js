import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import colors from '../../styles/colors';

const Header = (props) => {
  const { titleText, rightText,
    viewStyle, altViewStyle,
    placeholderStyle, gameViewStyle,
    gameTitleText, gameRightText } = styles;
  if (props.gameMode) {
    return (
      <View style={gameViewStyle}>
          <View style={placeholderStyle} />
          <View style={placeholderStyle}>
            <Text style={gameTitleText}>{props.headerText}</Text>
          </View>
          <View style={placeholderStyle}>
            <TouchableOpacity
              onPress={props.rightButtonAction}
            >
              <Text style={gameRightText}>{props.rightButtonText}</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }
  if (props.includeRightButton) {
    return (
      <View style={viewStyle}>
          <View style={placeholderStyle} />
          <View style={placeholderStyle}>
            <Text style={titleText}>{props.headerText}</Text>
          </View>
          <View style={placeholderStyle}>
            <TouchableOpacity
              onPress={props.rightButtonAction}
            >
              <Text style={rightText}>{props.rightButtonText}</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View style={altViewStyle}>
      <Text style={titleText}>{props.headerText}</Text>
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
  gameViewStyle: {
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
    backgroundColor: colors.gameHeaderColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  altViewStyle: {
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
    paddingLeft: 20,
    paddingRight: 20,
    alignSelf: 'stretch',
    backgroundColor: colors.headerColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderColor,
    flexDirection: 'row',
    justifyContent: 'center',
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
  rightText: {
    paddingLeft: 30,
    alignSelf: 'center',
    color: colors.clickTextColor,
  },
  titleText: {
    alignSelf: 'center',
    textAlign: 'center',
    color: colors.lightTextColor,
  },
  gameRightText: {
    paddingLeft: 30,
    alignSelf: 'center',
    color: colors.gameClickTextColor,
  },
  gameTitleText: {
    alignSelf: 'center',
    textAlign: 'center',
    color: colors.darkTextColor,
  },
});

export { Header };
