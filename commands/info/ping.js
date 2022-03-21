module.exports = {
    name: "ping",
	category: "info",
    description: "Возвращает задержку",
    run: async (client, message, args) => {
        const msg = await message.channel.send(`Pinging....`);

        msg.edit(`🏓 Pong!
        Задержка ${Math.floor(msg.createdAt - message.createdAt)}ms
        Задержка API ${Math.round(client.ws.ping)}ms`);
    }
}
