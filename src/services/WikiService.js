import axios from "axios";

class WikiService {
  constructor() {
    this.baseUrl = "https://en.wikipedia.org/w/api.php";
  }

  async getFromWiki(latlng, lang = "en", gsradius = 1000) {
    const params = {
      action: "query",
      list: "geosearch",
      gscoord: `${latlng.lat}|${latlng.lng}`,
      gsradius: gsradius,
      gslimit: 10,
      format: "json",
      origin: "*",
    };

    const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
    return await axios.get(url);
  }

  async getDataOnLocations(title, lang = "en") {
    const params = {
      action: "query",
      prop: "extracts|pageimages|info",
      exintro: true,
      explaintext: true,
      inprop: "url",
      pithumbsize: 400,
      titles: title,
      format: "json",
      origin: "*",
    };

    const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
    return await axios.get(url);
  }
}

export default new WikiService();
