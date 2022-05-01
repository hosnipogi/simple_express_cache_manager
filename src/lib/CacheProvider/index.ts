import { KEY, GamesListType } from "../types";

const CacheProvider: GamesListType = {
  [KEY.GAMES]: {
    value: [],
    lastUpdate: new Date().getTime(),
  },
  [KEY.SCORES]: {
    value: [],
    lastUpdate: new Date().getTime(),
  },
};

export default CacheProvider;
