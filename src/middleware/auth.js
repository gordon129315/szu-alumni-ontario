const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies["x-auth-token"];
        const decodedToken = jwt.verify(token, process.env.SECRETE_TOKEN);
        // console.log(decodedToken);

        if (decodedToken.id !== "szuonadmin") {
            throw new Error("auth failed");
        }

        req.token = token;
    } catch (e) {
        console.log(e);
    }
    next();
};

module.exports = auth;
