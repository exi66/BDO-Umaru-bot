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
        if (!message.member.hasPermission("ADMINISTRATOR")) 
            return message.reply("у вас нет прав использовать эту команду!").then(m => m.delete({ timeout: 10000 }));

        var configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder));
        var local_config = configurations_list.find(server => server.guild == message.guild.id);
        
        if (!local_config)
            return message.reply("конфигурация сервера отсутствует, использование не возможно!").then(m => m.delete({ timeout: 10000 }));                    
        //if (!local_config.premium)
            //return message.reply("сервер не премиум, использование не возможно!").then(m => m.delete({ timeout: 10000 }));
	    //cheak, can server use this command or not. You can delete this, if want use bot only for yourself.
        if (args.length <= 0) 
            return message.reply("отсутствуют аргументы!").then(m => m.delete({ timeout: 10000 }));
		args = args.map(e => e.toLowerCase());
        let filter = m => m.author.id === message.author.id;
        if (args[0] === "add") {
            if ((local_config.items.length >= 5) && !local_config.premium) 
                return message.channel.send("Достигнут лимит на 5 отслеживаемых групп товаров для сервера! Удалите какую-нибудь группу для создания новой.");
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
        else if (args[0] === "list") {
            if (local_config.items.length == 0) return message.channel.send("Список отслеживаемых товаров пуст!");
            let roles="", items="", lvls="";
            for (let e of local_config.items) {
                items+=e.ids.slice(0, Math.min(5, local_config.items.length)).join(", ")+"\n";
                roles+="<@&"+e.role+">\n"; 
                lvls+=e.enchant+"\n";  
            }
            message.channel.send({
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
            });	
        } 
        else if (args[0] === "remove") {
            message.channel.send("Упомяните роль, которую хотите перестать отслеживать или укажите ее id").then(() => {
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 240000,
                    errors: ["time"]
                }).then(_message => {
                    let local_message = _message.first();
                    let role = local_message.mentions.roles.first() || message.guild.roles.cache.find(role => role.id === local_message);
                    if (!role) return message.channel.send("Не удалось распознать роль!");
                    for (let i = 0; i < local_config.items.length; i++) {
                        if (local_config.items[i].role == role.id) {
                            local_config.items.splice(i, 1);
                            fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
                            	if (err) return print_e("[ERROR/track.js] " + err.message);
                            });							
                            return message.channel.send("Удалено!");
                        }
                    }
                    return message.channel.send("Не удалось найти такую зависимость!");
                });
            });
        } 
        else {

        }
    }
}
