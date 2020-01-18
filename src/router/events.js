const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const fileService = require("../util/fileService");
const { auth, hasToken } = require("../middleware/auth");
const { upload } = require("../util/multer");
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

// 打开“发布活动”页面
router.get("/create", auth, hasToken, (req, res) => {
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

// 上传图片
router.post(
    "/uploadImg",
    auth,
    hasToken,
    upload.array("photos", 50),
    async (req, res) => {
        let photos;
        try {
            if (req.files) {
                photos = req.files.map((photo) => {
                    return "/img/events/" + photo.filename;
                });
            }
            res.status(201).send({ photos });
        } catch (e) {
            res.status(500).send({ err: e.message });
        }
    }
);

// 新建活动
router.post("/", auth, hasToken, upload.single("pdf"), async (req, res) => {
    let event = req.body;

    try {
        if (req.file) {
            event.pdf = "/files/events/" + req.file.filename;
        }
        event.create_date = new Date(event.create_date.replace(/\-/g, "/"));
        event.event_date = new Date(event.event_date.replace(/\-/g, "/"));
        event.photos = JSON.parse(event.photos);

        event = new Event(event);
        await event.save();
        // console.log(event);
        res.status(201).send(event);
    } catch (e) {
        res.status(500).send({ err: e.message });
    }
});

// 发文章时删除选中的图片
router.delete("/uploadImg", auth, hasToken, async (req, res) => {
    try {
        const url = req.body.url;
        if (!url || typeof(url) !== 'string') {
            throw new Error('无效的url')
        }
        const photo_path = path.join(__dirname, "../../public", url);
        if (fs.existsSync(photo_path)) {
            fileService.deleteFile(photo_path);
        }
        res.send({ msg: "Deleted" });
    } catch (e) {
        res.status(500).send({ err: e.message });
    }
});

// 删除多余的图片
router.delete("/cache/photos", auth, hasToken, async (req, res) => {
    const event_photo_dir = path.join(__dirname, "../../public", "img/events");
    if (!fs.existsSync(event_photo_dir)) {
        return res.send({ msg: "dir not exist" });
    }
    const all_photos = [];
    fileService.walkDir(event_photo_dir, all_photos);

    if (all_photos.length == 0) {
        return res.send({ msg: "dir is empty" });
    }

    const all_photos_path = all_photos.map((photo) =>
        path.join("/img/events", photo.file_path)
    );

    try {
        const events = await Event.find();
        const exist_photos_path = [];
        events.forEach((event) => {
            event.photos.forEach((photo) => {
                exist_photos_path.push(path.join(photo.url));
            });
        });

        const redundant_photos_path = all_photos_path.filter(
            (path) => !exist_photos_path.includes(path)
        );

        redundant_photos_path.forEach((photo_path) => {
            const full_path = path.join(__dirname, "../../public", photo_path);
            if (fs.existsSync(full_path)) {
                fileService.deleteFile(full_path);
            }
        });

        res.send({ delete: redundant_photos_path });
    } catch (e) {
        res.status(500).send(e);
    }
});

// 删除文章
router.delete("/:id", auth, hasToken, async (req, res) => {
    try {
        const event_id = req.params.id.trim();
        const event = await Event.findById(event_id);
        if (!event) {
            throw new Error("找不此文章或此文章已被删除!");
        }
        if (event.pdf) {
            const pdf_path = path.join(__dirname, "../../public", event.pdf);
            if (fs.existsSync(pdf_path)) {
                fileService.deleteFile(pdf_path);
            }
        }
        if (event.photos) {
            event.photos.forEach((photo) => {
                const photo_path = path.join(
                    __dirname,
                    "../../public",
                    photo.url
                );
                if (fs.existsSync(photo_path)) {
                    fileService.deleteFile(photo_path);
                }
            });
        }
        await event.remove();
        res.send({});
    } catch (e) {
        res.status(500).send({ err: e.message });
    }
});

module.exports = router;
