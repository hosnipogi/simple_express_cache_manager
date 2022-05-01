import dotenv from "dotenv";
import { ScoreCategories, CRONSCHEDULE } from "./lib/types";

dotenv.config();

// SERVER CONFIGS

export const RATELIMIT = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

export const CORSOPTIONS = {
  origin: [
    "https://fortcake.io",
    "https://www.fortcake.io",
    "https://development.fortcake.io",
    "https://feature.fortcake.io",
  ],
  optionsSuccessStatus: 200,
};

export { CRONSCHEDULE };

// ENDPOINTS

export const coingeckoapi =
  "https://api.coingecko.com/api/v3/coins/binance-smart-chain/contract/";

export const airTableApi = `https://api.airtable.com/v0/${process.env.AIRTABLE_DATABASE}/site-content?api_key=${process.env.AIRTABLE_API_KEY}&filterByFormula=%7Bchain%7D+%3D+'BNB'`;

// SCORE CALCULATION

export const SCORE_IMPACT = {
  [ScoreCategories.COINGECKO]: 0.3,
  [ScoreCategories.COMMUNITY]: 0.2,
  [ScoreCategories.LIQUIDITY]: 0.5,
};
