import { FetchGames, UpdateScores } from "./index";
import { KEY } from "../types";
import { cache } from "../../index";
import updateScores from "./updateScores";

export default async function fetchAndUpdateGame() {
  const fetchedGames = await FetchGames();
  cache.setKey(KEY.GAMES, fetchedGames);
  await updateScores();

  return cache.getKey(KEY.GAMES).value;
}
