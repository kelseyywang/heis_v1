const strings = {
  sessionKeyHelp: `This key will connect you to your opponent. Enter a unique phrase or word (i.e. Alex’s round, yourfullname074). Your opponent must enter the exact same thing, caps included. If you get an error, enter a new key.`,
  readyHelp: `Pressing this will validate your key and start the round. Only press this when you are ready to begin, as the round will start immediately or right after your opponent joins.`,
  statsHelp: 'This will bring you to the win/loss statistics recorded for your account.',
  tracerHelp: `You attempt to capture the Traitor. You can request information about the Traitor’s distance and direction from you periodically. Your goal is to press Trigger when the Tracer is in range (default is 70 meters). Careful: the Traitor can Deflect and turn your weapon on you.`,
  traitorHelp: `You attempt to evade capture from the Tracer. You receive all the information on the map that the Tracer requests. You can Disguise (hide all information about your position), and Deflect (shield and reflect any Triggers) - 3 times each. Each instance lasts 5% of round time (i.e. 30 sec. for 10 min. game).`,
  settingsHelp: `You can adjust this round’s settings here - countdown time, total round time, and capture distance. If you’re new, we recommend skipping this and using the default settings.`,
  countdownHelp: `This adjusts the initial countdown time. This is when the Traitor escapes and the Tracer cannot move. The default is a time between :30 and 2:30, dependent on how far Traitor and Tracer are from each other when the round begins. We recommend this to be 15%-30% of round time.`,
  gameTimeHelp: `This adjusts the total time that this round lasts, after the countdown. The default is 10 minutes. Adjust this relative to your area size, i.e. use a smaller round time (and countdown) for a smaller area, and larger times for larger areas.`,
  captureDistHelp: `This adjusts the range of the Trigger (Aim and Deflect as well). I.e. If you set this to 100, the Tracer can Trigger and capture the Traitor from 100 meters away. Default is 70 meters. This is also the maximum distance the Tracer can move during countdown. Adjust this relative to your area size.`,
  saveSettingsHelp: `This saves the settings you have entered here.`,
  traitorMapHelp: `This displays any location information that the Tracer gets, as well as aim. Distance will appear as a circle (the Tracer is anywhere on the border of the circle), and Direction will appear as a line (the Tracer is anywhere on the line).`,
  disguiseHelp: `This prevents the Tracer, and therefore yourself, from getting any distance or direction information. When pressed, the screen will have be tinted black. The Tracer can still Trigger during this time. Can use 3 times, each instance lasts 5% of round time (i.e. default is 30 sec. for 10 min. game).`,
  aimHelp: `This displays the capture distance (default is 70 meters) in yellow. It is only for the user’s reference and does not cause any action to be performed. Show/hide by tapping again. If you don't see the circle, zoom in or re-center map on your location.`,
  deflectHelp: `This protects you and turns the Tracer’s weapon against him/herself. I.e. If you are within the capture distance and the Tracer pressed Trigger, instead of you losing, s/he loses. Causes a green circle to appear on map. Can use 3 times, each instance lasts 5% of round time (i.e. default is 30 sec. for 10 min. game).`,
  tracerMapHelp: `This displays any location information, aim, and tint black if Traitor Disguises. Distance will appear as a circle (the Traitor is anywhere on the border of the circle), and Direction will appear as a line (the Traitor is anywhere on the line).`,
  distanceHelp: `This will request your distance from the Traitor. The distance, at the time of your last press, will be shown on the map as a purple circle. You can request a new clue every 5 seconds. If you don't see the circle, zoom in or re-center map on your location.`,
  directionHelp: `This will request the Traitor’s direction from you. The direction, at the time of your last press, will be shown on the map as a purple line. You can request a new clue every 5 seconds.`,
  triggerHelp: `This triggers your stun weapon. You win if you press this when Traitor is within range, but you lose if the Traitor is Deflecting. You have 3 triggers and if you run out, you lose. If you miss, a red circle will appear on the map showing how far Traitor is.`,
  newGameHelp: 'Start a new round. You can reassign roles and adjust settings every round.',
  locateHelp: `If you are trying to find your opponent again, this leads to a map with their location to facilitate that. To prevent cheating, you must both be in this screen to get information about each other’s positions.`,
  //The following are EndScreen messages
  //Name is the string description/who won
  //Tracers' end with 1 and Traitors' with 2
  tracer1: `You win! You successfully captured the Traitor and crushed your greatest threat.`,
  traitor1: `You lose! You wasted all 3 chances of Triggering your weapon and are in a hopeless position now.`,
  deflect1: 'You lose! You were Deflected by the Traitor. They used your own weapon against you.',
  time1: `You lose! You ran out of time and must double back to the bunker or else succumb to the radiation.`,
  move1: 'You moved too much during the countdown. You are bounded by the capture distance (default is 70 meters) during the countdown. Start a new round.',
  tracer2: `You lose! The Tracer captured you - and the consequences are immense for treachery.`,
  traitor2: `You win! The Tracer missed all their Trigger attempts, leaving you free to escape to Firehand.`,
  deflect2: `You win! You successfully Deflected the Tracer’s weapon, using their own weapon against them.`,
  time2: `You win! The Tracer must double back to the bunker to avoid radiation poisoning, leaving you free to escape.`,
  move2: `The Tracer moved too much during the countdown. Start a new round.`,
  welcomeMessage1: `I see you're new here - Welcome to heis! The following is the last message - broadcast just seconds ago - from the Tracers of the Command Ministry...`,
  welcomeMessage2: `"We were the last ones left after Firehand bombed the capital. We have been communicating with our remaining supporters and planning a coup. But today, the Traitors have fled to join Firehand. We’re leaving the bunker to track and capture them.
  The stakes are high and we could lose everything."`,
  welcomeMessage3: `This device you’re holding right now carries all the resources you have, besides your own intelligence. If you need help, press Help Mode above, which will describe what each button will do when pressed. To exit help mode, press it again. Good luck. Run fast. This is not a game.`,

  locateModalText: `Your opponent is looking for you. Go to 'Find My Opponent'`,
  newRoundTracer: `Your opponent started a new round. You are the Tracer.`,
  newRoundTraitor: `Your friend started a new round. You are the Traitor.`,

};

export default strings;
