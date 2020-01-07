const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const verifyPassword = (password) => {
    const hash = "$2a$08$OiZPXSUOzYB2RHMJsVSmWe5HSVDzDpCQmxx8a4POd0LXXdWoKC9PS"; // Szuon2019$
    return bcrypt.compareSync(password, hash);
};

const generateToken = (id) => {
    const token = jwt.sign({ id }, process.env.SECRETE_TOKEN, {
        expiresIn: "1d"
    });
    return token;
};

module.exports = {
    verifyPassword,
    generateToken
};
