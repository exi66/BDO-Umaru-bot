const { print_e } = require("../../functions.js");
const fs = require("fs");

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
			} catch (err) {
				print_e("[ERROR/coupones.js]" + err.message);
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
