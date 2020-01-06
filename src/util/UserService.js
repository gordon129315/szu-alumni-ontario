const bcrypt = require('bcryptjs');

const verifyPassword = (password) =>{
    const hash = "$2a$08$OiZPXSUOzYB2RHMJsVSmWe5HSVDzDpCQmxx8a4POd0LXXdWoKC9PS"; // Szuon2019$
    return bcrypt.compareSync(password, hash);
}


module.exports = {
    verifyPassword
}