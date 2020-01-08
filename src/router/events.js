const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const fs = require("../util/fileService");
const auth = require("../middleware/auth");
const path = require("path");

// 获取所有文章
router.get("/", auth, async (req, res) => {
    try {
        let history_events = await Event.find({
            event_date: { $lte: new Date() }
        }).sort({ event_date: -1 });
        history_events = history_events.map((event) => {
            return event.toJSON();
        });
        let future_events = await Event.find({
            event_date: { $gt: new Date() }
        }).sort({ event_date: 1 });
        future_events = future_events.map((event) => {
            return event.toJSON();
        });
        const login = req.token ? true : false;
        res.render("events", { login, history_events, future_events });
    } catch (e) {
        res.status(500).redirect("/");
    }
});

// 新建活动
router.post("/", auth, async (req, res) => {
    if (!req.token) {
        res.status(401).redirect("/events");
    }

    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).send(event);
    } catch (e) {
        res.status(400).send({ err: e });
    }
});

router.get("/create", auth, (req, res) => {
    if (!req.token) {
        res.status(401).redirect("/events");
    }
    res.render("create-event");
});

// 获取某篇文章
router.get("/:id", auth, async (req, res) => {
    const article_id = req.params.id.trim();
    let article;
    try {
        article = await Event.findById(article_id);
        article = article.toJSON();

        article.login = req.token ? true : false;
    } catch (e) {
        article = fs.getEmptyArticle();
        console.log(e);
    }

    res.render("event-page", article);
});

module.exports = router;
