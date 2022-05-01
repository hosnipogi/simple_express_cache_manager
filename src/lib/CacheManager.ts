import { KEY, GamesListType, GamesConfig } from "./types";

export default class CacheManager {
  private obj: GamesListType;

  constructor(provider: GamesListType) {
    this.obj = provider;
  }

  public setKey = (key: KEY, val: GamesListType[KEY]["value"]): void => {
    this.obj[key] = {
      value: val,
      lastUpdate: new Date().getTime(),
    };
  };

  public getKey = (key: KEY): GamesListType[KEY] => {
    return this.obj[key];
  };
}
