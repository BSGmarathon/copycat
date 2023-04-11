export interface TwitchData<T> {
  data: T[];
}

export interface ChannelInformation {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  game_name: string;
  game_id: string;
  title: string;
}

export interface ExtendedChannelInformation extends ChannelInformation{
  is_live: boolean;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
}
