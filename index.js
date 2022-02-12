const { Client, Collection } = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const request = require("request-promise-native");
const { print_e, declOfNum } = require("./functions.js");

const client = new Client({
    disableEveryone: true
});
client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");
["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on("ready", () => {
    print_e(`${client.user.username} is now online!`);
	client.user.setActivity(`${client.guilds.cache.size} ${declOfNum(client.guilds.cache.size, ["сервер", "сервера", "серверов"])} • ${config.prefix}help`, { type: 'PLAYING' });
});

client.on("guildCreate", guild => {
    print_e(`Joined a new guild: ${guild.name}`);
	client.user.setActivity(`${client.guilds.cache.size} ${declOfNum(client.guilds.cache.size, ["сервер", "сервера", "серверов"])} • ${config.prefix}help`, { type: 'PLAYING' });
})

client.on("guildDelete", guild => {
    print_e(`Left a guild: ${guild.name}`);
	client.user.setActivity(`${client.guilds.cache.size} ${declOfNum(client.guilds.cache.size, ["сервер", "сервера", "серверов"])} • ${config.prefix}help`, { type: 'PLAYING' });
})

client.on("message", async message => {

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(config.prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    
    if (cmd.length === 0) return;
    
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) command.run(client, message, args, config);
});

client.login(config.token);

let configurations_list = [];
let coupons_list = [];
fs.readFile(config.servers_configs_folder, (err, data) => {
	if (err) print_e("[ERROR/Read_servers_configs]" + err.message);
	configurations_list = JSON.parse(data);
});	
fs.readFile(config.coupons_folder, (err, data) => {
	if (err) print_e("[ERROR/Read_servers_configs]" + err.message);
	coupons_list = JSON.parse(data);
});

function containsCupons(obj, list) {
    for (let i = 0; i < list.length; i++) {
        if (list[i].code == obj.code) {
            return true;
        }
    }
    return false;
}

setInterval(function() {
	fs.readFile(config.servers_configs_folder, (err, data) => {
		if (err) return print_e("[ERROR/Read_servers_configs]" + err.message);
		configurations_list = JSON.parse(data);
	});	
	fs.readFile(config.coupons_folder, (err, data) => {
		if (err) return print_e("[ERROR/Read_coupons]" + err.message);
		coupons_list = JSON.parse(data);
	});		
	try {
		if (configurations_list.length > 0) {
			request({
				method: "GET",
				url: "https://orbit-games.com/",
				headers: {
					"User-Agent": "BDO-Umaru-bot https://github.com/exi66/BDO-Umaru-bot"
				}
			}).then(body => {
				//console.log(body);
				if (body !== "" && body != null) {	
					let div = body.match(/<([^\s]+).*?id="text-15".*?>(.+?)<\/\1>/g);
					let search = div[0].match(/(<p>|<strong>)([^<]*)(<\/p>|<\/strong>)/g);
					let first, last;
					for (let i = 0; i < search.length; i++) {
						if (search[i] == "<strong>Промокоды BDO (КУПОНЫ)</strong>") first = i+1;
						if (search[i] == "<strong>Как использовать промокод BDO (жми)</strong>") last = i;
					}
					if (!last || !first) return print_e("[ERROR/Orbit_games] div with coupones not found, need to edit regex");
					let all_coupones_list = [], new_coupones_list = [];
					for (let i = first; i<last; i+=2) {
						let loc_coupon = {
							"date" : search[i].replace(/<[^>]*>?/gm, ""),
							"code" : search[i+1].replace(/<[^>]*>?/gm, "")
						}
						all_coupones_list.push(loc_coupon);
						if (!containsCupons(loc_coupon, coupons_list)) new_coupones_list.push(loc_coupon);
					}							
					if (new_coupones_list.length > 0) {
						fs.writeFile(config.coupons_folder, JSON.stringify(all_coupones_list, null, 4), function (err) {
							if (err) return print_e("[ERROR/Orbit_games]: Cannot save all coupones, "+err.message);
						});
						let codes = "", times = "";
						for (let c of new_coupones_list) {
							codes += c.code+"\n";
							times += c.date+"\n";
						}
						for (let local_guilds of configurations_list) {
							let em = {
								content: `<@&${local_guilds["coupons-role"]}>`,
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
								let local_channel = client.channels.cache.get(local_guilds["coupons"]);
								if (local_channel) local_channel.send(em);
							} catch (e) {
								print_e("[ERROR/Orbit_games]: Cannot send new coupones, "+e.message);
							}
						}							
					}
				}
			}).catch(function(e) { print_e("[ERROR/Orbit_games]: Request error, "+e.message) });						
			request({
				method: "GET",
				url: "http://veliainn.com/api/market-queue/ru",
				headers: {
					"User-Agent": "BDO-Umaru-bot https://github.com/exi66/BDO-Umaru-bot"
				}
			}).then(body => {
				if (body !== "" && body != null) {
					let data = JSON.parse(body);
					let items = data["items"];
					//let lastupdate = data["lastUpdate"];
					if (items.length > 0) {
						for (let local_guilds of configurations_list) {
							let important_items_list = [], mentions = "", names = "", lvls = "", times = "";								
							for (let local_items of local_guilds["items"]) {
								for (let item of items) {								
									for (let local_id of local_items["ids"]) {
										if (item[0] == local_id && item[1] == local_items["enchant"]) {
											important_items_list.push(item);
											if (!mentions.includes(local_items["role"])) mentions += `<@&${local_items["role"]}>`;
											lvls += item[1]+"\n";
											names += item[4]+"\n";
											var date = new Date(item[3] * 1000);
											var hours = date.getHours();
											var minutes = "0" + date.getMinutes();
											var seconds = "0" + date.getSeconds();
											times += `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}\n`;													
										}
									}										
								}
							}
							if (important_items_list.length > 0) {
								let em = {
									content: mentions,
									embed: {
										color: 15105570,
										title: "Очередь аукциона",
										timestamp: new Date(),
										fields: [
											{ name: "lvl", value: lvls, inline: true},
											{ name: "Название", value: names, inline: true},
											{ name: "Время", value: times, inline: true}
										]
									}
								};							
								try {
									let local_channel = client.channels.cache.get(local_guilds["queue"]);
									if (local_channel) local_channel.send(em);
								} catch (e) {
									print_e("[ERROR/Queue]: Cannot send queue, "+e.message);
								}									
							}
						}							
					}
				}
			}).catch(function(e) { print_e("[ERROR/Queue]: Request error, "+e.message); });
		}
	} catch (e) {
		print_e("[ERROR/App]: General try-catch error, "+e.message);
	}
}, 5*60*1000);