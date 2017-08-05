import React, { Component } from 'react';
import { View, Text } from 'react-native';
import firebase from 'firebase';
import { Actions } from 'react-native-router-flux';
import { Button, Card, CardSection, Input, Spinner, Header}  from './common';

class LoginForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      error: '',
      loading: false,
      loggedIn: false,
    }

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

  componentWillMount(){
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            this.setState({loggedIn: true});
        } else {
            this.setState({loggedIn: false});
        }
    });
  }

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

  renderContent() {
    switch (this.state.loggedIn) {
      case true:
        return (
          <Button onPress={ () => firebase.auth().signOut() }>
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
    height: 400,
  },
  errorTextStyle: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'red',
  }
};

export default LoginForm;
