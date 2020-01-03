const path = require("path");
const express = require("express");
const hbs = require("hbs");
const fs = require("../src/util/fileService");
const bcrypt = require("bcryptjs");

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
    text = hbs.Utils.escapeExpression(text);
    text =
        "<p>" +
        text
            .replace(/  /g, "&nbsp;&nbsp;&nbsp;&nbsp;")
            .replace(/(\r\n|\n|\r).*?/gm, "</p><p>") +
        "</p>";
    // console.log(text);
    
    return new hbs.SafeString(text);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    const history_events = fs.readFIleParse(
        path.join(__dirname, "../data/history_events.json")
    );
    const future_events = fs.readFIleParse(
        path.join(__dirname, "../data/future_events.json")
    );
    res.render("events", { history_events, future_events });
});

app.get("/events/:title", (req, res) => {
    const article_title = req.params.title.trim();
    const file_path = path.join(
        __dirname,
        `../data/articles/${article_title}.txt`
    );
    let article;
    if (fs.isExist(file_path)) {
        article = fs.getArticle(file_path);
    } else {
        article = fs.getEmptyArticle();
    }

    res.render("event-page", article);
});

app.get("/admin", (req, res) => {
    res.render("sign-in");
});

app.post("/login", (req, res) => {
    // console.log(req.body);
    const password = req.body.password;
    const hash = "$2a$08$Caxky4yejXrUup1fzJ8UceV.nTgvO47g/XahByeadzCrXV2embEOC"; // szuon2019#
    const check = bcrypt.compareSync(password, hash);
    // console.log(check);

    res.send({ check });
});

// must put at last one
app.get("*", (req, res) => {
    res.render("404");
});

app.listen(port, () => {
    console.log("Server is up on port " + port);
});
