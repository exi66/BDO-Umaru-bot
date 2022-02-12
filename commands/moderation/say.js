const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "say",
	category: "moderation",
    aliases: ["bc", "broadcast"],
    description: "Бот говорит за вас.",
    usage: "<input>",
    run: (client, message, args) => {
        message.delete();

        if (!message.member.hasPermission("MANAGE_MESSAGES"))
            return message.reply("у вас нет прав использовать эту команду.").then(m => m.delete({ timeout: 10000 }));

        if (args.length <= 0)
            return message.reply("нечего сказать?").then(m => m.delete({ timeout: 10000 }));

        const roleColor = message.guild.me.displayColor;

        if (args[0].toLowerCase() === "embed") {
            const embed = new MessageEmbed()
                .setDescription(args.slice(1).join(" "))
                .setColor(roleColor === "#000000" ? "#ffffff" : roleColor);

            message.channel.send(embed);
        } else {
            message.channel.send(args.join(" "));
        }
    }
}