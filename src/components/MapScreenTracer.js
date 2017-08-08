import { Grid, Button } from 'react-native-elements';
import { Scene, Router, Actions } from 'react-native-router-flux';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableHighlight } from 'react-native';
import { Spinner, Card, CardSection } from './common';

//TODO: add flex styling! fix glitches.
//And need to test once this stops glitching...

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
      modalVisible: true,
      showAim: false,
      showTriggerCircle: false,
      triggersRemaining: 3,
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

  //TODO: This is off because of the way longitude changes as you
  //approach the poles, due to spherical curvature... need to recalculate
  //Reference this: http://www.movable-type.co.uk/scripts/latlong.html
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

  setAim() {
    this.setState({
      showAim: !this.state.showAim,
    });
  }

  triggerPulled() {
    let traitorLat;
    let traitorLon;
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      traitorLat = snapshot.val().latitude;
      traitorLon = snapshot.val().longitude;
      let dist =
      this.calcDistance(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      console.log("current dist is " + dist);
      //TODO: change this dist to reasonable value for testing!
      if (dist < 5) {
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

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  renderCurrentUser() {
    console.log("RENDERCURRENTUSER - TRACER");
    return (
      <View style={styles.containerStyle}>
{/*
        <Modal
          visible={this.state.triggerModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {}}
        >
          <View style={styles.modalStyle}>
            <CardSection style={styles.cardSectionStyle}>
              <Text style={styles.textStyle}>
                You just triggered me.
              </Text>
            </CardSection>

            <CardSection>
              <Button onPress={this.setCurrentDistance}>Yes</Button>
              <Button onPress={this.setCurrentDistance}>No</Button>
            </CardSection>
          </View>
    </Modal>*/
  }
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
            fillColor="rgba(64, 52, 109, .1)"
            strokeColor="rgba(64, 52, 109, .9)"
          />
          }
          {this.state.showAim &&
            <MapView.Circle
              center={{
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }}
              radius={10}
              fillColor="rgba(0,0,0,.4)"
              strokeColor="rgba(0,0,0,.4)"
            />
          }
          {this.state.showPolyline &&
          <MapView.Polyline
            coordinates={
              this.state.directionCoords
            }
            strokeColor="rgba(64, 52, 109, .9)"
            strokeWidth={2}
          />
          }
        </MapView>
        <View style={styles.buttonsContainerStyle}>
          <Button
            buttonStyle={styles.buttonStyle}
            color='rgba(64, 52, 109, 1)'
            onPress={this.setCurrentDistance.bind(this)}
            title='Distance'
          />
          <Button
            buttonStyle={styles.buttonStyle}
            color='rgba(64, 52, 109, 1)'
            onPress={this.setCurrentDirectionCoords.bind(this)}
            title='Direction'
          />
          <View style={styles.triggerAimStyle}>
            <Button
              buttonStyle={styles.buttonAltStyle}
              fontSize={10}
              onPress={this.setAim.bind(this)}
              title='Aim'
            />
            <Button
              buttonStyle={styles.buttonAltStyle}
              onPress={this.triggerPulled.bind(this)}
              title={`Trigger (${this.state.triggersRemaining})`}
            />
          </View>
        </View>
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
      <View style={styles.containerStyle}>
        {this.renderContent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonStyle: {
    backgroundColor: 'white',
    borderRadius: 2,
    marginBottom: 20,
  },
  buttonAltStyle: {
    borderRadius: 2,
    marginBottom: 20,
    backgroundColor: 'rgba(64, 52, 109, 1)',
  },
  buttonsContainerStyle: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  triggerAimStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  map: {
    height: 300,
    width: 300,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(64, 52, 109, 1)',
  },
  cardSectionStyle: {
  justifyContent: 'center'
  },
  textStyle: {
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 40
  },
  modalStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    position: 'relative',
    flex: 1,
    justifyContent: 'center'
  }
});
