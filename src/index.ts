import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import CacheManager from "./lib/CacheManager";
import DefaultCacheProvider, { KEY } from "./lib/CacheProvider";

dotenv.config();

import fetchGames from "./lib/fetchGames";

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const PORT = parseInt(process.env.PORT!);
const TTL = parseInt(process.env.TTL!); // milliseconds
const cache = new CacheManager(DefaultCacheProvider);
const app = express();

app.use(limiter);

app.get("/*", async (_, res) => {
  const currentTime = new Date().getTime();
  const cachedContent = cache.getKey(KEY);

  if (Object.keys(cachedContent.value).length) {
    if (currentTime - cachedContent.lastUpdate < TTL) {
      return res.send(cachedContent.value);
    }
  }

  const games = await fetchGames();
  cache.setKey(KEY, games);

  return res.send(cache.getKey(KEY).value);
});

app.listen(PORT, () => {
  console.log(
    "Listening on port: %d, TTL: %d, at time: %d",
    PORT,
    TTL,
    new Date().getTime()
  );
});
