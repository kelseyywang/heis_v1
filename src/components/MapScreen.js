import MapView from 'react-native-maps';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spinner, Button } from './common';
import {Scene, Router, Actions} from 'react-native-router-flux';
import firebase from 'firebase';

export default class MapScreen extends React.Component {

  state = {
    latitude: null,
    longitude: null,
    error: null
    };

  distance(lat1, lon1, lat2, lon2) {
    { /* Setting zeroed second point to Rinconada Library for test*/ }
    lat2 += 37.444999;
    lon2 -= 122.139389;
    let radlat1 = Math.PI * lat1/180;
  	let radlat2 = Math.PI * lat2/180;
  	let theta = lon1-lon2;
  	let radtheta = Math.PI * theta/180;
  	let dist = Math.sin(radlat1) * Math.sin(radlat2)
    + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  	dist = Math.acos(dist);
  	dist = dist * 180/Math.PI;
  	dist = dist * 60 * 1.1515;
    dist = dist * 1609.344;
  	return dist;
  }

directionCoords(lat1, lon1, lat2, lon2) {
  {/* Setting zeroed second point to Rinconada Library for test*/}
  lat2 += 37.444999;
  lon2 -= 122.139389;
  {/* Arbitrary multiplier as long as it begins and ends off screen initially*/}
  const multiplier = 50;
  return ([{
    latitude: lat1 + ((lat2 - lat1) * multiplier),
    longitude: lon1 + ((lon2 - lon1) * multiplier)
  },
  {
    latitude: lat1 + ((lat1 - lat2) * multiplier),
    longitude: lon1 + ((lon1 - lon2) * multiplier)
  }]);
}


  componentDidMount() {
    this.callCurrentPosition();
    const { currentUser } = firebase.auth();
    if (currentUser.uid === "AQVDfE7Fp4S4nDXvxpX4fchTt2w2") {
      this.interval = setInterval(() => {
        this.callCurrentPosition();
      }, 5000);
  }
  }

  callCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

  componentWillUnmount() {
    const { currentUser } = firebase.auth();
    if (currentUser.uid === "AQVDfE7Fp4S4nDXvxpX4fchTt2w2") {
      clearInterval(this.interval);
    }
  }

  render() {
      return (
      <View style={styles.container}>
        {this.renderContent()}
      </View>
    );
  }

  renderContent() {
    if (this.state.latitude != null && this.state.longitude != null) {
      const { currentUser } = firebase.auth();
     firebase.database().ref(`/users/${currentUser.uid}/`)
       .set({latitude: this.state.latitude, longitude: this.state.longitude})
       .then(() => {
         console.log("location set success");
       })
       .catch(() => {
         console.log("location set failed");
       });
      return (
        <MapView
          provider="google"
          style={styles.map}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
        >
          <MapView.Marker
          title="me"
          coordinate={{
            latitude: this.state.latitude,
            longitude: this.state.longitude
          }}
          />

          <MapView.Circle
          center={{
            latitude: this.state.latitude,
            longitude: this.state.longitude
          }}
          radius={this.distance(this.state.latitude, this.state.longitude, 0, 0)}
          fillColor="rgba(106,92,165,.3)"
          strokeColor="rgba(106,92,165,.9)"
          />

          <MapView.Polyline
          coordinates={
            this.directionCoords(this.state.latitude, this.state.longitude, 0, 0)
          }
          strokeColor="rgba(106,92,165,.9)"
          strokeWidth={2}
          />

        </MapView>
      );
    }
    return <Spinner size="large" />;
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
