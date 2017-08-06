import { Grid, Button } from 'react-native-elements';
import { Scene, Router, Actions } from 'react-native-router-flux';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spinner, Card, CardSection } from './common';

//TODO: add flex styling! fix glitches.
//And need to test once this stops glitching...

//TODO: specific probs: if traitor logs in before tracer and there
//is data from prev game, there will be a line or circle on map

//spazzes out anytime traitor's location changes I think??
//but works fine if iphone tracer and android traitor!? wtf.
export default class MapScreenTraitor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      distance: 0,
      directionCoords: [{
        latitude: 0,
        longitude: 0
      },
      {
        latitude: 0,
        longitude: 0
      }],
      error: null,
      showPolyline: false,
      showCircle: false,
      lastClickLatTraitor: null,
      lastClickLonTraitor: null
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.callCurrentPosition();
    }, 5000);
  }

  componentWillUnmount() {
      clearInterval(this.interval);
  }

  callCurrentPosition() {
    console.log("CALLCURRENTPOSITION - TRAITOR");
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333`)
    .on('value', snapshot => {
      //TODO: Is this the best way to do this? Probably will have long wait time
      //since must wait for navigator to find geolocation, then wait for
      //firebase pull... should we do this in series?
      let fbShowPolyline = snapshot.val().showPolyline;
      let fbShowCircle = snapshot.val().showCircle;
      let fbDistance = snapshot.val().distance;
      let fbDirectionCoords = snapshot.val().directionCoords;
      let fbLastClickLatTraitor = snapshot.val().lastClickLatTraitor;
      let fbLastClickLonTraitor = snapshot.val().lastClickLonTraitor;

        this.setState({
          //set to firebase pull from tracer
          showCircle: fbShowCircle,
          showPolyline: fbShowPolyline,
          distance: fbDistance,
          directionCoords: fbDirectionCoords,
          lastClickLatTraitor: fbLastClickLatTraitor,
          lastClickLonTraitor: fbLastClickLonTraitor
          },
          this.getAndSetLocation.bind(this)
        );
    });
  }

  getAndSetLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null
        });
        //TODO: decompose into function:
        console.log("SET FIREBASE LOC. - TRAITOR");
        firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/`)
          .set({latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
          .then(() => {
            console.log("TRAITOR location set");
          })
          .catch(() => {
            console.log("location set failed");
          });
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

  renderCurrentUser() {
    console.log("RENDERCURRENTUSER - TRAITOR");
    return (
      <View style={styles.container}>
        <MapView
          provider="google"
          style={styles.map}
          initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <MapView.Marker
            title="me"
            coordinate={{
              latitude: this.state.latitude,
              longitude: this.state.longitude
            }}
          />
        {this.state.showCircle &&
          <MapView.Circle
            center={{
              latitude: this.state.lastClickLatTraitor,
              longitude: this.state.lastClickLonTraitor
            }}
            radius={this.state.distance}
            fillColor="rgba(106,92,165,.3)"
            strokeColor="rgba(106,92,165,.9)"
          />
          }
          {this.state.showPolyline &&
          <MapView.Polyline
            coordinates={
              this.state.directionCoords
            }
            strokeColor="rgba(106,92,165,.9)"
            strokeWidth={2}
          />
        }
        </MapView>
    </View>
    );
  }

  renderContent() {
    console.log("RENDERCONTENT - TRAITOR");
    if (this.state.latitude != null && this.state.longitude != null) {
      return this.renderCurrentUser();
    }
    else {
      console.log("RENDERCONTENT IS NULL - TRAITOR");
    }
    return <Spinner size="large" />;
  }

  render() {
    console.log("RENDER - TRAITOR");
    return (
      <View style={styles.container}>
        {this.renderContent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 500,
    width: 400,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  map: {
    height: 300,
    width: 400,
  }
});
