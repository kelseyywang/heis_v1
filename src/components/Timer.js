import React, { Component } from 'react';
import { Text } from 'react-native';
import commonStyles from '../styles/commonStyles';

export default class Timer extends React.Component {

  constructor(props) {
    //TODO: why is super red????
    super(props);
    //has prop countdownDuration in seconds
    console.log("constructed");
    this.state = {
      currTime: 0,
      inCountdown: true,
    };
    this.updateTimer = this.updateTimer.bind(this);
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    clearInterval(this.updater);
  }

  startTimer() {
    this.updater = setInterval(this.updateTimer, 100);
  }

  updateTimer() {
    if (this.state.inCountdown) {
      if (this.state.currTime < this.props.countdownDuration) {
        console.log("Time" + (new Date().getTime() - this.props.timerStart) / 1000);
        this.setState({
          currTime: (new Date().getTime() - this.props.timerStart) / 1000,
        });
      }
      else {
        //handle countdown end
        this.setState({
          inCountdown: false,
          currTime: 0,
        });
      }
    }
    else {
      if (this.state.currTime < this.props.gameDuration) {
        this.setState({
          currTime: (new Date().getTime() - (this.props.timerStart + this.props.countdownDuration * 1000)) / 1000,
        });
      }
      else {
        clearInterval(this.updater);
      }
    }
  }

  returnTimerString(numSeconds) {
    let minutes;
    let seconds;
    if (numSeconds < 0) {
      //default value, show 0
      return "00:00";
    }
    else if (Math.floor(numSeconds / 60) < 10) {
     minutes = "0" + Math.floor(numSeconds / 60);
    }
    else {
      minutes = "" + Math.floor(numSeconds / 60);
    }
    if (Math.floor(numSeconds % 60) < 10) {
      seconds = "0" + Math.floor(numSeconds % 60);
    }
    else {
      seconds = "" + Math.floor(numSeconds % 60);
    }
    return (minutes + ":" + seconds);
  }

  render() {
    console.log("renDERED");
    if (!this.state.inCountdown) {
      return (
        <Text style={commonStyles.lightTextStyle}>
          {"Time: " + this.returnTimerString(this.state.currTime)}
        </Text>
      );
    }
    return (
      <Text style={commonStyles.lightTextStyle}>
        {"Wait. Countdown: " + this.returnTimerString(this.state.currTime)}
      </Text>
    );
  }
}
