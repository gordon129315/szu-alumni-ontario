const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const fileService = require("../util/fileService");
const { auth, hasToken } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        if (file.fieldname === "pdf") {
            const pdf_dir = path.join(__dirname, "../../public/files/events");
            if (!fs.existsSync(pdf_dir)) {
                fs.mkdirSync(pdf_dir);
            }
            callback(null, pdf_dir);
        } else if (file.fieldname === "photo") {
            const img_dir = path.join(__dirname, "../../public/img/events");
            if (!fs.existsSync(img_dir)) {
                fs.mkdirSync(img_dir);
            }
            callback(null, img_dir);
        } else {
            return callback(new Error("no this field name"));
        }
    },
    filename: function(req, file, callback) {
        const filename = [
            Date.now(),
            req.body.title.replace(/ /g, "+"),
            file.originalname.trim().replace(/ /g, "+")
        ].join("_");
        callback(null, filename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (file.fieldname === "pdf") {
            if (!file.originalname.match(/\.pdf$/)) {
                return callback(new Error("Please upload a legal file"));
            }
        } else if (file.fieldname === "photo") {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return callback(new Error("Please upload a legal file"));
            }
        } else {
            return callback(new Error("no this field name"));
        }
        callback(undefined, true);
    }
});

// 新建活动
router.post(
    "/",
    auth,
    hasToken,
    upload.fields([
        { name: "photo", maxCount: 20 },
        { name: "pdf", maxCount: 1 }
    ]),
    async (req, res) => {
        let event = req.body;

        try {
            if (req.files.pdf) {
                event.pdf = "/files/events/" + req.files.pdf[0].filename;
            }
            event.create_date = new Date(event.create_date.replace(/\-/g, "/"));
            event.event_date = new Date(event.event_date.replace(/\-/g, "/"));
            event = new Event(event);
            await event.save();
            res.status(201).send(event);
        } catch (e) {
            res.status(400).send({ err: e.message });
        }
    }
);

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
        event = fileService.getEmptyEvent();
        res.status(404).render("event-page", event);
    }
});

router.delete("/:id", auth, hasToken, async (req, res) => {
    try {
        const event_id = req.params.id.trim();
        const event = await Event.findById(event_id);
        if (event.pdf) {
            const pdf_path = path.join(__dirname, "../../public", event.pdf);
            if (fs.existsSync(pdf_path)) {
                fileService.deleteFile(pdf_path);
            }
        }
        await event.remove();
        res.send({});
    } catch (e) {
        res.status(500).send({ err: e.message });
    }
});

module.exports = router;
