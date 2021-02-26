const axios = require("axios"),
  cheerio = require("cheerio"),
  express = require("express"),
  cors = require("cors"),
  app = express();

app.use(express.json());
app.use(cors());

//READ Request Handlers
app.get("/", (req, res) => {
  res.status(200).send({
    response: "OK",
    message: "Mandi Details API",
    "api-routes": {
      "all-details": "/api",
    },
  });
});

app.get("/api", async (req, res) => {
  mandiData = [];
  const mainURL = "https://www.commodityonline.com/mandiprices/";
  const urls = ["https://www.commodityonline.com/mandiprices/"];

  let axios_requests = [];
  axios_requests.push(axios.get(`${mainURL}`));

  for (let i = 1; i <= 10; ++i) {
    axios_requests.push(axios.get(`${mainURL}${36 * i}`));
  }

  Promise.all([...axios_requests])
    .then(function (results) {
      for (let i = 0; i < results.length; ++i) {
        console.log("hitted api: ", i);

        const result = results[i].data;
        let $ = cheerio.load(result);

        $("#tdm_base_scroll > div > div.dt_ta_09").each(function (i, elm) {
          let price = $("div.dt_ta_14", elm);
          let newObject = {
            commodity: $("div.dt_ta_10", elm).text().trim(),
            marketCenter: $("div.dt_ta_11", elm)
              .text()
              .trim()
              .replace("\n", ","),
            variety: $("div.dt_ta_12", elm).text().trim(),
            arrrivals: $("div.dt_ta_13", elm).text().trim(),
            modalPrice: $(price[0]).text().trim(),
            minMaxPrice: $(price[1]).text().trim().replace("\n", " "),
          };
          mandiData.push(newObject);
        });
      }

      console.log("end");
      res.status(200).send(mandiData);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send("error fetching");
    });
});

app.get("*", (req, res) => res.status(400).send("Wrong route use /api"));

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Running API Server on ${port}..`));
