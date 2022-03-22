const request = require("request-promise-native");
const { printError } = require("../../functions.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = {
    name: "umaru",
	category: "fun",
    description: "[ search request ]",
    run: async (client, message, args) => {
		message.delete();
		let req = args.join(" ") || "umaru";
		request({
			method: "GET",
			url: encodeURI(`https://g.tenor.com/v1/random?q=${req}&key=4HDPRLGK9KPI&limit=1`),
			headers: {
				"User-Agent": "BDO-Umaru-bot https://github.com/exi66/BDO-Umaru-bot"
			}
		}).then(body => {
			let answer = JSON.parse(body).results[0].url || "ничего не найдено :(";
			message.channel.send(answer);
		}).catch(function(e) { printError(error_here, "request error, "+e.message) });
    }
}
