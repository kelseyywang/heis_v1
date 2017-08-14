import { Button } from 'react-native-elements';
import firebase from 'firebase';
import { Actions } from 'react-native-router-flux';
import MapView from 'react-native-maps';
import React from 'react';
import { StyleSheet, Text, View, Vibration } from 'react-native';
import { Spinner } from './common';

//TODO: make Restart better
//TODO: push to expo
//TODO: maybe black out (or just empty map) option for traitor
//or a thing that disables trigger

//TODO (eventually): change rules in firebase
//TODO: think about whether you want to make this a time-based
//game, or a win/lose, time-sensitive point-based game.
//Because you can make it time-based if you let the tracer know
//every time the traitor deflects, and it's basically just a shield,
//not necessarily reflective. Or there can be both...??
export default class MapScreenTraitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null,
      distance: 0,
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
      lastClickLatTraitor: null,
      lastClickLonTraitor: null,
      disguiseOn: false,
      disguisesRemaining: 3,
      showAimCircle: false,
      deflectOn: false,
      deflectsRemaining: 3,
      counter: 0,
      tracerLoggedIn: false,
      gameWinner: "none",
    };
    this.callCurrentPosition = this.callCurrentPosition.bind(this);
    this.endDeflect = this.endDeflect.bind(this);
    this.endDisguise = this.endDisguise.bind(this);
    this.updateCounter = this.updateCounter.bind(this);
  }

  //Sets interval to callCurrentPosition every second and
  //sets timerInterval to null
  componentDidMount() {
    this.interval = setInterval(this.callCurrentPosition, 1000);
    this.timerInterval = null;
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.timerInterval);
  }

  //Pulls all info from firebase, and checks stuff about
  //the current status of the game and current display.
  //Sets state to all this current info, with callback to
  //getAndSetLocation
  callCurrentPosition() {
    firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333`)
    .once('value', snapshot => {
      let fbShowDirection = snapshot.val().showDirection;
      let fbShowDistance = snapshot.val().showDistance;
      let fbDistance = snapshot.val().distance;
      let fbDirectionCoordsForTraitor = snapshot.val().directionCoordsForTraitor;
      let fbLastClickLatTraitor = snapshot.val().lastClickLatTraitor;
      let fbLastClickLonTraitor = snapshot.val().lastClickLonTraitor;
      let fbTracerLoggedIn = snapshot.val().tracerLoggedIn;
      let fbGameWinner = snapshot.val().gameWinner;
      //Check if game has ended
      if (fbGameWinner !== "none" && this.state.gameWinner === "none") {
        clearTimeout(this.deflectInterval);
        clearInterval(this.interval);
        clearInterval(this.timerInterval);
        if (this.state.disguiseOn) {
          clearTimeout(this.disguiseInterval);
        }
        if (this.state.deflectOn) {
          clearTimeout(this.deflectInterval);
        }
        Actions.endScreenTraitor({winner: fbGameWinner});
      }
      //Check if display on map has changed
      if (this.state.showDirection !== fbShowDirection ||
            this.state.showDistance !== fbShowDistance ||
            this.state.distance !== fbDistance ||
            !this.compareDirectionCoordsForTraitor(this.state.directionCoordsForTraitor, fbDirectionCoordsForTraitor)) {
        Vibration.vibrate();
      }
      //Check if tracer is logged in, and if so, start timer.
      //TODO: change this so that game doesn't start until both logged in
      //This is also really glitchy... i.e. won't start until tracer presses
      //distance or direction button in some cases...
      if (!this.state.tracerLoggedIn && fbTracerLoggedIn &&
        this.state.counter === 0 && this.timerInterval === null) {
        //TODO: solve the problem of the timers being DIFFERENT
        //on EVERY DEVICE?!?! Really slow on iPhone, but has been
        //pretty accurate on my Android... but I think it varies by
        //individual device...
        this.timerInterval = setInterval(this.updateCounter, 1000);
      }
        this.setState({
          showDistance: fbShowDistance,
          showDirection: fbShowDirection,
          distance: fbDistance,
          directionCoordsForTraitor: fbDirectionCoordsForTraitor,
          lastClickLatTraitor: fbLastClickLatTraitor,
          lastClickLonTraitor: fbLastClickLonTraitor,
          gameWinner: fbGameWinner,
          },
          this.getAndSetLocation.bind(this)
        );
    });
  }

  //Updates timer
  updateCounter() {
    this.setState({
      counter: this.state.counter + 1
    });
  }

  compareDirectionCoordsForTraitor(c1, c2) {
    return (c1[0].latitude === c2[0].latitude &&
      c1[0].longitude === c2[0].longitude &&
      c1[1].latitude === c2[1].latitude &&
      c1[1].longitude === c2[1].longitude
    );
  }

  //Callback function after state variables are set,
  //this again sets state to current traitor position
  //and uploads that to firebase
  getAndSetLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null
        });
        firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/`)
          .set({latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            deflectOn: this.state.deflectOn,
            disguiseOn: this.state.disguiseOn
        })
          .catch(() => {
            console.log("location set failed");
          });
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

  //Causes gray circle overlay. This prevents the tracer
  //from receiving any distance/direction updates for 10 sec.
  disguisePressed() {
    if (this.state.disguisesRemaining > 0) {
      this.state.disguisesRemaining = this.state.disguisesRemaining - 1;
      let updates = {};
      updates['/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/disguiseOn/'] = true;
      firebase.database().ref().update(updates);
      Vibration.vibrate();
      this.setState({
        disguiseOn: true,
      }, () => {
        this.disguiseInterval = setTimeout(this.endDisguise, 10000);
      });
    }
  }

  endDisguise() {
    clearTimeout(this.disguiseInterval);
    let updates = {};
    updates['/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/disguiseOn/'] = false;
    firebase.database().ref().update(updates);
    Vibration.vibrate();
    this.setState({
      disguiseOn: false,
    });
  }

  //Shows Aim circle, which does nothing but help
  //the traitor decide whether they should deflect
  setAim() {
    this.setState({
      showAimCircle: !this.state.showAimCircle,
    });
  }

  //Vibrates phone when deflect is pressed, and sets the
  //state and the deflect interval
  deflectPressed() {
    if (this.state.deflectsRemaining > 0) {
      this.state.deflectsRemaining = this.state.deflectsRemaining - 1;
      let updates = {};
      updates['/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/deflectOn/'] = true;
      firebase.database().ref().update(updates);
      Vibration.vibrate();
      this.setState({
        deflectOn: true,
      }, () => {
        this.deflectInterval = setTimeout(this.endDeflect, 10000);
      });
    }
  }

  //Vibrates and sets new state when deflect ends
  endDeflect() {
    clearTimeout(this.deflectInterval);
    let updates = {};
    updates['/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/deflectOn/'] = false;
    firebase.database().ref().update(updates);
    Vibration.vibrate();
    this.setState({
      deflectOn: false,
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
              latitude: this.state.lastClickLatTraitor,
              longitude: this.state.lastClickLonTraitor
            }}
            radius={this.state.distance}
            fillColor="rgba(106,92,165,.3)"
            strokeColor="rgba(106,92,165,.9)"
            strokeWidth={2}
          />
          }
          {this.state.disguiseOn &&
            <MapView.Circle
              center={{
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }}
              radius={100000}
              fillColor="rgba(0,0,0,.3)"
              strokeColor="rgba(0,0,0,.3)"
            />
          }
          {this.state.showAimCircle &&
            <MapView.Circle
              center={{
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }}
              radius={70}
              fillColor="rgba(255,235,20,.3)"
              strokeColor="rgba(255,235,20,.3)"
            />
          }
          {this.state.deflectOn &&
            <MapView.Circle
              center={{
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }}
              radius={70}
              fillColor="rgba(0,206,165,.3)"
              strokeColor="rgba(0,206,165,.3)"
            />
          }
          {this.state.showDirection &&
          <MapView.Polyline
            coordinates={
              this.state.directionCoordsForTraitor
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
            onPress={this.disguisePressed.bind(this)}
            title={`Disguise (${this.state.disguisesRemaining})`}
          />
          <View style={styles.deflectAimStyle}>
            <Button
              buttonStyle={styles.buttonAltStyle}
              fontSize={10}
              onPress={this.setAim.bind(this)}
              title='Aim'
            />
            <Button
              buttonStyle={styles.buttonAltStyle}
              onPress={this.deflectPressed.bind(this)}
              title={`Deflect (${this.state.deflectsRemaining})`}
            />
        </View>
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
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  map: {
    height: 260,
    width: 300,
    marginTop: 5,
    borderWidth: 2,
    borderColor: 'rgba(64, 52, 109, 1)',
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
  deflectAimStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
