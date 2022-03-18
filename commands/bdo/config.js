const { print_e } = require("../../functions.js");
const fs = require("fs");
const { MessageAttachment } = require('discord.js')

module.exports = {
    name: "config",
	category: "bdo",
    aliases: ["conf"],
    description: "Управляет конфигурацией сервера",
    usage: "<edit> <key> <value>",
    run: (client, message, args, config) => {
        message.delete();
        if (!message.member.hasPermission("ADMINISTRATOR")) 
            return message.reply("у вас нет прав использовать эту команду!").then(m => m.delete({ timeout: 10000 }));

        var configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder));
        var local_config = configurations_list.find(server => server.guild == message.guild.id);

        if (!local_config)
            return message.reply("конфигурация сервера отсутствует, использование не возможно!").then(m => m.delete({ timeout: 10000 }));                    
        if (args.length <= 0) {
            return message.channel.send(`Guild ID = \`${local_config.guild}\`\nPremium = \`${local_config.premium}\`\nCategory ID = \`${local_config.category || " "}\`\nQueue ID = \`${local_config.queue || " "}\`\nCoupons ID = \`${local_config.coupons || " "}\`\nCoupons role = \`${local_config["coupons-role"] || " "}\``);
        }
		args = args.map(e => e.toLowerCase());
        //let filter = m => m.author.id === message.author.id;
        if (args[0] === "edit") { 
            switch(args[1].toLowerCase()) {
                case "category":
                    c.category = args[2];
                    break;
                case "queue":
                    c.queue = args[2];
                    break;
                case "coupons":
                    c.coupons = args[2];
                    break;  
                case "coupons-role":
                    c["coupons-role"] = args[2];
                    break;
                case "premium":
                    if (message.author.id == config.root) c.premium = args[2] == "true" ? true : false;
                    break;      
                default:
                    return message.channel.send("Неизвестный параметр! Изменять можно только `category`, `queue`, `coupons`, `coupons-role`.");
            }
            for (let i = 0; i < configurations_list.length; i++) {
                if (configurations_list[i].guild == local_config.guild) {
                    configurations_list[i] = local_config;
                    break;
                }
            }
            fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
                if (err) return print_e("[ERROR/config.js] " + err.message);
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
