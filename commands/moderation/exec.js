module.exports = {
    name: "exec",
	category: "moderation",
    aliases: ["e", "exe", "eval"],
    description: "Execute command",
    usage: "<cmd>",
    run: (client, message, args, config) => {
        if (!(message.author.id == config.root))
            return message.reply("у вас нет прав использовать эту команду.").then(m => m.delete({ timeout: 10000 }));

        if (args.length <= 0)
            return message.reply("нет команды").then(m => m.delete({ timeout: 10000 }));

        try {
            eval(args.join(" "));
        } catch (e) {
            return message.channel.send("Error: \n```"+e.message+"```");
        }
    }
}