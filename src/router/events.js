const express = require("express");
const router = express.Router();
const fs = require("../util/fileService");
const auth = require("../middleware/auth");
const path = require("path");

router.get("/", auth, (req, res) => {
    const events_list = fs.readFIleParse(
        path.join(__dirname, "../../data/events_list.json")
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

router.post("/", auth, (req, res) => {
    if (!req.token) {
        res.status(401).redirect("/events");
    }

    const data = req.body;
    data.id = "05";
    const dir_path = path.join(__dirname, `../../data/articles`);

    fs.createEventFile(data, dir_path);

    res.send(data);
});

router.get("/create", auth, (req, res) => {
    if (!req.token) {
        res.status(401).redirect("/events");
    }
    res.render("create-event");
});

router.get("/:title", auth, (req, res) => {
    const article_title = req.params.title.trim();
    const file_path = path.join(
        __dirname,
        `../../data/articles/${article_title}.txt`
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

module.exports = router;
