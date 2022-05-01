export enum CRONSCHEDULE {
  EVERYMINUTE = `* * * * *`,
  EVERYFIFTHMINUTE = `*/5 * * * *`,
  EVERYTHIRTYMINUTES = `*/30 * * * *`,
  EVERYDAY = `0 1 * * *`, // everyday at 1am
}

export enum KEY {
  GAMES = "GAMELIST",
  SCORES = "SCORES",
}

export interface GamesConfig {
  title: string;
  subtitle: string;
  logo: { [logoFields: string]: string }[] | string;
  cta: string;
  symbol: string;
  votes: number;
  chain: string;
  address: string;
}

export enum ScoreCategories {
  COINGECKO = "coingecko_score",
  COMMUNITY = "community_score",
  LIQUIDITY = "liquidity_score",
}

export type CoinGeckoApiResponseType = {
  symbol: string;
  [ScoreCategories.COINGECKO]: number;
  [ScoreCategories.COMMUNITY]: number;
  [ScoreCategories.LIQUIDITY]: number;
};

export type FortCakeScoresType = {
  symbol: string;
  score: number;
};

export type GamesListType = {
  -readonly [p in KEY]: {
    value: GamesConfig[] | FortCakeScoresType[];
    lastUpdate: number;
  };
};
