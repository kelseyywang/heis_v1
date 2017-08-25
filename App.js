import React from 'react';
import {Scene, Router, Actions, ActionConst} from 'react-native-router-flux';
import LoginForm from './src/components/LoginForm';
import MapScreenTraitor from './src/components/MapScreenTraitor';
import MapScreenTracer from './src/components/MapScreenTracer';
import EndScreenTracer from './src/components/EndScreenTracer';
import EndScreenTraitor from './src/components/EndScreenTraitor';
import LogoutConfirmTraitor from './src/components/LogoutConfirmTraitor';
import LogoutConfirmTracer from './src/components/LogoutConfirmTracer';

//PROBLEM TODO:
//1. 8/23 - MapScreenTracer problem that arises kinda randomly - but mostly after traitor deflects
//and tracer triggers. Causes error "Can only update a mounted or mounting component"
//I've also seen the same error on MapScreenTraitor after logout or login?



import { Header } from './src/components/common';

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
            key="endScreenTraitor"
            component={EndScreenTraitor}
            title="Game Over, Traitor ;^)"
            hideBackImage
            renderLeftButton={() => (null)}
            onRight={() => {Actions.logoutConfirmTraitor();}}
            onBack={() => {}}
            rightTitle={"Log out"}
            onBack={() => {}}

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
