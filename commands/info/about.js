module.exports = {
    name: "about",
	category: "info",
    run: async (client, message, args, lang) => {
        message.channel.send({
			embed: {
				color: "#2f3136",
				title: lang.cmd.EMBED.TITLE,
				description: lang.cmd.EMBED.DESCRIPTION
			}
		});
    }
}
