import axios from 'axios';
import dotenv from 'dotenv';
import { ChannelInformation, ExtendedChannelInformation, TwitchData } from '@/types';
import { setupAutoRefreshing } from '@/auth';

dotenv.config();

// setup axios defaults
axios.defaults.baseURL = 'https://api.twitch.tv/helix';
axios.defaults.headers.common['Client-ID'] = process.env.CLIENTID;

// TODO: remove, backwards compatibility.
if (process.env.AUTH_TOKEN) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.AUTH_TOKEN}`;
}

axios.defaults.headers.common['Content-Type'] = 'application/json';

let esaGameId = '';
let bsgGameId = '';

let isBsgLive = false;

let esaTitle = '';
let bsgTitle = '';

const esaChannelID = '54739364'; //giving channel (esamarathon)
const bsgChannelID = '91097747'; //receiving channels (duncte123)

const interval = parseInt(process.env.INTERVAL || '2', 10);
let timer: NodeJS.Timer;

async function logic() {
  try {
    await fetchGameInfo();

    if (esaGameId !== bsgGameId) {
      await setGame();

      if (isBsgLive) {
        await startAd();
      }
    } else {
      console.log('No update');
    }
  } catch (e) {
    console.log('Error during update, timer will be stopped', e);
    clearInterval(timer);
  }
}

async function fetchGameInfo(): Promise<void> {
  const { data: json } = await axios.get<TwitchData<ChannelInformation>>(
    `/channels?broadcaster_id=${esaChannelID}&broadcaster_id=${bsgChannelID}`
  );

  console.log(json);// can we guarantee the order of these?
  const esaData = json.data.find((x) => x.broadcaster_id === esaChannelID)!;

  esaGameId = esaData.game_id;
  esaTitle = esaData.title;

  console.log(`ESA Game saved: ${esaGameId} ${esaData.game_name}`);

  const bsgData = json.data.find((x) => x.broadcaster_id === bsgChannelID)!;

  bsgGameId = bsgData.game_id;
  bsgTitle = bsgData.title;
  console.log(`BSG Game saved: ${bsgGameId} ${bsgData.game_name}`);

  await fetchBsgLiveStatus(bsgData.broadcaster_login);
}

async function fetchBsgLiveStatus(channelLogin: string): Promise<void> {
  // https://api.twitch.tv/helix/search/channels?query=channelLogin

  const { data } = await axios.get<TwitchData<ExtendedChannelInformation>>(
    `/search/channels?query=${channelLogin}`
  );

  isBsgLive = data.data[0].is_live;
}

async function setGame(): Promise<void> {
  await axios.patch(`/channels?broadcaster_id=${bsgChannelID}`, {
    game_id: esaGameId,
    title: esaTitle,
  });
}

async function startAd(): Promise<void> {
  const { data } = await axios.post(`/channels/commercial`, {
    broadcaster_id: bsgChannelID,
    length: 180, // seconds
  });

  console.log(data);
}

setupAutoRefreshing().then(() => {
  logic();
  timer = setInterval(() => logic(), interval * 60 * 1000);
});
