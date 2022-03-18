const request = require("request-promise-native");

module.exports = {
    name: "umaru",
	category: "fun",
    description: "Мммм",
    run: async (client, message, args) => {
		message.delete();
		let req = args.join(" ") || "umaru";
		request({
			method: "GET",
			url: `https://g.tenor.com/v1/random?q=${req}&key=4HDPRLGK9KPI&limit=1`,
			headers: {
				"User-Agent": "BDO-Umaru-bot https://github.com/exi66/BDO-Umaru-bot"
			}
		}).then(body => {
			let data = JSON.parse(body);	
			let answer = data.results[0].url || "ничего найдено(";
			message.channel.send(answer);
		}).catch(function(e) { print_e("[ERROR/umaru.js]: Request error, "+e.message); });;
    }
}
