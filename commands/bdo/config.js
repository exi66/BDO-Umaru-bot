const { printError } = require("../../functions.js");
const { MessageAttachment } = require('discord.js')

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = {
    name: "config",
	category: "bdo",
    aliases: ["conf"],
    description: (lang) => { return lang.cmd.DESCRIPTION },
    usage: "<edit> <key> <value> | [json]",
    run: async(client, message, args, lang) => {
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            return message.reply(lang.global.DONT_HAVE_PERMISSIONS);
        }
        var local_config = client.getConfig(message.guild);
        var config = client.umaru;
        if (!local_config) {
            return message.reply(lang.cmd.DONT_HAVE_CONFIG);
        }
        if (args.length <= 0) {
            return message.channel.send({
                embed: {
                    color: "#2f3136",
                    title: lang.cmd.EMBED.TITLE,
                    description: `guild: \`${message.guild.id}\`\nlang: \`${local_config.lang}\`\nregion: \`${local_config.region}\`\npremium: \`${local_config.premium}\`\ncategory: \`${local_config.category || " "}\`\nqueue: \`${local_config.queue || " "}\`\ncoupons: \`${local_config.coupons || " "}\`\ncoupons_role: \`${local_config.coupons_role || " "}\``
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
                case "lang":
                    let langs = Array.from(client.languages.keys());
                    local_config.lang = langs.includes(args[2]) ? args[2] : config.default_lang;
                    break;
                case "region":
                    let regions = client.umaru.regions;
                    local_config.region = regions.includes(args[2]) ? args[2] : config.default_region;
                    break;                            
                default:
                    return message.channel.send(lang.cmd.EDIT_AND_SAVE);
            }
            let save = client.setConfig(message.guild, local_config);
            if (!save) return message.channel.send(lang.global.ERROR);
            return message.channel.send(lang.cmd.EDIT_AND_SAVE);
        } else if(args[0] === "json") {
            let buffer = Buffer.from(JSON.stringify(local_config, null, 4));
            let attachment = new MessageAttachment(buffer, 'config.json');
            return message.channel.send(attachment);
        } else {
            return;
        }
    }
}
