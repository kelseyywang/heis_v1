import { Grid, Button } from 'react-native-elements';
import { Scene, Router, Actions } from 'react-native-router-flux';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import React from 'react';
import { StyleSheet, Text, View, Vibration } from 'react-native';
import { Spinner, Card, CardSection } from './common';

//TODO: clean up console logs and unused imports
//TODO: vibrate notification when display changes
//TODO (eventually): change rules in firebase
export default class MapScreenTraitor extends React.Component {
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
      lastClickLatTraitor: null,
      lastClickLonTraitor: null,
      deflectOn: false,
      deflectsRemaining: 3,
    };
    this.callCurrentPosition = this.callCurrentPosition.bind(this);
    this.endDeflect = this.endDeflect.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(this.callCurrentPosition, 1500);
  }

  componentWillUnmount() {
      clearInterval(this.interval);
      this.clearFirebaseActions();
  }

  callCurrentPosition() {
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333`)
    .once('value', snapshot => {
      //TODO: Is this the best way to do this? Probably will have long wait time
      //since must wait for navigator to find geolocation, then wait for
      //firebase pull... should we do this in series?
      let fbShowDirection = snapshot.val().showDirection;
      let fbShowDistance = snapshot.val().showDistance;
      let fbDistance = snapshot.val().distance;
      let fbDirectionCoords = snapshot.val().directionCoords;
      let fbLastClickLatTraitor = snapshot.val().lastClickLatTraitor;
      let fbLastClickLonTraitor = snapshot.val().lastClickLonTraitor;
      if (this.state.showDirection !== fbShowDirection ||
            this.state.showDistance !== fbShowDistance ||
            this.state.distance !== fbDistance ||
            !this.compareDirectionCoords(this.state.directionCoords, fbDirectionCoords)) {
        Vibration.vibrate();
      }

        this.setState({
          //set to firebase pull from tracer
          showDistance: fbShowDistance,
          showDirection: fbShowDirection,
          distance: fbDistance,
          directionCoords: fbDirectionCoords,
          lastClickLatTraitor: fbLastClickLatTraitor,
          lastClickLonTraitor: fbLastClickLonTraitor
          },
          this.getAndSetLocation.bind(this)
        );
    });
  }

  compareDirectionCoords(c1, c2) {
    console.log("lat is "+ c1[0].latitude);
    return (c1[0].latitude === c2[0].latitude &&
      c1[0].longitude === c2[0].longitude &&
      c1[1].latitude === c2[1].latitude &&
      c1[1].longitude === c2[1].longitude
    );
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
        firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/`)
          .set({latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            deflectOn: this.state.deflectOn
        })
          .then(() => {
            //nothing
          })
          .catch(() => {
            console.log("location set failed");
          });
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

//TODO: 8/9 add some sort of on screen thing that shows that a deflect
//is currently being used... also will say, no more deflects when there's 0 left
//TODO: also maybe vibrate it when you start and stop the deflect
  deflectPressed() {
    if (this.state.deflectsRemaining === 0) {
      //TODO: add stuff here
    }
    else {
    this.state.deflectsRemaining = this.state.deflectsRemaining - 1;
    console.log("deflectPressed");
    Vibration.vibrate();
    this.setState({
      deflectOn: true,
    }, () => {
      this.deflectInterval = setInterval(this.endDeflect, 10000);
    });
  }
  }

  endDeflect() {
    clearInterval(this.deflectInterval);
    console.log("endDeflect");
    Vibration.vibrate();
    this.setState({
      deflectOn: false,
    });
  }

  renderCurrentUser() {
    return (
      <View style={styles.containerStyle}>
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
              latitude: this.state.lastClickLatTraitor,
              longitude: this.state.lastClickLonTraitor
            }}
            radius={this.state.distance}
            fillColor="rgba(106,92,165,.3)"
            strokeColor="rgba(106,92,165,.9)"
            strokeWidth={2}
          />
          }
          {this.state.showDirection &&
          <MapView.Polyline
            coordinates={
              this.state.directionCoords
            }
            strokeColor="rgba(106,92,165,.9)"
            strokeWidth={2}
          />
        }
        </MapView>
        <View style={styles.buttonsContainerStyle}>
          <Button
            buttonStyle={styles.buttonStyle}
            color='rgba(64, 52, 109, 1)'
            onPress={this.deflectPressed.bind(this)}
            title={`Deflect (${this.state.deflectsRemaining})`}
          />
      </View>
    </View>
    );
  }

  renderContent() {
    if (this.state.latitude != null && this.state.longitude != null) {
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
        lastClickLonTraitor: 0
      })
      .then(() => {
        //nothing
      })
      .catch(() => {
        console.log("location set failed");
      });
  }
}
//TODO: fix layout problems on iOS
const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  map: {
    height: 300,
    width: 260,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(64, 52, 109, 1)',
  },
  buttonStyle: {
    backgroundColor: 'white',
    borderRadius: 2,
  },
  buttonsContainerStyle: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
