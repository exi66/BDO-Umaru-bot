const request = require("request-promise-native");
const { print_e } = require("../../functions.js");

module.exports = {
    name: "coupones",
	category: "bdo",
    aliases: ["c", "coupon", "cupon"],
    description: "Выдает доступные купоны с Орбиты Игр",
    usage: "<input>",
    run: (client, message, args, config) => {
        message.delete();
		request({
			method: "GET",
			url: "https://orbit-games.com/",
			headers: {
				"User-Agent": "BDO-Umaru-bot https://github.com/exi66/BDO-Umaru-bot"
			}
		}).then(body => {
			//console.log(body);
			if (body !== '' && body != null) {	
				let div = body.match(/<([^\s]+).*?id="text-15".*?>(.+?)<\/\1>/g);
				let search = div[0].match(/\(?[a-zA-Z0-9]{4}\)?-?[a-zA-Z0-9]{4}?-?[a-zA-Z0-9]{4}-?[a-zA-Z0-9]{4}/gm);
				if (!search) return print_e("[ERROR/coupones.js] div with coupones not found, need to edit regex");
				let all_coupones_list = [];
				for (let c of search) {
					if (!all_coupones_list.includes(c.toUpperCase())) all_coupones_list.push(c.toUpperCase());
				}
				if (all_coupones_list.length > 0) {
					let codes = "";
					for (let c of all_coupones_list) {
						codes += "`"+c+"`\n";
					}
					let em = {
						embed: {
							color: 15105570,
							title: "Купоны",
							timestamp: new Date(),
							description: codes
						}
					};	
					try {
						message.channel.send(em);
					} catch (e) {
						print_e("[ERROR/coupones.js]: "+e.message);
					}						
				} else return message.reply("нет доступных купонов(").then(m => m.delete({ timeout: 10000 }))	
			}
		}).catch(function(e){print_e("[ERROR/coupones.js]: "+e.message)});		
    }
}
