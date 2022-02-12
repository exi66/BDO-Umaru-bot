const { print_e } = require("../../functions.js");
const fs = require("fs");

module.exports = {
    name: "track",
	category: "bdo",
    aliases: ["t"],
    description: "Управляет отслеживанием аукциона",
    usage: "<add | list | remove >",
    run: (client, message, args, config) => {
        message.delete();
        let configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder));
        if (!message.member.hasPermission("ADMINISTRATOR")) 
            return message.reply("у вас нет прав использовать эту команду!").then(m => m.delete({ timeout: 10000 }));
        if (!configurations_list.find(server => server.guild == message.guild.id))
            return message.reply("конфигурация сервера отсутствует, использование не возможно!").then(m => m.delete({ timeout: 10000 }));                    
        if (!configurations_list.find(server => server.guild == message.guild.id).premium)
            return message.reply("сервер не премиум, использование не возможно!").then(m => m.delete({ timeout: 10000 }));
        if (args.length <= 0) 
            return message.reply("отсутствуют аргументы!").then(m => m.delete({ timeout: 10000 }));
        let filter = m => m.author.id === message.author.id;
        if (args[0].toLowerCase() === "add") {
            let new_item = {
                "role": "",
                "enchant": 0,
                "ids": []
            }
            message.channel.send("Какую роль упоминать? Укажите `id` или упомяните ее через `@role-name`.").then(() => {
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 240000,
                    errors: ["time"]
                }).then(_message => {
                    let local_message = _message.first();
                    let role = local_message.mentions.roles.first() || message.guild.roles.cache.find(role => role.id === local_message);
                    if (!role) return message.channel.send("Не удалось распознать роль!");
                    new_item.role = role.id;
                    message.channel.send("Перечислите id необходимых для отслеживания предметов.").then(() => {
                        message.channel.awaitMessages(filter, {
                            max: 1,
                            time: 240000,
                            errors: ["time"]
                        }).then(_message => {
                            let local_message = _message.first();
                            let local_id = local_message.content.replace(/\D/gm, " ").replace(/\s\s+/g, " ").split(" ");
                            new_item.ids = local_id;
                            message.channel.send("Укажите уровень усиления (общий для всей группы ранее указанных предметов).").then(() => {
                                message.channel.awaitMessages(filter, {
                                    max: 1,
                                    time: 240000,
                                    errors: ["time"]
                                }).then(_message => {
                                    let local_message = _message.first();
                                    new_item.enchant = parseInt(local_message.content);

                                    message.channel.send("```"+JSON.stringify(new_item, null, 2)+"``` \n Все верно? Да(Y)\/Нет(N)").then(() => {
                                        message.channel.awaitMessages(filter, {
                                            max: 1,
                                            time: 240000,
                                            errors: ["time"]
                                        }).then(_message => {
                                            let local_message = _message.first();
                                            if (local_message.content.toLowerCase() === "y" || local_message.content.toLowerCase() === "yes" || local_message.content.toLowerCase() === "да") {
                                                try {
                                                    configurations_list.find(server => server.guild == message.guild.id).items.push(new_item);
                                                    fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
                                                        if (err) return print_e("[ERROR/track.js] " + err.message);
                                                    });
                                                    return message.channel.send("Создано!");
                                                } catch (e) {
                                                    return print_e("[ERROR/track.js] "+e.message);
                                                }														
                                            } else {
                                                return message.channel.send("Команда отменена!");
                                            }

                                            
                                        }).catch(collected => {
                                            return message.channel.send("Команда отменена!");
                                        });
                                    })
                                    
                                }).catch(collected => {
                                    return message.channel.send("Команда отменена!");
                                });
                            })
                            
                        }).catch(collected => {
                            return message.channel.send("Команда отменена!");
                        });
                }).catch(collected => {
                    return message.channel.send("Команда отменена!");
                });
                }).catch(collected => {
                    return message.channel.send("Команда отменена!");
                });
            });
        }
        else if (args[0].toLowerCase() === "list") {
            let c = configurations_list.find(server => server.guild == message.guild.id);
            let roles="", items="", lvls="";
            for (let e of c.items) {
                items+=e.ids.slice(0, Math.min(5, c.items.length)).join(", ")+"\n";
                roles+="<@&"+e.role+">\n"; 
                lvls+=e.enchant+"\n";  
            }
            let em = {
                content: `Guild ID = \`${c.guild}\`\nPremium = \`${c.premium}\`\nCategory ID = \`${c.category}\`\nQueue ID = \`${c.queue}\`\nCoupons ID = \`${c.coupons}\`\nCoupons role = \`${c["coupons-role"]}\``,
                embed: {
                    color: 15105570,
                    title: "Отслеживаемые товары",
                    timestamp: new Date(),
                    fields: [
                        { name: "Роль", value: roles, inline: true},
                        { name: "id", value: items, inline: true},
                        { name: "lvl", value: lvls, inline: true},
                    ]
                }
            };
            message.channel.send(em);	
        } 
        else if (args[0].toLowerCase() === "remove") {
            message.channel.send("Упомяните роль, которую хотите перестать отслеживать или укажите ее id").then(() => {
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 240000,
                    errors: ["time"]
                }).then(_message => {
                    let local_message = _message.first();
                    let role = local_message.mentions.roles.first() || message.guild.roles.cache.find(role => role.id === local_message);
                    if (!role) return message.channel.send("Не удалось распознать роль!");
                    let c = configurations_list.find(server => server.guild == message.guild.id);
                    for (let e of c.items) {
                        if (e.role == role.id) {
                            let index = c.items.indexOf(e);
                            if (index !== -1) {
                                c.items.splice(index, 1);
                            }
                            return message.channel.send("Удалено!");
                        }
                    }
                    return message.channel.send("Не удалось найти такую зависимость!");
                });
            });
        } 
        else if (args[0].toLowerCase() === "edit") { 
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
                default:
                    return message.channel.send("Неизвестный параметр!");
            }
            for (let i = 0; i < configurations_list.length; i++) {
                if (configurations_list[i].guild == c.guild) {
                    configurations_list[i] = c;
                }
            }
            fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
                if (err) return print_e("[ERROR/track.js] " + err.message);
            });
            return message.channel.send("Изменено и сохранено!");
        } else {

        }
    }
}