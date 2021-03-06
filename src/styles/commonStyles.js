import colors from './colors';

const commonStyles = {
  mainTextStyle: {
    margin: 15,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
    color: colors.darkTextColor,
  },
  modalTextStyle: {
    margin: 15,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 30,
    color: colors.darkTextColor,
  },
  accentTextStyle: {
    margin: 15,
    fontSize: 25,
    textAlign: 'center',
    lineHeight: 30,
    color: colors.accentTextColor,
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
  map: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rowContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  aimButtonStyle: {
    marginRight: 30,
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: colors.mainButtonTextColor,
    backgroundColor: colors.mainButtonColor,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  aimTextStyle: {
    color: colors.mainButtonTextColor,
    fontSize: 16,
  },
  modalSectionStyle: {
    margin: 10,
    borderRadius: 8,
    borderWidth: 2,
    padding: 10,
    backgroundColor: colors.modalColor,
    justifyContent: 'space-around',
    flexDirection: 'column',
    borderColor: colors.modalBorderColor,
  },
  modalStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  placeholderStyle: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderStyle2: {
    flex: 2,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderNJStyle: {
    flex: 1,
    alignSelf: 'stretch',
  },
};

export default commonStyles;
