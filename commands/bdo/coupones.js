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
				let search = div[0].match(/(<p>|<strong>)([^<]*)(<\/p>|<\/strong>)/g);
				let first, last;
				for (let i = 0; i < search.length; i++) {
					if (search[i] == "<strong>Промокоды BDO (КУПОНЫ)</strong>") first = i+1;
					if (search[i] == "<strong>Как использовать промокод BDO (жми)</strong>") last = i;
				}
				if (!last || !first) return print_e("[ERROR/coupones.js] div with coupones not found, need to edit regex");
				let all_coupones_list = [];
				for (let i = first; i<last; i+=2) {
					let coupon = {
						"date" : search[i].replace(/<[^>]*>?/gm, ''),
						"code" : search[i+1].replace(/<[^>]*>?/gm, '')
					}
					all_coupones_list.push(coupon);
				}
				if (all_coupones_list.length > 0) {
					let codes = "", times = "";
					for (let c of all_coupones_list) {
						codes+= c.code+"\n";
						times+= c.date+"\n";
					}
					let em = {
						embed: {
							color: 15105570,
							title: "Купоны",
							timestamp: new Date(),
							fields: [
								{ name: "Код", value: codes, inline: true},
								{ name: "Время действия", value: times, inline: true}												
							]
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