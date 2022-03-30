import axios, { AxiosRequestConfig } from "axios";

class KlaviyoApi {
  private privateKey: string;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
  }

  public SubscribeUser = async ({
    email,
    listId,
  }: {
    email: string;
    listId: string;
  }) => {
    try {
      if (typeof email !== "string") throw "type error";

      const options = {
        method: "POST",
        url: `https://a.klaviyo.com/api/v2/list/${listId}/members?api_key=${this.privateKey}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: {
          profiles: [{ email }],
        },
      };

      const { data } = await axios.request(options as AxiosRequestConfig);
      return data;
    } catch (e) {
      console.error(e);
      return e;
    }
  };
}

export default KlaviyoApi;
