const { printError } = require("../../functions.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = {
    name: "queue",
	category: "bdo",
    aliases: ["q", "que"],
    description: (lang) => { return lang.cmd.DESCRIPTION },
    run: (client, message, args, lang) => {
		try {
			var queue_list = client.getQueue();
			let items = queue_list.items || [];
			if (items.length > 0) {
				let names = items.map(e => e[4]).join("\n"), 
				lvls = items.map(e => e[1]).join("\n"), 
				times = items.map(e => `${new Date(e[3] * 1000).getHours()}:${("0" + new Date(e[3]  * 1000).getMinutes()).substr(-2)}:${("0" + new Date(e[3] * 1000).getSeconds()).substr(-2)}`).join("\n");						
				try {
					message.channel.send({
						embed: {
							color: "#2f3136",
							title: lang.cmd.EMBED.TITLE,
							timestamp: new Date(queue_list.lastUpdate),
							fields: [
								{ name: lang.cmd.EMBED.FIELDS.LVL, value: lvls, inline: true},
								{ name: lang.cmd.EMBED.FIELDS.NAME, value: names, inline: true},
								{ name: lang.cmd.EMBED.FIELDS.TIME, value: times, inline: true}
							]
						}
					});
				} catch (e) {
					printError(error_here, "cannot send message, "+e.message);
				}
			} else return message.channel.send(lang.cmd.DONT_HAVE_ITEMS);	
		}
		catch (e) {
			printError(error_here, e.message)
			return message.channel.send(lang.global.ERROR);
		};		
    }
}
