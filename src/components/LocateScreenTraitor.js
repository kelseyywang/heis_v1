import React from 'react';
import firebase from 'firebase';
import { StyleSheet, Text, View, Modal } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import MapView from 'react-native-maps';
import { Spinner, Button, Header, Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class LocateScreenTraitor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tracerLatitude: 0,
      tracerLongitude: 0,
      traitorLatitude: 0,
      traitorLongitude: 0,
      tracerInLocate: false,
      locateModalVisible: true,
      initialLatDelta: 0,
      initialLonDelta: 0,
      initialLat: 0,
      initialLon: 0,
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
    this.unmountActions();
  }

  unmountActions() {
    clearInterval(this.interval);
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      if (snapshot.val() !== null) {
        let updates = {};
        updates[`/currentSessions/${this.props.sessionKey}/traitorInLocate/`] = false;
        firebase.database().ref().update(updates);
      }
    });
  }

  setCurrentPositions() {
    let ret = false;
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      if (snapshot.val() === null) {
        this.unmountActions();
        ret = true;
        return;
      }
      if (!ret) {
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
            if (fbTracerInLocate && fbTracerLatitude !== 0 && fbTracerLongitude !== 0) {
              this.setState({
                initialLatDelta: this.calcLocateDelta(this.state.tracerLatitude,
                  this.state.traitorLatitude),
                initialLonDelta: this.calcLocateDelta(this.state.tracerLongitude,
                  this.state.traitorLongitude),
                initialLat: this.calcAve(this.state.tracerLatitude,
                  this.state.traitorLatitude),
                initialLon: this.calcAve(this.state.tracerLongitude,
                  this.state.traitorLongitude),
              });
            }
            let updates = {};
            updates[`/currentSessions/${this.props.sessionKey}/traitorLatitude/`] = position.coords.latitude;
            updates[`/currentSessions/${this.props.sessionKey}/traitorLongitude/`] = position.coords.longitude;
            firebase.database().ref().update(updates);
          },
          (error) => this.setState({ error: error.message }),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
      }
    });
  }

  calcLocateDelta(coord1, coord2) {
    let difference = Math.abs(coord1 - coord2);
    //add difference / 6 to add some padding
    return (difference + difference / 4);
  }

  calcAve(coord1, coord2) {
    return ((coord1 + coord2) / 2);
  }

  exitLocateModal() {
    this.setState({
      locateModalVisible: false,
    });
  }

  backActions() {
    this.unmountActions();
    Actions.endScreenTraitor({
      sessionKey: this.props.sessionKey,
      winner: this.props.winner,
      endTime: this.props.endTime,
      type: ActionConst.RESET
    });
  }

  renderMap() {
    if (this.state.initialLatDelta !== 0 && this.state.initialLonDelta !== 0
    && this.state.initialLat !== 0 && this.state.initialLon !== 0) {
      return (
        <MapView
          provider="google"
          showsUserLocation
          style={commonStyles.map}
          initialRegion={{
            latitude: this.state.initialLat,
            longitude: this.state.initialLon,
            latitudeDelta: this.state.initialLatDelta,
            longitudeDelta: this.state.initialLonDelta,
          }}
        >
          {this.state.tracerInLocate &&
            <MapView.Marker
              title="Tracer"
              pinColor={colors.markerColor}
              coordinate={{
                latitude: this.state.tracerLatitude,
                longitude: this.state.tracerLongitude,
              }}
            />
          }
        </MapView>
      );
    }
  }

  renderCurrentUser() {
    return (
      <View style={commonStyles.setupStyle}>
        <Header
          headerText='Locate Other Player'
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, hasEntered: true});}}
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
        <Placeholder flex={1} >
          {this.renderMap()}
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
    if (this.state.traitorLatitude !== 0 && this.state.traitorLongitude !== 0) {
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
