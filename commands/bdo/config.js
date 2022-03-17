const { print_e } = require("../../functions.js");
const fs = require("fs");

module.exports = {
    name: "config",
	category: "bdo",
    aliases: ["conf"],
    description: "Управляет конфигурацией сервера",
    usage: "<edit> <key> <value>",
    run: (client, message, args, config) => {
        message.delete();
        let configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder));
        if (!message.member.hasPermission("ADMINISTRATOR")) 
            return message.reply("у вас нет прав использовать эту команду!").then(m => m.delete({ timeout: 10000 }));
        if (!configurations_list.find(server => server.guild == message.guild.id))
            return message.reply("конфигурация сервера отсутствует, использование не возможно!").then(m => m.delete({ timeout: 10000 }));                    
        if (args.length <= 0) {
            let c = configurations_list.find(server => server.guild == message.guild.id);
            return message.channel.send(`Guild ID = \`${c.guild}\`\nPremium = \`${c.premium}\`\nCategory ID = \`${c.category || " "}\`\nQueue ID = \`${c.queue || " "}\`\nCoupons ID = \`${c.coupons || " "}\`\nCoupons role = \`${c["coupons-role"] || " "}\``);
        }
        //let filter = m => m.author.id === message.author.id;
        if (args[0].toLowerCase() === "edit") { 
            let c = configurations_list.find(server => server.guild == message.guild.id);
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
                if (configurations_list[i].guild == c.guild) {
                    configurations_list[i] = c;
                }
            }
            fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
                if (err) return print_e("[ERROR/config.js] " + err.message);
            });
            return message.channel.send("Изменено и сохранено!");
        } else {
            return;
        }
    }
}
