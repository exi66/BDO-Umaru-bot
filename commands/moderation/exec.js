module.exports = {
    name: "exec",
	category: "moderation",
    aliases: ["e", "exe", "eval"],
    description: (lang) => { return lang.cmd.DESCRIPTION },
    usage: "<cmd>",
    run: (client, message, args, lang) => {
        if (!(message.author.id == client.umaru.root))
            return message.reply(lang.global.DONT_HAVE_PERMISSIONS);

        if (args.length <= 0)
            return message.reply(lang.global.DONT_HAVE_ARGS);

        try {
            eval(args.join(" "));
        } catch (e) {
            return message.channel.send("Error: \n```"+e.message+"```");
        }
    }
}
