module.exports = {
    name: "about",
	category: "info",
    description: "Информация о боте",
    run: async (client, message, args) => {
        message.channel.send({
			embed: {
				color: "#2f3136",
				title: "О проекте",
				description: "Простой бот на Discord.js с фукнциями для проекта [BDO](https://www.ru.playblackdesert.com/main/index)\n[Github](https://github.com/exi66/BDO-Umaru-bot)\n[Telegram](https://t.me/exi666)\nDiscord: `Exi#5604`"
			}
		});
    }
}
