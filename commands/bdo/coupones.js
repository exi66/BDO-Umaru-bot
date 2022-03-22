const { printError } = require("../../functions.js");
const fs = require("fs");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = {
    name: "coupones",
	category: "bdo",
    aliases: ["c", "coupon", "cupon"],
    description: "Выдает доступные купоны с Орбиты Игр",
    run: (client, message, args, config) => {
		try {
			var coupons_list = [];
			try {
				coupons_list = JSON.parse(fs.readFileSync(config.coupons_folder, "utf8"));
			} catch (e) {
				printError(error_here, e.message);
			}
			if (coupons_list.length > 0) {
				let codes = coupons_list.map(e => "`" + e + "`").join("\n");
				try {
					message.channel.send({
						embed: {
							color: "#2f3136",
							title: "Купоны",
							url: "https://orbit-games.com/",
							timestamp: new Date(),
							description: codes
						}
					});
				} catch (e) {
					printError(error_here, e.message);
				}						
			} else return message.reply("нет доступных купонов");
		}
		catch (e) {
			printError(error_here, e.message);
			return message.reply("непредвиденная ошибка! Попробуйте позже.");
		};		
    }
}
