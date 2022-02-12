module.exports = {
    name: "about",
	category: "info",
    description: "Информация о боте.",
    run: async (client, message, args) => {
		let em = {embed: {
			color: 9807270,
			title: "О проекте",
			description: "Простой бот на Discord.js с фукнциями для проекта [BDO](https://www.ru.playblackdesert.com/main/index)\n[Github](https://github.com/exi66/BDO-Umaru-bot)\n[Telegram](https://t.me/exi666)\nDiscord: `Exi#5604`"
		}};
        message.channel.send(em);
    }
}
