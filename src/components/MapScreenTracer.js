import { Actions, ActionConst } from 'react-native-router-flux';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import React from 'react';
import { StyleSheet, Text, View, Vibration, Modal, TouchableOpacity } from 'react-native';
import GameStartedModal from './GameStartedModal';
import { Spinner, Button, Header, Placeholder } from './common';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

//TODO 9/5: Reset all the fb with sessionKey to default vals in beginning
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
      showAimCircle: false,
      showTriggerCircle: false,
      triggersRemaining: 3,
      traitorInGame: false,
      timerModalVisible: true,
      disguiseOn: false,
      pauseBetweenClicks: false,
      showPauseText: false,
      currentTime: -10,
      showCountdown: false,
    };
    this.range = 70;
    //The following instance vars are to determine countdown time
    //where minDist or less get minTime, maxTime or more get maxTime,
    //and anything in between gets a countdown value
    //linearly correlated to its distance, and set to the nearest
    //time increment
    this.minTime = 3;
    this.maxTime = 3;
    this.timeIncrements = 30;
    this.minDist = 200;
    this.maxDist = 1500;

    //The amount of meters the the tracer is permitted to travel from his
    //initial location during countdown
    this.countdownBounds = 70;
    this.totalGameTime = 20;
    this.setFirebase = this.setFirebase.bind(this);
    this.callCurrentPosition = this.callCurrentPosition.bind(this);
    this.resumeClicks = this.resumeClicks.bind(this);
    this.updateTime = this.updateTime.bind(this);
    this.exitGameJoinModal = this.exitGameJoinModal.bind(this);
  }

  //Sets interval to callCurrentPosition every second and
  //sets firebase tracerInGame to true
  componentDidMount() {
    this.callCurrentPosition();
    this.interval = setInterval(this.callCurrentPosition, 1000);
    this.timerInterval = null;
    this.countdownInterval = null;
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/tracerInGame/`] = true;
    firebase.database().ref().update(updates);
  }

  componentWillUnmount() {
    this.endGameActions();
  }

  //Updates timer and tracer's position
  //Also pulls disguise info from firebase
  callCurrentPosition() {
    //Check if traitor is in game, if so, start countdown
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      let fbTraitorInGame = snapshot.val().traitorInGame;
      if (fbTraitorInGame && this.countdownInterval === null) {
        this.setState({
          showCountdown: true,
        });
        this.startCountdown();
        //Save initial position of tracer to make sure he doesn't move
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.initialLat = position.coords.latitude;
            this.initialLon = position.coords.longitude;
          },
          (error) => this.setState({ error: error.message }),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
      }
      this.setState({
        traitorInGame: fbTraitorInGame,
      });
    });
    //Set tracer's location to state
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
    //Determine whether tracer has moved too much during countdown
    if (this.state.showCountdown && this.initialLat !== null
      && this.initialLon !== null) {
        if (this.calcDistance(this.state.latitude, this.state.longitude,
          this.initialLat, this.initialLon) > this.countdownBounds) {
          this.gameWonActions("Countdown move", null);
        }
      }
  }

  //Determines countdown amount and starts countdown after both players are in game
  startCountdown() {
    this.setCountdownTotal();
    this.timerStart = new Date().getTime();
    this.countdownInterval = setInterval(this.updateTime, 1000);
  }

  //Uses traitor and tracer's location when they have just both clicked "Ready"
  //to determine total countdown amount
  setCountdownTotal() {
    let traitorStartLat;
    let traitorStartLon;
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      traitorStartLat = snapshot.val().traitorLatitude;
      traitorStartLon = snapshot.val().traitorLongitude;
    })
    .then(() => {
      if (traitorStartLat === 0 || traitorStartLon === 0) {
        //Traitor's position hasn't been uploaded to firebase yet, need to wait
        this.getTraitorPosTimeout = setTimeout(this.setCountdownTotal.bind(this), 500);
      }
      else {
        clearTimeout(this.getTraitorPosTimeout);
        //Traitor's position has been uploaded to firebase
        let startDistance = this.calcDistance(this.state.latitude, this.state.longitude, traitorStartLat, traitorStartLon);
        this.countdownTotal = this.calcCountdownAmount(startDistance);
        let updates = {};
        updates[`/currentSessions/${this.props.sessionKey}/countdownTotal/`] = this.countdownTotal;
        firebase.database().ref().update(updates);
      }
    });
  }

  //Helps calculate countdown distance using linearly distributed
  //increments between minTime and maxTime
  calcCountdownAmount(myDist) {
    if (myDist < this.minDist) {
      return this.maxTime;
    }
    else if (myDist > this.maxDist) {
      return this.minTime;
    }
    else {
      let numCountdownTimes = 1 + Math.floor((this.maxTime - this.minTime) / this.timeIncrements);
      //Calculate range of distance for each time increment
      let incrementDistAmts = Math.floor((this.maxDist - this.minDist) / (numCountdownTimes - 2));
      let numTimeIncrements = numCountdownTimes - 2 - Math.floor((myDist - this.minDist) / incrementDistAmts);
      return (Math.floor(this.minTime + this.timeIncrements * numTimeIncrements));
    }
  }

  //Starts timer after countdown ends
  startTimer() {
    this.timerStart = new Date().getTime();
    this.timerInterval = setInterval(this.updateTime, 1000);
  }

  //Sets current state variables to firebase
  setFirebase() {
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/showDirection/`] = this.state.showDirection;
    updates[`/currentSessions/${this.props.sessionKey}/showDistance/`] = this.state.showDistance;
    updates[`/currentSessions/${this.props.sessionKey}/distance/`] = this.state.distance;
    updates[`/currentSessions/${this.props.sessionKey}/directionCoordsForTraitor/`] = this.state.directionCoordsForTraitor;
    updates[`/currentSessions/${this.props.sessionKey}/lastClickLatTraitor/`] = this.state.lastClickLatTraitor;
    updates[`/currentSessions/${this.props.sessionKey}/lastClickLonTraitor/`] = this.state.lastClickLonTraitor;
    firebase.database().ref().update(updates);
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

  //Returns direction coordinates for traitor's direction
  //line, which is in the opposite direction as the tracer's
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
    if (!this.state.pauseBetweenClicks && this.state.traitorInGame
      && !this.state.showCountdown) {
      firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
      .once('value', snapshot => {
        let traitorLat = snapshot.val().traitorLatitude;
        let traitorLon = snapshot.val().traitorLongitude;
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
            lastClickLatTraitor: snapshot.val().traitorLatitude,
            lastClickLonTraitor: snapshot.val().traitorLongitude,
            showTriggerCircle: false,
            disguiseOn: false,
          }, this.setFirebase);
        }
      });
      this.setPauseBetweenClicks();
    }
    else {
      this.setState({
        showPauseText: true,
      });
    }
  }

  //Called when Direction button pressed
  setCurrentDirectionCoords() {
    if (!this.state.pauseBetweenClicks && this.state.traitorInGame
    && !this.state.showCountdown) {
      firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
      .once('value', snapshot => {
        let traitorLat = snapshot.val().traitorLatitude;
        let traitorLon = snapshot.val().traitorLongitude;
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
            lastClickLatTraitor: snapshot.val().traitorLatitude,
            lastClickLonTraitor: snapshot.val().traitorLongitude,
            showTriggerCircle: false,
            disguiseOn: false,
          }, this.setFirebase);
        }
      });
      this.setPauseBetweenClicks();
    }
    else {
      this.setState({
        showPauseText: true,
      });
    }
  }

  //Requires tracer to wait a little between getting new
  //distance and direction clues
  setPauseBetweenClicks() {
    this.setState({
      pauseBetweenClicks: true
    });
    this.pauseBetweenClicksTimeout = setTimeout(this.resumeClicks, 5000);
  }

  resumeClicks() {
    clearTimeout(this.pauseBetweenClicksTimeout);
    this.setState({
      pauseBetweenClicks: false,
      showPauseText: false,
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
    if (this.state.traitorInGame && !this.state.showCountdown) {
      Vibration.vibrate();
      this.state.triggersRemaining = this.state.triggersRemaining - 1;
      if (this.state.triggersRemaining <= 0) {
        //Traitor won as tracer ran out of triggers
        this.state.triggersRemaining = 0;
        this.gameWonActions("Traitor", null);
      }
      else {
        this.determineWinner();
      }
    }
  }

  //Determines whether traitor is in range and
  //whether deflect was pulled. If no winner, resets state
  determineWinner() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      let traitorLat = snapshot.val().traitorLatitude;
      let traitorLon = snapshot.val().traitorLongitude;
      let traitorDeflect = snapshot.val().deflectOn;
      let dist =
      this.calcDistance(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      if (dist < this.range) {
        if (!traitorDeflect) {
          //Tracer won
          this.gameWonActions("Tracer", Math.round(dist));
        }
        else {
          //Traitor won by deflect
          this.gameWonActions("Traitor deflect", null);
        }
      }
      else {
        //None of the following is updated to firebase,
        //preventing traitor from seeing it
        this.setState({
          distance: dist,
          lastClickLatTracer: this.state.latitude,
          lastClickLonTracer: this.state.longitude,
          showTriggerCircle: true,
        });
      }
    });
  }

  //Helper function to set winner to Firebase
  //and send to end screen
  gameWonActions(winnerString, endDist) {
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/gameWinner/`] = winnerString;
    firebase.database().ref().update(updates);
    Actions.endScreenTracer({
      sessionKey: this.props.sessionKey,
      winner: winnerString,
      endDistance: endDist,
      endTime: this.totalGameTime - this.state.currentTime,
      type: ActionConst.RESET});
  }

  //Updates timer
  updateTime() {
    if (this.state.showCountdown){
      //Get the time remaining in countdown
      //Have to adjust currCountdownTime by 2 to account for lag
      //that makes traitor slower
      let currCountdownTime = 2 + this.countdownTotal -
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
      if (currTime < 1) {
        this.gameWonActions("Traitor time", null);
      }
        this.setState({
          currentTime: currTime / 1000,
        });
    }
  }

  //Resets intervals and stuff at the end of game
  endGameActions() {
    clearInterval(this.interval);
    clearInterval(this.timerInterval);
    clearTimeout(this.pauseBetweenClicksTimeout);
    clearInterval(this.countdownInterval);
    clearTimeout(this.getTraitorPosTimeout);
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/tracerInGame/`] = false;
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
  exitGameJoinModal() {
    this.setState({
      timerModalVisible: false,
    });
  }

  renderCurrentUser() {
    return (
      <View style={commonStyles.gameStyle}>
        <Header
          headerText='Tracer'
          gameMode
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, role: 'tracer'});}}
        />
        <Placeholder flex={0.3} >
        {!this.state.showCountdown &&
          <Text style={commonStyles.lightTextStyle}>
            {"Time: " + this.returnTimerString(this.state.currentTime)}
          </Text>
        }
        </Placeholder>
        <Modal
          visible={!this.state.showCountdown && !this.state.traitorInGame && this.state.timerModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {}}
        >
          <View style={commonStyles.modalStyle}>
            <View style={commonStyles.modalSectionStyle}>
              <Text style={commonStyles.mainTextStyle}>
                Traitor is not in the game
              </Text>
              <Button
                onPress={this.exitGameJoinModal}
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
                {"Wait. Countdown: " + this.returnTimerString(this.state.currentTime)}
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
                latitude: this.state.lastClickLatTracer,
                longitude: this.state.lastClickLonTracer
              }}
              radius={this.state.distance}
              fillColor={colors.clueFillColor}
              strokeColor={colors.clueStrokeColor}
              strokeWidth={2}
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
                  latitude: this.state.latitude,
                  longitude: this.state.longitude
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
              strokeColor={colors.clueStrokeColor}
              strokeWidth={2}
            />
            }
          </MapView>
        </Placeholder>
        <Placeholder flex={2} >
          <View style={commonStyles.gameStyle}>
            <Button
              onPress={this.setCurrentDistance.bind(this)}
              title='Distance'
              main={false}
            />
            <Button
              onPress={this.setCurrentDirectionCoords.bind(this)}
              title='Direction'
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
                onPress={this.triggerPulled.bind(this)}
                title={`Trigger (${this.state.triggersRemaining})`}
                main
              />
            </View>
          </View>
        </Placeholder>
        <Placeholder flex={0.3} >
          {this.state.showPauseText && this.state.traitorInGame &&
            !this.state.showCountdown &&
            <Text style={commonStyles.errorTextStyle}>
              Must wait 5 sec. between clues
            </Text>
          }
        </Placeholder>
      </View>
    );
  }

  renderContent() {
    if (this.state.latitude !== null && this.state.longitude !== null &&
    this.state.distance !== null && this.state.directionCoords !== null &&
    this.state.showDirection !== null && this.state.showDistance !== null) {
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
