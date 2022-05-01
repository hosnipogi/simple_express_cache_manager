import Cron from "node-cron";
import { UpdateScores } from "./utils/";
import { CRONSCHEDULE } from "../config";

export default function () {
  const task = Cron.schedule(CRONSCHEDULE.EVERYTHIRTYMINUTES, () => {
    UpdateScores();
  });

  task.start();
  console.info("Cron jobs running");
}
