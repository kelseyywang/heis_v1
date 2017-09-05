import React from 'react';
import {Scene, Router, Actions } from 'react-native-router-flux';
import LoginForm from './src/components/LoginForm';
import MapScreenTraitor from './src/components/MapScreenTraitor';
import MapScreenTracer from './src/components/MapScreenTracer';
import EndScreenTracer from './src/components/EndScreenTracer';
import EndScreenTraitor from './src/components/EndScreenTraitor';
import LogoutConfirmTraitor from './src/components/LogoutConfirmTraitor';
import LogoutConfirmTracer from './src/components/LogoutConfirmTracer';
import StartGameTraitor from './src/components/StartGameTraitor';
import StartGameTracer from './src/components/StartGameTracer';
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

// TODO 9/4 - add GameStartedModal to EndScreenTraitor and the Locate Screens?
//test to make sure the clearFirebaseActions are truly working.
//Also after tracer goes into locate traitor, then goes back and traitor starts game,
//the modal doesn't pop up... figure out why

// PROBLEM TODO:
// 1. 8/23 - MapScreenTracer problem that arises kinda randomly - but mostly after traitor deflects
// and tracer triggers. Causes error "Can only update a mounted or mounting component"
// I've also seen the same error on MapScreenTraitor after logout or login?
// ^FIX? by doing the unmount stuff before any Actions.
// SOLVED? 2. 8/27 - MapScreenTraitor - if you log out, the interval isn't cleared so the location
// is still updated on firebase sometimes and it's not 0 as it should be
// 3. 8/28 - MapScreenTracer on iOS I think? When traitor logs in first, tracer on iOS
// doesn't show the countdown modal... problem again arises seemingly randomly.
// 4. 8/28 - timing between MapScreens is always a little off - I have it currently sketchily
// adjusted so that Traitor is usually a tiny tiny bit ahead of Tracer, but sometimes it's up to
// 2-3 seconds off or something
// SOLVED? 5. 9/3 - In EndScreenTraitor if Traitor clicks new game first, it will go to game screeen briefly
// Then go to EndScreen saying "u win lil bitch tracer ran outta time. Game time: 10"
// 6. 9/4 - The GameStartedModal makes layout weird when used anywhere (currently
// in EndScreenTraitor and Tracer)
// GENERAL TODO:
// make colors darker or make it zoom out when circle is really big
// change user's location icon https://github.com/airbnb/react-native-maps/issues/540
// shorter countdowns? 2:30 max?
// make option to switch to tracer or traitor!
// make option to cancel game, while game is happening or in countdown


export default class App extends React.Component {

  render() {
    return (
      <Router>
        <Scene key="root" component={LoginForm}>
          <Scene
            key="loginForm"
            component={LoginForm}
            title="Login"
            onBack={() => {}}
            initial
          />
          <Scene
            key="startGameTraitor"
            component={StartGameTraitor}
            title="Traitor Start Game?"
            hideBackImage
            renderLeftButton={() => (null)}
            onRight={() => {Actions.logoutConfirmTraitor();}}
            onBack={() => {}}
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="startGameTracer"
            component={StartGameTracer}
            title="Tracer Start Game?"
            hideBackImage
            renderLeftButton={() => (null)}
            onRight={() => {Actions.logoutConfirmTracer();}}
            onBack={() => {}}
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="mapScreenTraitor"
            component={MapScreenTraitor}
            title="Traitor Map"
            hideBackImage
            renderLeftButton={() => (null)}
            onRight={() => {Actions.logoutConfirmTraitor();}}
            onBack={() => {}}
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="mapScreenTracer"
            component={MapScreenTracer}
            title="Tracer Map"
            hideBackImage
            renderLeftButton={() => (null)}
            onRight={() => {Actions.logoutConfirmTracer();}}
            onBack={() => {}}
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="locateScreenTracer"
            component={LocateScreenTracer}
            title="Reunite with Traitor"
            hideBackImage
            renderLeftButton={() => (null)}
            onRight={() => {Actions.logoutConfirmTracer();}}
            onBack={() => {}}
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="locateScreenTraitor"
            component={LocateScreenTraitor}
            title="Reunite with Tracer"
            hideBackImage
            renderLeftButton={() => (null)}
            onRight={() => {Actions.logoutConfirmTraitor();}}
            onBack={() => {}}
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="chooseRole"
            component={ChooseRole}
            title="Choose Next Game Role"
            hideBackImage
            renderLeftButton={() => (null)}
            onBack={() => {}}
            panHandlers={null}
          />
          <Scene
            key="endScreenTraitor"
            component={EndScreenTraitor}
            title="Game Over, Traitor ;^)"
            hideBackImage
            renderLeftButton={() => (null)}
            onRight={() => {Actions.logoutConfirmTraitor();}}
            onBack={() => {}}
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="endScreenTracer"
            component={EndScreenTracer}
            title="Game Over, Tracer ;^)"
            hideBackImage
            renderLeftButton={() => (null)}
            onRight={() => {Actions.logoutConfirmTracer();}}
            onBack={() => {}}
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="logoutConfirmTracer"
            component={LogoutConfirmTracer}
            title="Logout BITCH?"
            hideBackImage
            onBack={() => {}}
            renderLeftButton={() => (null)}
            panHandlers={null}
          />
          <Scene
            key="logoutConfirmTraitor"
            component={LogoutConfirmTraitor}
            title="Logout BITCH?"
            hideBackImage
            onBack={() => {}}
            renderLeftButton={() => (null)}
            panHandlers={null}
          />
        </Scene>
      </Router>
    );
  }
}
