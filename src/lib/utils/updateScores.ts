import ScoresProvider from "../ScoresProvider";
import { cache } from "../../index";
import { KEY, GamesConfig, FortCakeScoresType } from "../types";

const TTL_SCORES = parseInt(process.env.TTL_SCORES!);
const TTL_GAMES = parseInt(process.env.TTL!);

export default async function () {
  const currentTime = new Date().getTime();
  const { value: cgames, lastUpdate: gamesLastUpdate } = cache.getKey(
    KEY.GAMES
  );
  const cachedGames = cgames as GamesConfig[];
  const cachedScores = cache.getKey(KEY.SCORES);

  if (cachedScores.value.length) {
    if (currentTime - cachedScores.lastUpdate < TTL_SCORES) {
      if (currentTime - gamesLastUpdate < TTL_GAMES) {
        const updatedScores = replaceScores(
          cachedGames,
          cachedScores.value as FortCakeScoresType[]
        );
        cache.setKey(KEY.GAMES, updatedScores);
      }
      return;
    }
  }

  const computedScores = await ScoresProvider(cache);
  cache.setKey(KEY.SCORES, computedScores);

  const updatedScores = replaceScores(cachedGames, computedScores);

  cache.setKey(KEY.GAMES, updatedScores);
  return;
}

function replaceScores(
  tokens: GamesConfig[],
  cachedScores: FortCakeScoresType[]
) {
  return tokens.map((token) => {
    const found = cachedScores.find(({ symbol }) => symbol === token.symbol)!;
    token.votes = found.score;
    return token;
  });
}
