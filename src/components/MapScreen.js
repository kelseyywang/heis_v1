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
export default class MapScreen extends React.Component {
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
      showCircle: false
    };
  }

  componentDidMount() {
    const { currentUser } = firebase.auth();
    /*
    //Setting arbitrary initial variables
    firebase.database().ref(`/users/${currentUser.uid}/`)
      .set({
        latitude: 37.3,
        longitude: -122.3,
        showPolyline: this.state.showPolyline,
        showCircle: this.state.showCircle,
        distance: 9,
        directionCoords: [{
          latitude: 37,
          longitude: -122
        },
        {
          latitude: 37.5,
          longitude: -122.5
        }]
    })
      .then(() => {
        console.log("location set success");
      })
      .catch(() => {
        console.log("location set failed");
      });*/
    this.interval = setInterval(() => {
      this.callCurrentPosition();
    }, 5000);
  }

  componentWillUnmount() {
      clearInterval(this.interval);
  }

  calcDistance(lat1, lon1, lat2, lon2) {
    /* Setting zeroed second point to Rinconada Library for test
    lat2 += 37.444999;
    lon2 -= 122.139389;*/

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
    /* Setting zeroed second point to Rinconada Library for test
    lat2 += 37.444999;
    lon2 -= 122.139389;*/

    /* Arbitrary multiplier as long as it begins and ends off screen initially*/
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

  setCurrentDirectionCoords() {
    let traitorLat;
    let traitorLon;
    const { currentUser } = firebase.auth();
    console.log("CALLED BY "+currentUser.uid);
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .on('value', snapshot => {
      traitorLat = snapshot.val().latitude;
      traitorLon = snapshot.val().longitude;
      let dirCoords =
        this.calcDirectionCoords(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      this.setState({ directionCoords: dirCoords, showCircle: false, showPolyline: true });
    });
  }

  setCurrentDistance() {
    let traitorLat;
    let traitorLon;
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .on('value', snapshot => {
      traitorLat = snapshot.val().latitude;
      traitorLon = snapshot.val().longitude;
      //TODO: (prob not.) change this.state.lat and lon to absolute tracer vals???
      let dist = this.calcDistance(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      this.setState({ distance: dist, showCircle: true, showPolyline: false });
    });
  }

  didGameEnd() {
    let traitorLat;
    let traitorLon;
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .on('value', snapshot => {
      traitorLat = snapshot.val().latitude;
      traitorLon = snapshot.val().longitude;
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
    const { currentUser } = firebase.auth();

    console.log("CURR POS CALLED BY "+currentUser.uid);
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333`)
    .on('value', snapshot => {
      console.log("CALL CURR POS SET STATE 77777");

      //TODO: Is this the best way to do this? Probably will have long wait time
      //since must wait for navigator to find geolocation, then wait for
      //firebase pull... should we do this in series?
      let fbShowPolyline = snapshot.val().showPolyline;
      let fbShowCircle = snapshot.val().showCircle;
      let fbDistance = snapshot.val().distance;
      let fbDirectionCoords = snapshot.val().directionCoords;
        this.setState({
          //set to firebase pull from tracer
          showCircle: fbShowCircle,
          showPolyline: fbShowPolyline,
          distance: fbDistance,
          directionCoords: fbDirectionCoords
        });
    });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("CALL CURR POS SET STATE 666666");
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
    const { currentUser } = firebase.auth();
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
              latitude: this.state.latitude,
              longitude: this.state.longitude
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
        { currentUser.uid === "oAoeKzMPhwZ5W5xUMEQImvQ1r333" &&
        <Button
          buttonStyle={{backgroundColor: 'blue', borderRadius: 4, marginBottom: 20}}
          onPress={this.setCurrentDistance.bind(this)}
          title='Distance'
        />
        }
        { currentUser.uid === "oAoeKzMPhwZ5W5xUMEQImvQ1r333" &&
        <Button
          buttonStyle={{backgroundColor: 'blue', borderRadius: 4, marginBottom: 20}}
          onPress={this.setCurrentDirectionCoords.bind(this)}
          title='Direction'
        />
        }
        { currentUser.uid === "oAoeKzMPhwZ5W5xUMEQImvQ1r333" &&
        <Button
          buttonStyle={{backgroundColor: 'red', borderRadius: 4, marginBottom: 20}}
          onPress={this.didGameEnd.bind(this)}
          title='Trigger'
        />
        }
    </View>
    );
  }

  renderContent() {
    const { currentUser } = firebase.auth();
    //TODO: clean up this crap
    if (currentUser.uid === "oAoeKzMPhwZ5W5xUMEQImvQ1r333" && this.state.latitude != null
    && this.state.longitude != null &&
    this.state.distance != null && this.state.directionCoords != null &&
    this.state.showPolyline != null && this.state.showCircle != null) {
      firebase.database().ref(`/users/${currentUser.uid}/`)
        .set({latitude: this.state.latitude,
          longitude: this.state.longitude,
          showPolyline: this.state.showPolyline,
          showCircle: this.state.showCircle,
          distance: this.state.distance,
          directionCoords: this.state.directionCoords
      })
        .then(() => {
          console.log("TRACER location set success");
        })
        .catch(() => {
          console.log("location set failed");
        });
      return this.renderCurrentUser();
    }
    else if (currentUser.uid === "AQVDfE7Fp4S4nDXvxpX4fchTt2w2" && this.state.latitude != null
    && this.state.longitude != null){
      firebase.database().ref(`/users/${currentUser.uid}/`)
        .set({latitude: this.state.latitude,
          longitude: this.state.longitude
      })
        .then(() => {
          console.log("TRAITOR location set success");
        })
        .catch(() => {
          console.log("location set failed");
        });
      return this.renderCurrentUser();
    }
    return <Spinner size="large" />;
  }

  render() {
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
