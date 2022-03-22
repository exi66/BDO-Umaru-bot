const { printError, declOfNum } = require("../../functions.js");
const fs = require("fs");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

function getAllTracked(message, config, configurations_list) {
    let local_config = configurations_list.find(server => server.guild == message.guild.id);
    if (local_config.items.length == 0) return "список отслеживаемых товаров пуст!";
    let items   = local_config.items.map(e => e.ids.slice(0, Math.min(5, e.ids.length)).join(", ")).join("\n");
    let roles   = local_config.items.map(e => "<@&"+e.role+">").join("\n");
    let lvls    = local_config.items.map(e => e.enchant).join("\n");
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

async function removeTracked(message, config, configurations_list) {
    var local_config = configurations_list.find(server => server.guild == message.guild.id);
    var local_deleted;
    var questions = [
        {
            question: "Упомяните роль, которую хотите перестать отслеживать или укажите ее id",
            before: () => {

            },
            after: (msg) => {
                let role = msg.mentions.roles.first() || msg.guild.roles.cache.find(role => role.id === msg.content);
                if (!role) {
                    return { error: "Не удалось распознать роль!" };
                }
                local_deleted = local_config.items.filter(e => e.role == role.id);
            }
        }
    ]
    await sendQuestions(message, questions, 240000);
    if (local_deleted.length > 1) {
        let nums    = local_deleted.map((e, i) => i+1).join("\n");
        let items   = local_deleted.map(e => e.ids.slice(0, Math.min(5, e.ids.length)).join(", ")).join("\n");
        let lvls    = local_deleted.map(e => e.enchant).join("\n");
        questions = [
            {
                question: {
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
                },
                before: () => {
                    
                },
                after: (msg) => {
                    let local_index = parseInt(msg.content) || -1;
                    if (local_index === -1) {
                        return { error: "Не удалось распознать роль!" };
                    }
                    try {
                        let index = local_config.items.indexOf(local_deleted[local_index-1]);
                        if (index !== -1) {
                            local_config.items.splice(index, 1);
                        }
                        fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function(e) {
                            if (e) {
                                printError(error_here, e.message);
                                return { error: "Ошибка!" };
                            }
                        });
                        return { message: "Удалено!" };
                    } catch (e) {
                        printError(error_here, e.message);
                        return { error: "Ошибка!" };
                    }
                }
            }            
        ]
        await sendQuestions(message, questions, 240000);                    
    }
    else if (local_deleted.length == 1) {
        try {
            let index = local_config.items.indexOf(local_deleted[0]);
            if (index !== -1) {
                local_config.items.splice(index, 1);
            }
            fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function(e) {
                if (e) {
                    message.channel.send("Ошибка!");
                    return printError(error_here, e.message);
                }
            });
            return message.channel.send("Удалено!");
        } catch (e) {
            message.channel.send("Ошибка!");
            return printError(error_here, e.message);
        }                        
    }
    else return message.channel.send("Не удалось найти такую зависимость!");
}

function addTracked(message, config, configurations_list) {
    var local_config = configurations_list.find(server => server.guild == message.guild.id);
    if ((local_config.items.length >= 5) && !local_config.premium) {
        all_messages.forEach(e => e.delete({ timeout: 10000 }));
        return message.channel.send("Достигнут лимит на 5 отслеживаемых групп товаров для сервера! Удалите какую-нибудь группу для создания новой.").then(m => m.delete({ timeout: 10000 }));
    }
    var new_item = {
        role: "",
        enchant: 0,
        ids: []
    }
    var questions = [
        {
            question: "Какую роль упоминать? Укажите `id` или упомяните ее через `@role-name`",
            before: () => {

            },
            after: (msg) => {
                let role = msg.mentions.roles.first() || msg.guild.roles.cache.find(role => role.id === msg.content);
                if (!role) {
                    return { error: "Не удалось распознать роль!" };
                }
                return new_item.role = role.id;
            }
        },
        {
            question: "Перечислите id необходимых для отслеживания предметов",
            before: () => {

            },
            after: (msg) => {
                let local_id = msg.content.replace(/\D/gm, " ").replace(/\s\s+/g, " ").split(" ");
                return new_item.ids = local_id.map(e => parseInt(e));
            }
        },
        {
            question: "Укажите уровень усиления (общий для всей группы ранее указанных предметов)",
            before: () => {

            },
            after: (msg) => {
                let enchant = parseInt(msg.content) || { error: "Не удалось распознать число!" };
                if (enchant.message) return enchant;
                return new_item.enchant = enchant;
            }
        },
        {
            question: "Все верно? Да(Y)\/Нет(N)",
            before: () => {
                return { message: "```json\n"+JSON.stringify(new_item, null, 2)+"```" }
            },
            after: (msg) => {
                if (msg.content.toLowerCase() === "y" || msg.content.toLowerCase() === "yes" || msg.content.toLowerCase() === "да") {
                    try {
                        local_config.items.push(new_item);
                        fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function(e) {
                            if (e) {
                                printError(error_here, e.message);
                                return { error: "Ошибка!" }
                            }
                        });
                        return { message: "Создано!" }
                    } catch (e) {
                        printError(error_here, e.message);
                        return { error: "Ошибка!" }
                    }
                } else {
                    return { error: "Команда отменена пользователем!" }
                }                
            }
        },
    ];
    sendQuestions(message, questions, 240000);
}

async function sendQuestions(message, questions, timeout) {
    var all_messages = [];
    var filter = m => m.author.id === message.author.id;
    for (let quest of questions) {
        let before = quest.before();
        if (before) {
            if (before.error) return message.channel.send(before.error);
            if (before.message) message.channel.send(before.message).then(m => all_messages.push(m));
        }
        await message.channel.send(quest.question).then(m => all_messages.push(m));
        let m = await message.channel.awaitMessages(filter, {
            max: 1,
            time: timeout,
            errors: ["time"]
        }).catch(() => {
            return message.channel.send("Команда отменена по таймауту!");
        });
        let after = quest.after(m.first());
        all_messages.push(m.first());
        if (after) {
            if (after.error) {
                return message.channel.send(after.error);
            }
            if (after.message) message.channel.send(after.message).then(m => all_messages.push(m));
        }  
    }
    all_messages.forEach(e => e.delete({ timeout: 10000 }));
}

module.exports = {
    name: "track",
	category: "bdo",
    aliases: ["t"],
    description: "Управляет отслеживанием аукциона",
    usage: "<add | remove>",
    run: (client, message, args, config) => {
        var configurations_list = [], local_config;

        if (!message.member.hasPermission("ADMINISTRATOR"))
            return message.reply("у вас нет прав использовать эту команду!");

        try {
            configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder, "utf8"));
        } catch (e) {
            printError(error_here, e.message);
        }
        local_config = configurations_list.find(server => server.guild == message.guild.id);

        if (!local_config)
            return message.reply("конфигурация сервера отсутствует, использование невозможно!");

        if (args.length <= 0) return getAllTracked(message, config, configurations_list);

		args = args.map(e => e.toLowerCase());
        if (args[0] === "add") {
            addTracked(message, config, configurations_list);
        } else if (args[0] === "remove" || args[0] === "rm") {
            removeTracked(message, config, configurations_list);
        } 
        else {
            return;
        }
    }
}
