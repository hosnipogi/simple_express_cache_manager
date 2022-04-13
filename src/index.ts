import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import CacheManager from "./lib/CacheManager";
import DefaultCacheProvider, { KEY } from "./lib/CacheProvider";

dotenv.config();

import fetchGames from "./lib/fetchGames";
import KlaviyoApi from "./lib/KlaviyoApi";

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const PORT = parseInt(process.env.PORT!);
const TTL = parseInt(process.env.TTL!); // milliseconds
const cache = new CacheManager(DefaultCacheProvider);

const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID!;
const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY!;

const app = express();

const corsOptions = {
  origin: [
    "https://fortcake.io",
    "https://www.fortcake.io",
    "https://development.fortcake.io",
    "https://feature.fortcake.io",
  ],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/games", async (_, res) => {
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

app.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.send("error");
  const klaviyo = new KlaviyoApi(KLAVIYO_PRIVATE_KEY);

  const response = await klaviyo.SubscribeUser({
    email,
    listId: KLAVIYO_LIST_ID,
  });

  console.info({ newUser: { ...response, time: new Date().getTime() } });

  return res.send(response);
});

app.listen(PORT, () => {
  console.log(
    "Listening on port: %d, TTL: %d, at time: %d",
    PORT,
    TTL,
    new Date().getTime()
  );
});
