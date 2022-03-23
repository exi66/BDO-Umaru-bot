const { printError, declOfNum } = require("../../functions.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

function getAllTracked(client, message, lang) {
    let local_config = client.getConfig(message.guild);
    if (local_config.items.length < 1) return message.channel.send(lang.cmd.TRACKED_EMPTY);
    let items   = local_config.items.map(e => e.ids.slice(0, Math.min(5, e.ids.length)).join(", ")).join("\n");
    let roles   = local_config.items.map(e => "<@&"+e.role+">").join("\n");
    let lvls    = local_config.items.map(e => e.enchant).join("\n");
    return message.channel.send({
        embed: {
            color: "#2f3136",
            title: lang.cmd.EMBED.TITLE,
            fields: [
                { name: lang.cmd.EMBED.FIELDS.ROLE, value: roles, inline: true},
                { name: lang.cmd.EMBED.FIELDS.ID, value: items, inline: true},
                { name: lang.cmd.EMBED.FIELDS.LVL, value: lvls, inline: true},
            ]
        }
    });    
}

async function removeTracked(client, message, lang) {
    const removed = lang.cmd.REMOVED;
    var local_config = client.getConfig(message.guild);
    var local_deleted;
    var questions = [
        {
            question: removed.QUESTION_1,
            before: () => {

            },
            after: (msg) => {
                let role = msg.mentions.roles.first() || msg.guild.roles.cache.find(role => role.id === msg.content);
                if (!role) {
                    return { error: removed.ERROR_1 };
                }
                local_deleted = local_config.items.filter(e => e.role == role.id);
            }
        }
    ]
    await sendQuestions(message, questions, 240000, lang);
    if (local_deleted.length > 1) {
        let nums    = local_deleted.map((e, i) => i+1).join("\n");
        let items   = local_deleted.map(e => e.ids.slice(0, Math.min(5, e.ids.length)).join(", ")).join("\n");
        let lvls    = local_deleted.map(e => e.enchant).join("\n");
        questions = [
            {
                question: {
                    content: removed.QUESTION_2(local_deleted.length),
                    embed: {
                        color: "#2f3136",
                        title: removed.QUESTION_2_EMBED.TITLE,
                        fields: [
                            { name: removed.QUESTION_2_EMBED.FIELDS.NUM, value: nums, inline: true},
                            { name: removed.QUESTION_2_EMBED.FIELDS.ID, value: items, inline: true},
                            { name: removed.QUESTION_2_EMBED.FIELDS.LVL, value: lvls, inline: true},
                        ]
                    }
                },
                before: () => {
                    
                },
                after: (msg) => {
                    let local_index = parseInt(msg.content) || -1;
                    if (local_index === -1) {
                        return { error: removed.ERROR_2 };
                    }
                    try {
                        let index = local_config.items.indexOf(local_deleted[local_index-1]);
                        if (index !== -1) {
                            local_config.items.splice(index, 1);
                        }
                        let save = client.setConfig(message.guild, local_config);
                        if (!save) return { error: lang.global.ERROR }
                        return { message: removed.SUCCESS };
                    } catch (e) {
                        printError(error_here, e.message);
                        return { error: lang.global.ERROR };
                    }
                }
            }            
        ]
        await sendQuestions(message, questions, 240000, lang);                    
    }
    else if (local_deleted.length == 1) {
        try {
            let index = local_config.items.indexOf(local_deleted[0]);
            if (index !== -1) {
                local_config.items.splice(index, 1);
            }
            let save = client.setConfig(message.guild, local_config);
            if (!save) return { error: lang.global.ERROR }
            return message.channel.send(removed.SUCCESS);
        } catch (e) {
            message.channel.send(lang.global.ERROR);
            return printError(error_here, e.message);
        }                        
    }
    else return message.channel.send(removed.ERROR_3);
}

function addTracked(client, message, lang) {
    const add = lang.cmd.ADD;
    var local_config = client.getConfig(message.guild);
    if ((local_config.items.length >= 5) && !local_config.premium) {
        return message.channel.send(add.LIMITE_ERROR);
    }
    var new_item = {
        role: "",
        enchant: 0,
        ids: []
    }
    var questions = [
        {
            question: add.QUESTION_1,
            before: () => {

            },
            after: (msg) => {
                let role = msg.mentions.roles.first() || msg.guild.roles.cache.find(role => role.id === msg.content);
                if (!role) {
                    return { error: add.ERROR_1 };
                }
                return new_item.role = role.id;
            }
        },
        {
            question: add.QUESTION_2,
            before: () => {

            },
            after: (msg) => {
                let local_id = msg.content.replace(/\D/gm, " ").replace(/\s\s+/g, " ").split(" ");
                return new_item.ids = local_id.map(e => parseInt(e));
            }
        },
        {
            question: add.QUESTION_3,
            before: () => {

            },
            after: (msg) => {
                let enchant = parseInt(msg.content) || { error: add.ERROR_3 };
                if (enchant.message) return enchant;
                return new_item.enchant = enchant;
            }
        },
        {
            question: add.QUESTION_4,
            before: () => {
                return { message: "```json\n"+JSON.stringify(new_item, null, 2)+"```" }
            },
            after: (msg) => {
                if (msg.content.toLowerCase() === "y" || msg.content.toLowerCase() === "yes" || msg.content.toLowerCase() === "да") {
                    try {
                        local_config.items.push(new_item);
                        let save = client.setConfig(message.guild, local_config);
                        if (!save) return { error: lang.global.ERROR }
                        return { message: add.SUCCESS }
                    } catch (e) {
                        printError(error_here, e.message);
                        return { error: lang.global.ERROR }
                    }
                } else {
                    return { error: lang.global.CANCEL }
                }                
            }
        },
    ];
    sendQuestions(message, questions, 240000, lang);
}

async function sendQuestions(message, questions, timeout, lang) {
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
            return message.channel.send(lang.global.TIMEOUT);
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
    description: (lang) => { return lang.cmd.DESCRIPTION },
    usage: "<add | remove>",
    run: (client, message, args, lang) => {

        if (!message.member.hasPermission("ADMINISTRATOR"))
            return message.reply(lang.global.DONT_HAVE_PERMISSIONS);

        var local_config = client.getConfig(message.guild);

        if (!local_config)
            return message.reply(lang.cmd.DONT_HAVE_CONFIG);

        if (args.length <= 0) return getAllTracked(client, message, lang);

		args = args.map(e => e.toLowerCase());
        if (args[0] === "add") {
            addTracked(client, message, lang);
        } else if (args[0] === "remove" || args[0] === "rm") {
            removeTracked(client, message, lang);
        } 
        else {
            return;
        }
    }
}
