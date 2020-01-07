const path = require("path");
const express = require("express");
const hbs = require("hbs");
const auth = require("./middleware/auth");
const fs = require("./util/fileService");
const us = require("./util/UserService");
const cookieParser = require("cookie-parser");
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
hbs.registerHelper("breaklines", function(text) {
    // text = hbs.Utils.escapeExpression(text);
    text =
        "<p>" +
        text
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

app.get("/events", auth, (req, res) => {
    const events_list = fs.readFIleParse(
        path.join(__dirname, "../data/events_list.json")
    );

    const history_events = [];
    const future_events = [];
    const today = new Date();

    events_list.forEach((event) => {
        const event_date = new Date(event.event_date.replace("-", "/"));
        if (event_date > today) {
            future_events.push(event);
        } else {
            history_events.push(event);
        }
    });

    const compare = (a, b) => {
        let a_e_date = new Date(a.event_date.replace("-", "/"));
        let b_e_date = new Date(b.event_date.replace("-", "/"));
        return a_e_date < b_e_date;
    };

    history_events.sort((l1, l2) => {
        return compare(l1, l2); //降序
    });

    future_events.sort((l1, l2) => {
        return compare(l2, l1); //升序
    });

    const login = req.token ? true : false;

    res.render("events", { login, history_events, future_events });
});

app.get("/events/:title", auth, (req, res) => {
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

    article.login = req.token ? true : false;

    res.render("event-page", article);
});

app.get("/admin", (req, res) => {
    res.render("sign-in");
});

app.post("/login", (req, res) => {
    // console.log(req.body);
    const account = "szuonadmin";
    if (req.body.account !== account) {
        return res.status(401).send({ err: "Invalid Account ID!" });
    }

    const check = us.verifyPassword(req.body.password);
    if (!check) {
        return res.status(401).send({ err: "Invalid Password!" });
    }

    const token = us.generateToken(account);
    res.cookie("x-auth-token", token, {
        maxAge: 86400000,
        httpOnly: true
    });

    res.send({});
});

// must put at last one
app.get("*", (req, res) => {
    res.status(404).render("404");
});

app.listen(port, () => {
    console.log("Server is up on port " + port);
});
