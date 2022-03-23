const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "help",
    category: "info",
	aliases: ["h"],
    description: (lang) => { return lang.cmd.DESCRIPTION },
    usage: "[command | alias]",
    run: async (client, message, args, lang) => {
        if (args[0]) {
            return getCMD(client, message, args[0], lang);
        } else {
            return getAll(client, message);
        }
    }
}

function getAll(client, message) {
    const embed = new MessageEmbed()
        .setColor("#2f3136")

    const commands = (category) => {
        return client.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `• \`${cmd.name}\``)
            .join("\n");
    }

    const info = client.categories
        .map(cat => stripIndents`**${cat[0].toUpperCase() + cat.slice(1)}** \n${commands(cat)}`)
        .reduce((string, category) => string + "\n" + category);

    return message.channel.send(embed.setDescription(info));
}

function getCMD(client, message, input, lang) {
    const embed = new MessageEmbed()

    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));
    
    let info = lang.cmd.INFO_EMPTY(input.toLowerCase());

    if (!cmd) {
        return message.channel.send(info);
    }

    if (cmd.name) info = lang.cmd.EMBED.INFO_NAME(cmd.name);
    if (cmd.aliases) info += lang.cmd.EMBED.INFO_ALIASES(cmd.aliases.map(a => `\`${a}\``).join(", "));
    if (cmd.description && cmd.name) {
        let local_lang = { cmd: client.languages.get(lang.name)[cmd.name.toUpperCase()] };
        info += lang.cmd.EMBED.INFO_DESCRIPTION(cmd.description(local_lang));
    }
    if (cmd.usage) {
        info += lang.cmd.EMBED.INFO_USAGE(cmd.usage);
        embed.setFooter(lang.cmd.EMBED.FOOTER);
    }

    return message.channel.send(embed.setColor("#2f3136").setDescription(info));
}
