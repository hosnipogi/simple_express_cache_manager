import { addToSendgridMailingList } from "./lib/SendGrid";
import { FetchAndUpdateGames } from "./lib/utils/index";
import { KEY } from "./lib/types";
import { RATELIMIT, CORSOPTIONS } from "./config";
import CacheManager from "./lib/CacheManager";
import CacheProvider from "./lib/CacheProvider";
import cors from "cors";
import CronJobs from "./lib/CronJobs";
import express from "express";
import rateLimit from "express-rate-limit";
export const cache = new CacheManager(CacheProvider);

const PORT = parseInt(process.env.PORT!);
const TTL = parseInt(process.env.TTL!); // milliseconds

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

  if (cachedGames.value.length) {
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

  try {
    const promises = [addToSendgridMailingList([{ email }])];
    const result = await Promise.all(promises);

    console.info(
      `Added email: ${email} to mail list at ${new Date().getTime()}`
    );

    return res.json({ success: true, result });
  } catch (e) {
    console.log(`${new Date().getTime().toFixed(0).substr(-4)}: `, { e });
    return res.status(400).json({ success: false });
  }
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
