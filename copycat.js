// require('dotenv').config();
//Scopes channel_editor channel:manage:broadcast channel:edit:commercial
import dotenv from "dotenv";
dotenv.config({
  silent: process.env.NODE_ENV === 'production'
});
import fetch from 'node-fetch';
var esaGameId = "";
var bsgGameId = "";
var esaGame = "";
var esaTitle = "";
var bsgTitle = "";
var interval = process.env.INTERVAL; //in minutes
var readerChannelID = process.env.READERID; //giving channel, ESA
// var readerChannelID = '277226652' //McRaeathon
var targetChannelID = process.env.TARGETID; //receiving channels, BSG

logic();
setInterval(function() {
  logic();
}, interval * 60 * 1000);


function logic() {
  getGame();
  // startAd();               //Debug only no touch
  setTimeout(function() {
    if (esaGameId !== bsgGameId) {
      setGame();
      startAd();
    } else {
      console.log("No update");
    }
  }, (2 * 1000));
}

function getGame() { //scope channel_editor
  fetch('https://api.twitch.tv/helix/channels?broadcaster_id=' + readerChannelID, {
      method: 'GET',
      headers: {
        // 'Authorization': 'Bearer ' + process.env.LOOKUP_AUTH,
        'Authorization': 'Bearer ' + process.env.BUNDLEAUTH,
        'Client-Id': process.env.CLIENTID
      }
    })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      esaGame = res.data[0].game_name;
      esaGameId = res.data[0].game_id;
      esaTitle = res.data[0].title;
      console.log("ESA Game saved: " + esaGameId + " " + res.data[0].game_name);
    });

  fetch('https://api.twitch.tv/helix/channels?broadcaster_id=' + targetChannelID, {
      method: 'GET',
      headers: {
        // 'Authorization': 'Bearer ' + process.env.LOOKUP_AUTH,
        'Authorization': 'Bearer ' + process.env.BUNDLEAUTH,
        'Client-Id': process.env.CLIENTID
      }
    })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      bsgGameId = res.data[0].game_id;
      bsgTitle = res.data[0].title;
      console.log("BSG Game saved: " + bsgGameId + ' ' + res.data[0].game_name);
    });
}

function setGame() {
  postRequest('https://api.twitch.tv/helix/channels?broadcaster_id=' + targetChannelID)
    .then(data => console.log(""))
    // .catch(error => console.error(error))
    .catch(error => console.error())

  function postRequest(url, data) {
    return fetch(url, {
        method: 'PATCH', // 'GET', 'PUT', 'DELETE', etc.
        body: '{"game_id": "' + esaGameId + '", "title": "' + esaTitle + '"}', // Coordinate the body type with 'Content-Type'
        headers: {
          'Client-ID': process.env.CLIENTID,
          'Authorization': 'Bearer ' + process.env.BUNDLEAUTH,
          // 'Authorization': 'Bearer ' + process.env.POSTAUTH, //scope channel:manage:broadcast
          // 'Accept': 'application/vnd.twitchtv.v5+json',
          'Content-Type': 'application/json'
        },
      })
      .then(response => response.json())
  }
  console.log("UPDATE: Changed BSG game to " + esaGameId + ' ' + esaGame);
}

function startAd() {
  postRequest('https://api.twitch.tv/helix/channels/commercial')
    .then(data => console.log(""))
    .catch(error => console.error(error))
  console.log('Sent commercial of 180 seconds');

  function postRequest(url, data) {
    return fetch(url, {
        method: 'POST', // 'GET', 'PUT', 'DELETE', etc.
        body: '{"broadcaster_id": ' + targetChannelID + ', "length": 180}', // Coordinate the body type with 'Content-Type'
        headers: {
          'Client-ID': process.env.CLIENTID,
          // 'Authorization': 'Bearer ' + process.env.ADAUTH, //scope channel:edit:commercial
          'Authorization': 'Bearer ' + process.env.BUNDLEAUTH,
          // 'Accept': 'application/vnd.twitchtv.v5+json',
          'Content-Type': 'application/json'
        },
      })
      .then(response => response.json())
      .then(res => {
        console.log(res)
      });
  }
}
