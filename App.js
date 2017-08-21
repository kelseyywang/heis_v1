import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {Scene, Router, Actions} from 'react-native-router-flux';
import LoginForm from './src/components/LoginForm';
import MapScreenTraitor from './src/components/MapScreenTraitor';
import MapScreenTracer from './src/components/MapScreenTracer';
import EndScreenTracer from './src/components/EndScreenTracer';
import EndScreenTraitor from './src/components/EndScreenTraitor';
import { Header } from './src/components/common';

export default class App extends React.Component {

  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene
            key="login"
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
            onRight={()=>{console.log("right pressed");}}
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="mapScreenTracer"
            component={MapScreenTracer}
            title="Tracer Map"
            hideBackImage
            renderLeftButton={() => (null)}
            onRight={()=>{console.log("right pressed");}}
            rightTitle={"Log out"}
            panHandlers={null}
          />
          <Scene
            key="endScreenTraitor"
            renderLeftButton={() => (null)}
            onBack={() => {}}
            component={EndScreenTraitor}
            title="Game Over, Traitor ;^)"
          />
          <Scene
            key="endScreenTracer"
            renderLeftButton={() => (null)}
            onBack={() => {}}
            component={EndScreenTracer}
            title="Game Over, Tracer ;^)"
          />
        </Scene>
      </Router>
    );
  }
}
