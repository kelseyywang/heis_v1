import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import { Spinner } from './common';

//TODO 9/1: make back button cancel interval
//TODO 9/1: make modal that says other person must be in the locate Screen too to
//get location. Also reset the tracerInLocate, etc.
export default class LocateScreenTracer extends React.Component {
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
    updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/tracerInLocate/'] = true;
    firebase.database().ref().update(updates);
  }
//remember to clear interval!?
  setCurrentPositions() {
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      let fbTraitorLatitude = snapshot.val().latitude;
      let fbTraitorLongitude = snapshot.val().longitude;
      console.log("fbtraitor" + fbTraitorLatitude);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            tracerLatitude: position.coords.latitude,
            tracerLongitude: position.coords.longitude,
            traitorLatitude: fbTraitorLatitude,
            traitorLongitude: fbTraitorLongitude,
            error: null
          });
          let updates = {};
          updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/latitude/'] = position.coords.latitude;
          updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/longitude/'] = position.coords.longitude;
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
            latitude: this.state.tracerLatitude,
            longitude: this.state.tracerLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <MapView.Circle
            center={{
              latitude: this.state.traitorLatitude,
              longitude: this.state.traitorLongitude,
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
