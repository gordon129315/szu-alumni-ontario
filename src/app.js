const path = require("path");
const express = require("express");
const fs = require("fs");
const fileService = require("./util/fileService");
const admin = require("./router/admin");
const events = require("./router/events");
const cookieParser = require("cookie-parser");
const hbs = require("./util/handlebars");
const axios = require("axios");
require("./db/mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000; //PORT has to be in capital

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

// setup handlebars engine and views location
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

// router
app.use("/admin", admin);
app.use("/events", events);

app.get("", (req, res) => {
  const headline_news = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/headline-news.json"), "utf8")
  );
  headline_news.shift();
  res.render("index", { headline_news });
});

app.get("/about-us", (req, res) => {
  res.render("about-us");
});

app.get("/council", (req, res) => {
  const { council, update } = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/council.json"), "utf8")
  );
  res.render("council", { council, update });
});

app.get("/enterprise", (req, res) => {
  const enterprise_list = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/enterprise.json"), "utf8")
  );
  res.render("enterprise", { enterprise_list });
});

app.get("/sport-teams", (req, res) => {
  const sport_teams = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/sport-teams.json"), "utf8")
  );
  res.render("sport-teams", { sport_teams });
});

app.get("/covid", async (req, res) => {
  const fields = [
    "_id",
    "Reported Date",
    "Confirmed Positive",
    "Resolved",
    "Deaths",
    "Total Cases",
  ].join(",");
  const sort = "_id desc";
  const resource_id = "ed270bb8-340b-41f9-a7c6-e8ef587e6d11";
  const url =
    "https://data.ontario.ca/en/api/3/action/datastore_search?resource_id=" +
    resource_id +
    "&sort=" +
    sort +
    "&fields=" +
    fields +
    "&limit=101";

  try {
    const result = await axios.get(encodeURI(url));
    const data = result.data;
    if (data.success) {
      let records = data.result.records;
      const length = records.length;
      records = records.map((data, i) => {
        if (i < length - 1) {
          data.new_cases = data["Total Cases"] - records[i + 1]["Total Cases"];
        }
        data["Reported Date"] = data["Reported Date"].substring(0, 10);
        return data;
      });
      records.pop();
      //res.send({ records });
      res.render("covid", { records });
    } else {
      res.status(400).send(data.success);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.get("/downloads", (req, res) => {
  let files = [];
  const dir = path.join(__dirname, "../public/files/downloads");
  fileService.walkDir(dir, files);
  files = files
    .filter((f) => f.file_name.endsWith(".pdf"))
    .sort((f1, f2) => f1.create_time < f2.create_time);

  res.render("downloads", { files });
});

// must put at last one
app.get("*", (req, res) => {
  res.status(404).render("404");
});

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
