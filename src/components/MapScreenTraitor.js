import React from 'react';
import firebase from 'firebase';
import { Actions, ActionConst } from 'react-native-router-flux';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, Vibration, Modal, TouchableOpacity } from 'react-native';
import { Spinner, Button, Header, Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

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
      tracerInGame: false,
      timerModalVisible: true,
      gameWinner: "none",
      currentTime: -10,
      showCountdown: false,
    };
    this.range = 70;
    this.totalGameTime = 20;
    this.callCurrentPosition = this.callCurrentPosition.bind(this);
    this.endDeflect = this.endDeflect.bind(this);
    this.endDisguise = this.endDisguise.bind(this);
    this.updateTime = this.updateTime.bind(this);
    this.notInGameModal = this.notInGameModal.bind(this);
  }

  //Sets interval to callCurrentPosition every second and
  //sets timerInterval to null
  componentDidMount() {
    this.callCurrentPosition();
    this.interval = setInterval(this.callCurrentPosition, 1000);
    this.timerInterval = null;
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/traitorInGame/`] = true;
    firebase.database().ref().update(updates);
  }

  componentWillUnmount() {
    this.endGameActions();
  }

  //Pulls all info from firebase, and checks stuff about
  //the current status of the game and current display.
  //Sets state to all this current info, with callback to
  //getAndSetLocation
  callCurrentPosition() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      let fbGameWinner = snapshot.val().gameWinner;
      if (fbGameWinner !== "none") {
        this.hasGameEnded(fbGameWinner);
      }
      else {
        let fbShowDirection = snapshot.val().showDirection;
        let fbShowDistance = snapshot.val().showDistance;
        let fbDistance = snapshot.val().distance;
        let fbDirectionCoordsForTraitor = snapshot.val().directionCoordsForTraitor;
        let fbLastClickLatTraitor = snapshot.val().lastClickLatTraitor;
        let fbLastClickLonTraitor = snapshot.val().lastClickLonTraitor;
        let fbTracerInGame = snapshot.val().tracerInGame;
        //Check if display on map has changed
        if (this.state.showDirection !== fbShowDirection ||
              this.state.showDistance !== fbShowDistance ||
              this.state.distance !== fbDistance ||
              !this.compareDirectionCoordsForTraitor(this.state.directionCoordsForTraitor, fbDirectionCoordsForTraitor)) {
          Vibration.vibrate();
        }
        //Check if fbCountdownTotal has a value and tracer is logged in.
        //If so, set countdownTotal and start countdown
        let fbCountdownTotal = snapshot.val().countdownTotal;
        if (!this.state.tracerInGame && fbTracerInGame &&
          this.state.currentTime === -10 && fbCountdownTotal > 0) {
            this.countdownTotal = fbCountdownTotal;
            this.setState({
              currentTime: this.countdownTotal,
              showCountdown: true,
            });
            this.startCountdown();
        }
        //If countdownTotal hasn't been set because of asynchronous
        //firebase uploading by tracer, then pull from firebase again
        if (!(this.countdownTotal > 0) && fbTracerInGame && fbCountdownTotal > 0) {
          this.countdownTotal = fbCountdownTotal;
          this.setState({
            currentTime: this.countdownTotal,
            showCountdown: true,
          });
          this.startCountdown();
        }
          this.setState({
            showDistance: fbShowDistance,
            showDirection: fbShowDirection,
            distance: fbDistance,
            directionCoordsForTraitor: fbDirectionCoordsForTraitor,
            lastClickLatTraitor: fbLastClickLatTraitor,
            lastClickLonTraitor: fbLastClickLonTraitor,
            gameWinner: fbGameWinner,
            tracerInGame: fbTracerInGame,
            },
            this.getAndSetLocation.bind(this)
          );
      }
    });
  }

  //Determines countdown amount and starts countdown after both players are in game
  startCountdown() {
    this.timerStart = new Date().getTime();
    this.countdownInterval = setInterval(this.updateTime, 1000);
  }

  //Starts timer after countdown ends
  startTimer() {
    this.timerStart = new Date().getTime();
    this.timerInterval = setInterval(this.updateTime, 1000);
  }

  //Check if game has ended
  hasGameEnded(fbGameWinner) {
    //TODO 8/24: don't need these state checks bc now im unmounting components...
    // if (this.state.gameWinner === "none") {
    //   if (this.state.disguiseOn) {
    //     clearTimeout(this.disguiseTimeout);
    //   }
    //   if (this.state.deflectOn) {
    //     clearTimeout(this.deflectTimeout);
    //   }
      //Have to adjust endTime by 2 because of Tracer being set 2 seconds "behind"
      this.clearFirebaseActions();
      Actions.endScreenTraitor({
        sessionKey: this.props.sessionKey,
        winner: fbGameWinner,
        endTime: this.totalGameTime - this.state.currentTime - 2,
        type: ActionConst.RESET});
    //}
  }

  //Resets game properties to default when game is over
  clearFirebaseActions() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
      .set({
        deflectOn: false,
        disguiseOn: false,
        traitorLatitude: 0,
        traitorLongitude: 0,
        traitorInGame: false,
        showDirection: false,
        showDistance: false,
        distance: 0,
        directionCoordsForTraitor: [{
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
        tracerInGame: false,
        gameWinner: "none",
        countdownTotal: -1,
        tracerLatitude: 0,
        tracerLongitude: 0,
        tracerInLocate: false,
        traitorInLocate: false,
        numPlayers: 2,
      })
      .catch(() => {
        console.log("firebase reset failed");
      });
  }

  //Updates timer
  updateTime() {
    if (this.state.showCountdown){
      //Get the time remaining in countdown
      let currCountdownTime = this.countdownTotal -
        ((new Date().getTime() - this.timerStart) / 1000);
      if (currCountdownTime < 0) {
        //End countdown
        clearInterval(this.countdownInterval);
        this.timerStart = new Date().getTime();
        this.setState({
          showCountdown: false,
          currentTime: this.totalGameTime - 1,
        });
        this.startTimer();
      }
      else {
          this.setState({
            currentTime: currCountdownTime,
          });
      }
    }
    else {
      //Get game time
      let currTime = this.totalGameTime * 1000 - (new Date().getTime() - this.timerStart);
      this.setState({
          currentTime: currTime / 1000,
      });
    }
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
        let updates = {};
        updates[`/currentSessions/${this.props.sessionKey}/traitorLatitude/`] = position.coords.latitude;
        updates[`/currentSessions/${this.props.sessionKey}/traitorLongitude/`] = position.coords.longitude;
        updates[`/currentSessions/${this.props.sessionKey}/deflectOn/`] = this.state.deflectOn;
        updates[`/currentSessions/${this.props.sessionKey}/disguiseOn/`] = this.state.disguiseOn;
        firebase.database().ref().update(updates);
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

  //Causes gray circle overlay. This prevents the tracer
  //from receiving any distance/direction updates for 10 sec.
  disguisePressed() {
    if (this.state.disguisesRemaining > 0 && this.state.tracerInGame
      && !this.state.showCountdown) {
      this.state.disguisesRemaining = this.state.disguisesRemaining - 1;
      let updates = {};
      updates[`/currentSessions/${this.props.sessionKey}/disguiseOn/`] = true;
      firebase.database().ref().update(updates);
      Vibration.vibrate();
      this.setState({
        disguiseOn: true,
      }, () => {
        this.disguiseTimeout = setTimeout(this.endDisguise, 10000);
      });
    }
  }

  endDisguise() {
    clearTimeout(this.disguiseTimeout);
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/disguiseOn/`] = false;
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
    if (this.state.deflectsRemaining > 0 && this.state.tracerInGame
      && !this.state.showCountdown) {
      this.state.deflectsRemaining = this.state.deflectsRemaining - 1;
      let updates = {};
      updates[`/currentSessions/${this.props.sessionKey}/deflectOn/`] = true;
      firebase.database().ref().update(updates);
      Vibration.vibrate();
      this.setState({
        deflectOn: true,
      }, () => {
        this.deflectTimeout = setTimeout(this.endDeflect, 10000);
      });
    }
  }

  //Vibrates and sets new state when deflect ends
  endDeflect() {
    clearTimeout(this.deflectTimeout);
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/deflectOn/`] = false;
    firebase.database().ref().update(updates);
    Vibration.vibrate();
    this.setState({
      deflectOn: false,
    });
  }

  //Resets intervals and stuff at the end of game
  endGameActions() {
    clearInterval(this.interval);
    clearInterval(this.timerInterval);
    clearInterval(this.countdownInterval);
    clearInterval(this.deflectTimeout);
    clearInterval(this.disguiseTimeout);
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/traitorInGame/`] = false;
    firebase.database().ref().update(updates);
  }

  //Returns what timer should appear as
  returnTimerString(numSeconds) {
    let minutes;
    let seconds;
    if (numSeconds < 0) {
      //default value, show 0
      return "00:00";
    }
    else if (Math.floor(numSeconds / 60) < 10) {
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
    return (minutes + ":" + seconds);
  }

  //User wants to exit modal
  notInGameModal() {
    this.setState({
      timerModalVisible: false,
    });
  }

  renderCurrentUser() {
    return (
      <View style={commonStyles.gameStyle}>
        <Header
          headerText='Traitor'
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, role: 'traitor'});}}
        />
        <Placeholder flex={0.3} >
          {!this.state.showCountdown &&
            <Text style={commonStyles.lightTextStyle}>
              {"Time: " + this.returnTimerString(this.state.currentTime)}
            </Text>
          }
        </Placeholder>
        <Modal
          visible={!this.state.showCountdown && !this.state.tracerInGame && this.state.timerModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {}}
        >
          <View style={commonStyles.modalStyle}>
            <View style={commonStyles.modalSectionStyle}>
              <Text style={commonStyles.mainTextStyle}>
                Tracer is not in the game
              </Text>
              <Button
                onPress={this.notInGameModal}
                title='Okay'
                main
              >
              </Button>
            </View>
          </View>
        </Modal>
        <Modal
        visible={this.state.showCountdown}
        transparent
        animationType="slide"
        onRequestClose={() => {}}
        >
        <View style={commonStyles.modalStyle}>
          <View style={commonStyles.modalShortSectionStyle}>
            <Text style={commonStyles.mainTextStyle}>
              {"Run! Countdown: " + this.returnTimerString(this.state.currentTime)}
            </Text>
          </View>
        </View>
      </Modal>
      <Placeholder flex={2} >
        <MapView
          provider="google"
          style={commonStyles.map}
          showsUserLocation
          initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
        {this.state.showDistance &&
          <MapView.Circle
            center={{
              latitude: this.state.lastClickLatTraitor,
              longitude: this.state.lastClickLonTraitor
            }}
            radius={this.state.distance}
            fillColor={colors.clueFillColor}
            strokeColor={colors.clueStrokeColor}
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
              radius={this.range}
              fillColor={colors.aimCircleColor}
              strokeColor={colors.aimCircleColor}
            />
          }
          {this.state.deflectOn &&
            <MapView.Circle
              center={{
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }}
              radius={this.range}
              fillColor="rgba(0,206,165,.3)"
              strokeColor="rgba(0,206,165,.3)"
            />
          }
          {this.state.showDirection &&
          <MapView.Polyline
            coordinates={
              this.state.directionCoordsForTraitor
            }
            strokeColor={colors.clueStrokeColor}
            strokeWidth={2}
          />
          }
          </MapView>
        </Placeholder>
        <Placeholder flex={2} >
          <View style={commonStyles.gameStyle}>
            <Button
              onPress={this.disguisePressed.bind(this)}
              title={`Disguise (${this.state.disguisesRemaining})`}
              main={false}
            />
          <View style={commonStyles.rowContainerStyle}>
            <TouchableOpacity
              onPress={this.setAim.bind(this)}
              style={commonStyles.aimButtonStyle}
            >
              <Text style={commonStyles.aimTextStyle} >Aim</Text>
            </TouchableOpacity>
            <Button
              onPress={this.deflectPressed.bind(this)}
              title={`Deflect (${this.state.deflectsRemaining})`}
              main
            />
          </View>
        </View>
      </Placeholder>
    </View>
    );
  }

  renderContent() {
    if (this.state.latitude !== null && this.state.longitude !== null) {
      return this.renderCurrentUser();
    }
    return <Spinner size="large" />;
  }

  render() {
    return (
      <View style={commonStyles.gameStyle}>
        {this.renderContent()}
      </View>
    );
  }
}
