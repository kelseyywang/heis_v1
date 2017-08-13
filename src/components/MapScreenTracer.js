import { Button } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import React from 'react';
import { StyleSheet, Text, View, Vibration } from 'react-native';
import { Spinner } from './common';

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
      directionCoordsForTraitor: [{
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
      disguiseOn: false
    };

    this.setFirebase = this.setFirebase.bind(this);
    this.callCurrentPosition = this.callCurrentPosition.bind(this);
  }

  //Sets interval to callCurrentPosition every second and
  //sets firebase tracerLoggedIn to true
  componentDidMount() {
    this.interval = setInterval(this.callCurrentPosition, 1000);
    let updates = {};
    updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/tracerLoggedIn/'] = true;
    firebase.database().ref().update(updates);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    //this.clearFirebaseActions();
  }

  //Updates timer and tracer's position
  //Also pulls disguise info from firebase
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

  //Sets current state variables to firebase
  setFirebase() {
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/`)
      .set({
        showDirection: this.state.showDirection,
        showDistance: this.state.showDistance,
        distance: this.state.distance,
        directionCoordsForTraitor: this.state.directionCoordsForTraitor,
        lastClickLatTraitor: this.state.lastClickLatTraitor,
        lastClickLonTraitor: this.state.lastClickLonTraitor,
        tracerLoggedIn: true,
        gameWinner: "none",
        })
      .catch(() => {
        console.log("location set failed");
      });
  }

  //Calculates dist in meters between two coordinates
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

  //Returns coordinates of a line in the direction
  //of the segment from one coordinate to the other,
  //but is a fixed length
  calcDirectionCoords(lat1, lon1, lat2, lon2) {
    //Line will be around 1000m long or something
    const multiplier = 1000 / this.calcDistance(lat1, lon1, lat2, lon2);
    return ([{
      latitude: lat1 + ((lat2 - lat1) * multiplier),
      longitude: lon1 + ((lon2 - lon1) * multiplier)
    },
    {
      latitude: lat1,
      longitude: lon1
    }]);
  }

  calcDirectionCoordsForTraitor(lat1, lon1, lat2, lon2) {
    //Line will be around 1000m long or something
    const multiplier = 1000 / this.calcDistance(lat1, lon1, lat2, lon2);
    return ([{
      latitude: lat2 + ((lat1 - lat2) * multiplier),
      longitude: lon2 + ((lon1 - lon2) * multiplier)
    },
    {
      latitude: lat2,
      longitude: lon2
    }]);
  }

  //Called when Distance button pressed
  setCurrentDistance() {
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      let traitorLat = snapshot.val().latitude;
      let traitorLon = snapshot.val().longitude;
      let traitorDisguiseOn = snapshot.val().disguiseOn;
      if (traitorDisguiseOn) {
        this.setState({
          disguiseOn: true,
        });
      }
      else {
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
          disguiseOn: false,
        }, this.setFirebase);
      }
    });
  }

  //Called when Direction button pressed
  setCurrentDirectionCoords() {
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      let traitorLat = snapshot.val().latitude;
      let traitorLon = snapshot.val().longitude;
      let traitorDisguiseOn = snapshot.val().disguiseOn;
      if (traitorDisguiseOn) {
        this.setState({
          disguiseOn: true,
        });
      }
      else {
        let dirCoords =
          this.calcDirectionCoords(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
        let dirCoordsForTraitor =
          this.calcDirectionCoordsForTraitor(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
        this.setState({
          directionCoords: dirCoords,
          directionCoordsForTraitor: dirCoordsForTraitor,
          showDistance: false,
          showDirection: true,
          lastClickLatTracer: this.state.latitude,
          lastClickLonTracer: this.state.longitude,
          lastClickLatTraitor: snapshot.val().latitude,
          lastClickLonTraitor: snapshot.val().longitude,
          showTriggerCircle: false,
          disguiseOn: false,
        }, this.setFirebase);
      }
    });
  }

  //Shows Aim circle, which does nothing but help
  //the tracer decide whether they should trigger
  setAim() {
    this.setState({
      showAimCircle: !this.state.showAimCircle,
    });
  }

  //Called when trigger pressed
  triggerPulled() {
    Vibration.vibrate();
    this.state.triggersRemaining = this.state.triggersRemaining - 1;
    if (this.state.triggersRemaining <= 0) {
      //Traitor won as tracer ran out of triggers
      this.state.triggersRemaining = 0;
      let updates = {};
      updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/gameWinner/'] = "Traitor";
      firebase.database().ref().update(updates);
      Actions.endScreenTracer({winner: "Traitor"});
    }
    //Check whether tracer got traitor or if traitor has
    //deflect on
    firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2`)
    .once('value', snapshot => {
      let traitorLat = snapshot.val().latitude;
      let traitorLon = snapshot.val().longitude;
      let traitorDeflect = snapshot.val().deflectOn;
      let dist =
      this.calcDistance(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      //TODO: change this dist to reasonable value if 50 isn't!
      //Also change radius of aimCircle
      if (dist < 50) {
        let updates = {};
        if (!traitorDeflect) {
          //Tracer won
          updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/gameWinner/'] = "Tracer";
          Actions.endScreenTracer({winner: "Tracer", endDistance: Math.round(dist)});
        }
        else {
          //Traitor won by deflect
          updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/gameWinner/'] = "Traitor deflect";
          Actions.endScreenTracer({winner: "Traitor deflect"});
        }
        firebase.database().ref().update(updates);
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

  //Returns what timer should appear as
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
              radius={50}
              fillColor="rgba(255,235,20,.3)"
              strokeColor="rgba(255,235,20,.3)"
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
          {this.state.disguiseOn &&
            <MapView.Circle
              center={{
                latitude: this.state.lastClickLatTracer,
                longitude: this.state.lastClickLonTracer
              }}
              radius={100000}
              fillColor="rgba(0,0,0,.3)"
              strokeColor="rgba(0,0,0,.3)"
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
