const request = require("request-promise-native");
const { print_e } = require("../../functions.js");
const fs = require("fs");

module.exports = {
    name: "queue",
	category: "bdo",
    aliases: ["q", "que"],
    description: "Выдает текущую очередь регистрации на аукционе",
    usage: "<input>",
    run: (client, message, args, config) => {
        message.delete();
		try {
			let queue_list = JSON.parse(fs.readFileSync(config.queue_folder));
			let items = queue_list.items || [];
			if (items.length > 0) {
				let names = items.map(e => e[4]).join("\n"), 
				lvls = items.map(e => e[1]).join("\n"), 
				times = items.map(e => `${new Date(e[3] * 1000).getHours()}:${("0" + new Date(e[3]  * 1000).getMinutes()).substr(-2)}:${("0" + new Date(e[3] * 1000).getSeconds()).substr(-2)}`).join("\n");						
				try {
					message.channel.send({
						embed: {
							color: 15105570,
							title: "Очередь аукциона",
							timestamp: new Date(queue_list.lastUpdate),
							fields: [
								{ name: "lvl", value: lvls, inline: true},
								{ name: "Название", value: names, inline: true},
								{ name: "Время", value: times, inline: true}
							]
						}
					});
				} catch (e) {
					print_e("[ERROR/queue.js]: Cannot send message, "+e.message);
				}
			} else return message.reply("очередь аукциона пуста!").then(m => m.delete({ timeout: 10000 }))	
		}
		catch (e) {
			print_e("[ERROR/queue.js]: "+e.message)
			return message.reply("непредвиденная ошибка! Попробуйте позже.").then(m => m.delete({ timeout: 10000 }))
		};		
    }
}
