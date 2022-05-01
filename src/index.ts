import express from "express";
import { RATELIMIT, CORSOPTIONS } from "./config";
import rateLimit from "express-rate-limit";
import cors from "cors";
import CacheManager from "./lib/CacheManager";
import CacheProvider from "./lib/CacheProvider";
import { KEY } from "./lib/types";
import CronJobs from "./lib/CronJobs";
import { FetchAndUpdateGames } from "./lib/utils/index";
import KlaviyoApi from "./lib/KlaviyoApi";
export const cache = new CacheManager(CacheProvider);

const PORT = parseInt(process.env.PORT!);
const TTL = parseInt(process.env.TTL!); // milliseconds

const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID!;
const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY!;

const app = express();

app.use(cors(CORSOPTIONS));
app.use(rateLimit(RATELIMIT));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/scores", (_, res) => {
  const cachedScores = cache.getKey(KEY.SCORES);
  return res.send(cachedScores);
});

app.get("/games", async (_, res) => {
  const currentTime = new Date().getTime();
  const cachedGames = cache.getKey(KEY.GAMES);

  if (Object.keys(cachedGames.value).length) {
    if (currentTime - cachedGames.lastUpdate < TTL) {
      return res.send(cachedGames.value);
    }
  }

  const games = await FetchAndUpdateGames();

  return res.send(games);
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

app.listen(PORT, async () => {
  console.log(
    "Listening on port: %d, TTL: %d, at time: %d",
    PORT,
    TTL,
    new Date().getTime()
  );
  await FetchAndUpdateGames();
  CronJobs();
});
