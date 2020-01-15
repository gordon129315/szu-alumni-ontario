const express = require("express");
const Admin = require("../models/admin");
const router = express.Router();
const { auth,hasToken } = require('../middleware/auth')


router.get("/", (req, res) => {
    res.render("sign-in");
});

// create Admin
router.post("/", async (req, res) => {
    const admin = new Admin(req.body);

    try {
        await admin.save();
        res.status(201).send(admin);
    } catch (e) {
        res.status(400).send(e);
    }
});

//login
router.post("/login", async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(
            req.body.account,
            req.body.password
        );

        const token = admin.generateAuthToken();
        res.cookie("x-auth-token", token, {
            maxAge: 86400000,
            httpOnly: true
        });
        res.send({ admin, token });
    } catch (e) {
        res.status(400).send({ err: e.message });
    }
});

router.get('/get/all/admin', auth, async (req, res) => {
    if (!req.token) {
        return res.status(400).redirect('/');
    }

    try{
        const all = await Admin.find();
        res.send(all);
    }
    catch(e) {
        res.status(500).send(e);
    }
})

router.get('/get/token', auth, hasToken, async (req, res) => {
    res.send({token: req.token})
})

router.get('/logout', auth, hasToken, async (req, res) => {
    res.clearCookie("x-auth-token");
    res.redirect("/");
})
module.exports = router;
