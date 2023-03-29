import {
  KEY,
  GamesConfig,
  ScoreCategories,
  CoinGeckoApiResponseType,
  FortCakeScoresType,
} from "./types";
import { coingeckoapi, SCORE_IMPACT } from "../config";
import axios from "axios";
import CacheManager from "./CacheManager";

type PromiseTokensWithScoresType = ReturnType<
  typeof getCoinGeckoScoresFromCoinGeckoApi
>;
type UnwrappedTokensWithScoresType = Awaited<PromiseTokensWithScoresType>;

async function getCoinGeckoScoresFromCoinGeckoApi(token: GamesConfig) {
  const { address, symbol } = token;
  try {
    const { data } = await axios.get<CoinGeckoApiResponseType>(
      coingeckoapi + address
    );

    console.log(data.symbol);

    const {
      [ScoreCategories.COINGECKO]: score_coingecko,
      [ScoreCategories.COMMUNITY]: score_community,
      [ScoreCategories.LIQUIDITY]: score_liquidity,
    } = data;

    return {
      symbol,
      score_coingecko,
      score_community,
      score_liquidity,
    };
  } catch (e) {
    if (e instanceof Error) {
      console.info(e.message, "In Scores Provider");
    }
    return {
      symbol,
      score_coingecko: 0,
      score_community: 0,
      score_liquidity: 0,
    };
  }
}

function getHighestScoresForCategories(
  tokens: UnwrappedTokensWithScoresType[]
) {
  const mappedScoreGecko = tokens.map(({ score_coingecko }) => score_coingecko);
  const mappedScoreCommunity = tokens.map(
    ({ score_community }) => score_community
  );
  const mappedScoreLiquidity = tokens.map(
    ({ score_liquidity }) => score_liquidity
  );

  const highestScoreGecko = Math.max(...mappedScoreGecko);
  const highestScoreCommunity = Math.max(...mappedScoreCommunity);
  const highestScoreLiquidity = Math.max(...mappedScoreLiquidity);

  return { highestScoreGecko, highestScoreCommunity, highestScoreLiquidity };
}

function getTotalScoreForEachToken(
  tokens: UnwrappedTokensWithScoresType[],
  highestScores: ReturnType<typeof getHighestScoresForCategories>
) {
  const { highestScoreGecko, highestScoreCommunity, highestScoreLiquidity } =
    highestScores;

  const computedCategoryScores = tokens.map((token) => {
    return {
      symbol: token.symbol,
      [ScoreCategories.COINGECKO]:
        (token.score_coingecko / highestScoreGecko) *
        SCORE_IMPACT[ScoreCategories.COINGECKO],
      [ScoreCategories.COMMUNITY]:
        (token.score_community / highestScoreCommunity) *
        SCORE_IMPACT[ScoreCategories.COMMUNITY],
      [ScoreCategories.LIQUIDITY]:
        (token.score_liquidity / highestScoreLiquidity) *
        SCORE_IMPACT[ScoreCategories.LIQUIDITY],
    };
  });

  const tokensWithFinalScore = computedCategoryScores.map((token) => {
    const TOTAL_SCORE =
      (token[ScoreCategories.COINGECKO] +
        token[ScoreCategories.COMMUNITY] +
        token[ScoreCategories.LIQUIDITY]) *
      100;
    return {
      symbol: token.symbol,
      score: Math.round(TOTAL_SCORE * 100) / 100,
    };
  });

  return tokensWithFinalScore;
}

async function getTokensWithFortcakeScores(
  tokenArray: PromiseTokensWithScoresType[]
) {
  return Promise.all(tokenArray).then((tokens) => {
    const scoreReference = getHighestScoresForCategories(tokens);
    return getTotalScoreForEachToken(tokens, scoreReference);
  });
}

export default function (
  CacheManager: CacheManager
): Promise<FortCakeScoresType[]> {
  const tokens = CacheManager.getKey(KEY.GAMES).value;

  const tokensWithCoinGeckoScores = tokens.map((token: any, idx) =>
    delay(() => getCoinGeckoScoresFromCoinGeckoApi(token), 500 * idx)
  );

  return getTokensWithFortcakeScores(tokensWithCoinGeckoScores as any);
}

function delay<T>(cb: (arg?: T) => T, ms: number) {
  return new Promise((res) => {
    setTimeout(() => {
      res(cb());
    }, ms);
  });
}
