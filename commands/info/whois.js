const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { getMember, formatDate } = require("../../functions.js");

module.exports = {
    name: "whois",
	category: "info",
    aliases: ["who", "user", "info"],
    description: (lang) => { return lang.cmd.DESCRIPTION },
    usage: "[username | id | mention]",
    run: (client, message, args, lang) => {
        const member = getMember(message, args.join(" "));

        // Member variables
        const joined = formatDate(member.joinedAt);
        const roles = member.roles.cache
            .filter(r => r.id !== message.guild.id)
            .map(r => r).join(", ") || "none";

        // User variables
        const created = formatDate(member.user.createdAt);

        const embed = new MessageEmbed()
            .setFooter(member.displayName, member.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL({size: 2048}))
            .setColor(member.displayHexColor === "#000000" ? "#2f3136" : member.displayHexColor)

            .addField(lang.cmd.EMBED.FIELDS.INFO, stripIndents(lang.cmd.EMBED.FIELDS.INFO_DESCRIPTION(member.displayName, joined, roles)), true)

            .addField(lang.cmd.EMBED.FIELDS.USER, stripIndents(lang.cmd.EMBED.FIELDS.USER_DESCRIPTION(member.user.id, member.user.username, member.user.tag, created)), true)
            
            .setTimestamp()

        return message.channel.send(embed);
    }
}
