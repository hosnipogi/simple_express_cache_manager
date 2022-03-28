import axios from "axios";
import dummyContent from "./dummyContent";

const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_DATABASE}/site-content?api_key=${process.env.AIRTABLE_API_KEY}`;

const controller = new AbortController();

const fetchGamesData = async () => {
  try {
    const {
      data: { records },
    } = await axios.get(url, {
      signal: controller.signal,
    });

    const allGames = records.map(({ fields }: any) => ({
      ...fields,
      logo: fields.logo[0].url,
    }));

    return allGames;
  } catch (e) {
    console.error(e);
    return dummyContent;
  }
};

export default fetchGamesData;
