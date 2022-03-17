const request = require("request-promise-native");
const { print_e } = require("../../functions.js");
const fs = require("fs");

module.exports = {
    name: "coupones",
	category: "bdo",
    aliases: ["c", "coupon", "cupon"],
    description: "Выдает доступные купоны с Орбиты Игр",
    usage: "<input>",
    run: (client, message, args, config) => {
        message.delete();
		try {
			let coupons_list = JSON.parse(fs.readFileSync(config.coupons_folder));
			if (coupons_list.length > 0) {
				let codes = coupons_list.map(e => "`" + e + "`").join("\n");
				try {
					message.channel.send({
						embed: {
							color: 15105570,
							title: "Купоны",
							timestamp: new Date(),
							description: codes
						}
					});
				} catch (e) {
					print_e("[ERROR/coupones.js]: "+e.message);
				}						
			} else return message.reply("нет доступных купонов(").then(m => m.delete({ timeout: 10000 }))	
		}
		catch (e) {
			print_e("[ERROR/coupones.js]: "+e.message)
			return message.reply("непредвиденная ошибка! Попробуйте позже.").then(m => m.delete({ timeout: 10000 }))
		};		
    }
}
