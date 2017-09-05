import React from 'react';
import { StyleSheet, Text, View, Modal } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import { Spinner } from './common';

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

  componentWillMount() {
    this.setCurrentPositions();
    this.interval = setInterval(this.setCurrentPositions.bind(this), 1000);
    let updates = {};
    updates['/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/traitorInLocate/'] = true;
    firebase.database().ref().update(updates);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    let updates = {};
    updates['/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/traitorInLocate/'] = false;
    firebase.database().ref().update(updates);
  }

  setCurrentPositions() {
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333`)
    .once('value', snapshot => {
      let fbTracerLatitude = snapshot.val().latitude;
      let fbTracerLongitude = snapshot.val().longitude;
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
          updates['/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/latitude/'] = position.coords.latitude;
          updates['/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/longitude/'] = position.coords.longitude;
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
    Actions.endScreenTraitor({winner: this.props.winner, endTime: this.props.endTime, type: ActionConst.RESET});
  }

  renderCurrentUser() {
    return (
      <View style={styles.containerStyle}>
        <Modal
          visible={!this.state.tracerInLocate && this.state.locateModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {}}
        >
          <View style={styles.modalStyle}>
            <View style={styles.modalSectionStyle}>
              <Text style={styles.textStyle}>
                Tracer must also be locating you for you to get their position.
              </Text>
              <Button
                style={styles.buttonStyle}
                onPress={this.exitLocateModal.bind(this)}
                title='OKAY'
              >
              </Button>
            </View>
          </View>
        </Modal>
        <Text style={styles.textStyle}>FIND YOUR FRIEND</Text>
        <MapView
          provider="google"
          showsUserLocation
          style={styles.map}
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
        <Button
          style={styles.buttonStyle}
          onPress={this.backActions.bind(this)}
          title='Back'
        >
        </Button>
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
      <View style={styles.containerStyle}>
        {this.renderContent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    margin: 20,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonsContainerStyle: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonAltStyle: {
    marginTop: 20,
    borderRadius: 2,
    backgroundColor: 'rgba(64, 52, 109, 1)',
  },
  textStyle: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30
  },
  map: {
    height: 260,
    width: 300,
    marginTop: 5,
    borderWidth: 2,
    borderColor: 'rgba(64, 52, 109, 1)',
  },
  modalSectionStyle: {
    borderBottomWidth: 1,
    padding: 15,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    flexDirection: 'column',
    borderColor: '#ddd',
    height: 150
  },
  modalStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
});
