const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const fs = require("../util/fileService");
const auth = require("../middleware/auth");

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
        return res.status(401).send({ err: "请登录" });
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
        return res.status(401).redirect("/events");
    }
    res.render("create-event");
});

// 获取某篇文章
router.get("/:id", auth, async (req, res) => {
    const event_id = req.params.id.trim();
    let event;
    try {
        event = await Event.findById(event_id);
        event = event.toJSON();

        event.login = req.token ? true : false;
        res.render("event-page", event);
    } catch (e) {
        event = fs.getEmptyEvent();
        res.status(404).render("event-page", event);
    }
});

router.delete("/:id", auth, async (req, res) => {
    if (!req.token) {
        return res.status(401).send({ err: "请登录" });
    }

    try {
        const event_id = req.params.id.trim();
        const event = await Event.findByIdAndDelete(event_id);
        res.send(event);
    } catch (e) {
        res.status(500).send({ err: e.message });
    }
});

module.exports = router;
