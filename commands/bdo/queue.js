const request = require("request-promise-native");
const { print_e } = require("../../functions.js");

module.exports = {
    name: "queue",
	category: "bdo",
    aliases: ["q", "que"],
    description: "Выдает текущую очередь регистрации на аукционе",
    usage: "<input>",
    run: (client, message, args, config) => {
        message.delete();
		request({
			method: "GET",
			url: "https://veliainn.com/api/market-queue/ru",
			headers: {
				"User-Agent": "BDO-Umaru-bot https://github.com/exi66/BDO-Umaru-bot"
			}
		}).then(body => {
			if (body !== "" && body != null) {
				let data = JSON.parse(body);
				let items = data["items"];
				//let lastupdate = data["lastUpdate"];
				if (items.length > 0) {
					let names = "", lvls = "", times = "";
					for (let item of items) {
						lvls += item[1]+"\n";
						names += item[4]+"\n";
						var date = new Date(item[3] * 1000);
						var hours = date.getHours();
						var minutes = "0" + date.getMinutes();
						var seconds = "0" + date.getSeconds();
						times += `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}\n`;					
					}
					let em = {
						embed: {
							color: 15105570,
							title: "Очередь аукциона",
							timestamp: new Date(),
							fields: [
								{ name: "lvl", value: lvls, inline: true},
								{ name: "Название", value: names, inline: true},
								{ name: "Время", value: times, inline: true}
							]
						}
					};							
					try {
						message.channel.send(em);
					} catch (e) {
						print_e("[ERROR/queue.js]: Cannot send message, "+e.message);
					}
				} else return message.reply("очередь аукциона пуста!").then(m => m.delete({ timeout: 10000 }))	
			}
		}).catch(function(e){print_e("[ERROR/queue.js]: "+e.message)});		
    }
}