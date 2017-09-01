import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import { Spinner } from './common';

//TODO: make back button cancel interval
export default class LocateScreenTraitor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tracerLatitude: null,
      tracerLongitude: null,
      traitorLatitude: null,
      traitorLongitude: null,
      error: null,
    };
  }

  componentWillMount() {
    this.setCurrentPositions();
    this.interval = setInterval(this.setCurrentPositions.bind(this), 3000);
    let updates = {};
    updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/traitorInLocate/'] = true;
    firebase.database().ref().update(updates);
  }
//remember to clear interval!?
  setCurrentPositions() {
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333`)
    .once('value', snapshot => {
      let fbTracerLatitude = snapshot.val().latitude;
      let fbTracerLongitude = snapshot.val().longitude;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            traitorLatitude: position.coords.latitude,
            traitorLongitude: position.coords.longitude,
            tracerLatitude: fbTracerLatitude,
            tracerLongitude: fbTracerLongitude,
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

  renderCurrentUser() {
    return (
      <View style={styles.containerStyle}>
        <Text style={styles.textStyle}>YOU DO NOT AMAZE ME AY</Text>
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
          <MapView.Circle
            center={{
              latitude: this.state.tracerLatitude,
              longitude: this.state.tracerLongitude,
            }}
            fillColor="rgba(106,92,165,.9)"
            radius={20}
            strokeColor="rgba(106,92,165,.9)"
            strokeWidth={2}
          />
        </MapView>
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
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 40
  },
  map: {
    height: 260,
    width: 300,
    marginTop: 5,
    borderWidth: 2,
    borderColor: 'rgba(64, 52, 109, 1)',
  },
});
