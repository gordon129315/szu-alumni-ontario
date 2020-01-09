const path = require("path");
const express = require("express");
const hbs = require("hbs");
const fs = require("./util/fileService");
const admin = require("./router/admin");
const events = require("./router/events");
const cookieParser = require("cookie-parser");
require("./db/mongoose");

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
hbs.registerHelper("breaklines", function(text) {
    // text = hbs.Utils.escapeExpression(text);
    text =
        "<p>" +
        text
            .replace(/^(\r\n|\n|\r)/gm, "&nbsp;\n")
            .replace(/ /g, "&nbsp;&nbsp;")
            .replace(/(\r\n|\n|\r).*?/gm, "</p><p>") +
        "</p>";

    // 匹配 <p><img src="url"></p> 中的 "url"
    text = text.replace(
        /(\<p\>)(?:(?!\1).)*?\<img\ssrc\=(\".+?\")\>.*?\<\/p\>/g,
        '<p class="text-center"><img src=$2 class="my-3 w-75"></p>'
    );

    // text.match(/(\<p\>)(?:(?!\1).)*?\<img\ssrc\=(\".+?\")\>.*?\<\/p\>/g)

    return new hbs.SafeString(text);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

// router
app.use("/admin", admin);
app.use("/events", events);

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

app.get("/downloads", (req, res) => {
    let files = [];
    const dir = path.join(__dirname, "../public/files");
    fs.walkDir(dir, dir, files);
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
