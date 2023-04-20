import dotenv from 'dotenv';

dotenv.config();

import Koa, { Context, Next } from 'koa';
import Router from '@koa/router';
import axios from 'axios';
import { TokenResponse } from './types';
import fs from 'fs';

const app = new Koa();
const router = new Router();

const localTokenPath = `${process.cwd()}/token.json`;


let generatedState = '';

router.get('/oauth/callback', async (ctx: Context, next: Next) => {
  if (!generatedState) {
    ctx.body = 'No state has been generated?';
    return next();
  }

  const { code, state, error } = ctx.request.query;

  if (error) {
    ctx.body = error;
    return next();
  }

  if (state !== generatedState) {
    console.log(state, generatedState);
    ctx.body = 'State is not the same';
    return next();
  }

  const formData = new URLSearchParams();

  formData.append('client_id', process.env.CLIENTID);
  formData.append('client_secret', process.env.CLIENTSECRET);
  formData.append('redirect_uri', 'http://localhost:3000/oauth/callback');
  formData.append('grant_type', 'authorization_code');
  formData.append('code', code as string);

  const response = await axios.post('https://id.twitch.tv/oauth2/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const data: TokenResponse = response.data;

  console.log(data);

  fs.writeFileSync(localTokenPath, JSON.stringify(data), { encoding: 'utf8' });

  console.log('============================================');
  console.log('');
  console.log('Token has been stored as token.json');
  console.log('');
  console.log('============================================');

  ctx.body = 'Token stored as token.json';
  ctx.exit = true;
  return next();
});

app.use(router.routes())
  .use(router.allowedMethods());

app.use(async (ctx, next) => {
  if (ctx.exit) {
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  }

  return next();
})

async function main():  Promise<void> {
  if (fs.existsSync(localTokenPath)) {
    console.log('Refresh token already exists, not instantiating again.');
    process.exit(0);
    return;
  }

  const params = new URLSearchParams();

  generatedState = randomString(15);

  params.append('response_type', 'code');
  params.append('client_id', process.env.CLIENTID);
  params.append('redirect_uri', 'http://localhost:3000/oauth/callback');
  params.append('scope', process.env.SCOPES);
  params.append('state', generatedState);

  console.log(`Please visit the following url: https://id.twitch.tv/oauth2/authorize?${params}`);
}

function randomString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;

  for(let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

main().catch(console.error);

app.listen(3000);
