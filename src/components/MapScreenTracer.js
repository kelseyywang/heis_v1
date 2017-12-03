import { Actions, ActionConst } from 'react-native-router-flux';
import firebase from 'firebase';
import MapView from 'react-native-maps';
import React from 'react';
import { Text, View, Vibration, TouchableOpacity } from 'react-native';
import { Spinner, Button, Header, Placeholder } from './common';
import Timer from './Timer';
import ModalWithButton from './ModalWithButton';
import colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';
import strings from '../styles/strings';

export default class MapScreenTracer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: 0,
      longitude: 0,
      distance: 0,
      directionCoords: null,
      directionCoordsForTraitor: null,
      error: null,
      showDirection: false,
      showDistance: false,
      lastClickLatTracer: 0,
      lastClickLonTracer: 0,
      lastClickLatTraitor: 0,
      lastClickLonTraitor: 0,
      showAimCircle: false,
      showTriggerCircle: false,
      triggersRemaining: 3,
      traitorInGame: false,
      showTimerModal: true,
      disguiseOn: false,
      pauseBetweenClicks: false,
      showPauseText: false,
      currentTime: -10,
      showCountdown: false,
      initialLatDelta: 0,
      initialLonDelta: 0,
      showCountdownModal: true,
      helpMode: false,
      tracerMapHelp: false,
      distanceHelp: false,
      directionHelp: false,
      aimHelp: false,
      triggerHelp: false,
      modalShowing: 'none',
      showTimerComponent: false,
    };
    //The following instance vars are to determine countdown time
    //where minDist or less get minTime, maxTime or more get maxTime,
    //and anything in between gets a countdown value
    //linearly correlated to its distance, and set to the nearest
    //time increment
    // this.minTime = 3;
    // this.maxTime = 3;
    // this.timeIncrements = 30;
    // this.minDist = 200;
    // this.maxDist = 1500;
    this.minTime = 60;
    this.maxTime = 150;
    this.timeIncrements = 30;
    this.minDist = 200;
    this.maxDist = 1000;
    //The amount of meters the the tracer is permitted to travel from his
    //initial location during countdown
    this.countdownBounds = 70;
    //this.defaultGameTime = 20;
    this.defaultGameTime = 600;
    this.defaultCaptureDist = 70;
    this.setFirebase = this.setFirebase.bind(this);
    this.callCurrentPosition = this.callCurrentPosition.bind(this);
    this.resumeClicks = this.resumeClicks.bind(this);
    this.updateTime = this.updateTime.bind(this);
  }

  //Sets interval to callCurrentPosition every second and
  //sets firebase tracerInGame to true
  componentDidMount() {
    this.callCurrentPosition();
    this.interval = setInterval(this.callCurrentPosition, 1000);
    this.timerInterval = null;
    this.countdownInterval = null;
    this.initialLat = null;
    this.initialLon = null;
    this.gameTime = null;
    this.captureDist = null;
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/tracerInGame/`] = true;
    firebase.database().ref().update(updates);
  }

  componentWillUnmount() {
    this.unmountActions();
  }

  //Resets intervals and stuff at the end of game
  unmountActions() {
    clearInterval(this.interval);
    clearInterval(this.timerInterval);
    clearTimeout(this.pauseBetweenClicksTimeout);
    clearInterval(this.countdownInterval);
    clearTimeout(this.getTraitorPosTimeout);
  }

  //Updates timer and tracer's position
  //Also pulls disguise info from firebase
  callCurrentPosition() {
    let ret = false;
    //Check if traitor is in game, if so, start countdown
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      if (snapshot.val() === null) {
        this.unmountActions();
        ret = true;
        //Return somehow doesn't work in this context sometimes... hence ret
        return;
      }
      if (!ret) {
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
      }
    });
    if (!ret) {
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
  }

  //Determines countdown amount and starts countdown after both players are in game
  startCountdown() {
    this.setGameValues();
    this.timerStart = new Date().getTime();
    this.setState({
      showTimerComponent: true,
    });
    this.countdownInterval = setInterval(this.updateTime, 1000);
  }

  //Uses traitor and tracer's location when they have just both clicked "Ready"
  //to determine total countdown amount, region deltas, game time, and capture distance
  setGameValues() {
    let traitorStartLat, traitorStartLon;
    let fbCountdownTotal, fbGameTime, fbCaptureDist;
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      traitorStartLat = snapshot.val().traitorLatitude;
      traitorStartLon = snapshot.val().traitorLongitude;
      fbCountdownTotal = snapshot.val().countdownTotal;
      fbGameTime = snapshot.val().gameTime;
      fbCaptureDist = snapshot.val().captureDist;
      if (traitorStartLat === null || typeof traitorStartLat === 'undefined'
         || traitorStartLon === null || typeof traitorStartLon === 'undefined') {
        //Traitor's position hasn't been uploaded to firebase yet, need to wait
        this.getTraitorPosTimeout = setTimeout(this.setGameValues.bind(this), 500);
      }
      else {
        clearTimeout(this.getTraitorPosTimeout);
        //Traitor's position has been uploaded to firebase
        let updates = {};
        let startDistance = this.calcDistance(this.state.latitude, this.state.longitude,
          traitorStartLat, traitorStartLon);
        this.updateCountdownTotal(fbCountdownTotal, startDistance, updates);
        this.updateGameTime(fbGameTime);
        this.updateCaptureDist(fbCaptureDist);
        //Compute initial latitude and longitude delta on map
        let stateInitialLatDelta = this.calcInitialDeltas(startDistance, this.countdownTotal,
        'latitude', this.state.latitude);
        if (stateInitialLatDelta > 10) {
          //Check if it's reasonable, as it sometimes glitches
          stateInitialLatDelta = 0.01;
        }
        let stateInitialLonDelta = this.calcInitialDeltas(startDistance, this.countdownTotal,
        'longitude', this.state.latitude);
        if (stateInitialLonDelta > 10) {
          //Check if it's reasonable, as it sometimes glitches
          stateInitialLonDelta = 0.01;
        }
        this.setState({
          initialLatDelta: stateInitialLatDelta,
          initialLonDelta: stateInitialLonDelta,
        });
        updates[`/currentSessions/${this.props.sessionKey}/initialLatDelta/`] = this.state.initialLatDelta;
        updates[`/currentSessions/${this.props.sessionKey}/initialLonDelta/`] = this.state.initialLonDelta;
        firebase.database().ref().update(updates);
      }
    });
  }

  updateCountdownTotal(fbCountdownTotal, startDistance, updates) {
    //Only calculate countdownTotal if it hasn't already been set in GameSettings
    if (typeof fbCountdownTotal === 'undefined' || fbCountdownTotal === null) {
      this.countdownTotal = this.calcCountdownAmount(startDistance);
      updates[`/currentSessions/${this.props.sessionKey}/countdownTotal/`] = this.countdownTotal;
    }
    else {
      this.countdownTotal = fbCountdownTotal;
    }
  }

  updateGameTime(fbGameTime) {
    if (typeof fbGameTime === 'undefined' || fbGameTime === null) {
      this.gameTime = this.defaultGameTime;
    }
    else {
      this.gameTime = fbGameTime;
    }
  }

  updateCaptureDist(fbCaptureDist) {
    if (typeof fbCaptureDist === 'undefined' || fbCaptureDist === null) {
      this.captureDist = this.defaultCaptureDist;
    }
    else {
      this.captureDist = fbCaptureDist;
      this.countdownBounds = fbCaptureDist;
    }
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
    let numCountdownTimes = 1 + Math.floor((this.maxTime - this.minTime) / this.timeIncrements);
    //Calculate range of distance for each time increment
    let incrementDistAmts = Math.floor((this.maxDist - this.minDist) / (numCountdownTimes - 2));
    let numTimeIncrements = numCountdownTimes - 2 - Math.floor((myDist - this.minDist) / incrementDistAmts);
    return (Math.floor(this.minTime + this.timeIncrements * numTimeIncrements));
  }

  calcInitialDeltas(myDist, myCountdownTotal, direction, latitude) {
    //Add some distance in both directions to account for meters
    //gained during countdown, assuming 8 minute mile pace
    let countdownMetersGained = 1609.34 * myCountdownTotal / (8 * 60);
    let meterDelta = 2 * (countdownMetersGained + myDist);

    if (direction === 'latitude') {
      //Convert meters to latitude
      return meterDelta / 111044.46;
    }
    else if (direction === 'longitude') {
      //Number of meters in longitude depends on current latitude
      let metersInLon = Math.cos(latitude * Math.PI / 180) * 111318.05;
      return meterDelta / metersInLon;
    }
    return 0.01;
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

  //Determines whether traitor is in captureDist and
  //whether deflect was pulled. If no winner, resets state
  determineWinner() {
    firebase.database().ref(`/currentSessions/${this.props.sessionKey}`)
    .once('value', snapshot => {
      let traitorLat = snapshot.val().traitorLatitude;
      let traitorLon = snapshot.val().traitorLongitude;
      let traitorDeflect = snapshot.val().deflectOn;
      let dist =
      this.calcDistance(this.state.latitude, this.state.longitude, traitorLat, traitorLon);
      if (dist < this.captureDist) {
        if (typeof traitorDeflect === 'undefined' || traitorDeflect === null || !traitorDeflect) {
          //Tracer won
          this.gameWonActions("Tracer", Math.round(dist));
        }
        else {
          //Traitor won by deflect
          this.gameWonActions("Traitor deflect", Math.round(dist));
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
  gameWonActions(winnerString, triggerDist) {
    let saveEndTime = this.gameTime - this.state.currentTime;
    let updates = {};
    updates[`/currentSessions/${this.props.sessionKey}/gameWinner/`] = winnerString;
    updates[`/currentSessions/${this.props.sessionKey}/endTime/`] = saveEndTime;
    if (triggerDist !== null) {
      updates[`/currentSessions/${this.props.sessionKey}/triggerDist/`] = Math.round(triggerDist);
    }
    firebase.database().ref().update(updates);
    this.unmountActions();
    Actions.endScreenTracer({
      sessionKey: this.props.sessionKey,
      winner: winnerString,
      triggerDistance: triggerDist,
      endTime: saveEndTime,
      fromGame: true,
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
      if (currTime < 1) {
        this.gameWonActions("Traitor time", null);
      }
        this.setState({
          currentTime: currTime / 1000,
        });
    }
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
  exitNotInGameModal() {
    this.setState({
      showTimerModal: false,
    });
  }

  exitCountdownModal() {
    this.setState({
      showCountdownModal: false,
    });
  }

  tracerMapHelpClose() {
    this.setState({
      tracerMapHelp: false,
    });
  }

  showTracerMapHelp() {
    this.setState({
      modalShowing: 'tracerMapHelp',
      tracerMapHelp: true,
    });
  }

  distanceHelpClose() {
    this.setState({
      distanceHelp: false,
    });
  }

  showDistanceHelp() {
    this.setState({
      modalShowing: 'distanceHelp',
      distanceHelp: true,
    });
  }

  directionHelpClose() {
    this.setState({
      directionHelp: false,
    });
  }

  showDirectionHelp() {
    this.setState({
      modalShowing: 'directionHelp',
      directionHelp: true,
    });
  }

  aimHelpClose() {
    this.setState({
      aimHelp: false,
    });
  }

  showAimHelp() {
    this.setState({
      modalShowing: 'aimHelp',
      aimHelp: true,
    });
  }

  triggerHelpClose() {
    this.setState({
      triggerHelp: false,
    });
  }

  showTriggerHelp() {
    this.setState({
      modalShowing: 'triggerHelp',
      triggerHelp: true,
    });
  }

  renderHelpModal(whichModal) {
    if (whichModal !== 'none') {
      if (eval(`this.state.${whichModal}`)) {
        return (
          <ModalWithButton
            onButtonPress={eval(`this.${whichModal}Close.bind(this)`)}
            buttonTitle='Okay'
          >
            {strings[whichModal]}
          </ModalWithButton>
        );
      }
    }
  }

  renderHelpMode() {
    return (
      <View style={commonStyles.gameStyle}>
        {this.renderHelpModal(this.state.modalShowing)}
        <Header
          helpMode
          headerText='Tracer - Help Mode'
          includeLeftButton
          leftButtonText='Help Mode'
          leftButtonAction={() =>
          {this.setState({helpMode: !this.state.helpMode});}}
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, fromRole: 'tracer'});}}
        />
        <Placeholder flex={0.3} >
          {this.renderTimerOrCountdown()}
        </Placeholder>
        <TouchableOpacity
          onPress={this.showTracerMapHelp.bind(this)}
          style={commonStyles.placeholderStyle2}
        >
          {this.renderMap()}
        </TouchableOpacity>
        <Placeholder flex={2} >
          <View style={commonStyles.gameStyle}>
            <Button
              onPress={this.showDistanceHelp.bind(this)}
              title='Distance'
              main
            />
            <Button
              onPress={this.showDirectionHelp.bind(this)}
              title='Direction'
              main
            />
            <View style={commonStyles.rowContainerStyle}>
              <TouchableOpacity
                onPress={this.showAimHelp.bind(this)}
                style={commonStyles.aimButtonStyle}
              >
                <Text style={commonStyles.aimTextStyle} >Aim</Text>
              </TouchableOpacity>
              <Button
                onPress={this.showTriggerHelp.bind(this)}
                title={`Trigger (${this.state.triggersRemaining})`}
                main={false}
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
              radius={this.captureDist}
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
      );
    }
  }

  renderTimerOrCountdown() {
    if (!this.state.showCountdown) {
      return (
        <Text style={commonStyles.lightTextStyle}>
          {"Time: " + this.returnTimerString(this.state.currentTime)}
        </Text>
      );
    }
    return (
      <Text style={commonStyles.lightTextStyle}>
        {"Wait. Countdown: " + this.returnTimerString(this.state.currentTime)}
      </Text>
    );
  }

  //TODO: fix this! remove testStart, replace w this.timerStart?
  renderTimerComponent() {
    if (this.state.showTimerComponent) {
      let testStart = new Date().getTime();
      console.log("TIMERSTART IS " + this.timerStart);
      return (
        <Timer
          countdownDuration={10}
          gameDuration={60}
          timerStart={testStart}
        />
      );
    }
  }

  renderCurrentUser() {
    return (
      <View style={commonStyles.gameStyle}>
        <Header
          headerText='Tracer'
          includeLeftButton
          leftButtonText='Help Mode'
          leftButtonAction={() =>
          {this.setState({helpMode: !this.state.helpMode});}}
          includeRightButton
          rightButtonText='Log Out'
          rightButtonAction={() =>
            {Actions.logoutConfirm({sessionKey: this.props.sessionKey, fromRole: 'tracer'});}}
        />
        <Placeholder flex={0.3} >
          {this.renderTimerComponent()}
        </Placeholder>
        {!this.state.showCountdown && !this.state.traitorInGame && this.state.showTimerModal &&
          <ModalWithButton
            onButtonPress={this.exitNotInGameModal.bind(this)}
            buttonTitle='Okay'
          >
            Traitor is not in the game
          </ModalWithButton>
        }
        {this.state.showCountdown && this.state.showCountdownModal &&
          <ModalWithButton
            onButtonPress={this.exitCountdownModal.bind(this)}
            buttonTitle='Close'
          >
            {"Wait. Countdown: " + this.returnTimerString(this.state.currentTime)}
          </ModalWithButton>
        }
        <Placeholder flex={2} >
          {this.renderMap()}
        </Placeholder>
        <Placeholder flex={2} >
          <View style={commonStyles.gameStyle}>
            <Button
              onPress={this.setCurrentDistance.bind(this)}
              title='Distance'
              main
            />
            <Button
              onPress={this.setCurrentDirectionCoords.bind(this)}
              title='Direction'
              main
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
                main={false}
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
    if (this.state.latitude !== 0 && this.state.longitude !== 0) {
      return this.renderCurrentUser();
    }
    return <Spinner size="large" />;
  }

  render() {
    if (this.state.helpMode) {
      return (
        <View style={commonStyles.gameStyle}>
          {this.renderHelpMode()}
        </View>
      );
    }
    return (
      <View style={commonStyles.gameStyle}>
        {this.renderContent()}
      </View>
    );
  }
}
