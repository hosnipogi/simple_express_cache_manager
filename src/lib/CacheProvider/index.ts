export const KEY = "GAMELIST";
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

export type GamesListType = {
  [KEY]: {
    value: GamesConfig[];
    lastUpdate: number;
  };
};

const CacheProvider: GamesListType = {
  [KEY]: {
    value: [],
    lastUpdate: new Date().getTime(),
  },
};

export default CacheProvider;
