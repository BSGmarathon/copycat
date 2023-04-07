import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { ChannelInformation, TwitchData } from '@/types/twitch';

dotenv.config();

let esaGameId = '';
let bsgGameId = '';

let esaTitle = '';
let bsgTitle = '';

let esaChannelID = '54739364'; //giving channel (esamarathon)
let bsgChannelID = '91097747'; //receiving channels (duncte123)

async function fetchGameInfo(): Promise<void> {
  const response = await fetch(
    `https://api.twitch.tv/helix/channels?broadcaster_id=${esaChannelID}&broadcaster_id=${bsgChannelID}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.BUNDLEAUTH}`,
        'Client-Id': process.env.CLIENTID!,
      },
    }
  );

  const json = await response.json() as TwitchData<ChannelInformation>;

  console.log(json);// can we guarantee the order of these?
  const esaData = json.data.find((x) => x.broadcaster_id === esaChannelID)!;

  esaGameId = esaData.game_id;
  esaTitle = esaData.title;

  console.log(`ESA Game saved: ${esaGameId} ${esaData.game_name}`);

  const bsgData = json.data.find((x) => x.broadcaster_id === bsgChannelID)!;

  bsgGameId = bsgData.game_id;
  bsgTitle = bsgData.title;
  console.log(`BSG Game saved: ${bsgGameId} ${bsgData.game_name}`);
}

async function setGame(): Promise<void> {
  await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${bsgChannelID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.BUNDLEAUTH}`,
      'Client-Id': process.env.CLIENTID!,
    },
    body: JSON.stringify({
      game_id: esaGameId,
      title: esaTitle,
    }),
  })
}

async function startAd(): Promise<void> {
  const response = await fetch('https://api.twitch.tv/helix/channels/commercial', {
    method: 'POST',
    headers: {
      'Client-ID': process.env.CLIENTID!,
      'Authorization': `Bearer ${process.env.BUNDLEAUTH}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      broadcaster_id: bsgChannelID,
      length: 180, // seconds
    })
  });

  const json = await response.json();

  console.log(json);
}
