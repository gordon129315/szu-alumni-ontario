const fs = require("fs");

const isExist = (file_path) => {
    return fs.existsSync(file_path);
};

const readFIleParse = (file_path) => {
    const string_data = fs.readFileSync(file_path);
    const obj = JSON.parse(string_data);
    return obj;
};

const getArticle = (file_path) => {
    let [
        id,
        title,
        author,
        create_date,
        event_date,
        ...content
    ] = fs.readFileSync(file_path, "utf-8").split(/\r?\n/);

    content = content.map((line) => {
        if (line === "") {
            return "  ";
        }
        return line;
    });
    
    const article = {
        id: id.replace("id:", "").trim(),
        title: title.replace("title:", "").trim(),
        author: author.replace("author:", "").trim(),
        create_date: create_date.replace("create_date:", "").trim(),
        event_date: event_date.replace("event_date:", "").trim(),
        content: content.join("\r\n")
    };

    return article;
};

const getEmptyArticle = () => {
    return {
        id: "",
        title: "抱歉！此文章不存在或已被删除",
        author: "",
        create_date: "",
        event_date: "",
        content: ""
    };
};

module.exports = { readFIleParse, isExist, getEmptyArticle, getArticle };
