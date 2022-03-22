const { printError } = require("../../functions.js");
const fs = require("fs");
const { MessageAttachment } = require('discord.js')

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = {
    name: "config",
	category: "bdo",
    aliases: ["conf"],
    description: "Управляет конфигурацией сервера",
    usage: "<edit> <key> <value> | [json]",
    run: async(client, message, args, config) => {
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            return message.reply("у вас нет прав использовать эту команду!");
        }

        var configurations_list = [];
		try {
			configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder, "utf8"));
		} catch (e) {
			printError(error_here, e.message);
		}
        var local_config = configurations_list.find(server => server.guild == message.guild.id);

        if (!local_config) {
            return message.reply("конфигурация сервера отсутствует, использование не возможно!");
        }
        if (args.length <= 0) {
            return message.channel.send({
                embed: {
                    color: "#2f3136",
                    title: "Конфигурация сервера",
                    description: `guild: \`${local_config.guild}\`\npremium: \`${local_config.premium}\`\ncategory: \`${local_config.category || " "}\`\nqueue: \`${local_config.queue || " "}\`\ncoupons: \`${local_config.coupons || " "}\`\ncoupons_role: \`${local_config.coupons_role || " "}\``
                }
            });
        }
		args = args.map(e => e.toLowerCase());
        //let filter = m => m.author.id === message.author.id;
        if (args[0] === "edit") { 
            switch(args[1].toLowerCase()) {
                case "category":
                    local_config.category = args[2];
                    break;
                case "queue":
                    local_config.queue = args[2];
                    break;
                case "coupons":
                    local_config.coupons = args[2];
                    break;  
                case "coupons_role":
                    local_config.coupons_role = args[2];
                    break;
                case "premium":
                    if (message.author.id == config.root) local_config.premium = args[2] == "true" ? true : false;
                    break;      
                default:
                    return message.channel.send("Неизвестный параметр! Изменять можно только `category`, `queue`, `coupons`, `coupons_role`");
            }
            fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function(e) {
                if (e) {
                    message.channel.send("Ошибка!");
                    return printError(error_here, e.message);
                }
            });
            return message.channel.send("Изменено и сохранено!");
        } else if(args[0] === "json") {
            let buffer = Buffer.from(JSON.stringify(local_config, null, 4));
            let attachment = new MessageAttachment(buffer, 'config.json');
            return message.channel.send(attachment);
        } else {
            return;
        }
    }
}
