import React from 'react';
import {Scene, Router, Actions } from 'react-native-router-flux';
import LoginForm from './src/components/LoginForm';
import MapScreenTraitor from './src/components/MapScreenTraitor';
import MapScreenTracer from './src/components/MapScreenTracer';
import EndScreenTracer from './src/components/EndScreenTracer';
import EndScreenTraitor from './src/components/EndScreenTraitor';
import LogoutConfirm from './src/components/LogoutConfirm';
import StartGame from './src/components/StartGame';
import StatsScreen from './src/components/StatsScreen';
import LocateScreenTracer from './src/components/LocateScreenTracer';
import LocateScreenTraitor from './src/components/LocateScreenTraitor';
import ChooseRole from './src/components/ChooseRole';
import GameSettings from './src/components/GameSettings';

//CHECKLIST BEFORE PUSHING TO EXPO
//MapScreenTracer and Traitor change this.defaultGameTime = 600;
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
// 2. 8/28 - MapScreenTracer on iOS I think? When traitor logs in first, tracer on iOS
// doesn't show the countdown modal... problem again arises seemingly randomly.
// 3. 8/28 - timing between MapScreens is always a little off - I have it currently sketchily
// adjusted so that Traitor is usually a tiny tiny bit ahead of Tracer, but sometimes it's up to
// 2-3 seconds off or something
// 4. 9/13 - when you go to Game Settings screen, or return back to ChooseRole after Settings,
// if the oter person started a game, the GameStartedModal doesn't pop up
// ^ test if the interval is still going in ChooseRole when you go to GameSettings
// GENERAL TODO:
// handle when user quits app without logging out??
// revise endscreen messages
// about page - maybe an information icon on header on each page
// not important: make option to cancel game, while game is happening or in countdown
// (mo)


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
            key="chooseRole"
            component={ChooseRole}
            hideNavBar
          />
          <Scene
            key="gameSettings"
            component={GameSettings}
            hideNavBar
          />
          <Scene
            key="statsScreen"
            component={StatsScreen}
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
            key="logoutConfirm"
            component={LogoutConfirm}
            hideNavBar
          />
        </Scene>
      </Router>
    );
  }
}
