import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View, Modal } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import MapView from 'react-native-maps';
import { Spinner, Button, Header, Placeholder } from './common';
import commonStyles from '../styles/commonStyles';

export default class LocateScreenTraitor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tracerLatitude: null,
      tracerLongitude: null,
      traitorLatitude: null,
      traitorLongitude: null,
      tracerInLocate: false,
      locateModalVisible: true,
      error: null,
    };
  }

  componentDidMount() {
    this.setCurrentPositions();
    this.interval = setInterval(this.setCurrentPositions.bind(this), 1000);
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/traitorInLocate/`] = true;
    firebase.database().ref().update(updates);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/traitorInLocate/`] = false;
    firebase.database().ref().update(updates);
  }

  setCurrentPositions() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      let fbTracerLatitude = snapshot.val().tracerLatitude;
      let fbTracerLongitude = snapshot.val().tracerLongitude;
      let fbTracerInLocate = snapshot.val().tracerInLocate;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            traitorLatitude: position.coords.latitude,
            traitorLongitude: position.coords.longitude,
            tracerLatitude: fbTracerLatitude,
            tracerLongitude: fbTracerLongitude,
            tracerInLocate: fbTracerInLocate,
            error: null
          });
          let updates = {};
          updates[`/currentSessions/${this.props.sessionKey}/traitorLatitude/`] = position.coords.latitude;
          updates[`/currentSessions/${this.props.sessionKey}/traitorLongitude/`] = position.coords.longitude;
          firebase.database().ref().update(updates);
        },
        (error) => this.setState({ error: error.message }),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
      );
    });
  }

  exitLocateModal() {
    this.setState({
      locateModalVisible: false,
    });
  }

  backActions() {
    Actions.endScreenTraitor({
      sessionKey: this.props.sessionKey,
      winner: this.props.winner,
      endTime: this.props.endTime,
      type: ActionConst.RESET
    });
  }

  renderCurrentUser() {
    return (
      <View style={commonStyles.setupStyle}>
        <Header
          headerText='Traitor'
          gameMode
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, role: 'traitor'});}}
        />
        <Modal
          visible={!this.state.tracerInLocate && this.state.locateModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {}}
        >
          <View style={commonStyles.modalStyle}>
            <View style={commonStyles.longModalSectionStyle}>
              <Text style={commonStyles.mainTextStyle}>
                Tracer must also be locating you for you to get their position.
              </Text>
              <Button
                onPress={this.exitLocateModal.bind(this)}
                title='Okay'
                main
              >
              </Button>
            </View>
          </View>
        </Modal>
        <Placeholder flex={0.3} >
          <Text style={commonStyles.mainTextStyle} >
            Reunite with the Tracer
          </Text>
        </Placeholder>
        <Placeholder flex={1} >
          <MapView
            provider="google"
            showsUserLocation
            style={commonStyles.map}
            initialRegion={{
              latitude: this.state.traitorLatitude,
              longitude: this.state.traitorLongitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {this.state.tracerInLocate &&
              <MapView.Marker
                title="Tracer"
                coordinate={{
                  latitude: this.state.tracerLatitude,
                  longitude: this.state.tracerLongitude,
                }}
              />
            }
          </MapView>
        </Placeholder>
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
    if (this.state.tracerLatitude !== null && this.state.tracerLongitude !== null &&
    this.state.traitorLatitude !== null && this.state.traitorLongitude !== null) {
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
