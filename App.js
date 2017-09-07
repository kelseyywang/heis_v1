import React from 'react';
import {Scene, Router, Actions } from 'react-native-router-flux';
import LoginForm from './src/components/LoginForm';
import MapScreenTraitor from './src/components/MapScreenTraitor';
import MapScreenTracer from './src/components/MapScreenTracer';
import EndScreenTracer from './src/components/EndScreenTracer';
import EndScreenTraitor from './src/components/EndScreenTraitor';
import LogoutConfirmTraitor from './src/components/LogoutConfirmTraitor';
import LogoutConfirmTracer from './src/components/LogoutConfirmTracer';
import StartGame from './src/components/StartGame';
import LocateScreenTracer from './src/components/LocateScreenTracer';
import LocateScreenTraitor from './src/components/LocateScreenTraitor';
import ChooseRole from './src/components/ChooseRole';

//CHECKLIST BEFORE PUSHING TO EXPO
//MapScreenTracer and Traitor change this.totalGameTime = 600;
//and these in MapScreenTracer:
// this.minTime = 60;
// this.maxTime = 150;
// this.timeIncrements = 30;
// this.minDist = 200;
// this.maxDist = 1500;

// PROBLEM TODO:
// 1. 8/23 - MapScreenTracer problem that arises kinda randomly - but mostly after traitor deflects
// and tracer triggers. Causes error "Can only update a mounted or mounting component"
// I've also seen the same error on MapScreenTraitor after logout or login?
// ^FIX? by doing the unmount stuff before any Actions.
// 2. 8/28 - MapScreenTracer on iOS I think? When traitor logs in first, tracer on iOS
// doesn't show the countdown modal... problem again arises seemingly randomly.
// 3. 8/28 - timing between MapScreens is always a little off - I have it currently sketchily
// adjusted so that Traitor is usually a tiny tiny bit ahead of Tracer, but sometimes it's up to
// 2-3 seconds off or something
// 4. 9/4 - The GameStartedModal makes layout weird when used anywhere (currently
// in EndScreenTraitor and Tracer)
// GENERAL TODO:
// for styling android vs ios: https://github.com/aksonov/react-native-router-flux/blob/master/src/NavBar.js
// handle create account
// connect log out to sessionKey... and make numPlayers decrease when there's a logout.
// handle if both players are on chooseRole at same time...
// make colors darker or make it zoom out when circle is really big
// shorter countdowns? 2:30 max?
// make option to cancel game, while game is happening or in countdown
// about page


export default class App extends React.Component {

  render() {
    return (
      <Router>
        <Scene key="root" component={LoginForm}>
          <Scene
            key="loginForm"
            component={LoginForm}
            hideNavBar
            initial
          />
          <Scene
            key="startGame"
            component={StartGame}
            hideNavBar
          />
          <Scene
            key="mapScreenTraitor"
            component={MapScreenTraitor}
            hideNavBar
          />
          <Scene
            key="mapScreenTracer"
            component={MapScreenTracer}
            hideNavBar
          />
          <Scene
            key="locateScreenTracer"
            component={LocateScreenTracer}
            hideNavBar
          />
          <Scene
            key="locateScreenTraitor"
            component={LocateScreenTraitor}
            hideNavBar
          />
          <Scene
            key="chooseRole"
            component={ChooseRole}
            hideNavBar
          />
          <Scene
            key="endScreenTraitor"
            component={EndScreenTraitor}
            hideNavBar
          />
          <Scene
            key="endScreenTracer"
            component={EndScreenTracer}
            hideNavBar
          />
          <Scene
            key="logoutConfirmTracer"
            component={LogoutConfirmTracer}
            hideNavBar
          />
          <Scene
            key="logoutConfirmTraitor"
            component={LogoutConfirmTraitor}
            hideNavBar
          />
        </Scene>
      </Router>
    );
  }
}
