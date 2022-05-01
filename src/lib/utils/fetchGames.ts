import axios from "axios";
import dummyContent from "../dummyContent";
import { GamesConfig } from "../types";
import { airTableApi } from "../../config";

const controller = new AbortController();

type AirTableResponse = {
  records: {
    id: string;
    createdTime: string;
    fields: GamesConfig;
  }[];
};

const fetchGamesData = async () => {
  try {
    const {
      data: { records },
    } = await axios.get<AirTableResponse>(airTableApi, {
      signal: controller.signal,
    });

    const allGames: GamesConfig[] = records.map(({ fields }) => ({
      ...fields,
      logo: Array.isArray(fields.logo)
        ? fields.logo[0].url
        : "https://via.placeholder.com/150",
    }));

    return allGames;
  } catch (e) {
    // console.error(e);
    return dummyContent;
  }
};

export default fetchGamesData;
