const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "say",
	category: "moderation",
    aliases: ["bc", "broadcast"],
    description: (lang) => { return lang.cmd.DESCRIPTION },
    usage: "[embed] <message>",
    run: (client, message, args, lang) => {
        if (!message.member.hasPermission("MANAGE_MESSAGES"))
            return message.reply(lang.global.DONT_HAVE_PERMISSIONS);
        
        message.delete();

        if (args.length <= 0)
            return message.reply(lang.global.DONT_HAVE_ARGS);

        const roleColor = message.guild.me.displayColor;

        if (args[0].toLowerCase() === "embed") {
            const embed = new MessageEmbed()
                .setDescription(args.slice(1).join(" "))
                .setColor(roleColor === "#000000" ? "#2f3136" : roleColor);

            message.channel.send(embed);
        } else {
            message.channel.send(args.join(" "));
        }
    }
}
