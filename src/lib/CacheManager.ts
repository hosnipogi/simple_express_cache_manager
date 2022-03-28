import { KEY, GamesListType, GamesConfig } from "./CacheProvider";

class CacheManager {
  private obj: GamesListType;

  constructor(provider: GamesListType) {
    this.obj = provider;
  }

  public setKey = (key: typeof KEY, val: GamesConfig): void => {
    this.obj[key] = {
      value: val,
      lastUpdate: new Date().getTime(),
    };
  };

  public getKey = (key: typeof KEY): GamesListType[typeof KEY] => {
    return this.obj[key];
  };
}

export default CacheManager;
