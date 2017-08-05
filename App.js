import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {Scene, Router, Actions} from 'react-native-router-flux';
import LoginForm from './src/components/LoginForm';
import MapScreenTraitor from './src/components/MapScreenTraitor';
import MapScreenTracer from './src/components/MapScreenTracer';
import EndScreen from './src/components/EndScreen';
import { Header } from './src/components/common';

export default class App extends React.Component {

  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene key="login" component={LoginForm} title="Login" initial />
          <Scene key="mapScreenTraitor" component={MapScreenTraitor} title="Traitor Map" />
          <Scene key="mapScreenTracer" component={MapScreenTracer} title="Tracer Map" />
          <Scene key="endScreen" component={EndScreen} title="Game Over, My Friend ;^)" />
        </Scene>
      </Router>
    );
  }
}
