import React, { Component } from 'react';
import { View, Text } from 'react-native';
import firebase from 'firebase';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Card, CardSection, Input, Spinner } from './common';

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: 'tracer@test.com',
      password: 'password',
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
    //Check if app has already been initialized
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    this.onLoginSuccess = this.onLoginSuccess.bind(this);
    this.onLoginFail = this.onLoginFail.bind(this);
  }

  //Check if logged in already
  componentWillMount() {
    //TODO: if already logged in, bring to start page or something.
    // const { currentUser } = firebase.auth();
    // if (currentUser !== null) {
    //   if (currentUser.uid === "oAoeKzMPhwZ5W5xUMEQImvQ1r333") {
    //     this.resetForm();
    //     Actions.mapScreenTracer({type: ActionConst.RESET});
    //   }
    // }
  }

  componentWillUnmount() {
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
    /*const { currentUser } = firebase.auth();
    if (currentUser.uid === "oAoeKzMPhwZ5W5xUMEQImvQ1r333") {
      this.resetForm();
      Actions.startGameTracer({type: ActionConst.RESET});
    }
    else if (currentUser.uid === "AQVDfE7Fp4S4nDXvxpX4fchTt2w2") {
      this.resetForm();
      Actions.startGameTraitor({type: ActionConst.RESET});
    }*/
    Actions.startGameTracer({type: ActionConst.RESET});
  }

  resetForm() {
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
            onChangeText={password => this.setState({ password })}
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
        {this.renderForm()}
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
  },
};

export default LoginForm;
