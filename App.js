import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {Scene, Router, Actions} from 'react-native-router-flux';
import LoginForm from './src/components/LoginForm';
import MapScreen from './src/components/MapScreen';
import { Header } from './src/components/common';

export default class App extends React.Component {

  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene key="login" component={LoginForm} title="Please Login" initial />
          <Scene key="mapScreen" component={MapScreen} title="Please Login" />
        </Scene>
      </Router>
    );
  }
}
