const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const auth = async (req, res, next) => {
    try {
        if (!req.cookies["x-auth-token"]) {
            return next();
        }

        const token = req.cookies["x-auth-token"];
        const decodedToken = jwt.verify(token, process.env.SECRETE_TOKEN);
        // console.log(decodedToken);

        const admin = await Admin.findById(decodedToken._id);

        if (!admin) {
            throw new Error("auth failed");
        }

        req.token = token;
        req.admin = admin;
    } catch (e) {
        console.log(e);
    }
    next();
};

module.exports = auth;
