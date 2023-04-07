export interface TwitchData<T> {
  data: T[];
}

export interface ChannelInformation {
  broadcaster_id: string;
  game_name: string;
  game_id: string;
  title: string;
}
