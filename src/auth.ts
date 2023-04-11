import axios from 'axios';
import { TokenResponse } from './types';
import { promises as fs } from 'node:fs';

let isLocalToken = false;
const tokenPath = '/copycat-data/token.json';
const localTokenPath = `${process.cwd()}/token.json`;

export async function setupAutoRefreshing(): Promise<void> {
  const refreshToken = async () => {
    try {
      const expiresIn = await refreshAccessToken();

      if (expiresIn === -1) {
        return;
      }

      // minus 10 seconds to make sure we always have a non expired token
      setTimeout(refreshToken, (expiresIn - 10) * 1000);
    } catch(e: any) {
      console.error('Failed to refresh token, trying again', e);
      refreshToken().catch(console.error); // should never happen
    }
  };

  await refreshToken();
}

// TODO: auto refresh token
async function refreshAccessToken(): Promise<number> {
  const tokenData = await getTokenData();

  if (!tokenData) {
    // TODO: show error, exit program
    return -1;
  }

  const params = new URLSearchParams();

  params.append('client_id', process.env.CLIENTID);
  params.append('client_secret', process.env.CLIENTSECRET);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', tokenData.refresh_token);

  const { data } = await axios.post<TokenResponse>('https://id.twitch.tv/oauth2/token', params, {
    headers: {
      // Clear headers just in case.
      'Client-ID': null,
      'Authorization': null,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  console.log(data);

  axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

  await saveToken(data);

  return data.expires_in;
}

async function getTokenData(): Promise<TokenResponse | null> {
  const stat = await fs.stat(tokenPath);

  if (stat.isFile()) {
    return JSON.parse(await fs.readFile(tokenPath, 'utf8'));
  }

  const localStat = await fs.stat(localTokenPath);

  if (localStat.isFile()) {
    isLocalToken = true;
    return JSON.parse(await fs.readFile(localTokenPath, 'utf8'));
  }

  return null;
}

async function saveToken(token: TokenResponse) {
  if (isLocalToken) {
    await fs.writeFile(localTokenPath, JSON.stringify(token), 'utf8');
  }

  await fs.writeFile(tokenPath, JSON.stringify(token), 'utf8');
}
