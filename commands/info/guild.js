module.exports = {
    name: "guild",
	category: "info",
    description: "Возвращает id сервера.",
    run: async (client, message, args) => {
        return message.channel.send("ID: `"+message.guild.id+"`").then(m => m.delete({ timeout: 10000 }));
    }
}
