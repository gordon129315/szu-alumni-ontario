const hbs = require("hbs");

hbs.registerHelper("breaklines", function(text) {
    // text = hbs.Utils.escapeExpression(text);
    text =
        "<p>" +
        text.replace(/^(\r\n|\n|\r)/gm, "&nbsp;\n").replace(/(\r\n|\n|\r)/gm, "</p><p>") +
        "</p>";

    const regex = /(?:http:\/\/|https:\/\/)?([a-z0-9]+(?:[\-\.]{1}[a-z0-9]+)*\.(?:top|com|org|net|edu|gov|ca|cn|io|cc|co|hk|uk|tv|info|club|tel|mobi|cd){1}(?::[0-9]{1,5})?(?:\/\S*)?)/gim;
    text = text.replace(
        regex,
        '<a href="http://$1" target="_blank" class="font-weight-normal">$1</a>'
    );

    // 匹配 <p><img src="url"></p> 中的 "url"
    // text = text.replace(
    //     /(\<p\>)(?:(?!\1).)*?\<img\ssrc\=(\".+?\")\>.*?\<\/p\>/g,
    //     '<p class="text-center"><img src=$2 class="my-3 w-75"></p>'
    // );

    return new hbs.SafeString(text);
});

hbs.registerHelper("textarea", function(text) {
    text = text.replace(/(\r\n|\n|\r)/gm, "\\n");
    return new hbs.SafeString(text);
});

module.exports = hbs;
