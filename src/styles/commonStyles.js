import colors from './colors';

commonStyles = {
  mainTextStyle: {
    margin: 15,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
    color: colors.darkTextColor,
  },
  lightTextStyle: {
    margin: 15,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
    color: colors.lightTextColor,
  },
  errorTextStyle: {
    margin: 15,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
    color: colors.errorTextColor,
  },
  setupStyle: {
    flex: 1,
    flexDirection: 'column',
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.backgroundSetupColor,
  },
  gameStyle: {
    flex: 1,
    flexDirection: 'column',
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.backgroundGameColor,
  },
}

export default commonStyles;
