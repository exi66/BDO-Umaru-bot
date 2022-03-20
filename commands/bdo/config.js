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
        if (!message.member.hasPermission("ADMINISTRATOR")) 
            return message.reply("у вас нет прав использовать эту команду!").then(m => m.delete({ timeout: 10000 }));

        message.delete();
        var configurations_list = [];
        fs.readFile(config.servers_configs_folder, (err, data) => {
            if (err) return print_e("[ERROR/Read_servers_configs]" + err.message);
            configurations_list = JSON.parse(data);
        });
        var local_config = configurations_list.find(server => server.guild == message.guild.id);

        if (!local_config)
            return message.reply("конфигурация сервера отсутствует, использование не возможно!").then(m => m.delete({ timeout: 10000 }));                    
        if (args.length <= 0) {
            return message.channel.send({
                embed: {
                    color: "#2f3136",
                    title: "Конфигурация сервера",
                    description: `guild: \`${local_config.guild}\`\npremium: \`${local_config.premium}\`\ncategory: \`${local_config.category || " "}\`\nqueue: \`${local_config.queue || " "}\`\ncoupons: \`${local_config.coupons || " "}\`\ncoupons-role: \`${local_config["coupons-role"] || " "}\``
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
                case "coupons-role":
                    local_config["coupons-role"] = args[2];
                    break;
                case "premium":
                    if (message.author.id == config.root) local_config.premium = args[2] == "true" ? true : false;
                    break;      
                default:
                    return message.channel.send("Неизвестный параметр! Изменять можно только `category`, `queue`, `coupons`, `coupons-role`.").then(m => m.delete({ timeout: 10000 }));
            }
            fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
                if (err) return print_e("[ERROR/config.js] " + err.message);
            });
            return message.channel.send("Изменено и сохранено!").then(m => m.delete({ timeout: 10000 }));
        } else if(args[0] === "json") {
            let buffer = Buffer.from(JSON.stringify(local_config, null, 4));
            let attachment = new MessageAttachment(buffer, 'config.json');
            return message.channel.send(attachment);
        } else {
            return;
        }
    }
}
