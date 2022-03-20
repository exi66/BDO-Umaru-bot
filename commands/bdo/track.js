const { print_e, declOfNum } = require("../../functions.js");
const fs = require("fs");

module.exports = {
    name: "track",
	category: "bdo",
    aliases: ["t"],
    description: "Управляет отслеживанием аукциона",
    usage: "<add | remove>",
    run: (client, message, args, config) => {
        if (!message.member.hasPermission("ADMINISTRATOR")) 
            return message.reply("у вас нет прав использовать эту команду!").then(m => m.delete({ timeout: 10000 }));

        message.delete();
        var configurations_list = [];
        fs.readFile(config.servers_configs_folder, (err, data) => {
            if (err) return print_e("[ERROR/track.js]" + err.message);
            configurations_list = JSON.parse(data);
        });
        var local_config = configurations_list.find(server => server.guild == message.guild.id);
        
        if (!local_config)
            return message.reply("конфигурация сервера отсутствует, использование не возможно!").then(m => m.delete({ timeout: 10000 }));                    
        //if (!local_config.premium)
            //return message.reply("сервер не премиум, использование не возможно!").then(m => m.delete({ timeout: 10000 }));
	    //cheak, can server use this command or not. You can delete this, if want use bot only for yourself.
        if (args.length <= 0) {
            if (local_config.items.length == 0) return message.reply("список отслеживаемых товаров пуст!").then(m => m.delete({ timeout: 10000 }));
            let roles="", items="", lvls="";
            for (let e of local_config.items) {
                items+=e.ids.slice(0, Math.min(5, e.ids.length)).join(", ")+"\n";
                roles+="<@&"+e.role+">\n"; 
                lvls+=e.enchant+"\n";  
            }
            return message.channel.send({
                embed: {
                    color: "#2f3136",
                    title: "Отслеживаемые товары",
                    fields: [
                        { name: "Роль", value: roles, inline: true},
                        { name: "id", value: items, inline: true},
                        { name: "lvl", value: lvls, inline: true},
                    ]
                }
            });	            
        }
		args = args.map(e => e.toLowerCase());
        var all_messages = [];
        var filter = m => m.author.id === message.author.id;
        if (args[0] === "add") {
            if ((local_config.items.length >= 5) && !local_config.premium) 
                return message.channel.send("Достигнут лимит на 5 отслеживаемых групп товаров для сервера! Удалите какую-нибудь группу для создания новой.").then(m => m.delete({ timeout: 10000 }));
            let new_item = {
                "role": "",
                "enchant": 0,
                "ids": []
            }
            message.channel.send("Какую роль упоминать? Укажите `id` или упомяните ее через `@role-name`.").then(m => {
                all_messages.push(m);
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 240000,
                    errors: ["time"]
                }).then(_message => {
                    all_messages.push(_message.first());
                    let local_message = _message.first();
                    let role = local_message.mentions.roles.first() || message.guild.roles.cache.find(role => role.id === local_message);
                    if (!role) {
                        all_messages.forEach(e => e.delete({ timeout: 10000 }));
                        return message.channel.send("Не удалось распознать роль!").then(m => m.delete({ timeout: 10000 }));
                    }
                    new_item.role = role.id;
                    message.channel.send("Перечислите id необходимых для отслеживания предметов.").then(m => {
                        all_messages.push(m);
                        message.channel.awaitMessages(filter, {
                            max: 1,
                            time: 240000,
                            errors: ["time"]
                        }).then(_message => {
                            all_messages.push(_message.first());
                            let local_message = _message.first();
                            let local_id = local_message.content.replace(/\D/gm, " ").replace(/\s\s+/g, " ").split(" ");
                            new_item.ids = local_id.map(e => parseInt(e));
                            message.channel.send("Укажите уровень усиления (общий для всей группы ранее указанных предметов).").then(m => {
                                all_messages.push(m);
                                message.channel.awaitMessages(filter, {
                                    max: 1,
                                    time: 240000,
                                    errors: ["time"]
                                }).then(_message => {
                                    all_messages.push(_message.first());
                                    let local_message = _message.first();
                                    new_item.enchant = parseInt(local_message.content);

                                    message.channel.send("```json\n"+JSON.stringify(new_item, null, 2)+"``` \n Все верно? Да(Y)\/Нет(N)").then(m => {
                                        all_messages.push(m);
                                        message.channel.awaitMessages(filter, {
                                            max: 1,
                                            time: 240000,
                                            errors: ["time"]
                                        }).then(_message => {
                                            all_messages.push(_message.first());
                                            let local_message = _message.first();
                                            if (local_message.content.toLowerCase() === "y" || local_message.content.toLowerCase() === "yes" || local_message.content.toLowerCase() === "да") {
                                                try {
                                                    configurations_list.find(server => server.guild == message.guild.id).items.push(new_item);
                                                    fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
                                                        if (err) {
                                                            all_messages.forEach(e => e.delete({ timeout: 10000 }));
                                                            message.channel.send("Ошибка!").then(m => m.delete({ timeout: 10000 }));
                                                            return print_e("[ERROR/track.js] " + err.message);
                                                        }
                                                    });
                                                    all_messages.forEach(e => e.delete({ timeout: 10000 }));
                                                    return message.channel.send("Создано!").then(m => m.delete({ timeout: 10000 }));
                                                } catch (e) {
                                                    all_messages.forEach(e => e.delete({ timeout: 10000 }));
                                                    message.channel.send("Ошибка!").then(m => m.delete({ timeout: 10000 }));
                                                    return print_e("[ERROR/track.js] "+e.message);
                                                }
                                            } else {
                                                all_messages.forEach(e => e.delete({ timeout: 10000 }));
                                                return message.channel.send("Команда отменена!").then(m => m.delete({ timeout: 10000 }));
                                            }
                                        }).catch(collected => {
                                            all_messages.forEach(e => e.delete({ timeout: 10000 }));
                                            return message.channel.send("Команда отменена!").then(m => m.delete({ timeout: 10000 }));
                                        });
                                    });
                                }).catch(collected => {
                                    all_messages.forEach(e => e.delete({ timeout: 10000 }));
                                    return message.channel.send("Команда отменена!").then(m => m.delete({ timeout: 10000 }));
                                });
                            });
                        }).catch(collected => {
                            all_messages.forEach(e => e.delete({ timeout: 10000 }));
                            return message.channel.send("Команда отменена!").then(m => m.delete({ timeout: 10000 }));
                        });
                    });
                }).catch(collected => {
                    all_messages.forEach(e => e.delete({ timeout: 10000 }));
                    return message.channel.send("Команда отменена!").then(m => m.delete({ timeout: 10000 }));
                });
            });
        } else if (args[0] === "remove" || args[0] === "rm") {
            message.channel.send("Упомяните роль, которую хотите перестать отслеживать или укажите ее id").then(m => {
                all_messages.push(m);
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 240000,
                    errors: ["time"]
                }).then(_message => {
                    all_messages.push(_message.first());
                    let local_message = _message.first();
                    let role = local_message.mentions.roles.first() || message.guild.roles.cache.find(role => role.id === local_message);
                    if (!role) {
                        all_messages.forEach(e => e.delete({ timeout: 10000 }));
                        return message.channel.send("Не удалось распознать роль!").then(m => m.delete({ timeout: 10000 }));
                    }
                    let local_deleted = [];
                    for (let i = 0; i < local_config.items.length; i++) {
                        if (local_config.items[i].role == role.id) {
                            local_deleted.push(local_config.items[i]);
                        }
                    }
                    if (local_deleted.length > 1) {
                        let nums = local_deleted.map((e, i) => i+1).join("\n");
                        let items = local_deleted.map(e => e.ids.slice(0, Math.min(5, e.ids.length)).join(", ")).join("\n");
                        let lvls = local_deleted.map(e => e.enchant).join("\n");
                        message.channel.send({
                            content: `Найдено ${local_deleted.length} ${declOfNum(local_deleted.length, ["зависимость", "зависимости", "зависимостей"])}. Какую удалить? (1-${local_deleted.length})`,
                            embed: {
                                color: "#2f3136",
                                title: "Найденные соответствия",
                                fields: [
                                    { name: "№", value: nums, inline: true},
                                    { name: "id", value: items, inline: true},
                                    { name: "lvl", value: lvls, inline: true},
                                ]
                            }
                        }).then(m => {
                            all_messages.push(m);
                            message.channel.awaitMessages(filter, {
                                max: 1,
                                time: 240000,
                                errors: ["time"]
                            }).then(_message => {
                                all_messages.push(_message.first());
                                let local_message = _message.first();
                                let local_index = parseInt(local_message) || -1;
                                if (local_index === -1) {
                                    all_messages.forEach(e => e.delete({ timeout: 10000 }));
                                    return message.channel.send("Не удалось распознать индекс!").then(m => m.delete({ timeout: 10000 }));
                                }
                                try {
                                    let index = local_config.items.indexOf(local_deleted[local_index-1]);
                                    if (index !== -1) {
                                        local_config.items.splice(index, 1);
                                    }
                                    //configurations_list[configurations_list.indexOf(local_config)] = local_config;
                                    fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
                                    	if (err) return print_e("[ERROR/track.js] " + err.message);
                                    });
                                    all_messages.forEach(e => e.delete({ timeout: 10000 }));
                                    return message.channel.send("Удалено!").then(m => m.delete({ timeout: 10000 }));
                                } catch (e) {
                                    all_messages.forEach(e => e.delete({ timeout: 10000 }));
                                    message.channel.send("Ошибка!").then(m => m.delete({ timeout: 10000 }));
                                    return print_e("[ERROR/track.js] "+e.message);
                                }
                            }).catch(collected => {
                                all_messages.forEach(e => e.delete({ timeout: 10000 }));
                                return message.channel.send("Команда отменена!").then(m => m.delete({ timeout: 10000 }));
                            });
                        });                        
                    }
                    else if (local_deleted.length == 1) {
                        try {
                            let index = local_config.items.indexOf(local_deleted[0]);
                            if (index !== -1) {
                                local_config.items.splice(index, 1);
                            }
                            //configurations_list[configurations_list.indexOf(local_config)] = local_config;
                            fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
                                if (err) return print_e("[ERROR/track.js] " + err.message);
                            });
                            all_messages.forEach(e => e.delete({ timeout: 10000 }));
                            return message.channel.send("Удалено!").then(m => m.delete({ timeout: 10000 }));
                        } catch (e) {
                            all_messages.forEach(e => e.delete({ timeout: 10000 }));
                            message.channel.send("Ошибка!").then(m => m.delete({ timeout: 10000 }));
                            return print_e("[ERROR/track.js] "+e.message);
                        }                        
                    }
                    else return message.channel.send("Не удалось найти такую зависимость!");
                });
            });
        } 
        else {
            return;
        }
    }
}
