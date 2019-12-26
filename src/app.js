const path = require("path");
const express = require("express");
const hbs = require("hbs");
const md = require("markdown").markdown;
const fs = require("fs");

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

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

app.get("", (req, res) => {
    res.render("index");
});

app.get("/about-us", (req, res) => {
    res.render("about-us");
});

app.get("/members", (req, res) => {
    res.render("members");
});

app.get("/enterprise", (req, res) => {
    res.render("enterprise");
});

app.get("/sport-teams", (req, res) => {
    res.render("sport-teams");
});

app.get("/events", (req, res) => {
    res.render("events");
});

// must put at last one
app.get("*", (req, res) => {
    res.render("404");
});

app.listen(port, () => {
    console.log("Server is up on port " + port);
});
