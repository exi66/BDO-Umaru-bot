const { printError } = require("../../functions.js");
const fs = require("fs");

module.exports = {
    name: "queue",
	category: "bdo",
    aliases: ["q", "que"],
    description: "Выдает текущую очередь регистрации на аукционе",
    run: (client, message, args, config) => {
		try {
			var queue_list = [];
			try {
				queue_list = JSON.parse(fs.readFileSync(config.queue_folder, "utf8"));
			} catch (e) {
				printError("ERROR/queue.js", e.message);
			}
			let items = queue_list.items || [];
			if (items.length > 0) {
				let names = items.map(e => e[4]).join("\n"), 
				lvls = items.map(e => e[1]).join("\n"), 
				times = items.map(e => `${new Date(e[3] * 1000).getHours()}:${("0" + new Date(e[3]  * 1000).getMinutes()).substr(-2)}:${("0" + new Date(e[3] * 1000).getSeconds()).substr(-2)}`).join("\n");						
				try {
					message.channel.send({
						embed: {
							color: "#2f3136",
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
					printError("ERROR/queue.js", "cannot send message, "+e.message);
				}
			} else return message.reply("очередь аукциона пуста!");	
		}
		catch (e) {
			printError("ERROR/queue.js", e.message)
			return message.reply("непредвиденная ошибка! Попробуйте позже.");
		};		
    }
}