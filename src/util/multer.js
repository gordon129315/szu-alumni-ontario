const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        if (file.fieldname === "pdf") {
            const pdf_dir = path.join(__dirname, "../../public/files/events");
            if (!fs.existsSync(pdf_dir)) {
                fs.mkdirSync(pdf_dir);
            }
            callback(null, pdf_dir);
        } else if (file.fieldname === "photos") {
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
        } else if (file.fieldname === "photos") {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return callback(new Error("Please upload a legal file"));
            }
        } else {
            return callback(new Error("no this field name"));
        }
        callback(undefined, true);
    }
});

module.exports = {
    upload
};
