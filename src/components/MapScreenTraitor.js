import { Grid, Button } from 'react-native-elements';
import { Scene, Router, Actions } from 'react-native-router-flux';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spinner, Card, CardSection } from './common';

//TODO: clean up console logs and unused imports
//TODO: decide whether traitor should have option to
//block or reverse (reflective shield) the trigger and
//make tracer die instead - called mirror or deflect or reflect
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
      shieldOn: false,
    };
    this.callCurrentPosition = this.callCurrentPosition.bind(this);
    this.endShield = this.endShield.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(this.callCurrentPosition, 1500);
  }

  componentWillUnmount() {
      clearInterval(this.interval);
  }

  callCurrentPosition() {
    console.log("CALLCURRENTPOSITION - TRAITOR");
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333`)
    .once('value', snapshot => {
      //TODO: Is this the best way to do this? Probably will have long wait time
      //since must wait for navigator to find geolocation, then wait for
      //firebase pull... should we do this in series?
      let fbshowDirection = snapshot.val().showDirection;
      let fbshowDistance = snapshot.val().showDistance;
      let fbDistance = snapshot.val().distance;
      let fbDirectionCoords = snapshot.val().directionCoords;
      let fbLastClickLatTraitor = snapshot.val().lastClickLatTraitor;
      let fbLastClickLonTraitor = snapshot.val().lastClickLonTraitor;

        this.setState({
          //set to firebase pull from tracer
          showDistance: fbshowDistance,
          showDirection: fbshowDirection,
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
            longitude: position.coords.longitude,
            shieldOn: this.state.shieldOn
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

  deflectPressed() {
    this.setState({
      shieldOn: true,
    }, () => {
      this.shieldInterval = setInterval(this.endShield, 10000);
    });
  }

  endShield() {
    clearInterval(this.shieldInterval);
    this.setState({
      shieldOn: false,
    });
  }

  renderCurrentUser() {
    console.log("RENDERCURRENTUSER - TRAITOR");
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
            title='Deflect'
          />
      </View>
    </View>
    );
  }

  renderContent() {
    console.log("RENDERCONTENT - TRAITOR");
    if (this.state.latitude != null && this.state.longitude != null) {
      return this.renderCurrentUser();
    }
    return <Spinner size="large" />;
  }

  render() {
    console.log("RENDER - TRAITOR");
    return (
      <View style={styles.containerStyle}>
        {this.renderContent()}
      </View>
    );
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
    width: 300,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(64, 52, 109, 1)',
  },
  buttonStyle: {
    backgroundColor: 'white',
    borderRadius: 2,
    marginBottom: 20,
  },
  buttonsContainerStyle: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
