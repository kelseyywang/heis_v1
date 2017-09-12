import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View, Modal } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Spinner, Button, Header, Placeholder } from './common';
import commonStyles from '../styles/commonStyles';

export default class StatsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      totalWins: 0,
      totalLosses: 0,
      totalPercent: 0,
      tracerWins: 0,
      tracerLosses: 0,
      tracerPercent: 0,
      traitorWins: 0,
      traitorLosses: 0,
      traitorPercent: 0,
    };
  }

  componentDidMount() {
    this.getAllStats();
  }

  backActions() {
    Actions.pop();
  }

  getAllStats() {
    const { currentUser } = firebase.auth();
    let myTracerWins, myTracerLosses, myTracerPercent;
    let myTraitorWins, myTraitorLosses, myTraitorPercent;
    let myTotalPercent;

    firebase.database().ref(`/users/${currentUser.uid}`)
    .once('value', snapshot => {
      if (snapshot.val() === null) {
        myTracerWins = 0;
        myTracerLosses = 0;
        myTraitorWins = 0;
        myTraitorLosses = 0;
      }
      else {
        myTracerWins = (snapshot.val().tracerWins || 0);
        myTracerLosses = (snapshot.val().tracerLosses || 0);
        myTraitorWins = (snapshot.val().traitorWins || 0);
        myTraitorLosses = (snapshot.val().traitorLosses || 0);
      }
      if (myTracerWins !== 0 || myTracerLosses !== 0) {
        myTracerPercent = 100 * myTracerWins / (myTracerWins + myTracerLosses);
      }
      else {
        myTracerPercent = 0;
      }
      if (myTraitorWins !== 0 || myTraitorLosses !== 0) {
        myTraitorPercent = 100 * myTraitorWins / (myTraitorWins + myTraitorLosses);
      }
      else {
        myTraitorPercent = 0;
      }
      if (myTraitorWins !== 0 || myTraitorLosses !== 0 ||
        myTracerWins !== 0 || myTracerLosses !== 0) {
          myTotalPercent = 100 * (
            (myTracerWins + myTraitorWins) /
            (myTracerWins + myTraitorWins + myTracerLosses + myTraitorLosses));
      }
      else {
        myTotalPercent = 0;
      }
    })
    .then(() => {
      this.setState({
        totalWins: myTracerWins + myTraitorWins,
        totalLosses: myTracerLosses + myTraitorLosses,
        totalPercent: myTotalPercent.toFixed(1),
        tracerWins: myTracerWins,
        tracerLosses: myTracerLosses,
        tracerPercent: myTracerPercent.toFixed(1),
        traitorWins: myTraitorWins,
        traitorLosses: myTraitorLosses,
        traitorPercent: myTraitorPercent.toFixed(1),
      });
    });
  }

  renderStatsSection(title, wins, losses, percent) {
    return (
      <Placeholder flex={1} >
        <Placeholder flex = {0.3} >
          <Text style={commonStyles.accentTextStyle}>
            {title}
          </Text>
        </Placeholder>
        <View style={styles.threeStatsStyle} >
          <View style={styles.oneStatStyle} >
            <Text style={commonStyles.mainTextStyle}>
              W: {wins}
            </Text>
          </View>
          <View style={styles.oneStatStyle} >
            <Text style={commonStyles.mainTextStyle}>
              L: {losses}
            </Text>
          </View>
          <View style={styles.oneStatStyle} >
            <Text style={commonStyles.mainTextStyle}>
              W%: {percent}%
            </Text>
          </View>
        </View>
      </Placeholder>
    );
  }

  renderCurrentUser() {
    return (
      <View style={commonStyles.setupStyle}>
        <Header
          headerText='Your Stats'
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, role: this.props.role});}}
        />
        <Placeholder flex={0.3} />
        {this.renderStatsSection('Tracer:',
        this.state.tracerWins, this.state.tracerLosses, this.state.tracerPercent)}
        {this.renderStatsSection('Traitor:',
        this.state.traitorWins, this.state.traitorLosses, this.state.traitorPercent)}
        {this.renderStatsSection('Total:',
        this.state.totalWins, this.state.totalLosses, this.state.totalPercent)}
        <Placeholder flex={1} >
          <Button
            onPress={this.backActions.bind(this)}
            title='Back'
            main
          >
          </Button>
      </Placeholder>
      </View>
    );
  }

  renderContent() {
    if (this.state.tracerLatitude !== 0 && this.state.tracerLongitude !== 0) {
      return this.renderCurrentUser();
    }
    return <Spinner size="large" />;
  }


  render() {
    return (
      <View style={commonStyles.setupStyle}>
        {this.renderContent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  threeStatsStyle: {
    flex: 0.7,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  oneStatStyle: {
    padding: 5,
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
