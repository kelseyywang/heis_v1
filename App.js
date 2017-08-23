import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {Scene, Router, Actions} from 'react-native-router-flux';
import LoginForm from './src/components/LoginForm';
import MapScreenTraitor from './src/components/MapScreenTraitor';
import MapScreenTracer from './src/components/MapScreenTracer';
import EndScreenTracer from './src/components/EndScreenTracer';
import EndScreenTraitor from './src/components/EndScreenTraitor';
import LogoutConfirmTraitor from './src/components/LogoutConfirmTraitor';
import LogoutConfirmTracer from './src/components/LogoutConfirmTracer';

import { Header } from './src/components/common';

export default class App extends React.Component {

//TODO: https://github.com/aksonov/react-native-router-flux/issues/1145
//() => Actions.SCENE()... make new scenes
//Actions reset Actions.ROUTE_NAME({type: ActionConst.RESET});
//https://github.com/aksonov/react-native-router-flux/blob/v3/docs/API_CONFIGURATION.md#scene
  render() {
    return (
      <Router>
        <Scene key="root" component={LoginForm}>
          <Scene
            key="loginForm"
            component={LoginForm}
            title="Login"
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
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="logoutConfirmTracer"
            component={LogoutConfirmTracer}
            title="Logout BITCH?"
            hideBackImage
            renderLeftButton={() => (null)}
            panHandlers={null}
          />
          <Scene
            key="logoutConfirmTraitor"
            component={LogoutConfirmTraitor}
            title="Logout BITCH?"
            hideBackImage
            renderLeftButton={() => (null)}
            panHandlers={null}
          />
        </Scene>
      </Router>
    );
  }
}
