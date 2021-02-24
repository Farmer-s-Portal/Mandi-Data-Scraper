const axios = require("axios"),
  cheerio = require("cheerio"),
  fs = require("fs"),
  json2csv = require("json2csv").Parser;

const mainURL = "https://www.commodityonline.com/mandiprices/";
const urls = ["https://www.commodityonline.com/mandiprices/"];
for (let i = 1; i <= 9; ++i) {
  urls.push(`${mainURL}${36 * i}`);
}

(async () => {
  mandiData = [];
  for (let url of urls) {
    console.log(url);
    const response = await axios.get(url);
    let $ = cheerio.load(response.data);

    $("#tdm_base_scroll > div > div.dt_ta_09").each(function (i, elm) {
      let price = $("div.dt_ta_14", elm);
      let newObject = {
        commodity: $("div.dt_ta_10", elm).text().trim(),
        marketCenter: $("div.dt_ta_11", elm).text().trim().replace("\n", " "),
        variety: $("div.dt_ta_12", elm).text().trim(),
        arrrivals: $("div.dt_ta_13", elm).text().trim(),
        modalPrice: $(price[0]).text().trim(),
        minMaxPrice: $(price[1]).text().trim().replace("\n", " "),
      };
      mandiData.push(newObject);
    });
  }
  // console.log(mandiData);
  const j2cp = new json2csv();
  const csv = j2cp.parse(mandiData);
  fs.writeFileSync("./mandi_data.csv", csv, "utf-8");
})();
