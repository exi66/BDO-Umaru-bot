module.exports = {
    name: "ping",
	category: "info",
    run: async (client, message, args, lang) => {
        const msg = await message.channel.send(`Pinging....`);

        msg.edit(`🏓 Pong!
        ${lang.cmd.PING} ${Math.floor(msg.createdAt - message.createdAt)}ms
        ${lang.cmd.PING} API ${Math.round(client.ws.ping)}ms`);
    }
}
