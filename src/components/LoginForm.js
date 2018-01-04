import React, { Component } from 'react';
import { View, Text, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import firebase from 'firebase';
import { Actions, ActionConst } from 'react-native-router-flux';
import { Button, Input, Spinner, Header, Placeholder } from './common';
import commonStyles from '../styles/commonStyles';

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
    //Check if app has already been initialized
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    this.onLoginSuccess = this.onLoginSuccess.bind(this);
    this.onLoginFail = this.onLoginFail.bind(this);
  }

  //Attempts to sign in
  onButtonPress() {
    const {email, password} = this.state;
    this.setState({ error: '', loading: true });
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(this.onLoginSuccess.bind(this))
      .catch(() => {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(this.onCreateUserSuccess.bind(this))
          .catch(this.onLoginFail.bind(this));
      });
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
    Actions.startGame({type: ActionConst.RESET, newUser: false});
  }

  onCreateUserSuccess() {
    Actions.startGame({type: ActionConst.RESET, newUser: true});
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
      <Button
        onPress={this.onButtonPress.bind(this)}
        title='Log In or Create Account'
        main
      />
    );
  }

  renderForm() {
    return (
      <View style={commonStyles.setupStyle}>
        <Placeholder>
          <Image
            style={styles.logoStyle}
            source={require('../images/heistextlogo.png')}
          />
        </Placeholder>
        <Placeholder
          noJustify
          flex={1.5}
        >
          <Input
            placeholder="user@gmail.com"
            label="Email"
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
            keyboardType='email-address'
          >
          </Input>

          <Input
            secureTextEntry
            placeholder="password"
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
            label="Password"
          />
      </Placeholder>
        <Placeholder>
          <Text style={commonStyles.errorTextStyle}>
            {this.state.error}
          </Text>
          {this.renderButton()}
        </Placeholder>
        <Placeholder />
      </View>
    );
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={commonStyles.setupStyle}>
          <Header
            headerText='Log In Or Create Account'
            includeRightButton={false}
          />
          {this.renderForm()}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = {
  logoStyle: {
    height: 80,
    width: 80,
  },
};

export default LoginForm;
