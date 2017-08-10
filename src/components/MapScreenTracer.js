import { Grid, Button } from 'react-native-elements';
import { Scene, Router, Actions } from 'react-native-router-flux';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableHighlight, Vibration } from 'react-native';
import { Spinner, Card, CardSection } from './common';

//TODO: think about the delay between tracer and traitor
//displays. Maybe when trigger is pulled, there is a 1 second
//delay, or however long it takes to update traitor?
//TODO: make vibrate when trigger is pulled!?
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
      showDirection: false,
      showDistance: false,
      lastClickLatTracer: null,
      lastClickLonTracer: null,
      lastClickLatTraitor: null,
      lastClickLonTraitor: null,
      modalVisible: true,
      showAimCircle: false,
      showTriggerCircle: false,
      triggersRemaining: 3,
      counter: 0,
    };

    this.setFirebase = this.setFirebase.bind(this);
    this.callCurrentPosition = this.callCurrentPosition.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(this.callCurrentPosition, 1000);
    let updates = {};
    updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/tracerLoggedIn/'] = true;
    firebase.database().ref().update(updates);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.clearFirebaseActions();
  }

  callCurrentPosition() {
    this.setState({
      counter: this.state.counter + 1
    });
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

  setFirebase() {
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/`)
      .set({
        showDirection: this.state.showDirection,
        showDistance: this.state.showDistance,
        distance: this.state.distance,
        directionCoords: this.state.directionCoords,
        lastClickLatTraitor: this.state.lastClickLatTraitor,
        lastClickLonTraitor: this.state.lastClickLonTraitor,
        tracerLoggedIn: true,
        })
      .then(() => {
        //nothing
      })
      .catch(() => {
        console.log("location set failed");
      });
  }

/*  setLastClickTraitorLoc(lastClickLat, lastClickLon) {
    if (lastClickLat != null && lastClickLon != null) {
      var updates = {};
      updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/lastClickLatTraitor/'] = lastClickLat;
      updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/lastClickLonTraitor/'] = lastClickLon;
      firebase.database().ref().update(updates);
    }
  }*/

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
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      let traitorLat = snapshot.val().latitude;
      let traitorLon = snapshot.val().longitude;
      //this.setLastClickTraitorLoc(traitorLat, traitorLon);
      let dist = this.calcDistance(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      this.setState({
        distance: dist,
        showDistance: true,
        showDirection: false,
        lastClickLatTracer: this.state.latitude,
        lastClickLonTracer: this.state.longitude,
        lastClickLatTraitor: snapshot.val().latitude,
        lastClickLonTraitor: snapshot.val().longitude,
        showTriggerCircle: false,
      }, this.setFirebase);
    });
  }

  //TODO: This is off because of the way longitude changes as you
  //approach the poles, due to spherical curvature... need to recalculate
  //Reference this: http://www.movable-type.co.uk/scripts/latlong.html
  setCurrentDirectionCoords() {
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      let traitorLat = snapshot.val().latitude;
      let traitorLon = snapshot.val().longitude;
      let dirCoords =
        this.calcDirectionCoords(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      this.setState({
        directionCoords: dirCoords,
        showDistance: false,
        showDirection: true,
        lastClickLatTracer: this.state.latitude,
        lastClickLonTracer: this.state.longitude,
        showTriggerCircle: false,
      }, this.setFirebase);
    });
  }

  setAim() {
    this.setState({
      showAimCircle: !this.state.showAimCircle,
    });
  }

  triggerPulled() {
    Vibration.vibrate();
    this.state.triggersRemaining = this.state.triggersRemaining - 1;
    if (this.state.triggersRemaining === 0) {
      //TODO: 8/10 add prop that tells traitor won
      //and upload this info to firebase
      Actions.endScreen();
    }
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      let traitorLat = snapshot.val().latitude;
      let traitorLon = snapshot.val().longitude;
      let traitorDeflect = snapshot.val().deflectOn;
      let dist =
      this.calcDistance(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      console.log("current dist is " + dist);
      //TODO: change this dist to reasonable value for testing!
      if (dist < 5) {
        if (!traitorDeflect) {
          //TODO: add prop that tells tracer won
          //and upload this info to firebase
          Actions.endScreen();
        }
        else {
          //TODO: add traitor won by deflect
          console.log("TRAITOR WON BY DEFLECT");
          Actions.endScreen();
        }
      }
      //None of the following is updated to firebase,
      //preventing traitor from seeing it
      this.setState({
        distance: dist,
        lastClickLatTracer: this.state.latitude,
        lastClickLonTracer: this.state.longitude,
        showTriggerCircle: true,
      });
    });
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  returnTimerString(numSeconds) {
    let minutes;
    let seconds;
    if (Math.floor(numSeconds / 60) < 10) {
     minutes = "0" + Math.floor(numSeconds / 60);
    }
    else {
      minutes = "" + Math.floor(numSeconds / 60);
    }
    if (Math.floor(numSeconds % 60) < 10) {
      seconds = "0" + Math.floor(numSeconds % 60);
    }
    else {
      seconds = "" + Math.floor(numSeconds % 60);
    }
    return ("Time: " + minutes + ":" + seconds);
  }

  renderCurrentUser() {
    return (
      <View style={styles.containerStyle}>
        <Text>{this.returnTimerString(this.state.counter)}</Text>
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
        {this.state.showDistance &&
          <MapView.Circle
            center={{
              latitude: this.state.lastClickLatTracer,
              longitude: this.state.lastClickLonTracer
            }}
            radius={this.state.distance}
            fillColor="rgba(64, 52, 109, .1)"
            strokeColor="rgba(64, 52, 109, .9)"
            strokeWidth={2}
          />
          }
          {this.state.showAimCircle &&
            <MapView.Circle
              center={{
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }}
              radius={5}
              fillColor="rgba(0,0,0,.3)"
              strokeColor="rgba(0,0,0,.3)"
            />
          }
          {this.state.showTriggerCircle &&
            <MapView.Circle
              center={{
                latitude: this.state.lastClickLatTracer,
                longitude: this.state.lastClickLonTracer
              }}
              radius={this.state.distance}
              fillColor="rgba(193,0,0,.3)"
              strokeColor="rgba(193,0,0,.3)"
            />
          }
          {this.state.showDirection &&
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
    if (this.state.latitude != null && this.state.longitude != null &&
    this.state.distance != null && this.state.directionCoords != null &&
    this.state.showDirection != null && this.state.showDistance != null) {
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

  clearFirebaseActions() {
    console.log("FIREBASE RESET");
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/`)
      .set({
        showDirection: false,
        showDistance: false,
        distance: 0,
        directionCoords: [{
          latitude: 0,
          longitude: 0
        },
        {
          latitude: 0,
          longitude: 0
        }],
        //Arbitrary values here!
        lastClickLatTraitor: 0,
        lastClickLonTraitor: 0,
        tracerLoggedIn: false,
      })
      .then(() => {
        //nothing
      })
      .catch(() => {
        console.log("location set failed");
      });
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
  },
  buttonAltStyle: {
    borderRadius: 2,
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
    height: 260,
    width: 300,
    marginTop: 5,
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
