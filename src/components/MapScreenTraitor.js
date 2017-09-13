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
      latitude: 0,
      longitude: 0,
      distance: 0,
      directionCoordsForTraitor: null,
      error: null,
      showDirection: false,
      showDistance: false,
      lastClickLatTraitor: 0,
      lastClickLonTraitor: 0,
      disguiseOn: false,
      disguisesRemaining: 3,
      showAimCircle: false,
      deflectOn: false,
      deflectsRemaining: 3,
      tracerInGame: false,
      timerModalVisible: true,
      currentTime: -10,
      showCountdown: false,
      initialLatDelta: 0,
      initialLonDelta: 0,
    };
    this.defaultCaptureDist = 70;
    this.defaultGameTime = 20;
    this.callCurrentPosition = this.callCurrentPosition.bind(this);
    this.endDeflect = this.endDeflect.bind(this);
    this.endDisguise = this.endDisguise.bind(this);
    this.updateTime = this.updateTime.bind(this);
    this.notInGameModal = this.notInGameModal.bind(this);
  }

  //Sets interval to callCurrentPosition every second and
  //sets timerInterval to null
  componentDidMount() {
    this.timerInterval = null;
    this.countdownTotal = null;
    this.captureDist = null;
    this.gameTime = null;
    this.updateGameTime();
    this.updateCaptureDist();
    this.callCurrentPosition();
    this.interval = setInterval(this.callCurrentPosition, 1000);
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/traitorInGame/`] = true;
    firebase.database().ref().update(updates);
  }

  componentWillUnmount() {
    this.unmountActions();
  }

  //Resets intervals and stuff at the end of game
  unmountActions() {
    clearInterval(this.interval);
    clearInterval(this.timerInterval);
    clearInterval(this.countdownInterval);
    clearInterval(this.deflectTimeout);
    clearInterval(this.disguiseTimeout);
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      if (snapshot.val() !== null) {
        let updates = {};
        updates[`/currentSessions/${this.props.sessionKey}/traitorInGame/`] = false;
        firebase.database().ref().update(updates);
      }
    });
  }

  //Sets game time to
  updateGameTime() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}/gameTime/`)
    .once('value', snapshot => {
      let fbGameTime = snapshot.val();
      if (typeof fbGameTime === 'undefined' || fbGameTime === null) {
        this.gameTime = this.defaultGameTime;
      }
      else {
        this.gameTime = fbGameTime;
      }
    });
  }

  updateCaptureDist() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}/captureDist/`)
    .once('value', snapshot => {
      let fbCaptureDist = snapshot.val();
      if (typeof fbCaptureDist === 'undefined' || fbCaptureDist === null) {
        this.captureDist = this.defaultCaptureDist;
      }
      else {
        this.captureDist = fbCaptureDist;
      }
    });
  }

  //Pulls all info from firebase, and checks stuff about
  //the current status of the game and current display.
  //Sets state to all this current info, with callback to
  //getAndSetLocation
  callCurrentPosition() {
    let ret = false;
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      if (snapshot.val() === null) {
        this.unmountActions();
        ret = true;
        return;
      }
      if (!ret) {
        let fbGameWinner = snapshot.val().gameWinner;
        if (typeof fbGameWinner !== 'undefined' || fbGameWinner === null) {
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
          if ((typeof fbShowDistance !== 'undefined' && this.state.showDistance !== fbShowDistance) ||
                (typeof fbShowDirection !== 'undefined' && this.state.showDirection !== fbShowDirection) ||
                (typeof fbDistance !== 'undefined' && this.state.distance !== fbDistance) ||
                (typeof fbDirectionCoordsForTraitor !== 'undefined' &&
                !this.compareDirectionCoordsForTraitor(this.state.directionCoordsForTraitor,
                  fbDirectionCoordsForTraitor))) {
            Vibration.vibrate();
          }
          //Check if fbCountdownTotal has a value and tracer is logged in.
          //If so, set countdownTotal and start countdown
          let fbCountdownTotal = snapshot.val().countdownTotal;
          let fbInitialLatDelta = snapshot.val().initialLatDelta;
          let fbInitialLonDelta = snapshot.val().initialLonDelta;

          //countdownTotal hasn't been set because of asynchronous
          //firebase uploading by tracer, so pull from firebase
          if (this.countdownTotal === null && fbTracerInGame &&
            typeof fbCountdownTotal !== 'undefined' && typeof fbInitialLatDelta !== 'undefined' &&
            typeof fbInitialLonDelta !== 'undefined') {
            this.countdownTotal = fbCountdownTotal;
            this.setState({
              currentTime: this.countdownTotal,
              initialLatDelta: fbInitialLatDelta,
              initialLonDelta: fbInitialLonDelta,
              showCountdown: true,
            });
            this.startCountdown();
          }
          //Ensure state variables showDistance and showDirection
          //are not set to undefined
          this.setState({
            showDistance: (fbShowDistance || false),
            showDirection: (fbShowDirection || false),
            distance: (fbDistance || 0),
            directionCoordsForTraitor: (fbDirectionCoordsForTraitor || null),
            lastClickLatTraitor: (fbLastClickLatTraitor || 0),
            lastClickLonTraitor: (fbLastClickLonTraitor || 0),
            tracerInGame: fbTracerInGame,
            },
            this.getAndSetLocation.bind(this)
          );
        }
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
    //Have to adjust endTime by 2 because of Tracer being set 2 seconds "behind"
    this.clearFirebaseActions();
    this.unmountActions();
    Actions.endScreenTraitor({
      sessionKey: this.props.sessionKey,
      winner: fbGameWinner,
      endTime: this.gameTime - this.state.currentTime - 2,
      fromGame: true,
      type: ActionConst.RESET});
  }

  //Resets game properties to default when game is over
  clearFirebaseActions() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
      .set({
        traitorLatitude: 0,
        traitorLongitude: 0,
        traitorInGame: false,
        tracerInGame: false,
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
          currentTime: this.gameTime - 1,
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
      let currTime = this.gameTime * 1000 - (new Date().getTime() - this.timerStart);
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

  renderMap() {
    if (this.state.initialLatDelta > 0 && this.state.initialLonDelta > 0) {
      return (
        <MapView
          provider="google"
          style={commonStyles.map}
          showsUserLocation
          initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: this.state.initialLatDelta,
            longitudeDelta: this.state.initialLonDelta,
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
              radius={this.captureDist}
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
              radius={this.captureDist}
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
      );
    }
  }

  renderCurrentUser() {
    return (
      <View style={commonStyles.gameStyle}>
        <Header
          headerText='Traitor'
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, hasEntered: true});}}
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
        {this.renderMap()}
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
    if (this.state.latitude !== 0 && this.state.longitude !== 0) {
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
