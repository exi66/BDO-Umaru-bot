const config = require("./config.json");
const client = require("./bot.js")(config);
const scraper = require("./scraper.js")(config, client);