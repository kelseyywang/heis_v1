import React, { Component } from 'react';
import { View, Text } from 'react-native';
import firebase from 'firebase';
import { Actions } from 'react-native-router-flux';
import { Button, Card, CardSection, Input, Spinner } from './common';

class LoginForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      error: '',
      loading: false,
      loggedIn: false,
    };

    //Firebase configuration
    const config = {
      apiKey: "AIzaSyCyCJdHSlhJmgVUf9G-9IPAxJPOAhRDlOQ",
      authDomain: "heis-v1.firebaseapp.com",
      databaseURL: "https://heis-v1.firebaseio.com",
      projectId: "heis-v1",
      storageBucket: "heis-v1.appspot.com",
      messagingSenderId: "1042195751384"
    };
    firebase.initializeApp(config);

    this.onLoginSuccess = this.onLoginSuccess.bind(this);
    this.onLoginFail = this.onLoginFail.bind(this);
  }

  //Check if logged in already
  componentWillMount(){
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            this.setState({loggedIn: true});
        } else {
            this.setState({loggedIn: false});
        }
    });
  }

  //Attempts to sign in
  onButtonPress() {
      const {email, password} = this.state;
      this.setState({ error: '', loading: true });
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(this.onLoginSuccess)
        .catch(this.onLoginFail);
  }

  onLoginFail() {
    this.setState({ error: 'Authentication Failed', loading: false });
  }

  //Sends user to appropriate tracer/traitor screen
  onLoginSuccess() {
    const { currentUser } = firebase.auth();
    if (currentUser.uid === "oAoeKzMPhwZ5W5xUMEQImvQ1r333") {
      Actions.mapScreenTracer();
    }
    else if (currentUser.uid === "AQVDfE7Fp4S4nDXvxpX4fchTt2w2") {
      Actions.mapScreenTraitor();
    }
    this.setState({
      email: '',
      password: '',
      loading: false,
      error: ''
    });
  }

  //Clears tracer's firebase stuff when logged out
  logOutActions() {
    if (firebase.auth().currentUser.uid === "oAoeKzMPhwZ5W5xUMEQImvQ1r333") {
      firebase.database().ref(`/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/`)
        .set({
          showDirection: false,
          showDistance: false,
          distance: 0,
          directionCoordsForTraitor: [{
            latitude: 0,
            longitude: 0
          },
          {
            latitude: 0,
            longitude: 0
          }],
          //Arbitrary values here!
          lastClickLatTraitor: 0,
          lastClickLonTraitor: 0,
          tracerInGame: false,
          gameWinner: "none",
        })
        .catch(() => {
          console.log("location set failed");
        });
      }
      else {
        let updates = {};
        updates['/users/oAoeKzMPhwZ5W5xUMEQImvQ1r333/gameWinner/'] = "none";
        firebase.database().ref().update(updates);
        firebase.database().ref(`/users/AQVDfE7Fp4S4nDXvxpX4fchTt2w2/`)
          .set({
            deflectOn: false,
            disguiseOn: false,
            latitude: 0,
            longitude: 0,
            traitorInGame: false,
          })
          .catch(() => {
            console.log("firebase reset failed");
          });
      }
      firebase.auth().signOut();
  }

  renderButton() {
    if (this.state.loading) {
      return <Spinner size="small" />;
    }
    return (
      <Button onPress={this.onButtonPress.bind(this)}>
        Log in
      </Button>
    );
  }
//TODO 8/19: clean up log out stuff here - don't need.
//Also make logout button component and add it to all screens
//or look into react native router flux to see how to add things to navbar
//https://stackoverflow.com/questions/39471733/is-it-possible-to-add-custom-buttons-to-navbar-in-react-native-router-flux
  renderContent() {
    switch (this.state.loggedIn) {
      case true:
        return (
          <Button onPress={this.logOutActions.bind(this)}>
            Log Out
          </Button>
        );
      case false:
        return this.renderForm();
      default:
        return <Spinner size="large" />;
    }
  }

  renderForm() {
    return (
      <Card>
        <CardSection>
          <Input
            placeholder="user@gmail.com"
            label="Email"
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
          >
          </Input>
        </CardSection>

        <CardSection>
          <Input
            secureTextEntry
            placeholder="password"
            value={this.state.password}
            onChangeText={ password => this.setState({ password }) }
            label="Password"
          />
        </CardSection>

        <Text style={styles.errorTextStyle}>
          {this.state.error}
        </Text>
        <CardSection>
          {this.renderButton()}
        </CardSection>
      </Card>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderContent()}
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
  },
  errorTextStyle: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'red',
  }
};

export default LoginForm;
