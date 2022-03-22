const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { getMember, formatDate } = require("../../functions.js");

module.exports = {
    name: "whois",
	category: "info",
    aliases: ["who", "user", "info"],
    description: "Возвращает информацию о пользователе",
    usage: "[username | id | mention]",
    run: (client, message, args) => {
        const member = getMember(message, args.join(" "));

        // Member variables
        const joined = formatDate(member.joinedAt);
        const roles = member.roles.cache
            .filter(r => r.id !== message.guild.id)
            .map(r => r).join(", ") || 'none';

        // User variables
        const created = formatDate(member.user.createdAt);

        const embed = new MessageEmbed()
            .setFooter(member.displayName, member.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL({size: 2048}))
            .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)

            .addField('Информация:', stripIndents`**> Никнейм:** ${member.displayName}
            **> Дата подключения:** ${joined}
            **> Роли:** ${roles}`, true)

            .addField('Пользователь:', stripIndents`**> ID:** ${member.user.id}
            **> Имя:** ${member.user.username}
            **> Тэг:** ${member.user.tag}
            **> Регистрация:** ${created}`, true)
            
            .setTimestamp()

        if (member.user.presence.game) 
            embed.addField('В игре', stripIndents`**> Название:** ${member.user.presence.game.name}`);

        return message.channel.send(embed);
    }
}
