module.exports = {
    name: "guild",
	category: "info",
    description: (lang) => { return lang.cmd.DESCRIPTION },
    run: async (client, message, args) => {
        return message.channel.send("ID: `"+message.guild.id+"`");
    }
}
