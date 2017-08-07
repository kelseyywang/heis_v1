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
export default class MapScreenTracer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      distance: 0,
      directionCoords: [{
        latitude: 0,
        longitude: 0,
      },
      {
        latitude: 0,
        longitude: 0,
      }],
      error: null,
      showPolyline: false,
      showCircle: false,
      lastClickLatTracer: null,
      lastClickLonTracer: null,
      lastClickLatTraitor: null,
      lastClickLonTraitor: null,
    };

    this.setFirebase = this.setFirebase.bind(this);
    this.callCurrentPosition = this.callCurrentPosition.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(this.callCurrentPosition, 5000);
    this.bitch = setInterval(() => {
      console.log(this.state.distance);
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.bitch);
  }

  setFirebase() {
    console.log("SET FIREBASE STUFF CALLBACK - TRACER");
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/`)
      .set({
        showPolyline: this.state.showPolyline,
        showCircle: this.state.showCircle,
        distance: this.state.distance,
        directionCoords: this.state.directionCoords,
        lastClickLatTraitor: this.state.lastClickLatTraitor,
        lastClickLonTraitor: this.state.lastClickLonTraitor
        })
      .then(() => {
        console.log("TRACER stuff set success");
      })
      .catch(() => {
        console.log("location set failed");
      });
  }

  setLastClickTraitorLoc(lastClickLat, lastClickLon) {
    console.log("SET LAST CLICK TRAITOR LOC - TRACER - VALUES: " +
      lastClickLat + " " + lastClickLon);
    if (lastClickLat != null && lastClickLon != null) {
      var updates = {};
      updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/lastClickLatTraitor/'] = lastClickLat;
      updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/lastClickLonTraitor/'] = lastClickLon;
      firebase.database().ref().update(updates);
    }
  }

  calcDistance(lat1, lon1, lat2, lon2) {
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

  calcDirectionCoords(lat1, lon1, lat2, lon2) {
    const multiplier = 1000;
    return ([{
      latitude: lat1 + ((lat2 - lat1) * multiplier),
      longitude: lon1 + ((lon2 - lon1) * multiplier)
    },
    {
      latitude: lat1 + ((lat1 - lat2) * multiplier),
      longitude: lon1 + ((lon1 - lon2) * multiplier)
    }]);
  }

  setCurrentDistance() {
    console.log("SETCURRENTDISTANCE - TRACER");
    let traitorLat;
    let traitorLon;
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      traitorLat = snapshot.val().latitude;
      traitorLon = snapshot.val().longitude;
      //this.setLastClickTraitorLoc(traitorLat, traitorLon);
      let dist = this.calcDistance(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      this.setState({
        distance: dist,
        showCircle: true,
        showPolyline: false,
        lastClickLatTracer: this.state.latitude,
        lastClickLonTracer: this.state.longitude,
        lastClickLatTraitor: snapshot.val().latitude,
        lastClickLonTraitor: snapshot.val().longitude,
      }, this.setFirebase);
    });
  }

  setCurrentDirectionCoords() {
    console.log("SETCURRENTDIRECTIONCOORDS - TRACER");
    let traitorLat;
    let traitorLon;
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      traitorLat = snapshot.val().latitude;
      traitorLon = snapshot.val().longitude;
      let dirCoords =
        this.calcDirectionCoords(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      this.setState({
        directionCoords: dirCoords,
        showCircle: false,
        showPolyline: true,
        lastClickLatTracer: this.state.latitude,
        lastClickLonTracer: this.state.longitude
      }, this.setFirebase);
    });
  }

  didGameEnd() {
    let traitorLat;
    let traitorLon;
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      traitorLat = snapshot.val().latitude;
      traitorLon = snapshot.val().longitude;
      //TODO: allow tracer to only pull trigger 3 times
      //after each failed time, give warning of how many shots
      //left and how many meters they were from traitor  and how much
      //closer they need to be
      let dist =
      this.calcDistance(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      console.log("current dist is " + dist);
      //TODO: change this dist to reasonable value for testing!
      if (dist < 1) {
        console.log("game end dist is " + dist);
        Actions.endScreen();
      }
    });
  }

  callCurrentPosition() {
    console.log("CALLCURRENTPOSITION - TRACER");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null
        });
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

  renderCurrentUser() {
    console.log("RENDERCURRENTUSER - TRACER");
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
              latitude: this.state.lastClickLatTracer,
              longitude: this.state.lastClickLonTracer
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
        <Button
          buttonStyle={{backgroundColor: 'blue', borderRadius: 4, marginBottom: 20}}
          onPress={this.setCurrentDistance.bind(this)}
          title='Distance'
        />
        <Button
          buttonStyle={{backgroundColor: 'blue', borderRadius: 4, marginBottom: 20}}
          onPress={this.setCurrentDirectionCoords.bind(this)}
          title='Direction'
        />
        <Button
          buttonStyle={{backgroundColor: 'red', borderRadius: 4, marginBottom: 20}}
          onPress={this.didGameEnd.bind(this)}
          title='Trigger'
        />
    </View>
    );
  }

  renderContent() {
    console.log("RENDERCONTENT - TRACER");
    if (this.state.latitude != null && this.state.longitude != null &&
    this.state.distance != null && this.state.directionCoords != null &&
    this.state.showPolyline != null && this.state.showCircle != null) {
      return this.renderCurrentUser();
    }
    return <Spinner size="large" />;
  }

  render() {
    console.log("RENDER - TRACER");
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
  },
  button: {
    height: 50,
    width: 200,
    marginBottom: 10
  }
});
