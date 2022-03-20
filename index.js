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
	checkAndRemove();
});
client.on("guildCreate", guild => {
    print_e(`Joined a new guild: ${guild.name}`);
	client.user.setActivity(`${client.guilds.cache.size} ${declOfNum(client.guilds.cache.size, ["сервер", "сервера", "серверов"])} • ${config.prefix}help`, { type: 'PLAYING' });
	checkAndRemove();
})
client.on("guildDelete", guild => {
    print_e(`Left a guild: ${guild.name}`);
	client.user.setActivity(`${client.guilds.cache.size} ${declOfNum(client.guilds.cache.size, ["сервер", "сервера", "серверов"])} • ${config.prefix}help`, { type: 'PLAYING' });
	checkAndRemove();
})
client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.content.startsWith(config.prefix)) {
		const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
		const cmd = args.shift().toLowerCase();
		if (cmd.length === 0) return;
		let command = client.commands.get(cmd);
		if (!command) command = client.commands.get(client.aliases.get(cmd));
		if (command) command.run(client, message, args, config);		
	}		
	else if (message.mentions.has(client.user.id)) {
		const args = message.content.replace(/<@.?[0-9]*?>/g, "").trim().split(/ +/g);
		const cmd = args.shift().toLowerCase();
		if (cmd.length === 0) return;
		let command = client.commands.get(cmd);
		if (!command) command = client.commands.get(client.aliases.get(cmd));
		if (command) command.run(client, message, args, config);
	} else return;
});
client.login(config.token);
var configurations_list = [];
try {
	configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder, "utf8"));
} catch (err) {
	print_e("[ERROR/Read_servers]" + err.message);
}
var coupons_list = [];
try {
	coupons_list = JSON.parse(fs.readFileSync(config.coupons_folder, "utf8"));
} catch (err) {
	print_e("[ERROR/Read_coupons]" + err.message);
}	

function checkAndRemove() {
	if (configurations_list.length < 1) return;
	let guilds = client.guilds.cache.map(guild => guild.id);
	for (let i = 0; i < configurations_list.length; i++) {
		if (!guilds.includes(configurations_list[i].guild)) {
			print_e("[checkAndRemove] found removed guild: "+configurations_list[i].guild);
			configurations_list.splice(i, 1);
		}
	}
	fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
		if (err) return print_e(err);
	});	
}

//main cycle
setInterval(function() {
	try {
		configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder, "utf8"));
	} catch (err) {
		print_e("[ERROR/read_servers]" + err.message);
	}
	try {
		coupons_list = JSON.parse(fs.readFileSync(config.coupons_folder, "utf8"));
	} catch (err) {
		print_e("[ERROR/read_coupons]" + err.message);
	}	
	try {
		if (configurations_list.length > 0) {
			if (config.coupons) {	
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
						let search = div[0].match(/\(?[a-zA-Z0-9]{4}\)?-?[a-zA-Z0-9]{4}?-?[a-zA-Z0-9]{4}-?[a-zA-Z0-9]{4}/gm);
						if (!search) return print_e("[ERROR/coupones.js] div with coupones not found, need to edit regex");
						let all_coupones_list = [], new_coupones_list = [];
						for (let c of search) {
							if (!all_coupones_list.includes(c.toUpperCase())) all_coupones_list.push(c.toUpperCase());
							if (!coupons_list.includes(c.toUpperCase())) new_coupones_list.push(c.toUpperCase());
						}							
						if (new_coupones_list.length > 0) {
							fs.writeFile(config.coupons_folder, JSON.stringify(all_coupones_list, null, 4), function (err) {
								if (err) return print_e("[ERROR/Orbit_games]: Cannot save all coupones, "+err.message);
							});
							let codes = coupons_list.map(e => "`" + e + "`").join("\n");
							let coupons_configurations_list = configurations_list.filter(e => e.coupons.trim());
							for (let local_guild of coupons_configurations_list) {						
								try {
									let local_channel = client.channels.cache.get(local_guild.coupons);
									if (local_channel) local_channel.send({
										content: `<@&${local_guild["coupons-role"]}>`,
										embed: {
											color: "#2f3136",
											title: "Купоны",
											url: "https://orbit-games.com/",
											timestamp: new Date(),
											description: codes
										}
									});
								} catch (e) {
									print_e("[ERROR/Orbit_games]: Cannot send new coupones, "+e.message);
								}
							}							
						}
					}
				}).catch(function(e) { print_e("[ERROR/Orbit_games]: Request error, "+e.message) });
			}
			if (config.queue) {					
				request({
					method: "GET",
					url: "http://veliainn.com/api/market-queue/ru",
					headers: {
						"User-Agent": "BDO-Umaru-bot https://github.com/exi66/BDO-Umaru-bot"
					}
				}).then(body => {
					if (body !== "" && body != null) {
						let data = JSON.parse(body);
						fs.writeFile(config.queue_folder, JSON.stringify(data, null, 4), function (err) {
							if (err) return print_e("[ERROR/Queue]: Cannot save queue, "+err.message);
						});
						let items = data["items"];
						//let lastupdate = data["lastUpdate"];
						if (items.length > 0) {
							let queue_configurations_list = configurations_list.filter(e => e.queue.trim());
							for (let local_guild of queue_configurations_list) {
								let important_items_list = [], mentions = "", names = "", lvls = "", times = "";								
								for (let local_items of local_guild["items"]) {
									for (let item of items) {		
										if(local_items["ids"].includes(parseInt(item[0])) && item[1] == local_items["enchant"]) {
											important_items_list.push(item);
											if (!mentions.includes(local_items["role"])) mentions += `<@&${local_items["role"]}>`;
											lvls += item[1]+"\n";
											names += item[4]+"\n";
											let date = new Date(item[3] * 1000);
											let hours = date.getHours();
											let minutes = "0" + date.getMinutes();
											let seconds = "0" + date.getSeconds();
											times += `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}\n`;													
										}										
									}
								}
								if (important_items_list.length > 0) {						
									try {
										let local_channel = client.channels.cache.get(local_guild["queue"]);
										if (local_channel) local_channel.send({
											content: mentions,
											embed: {
												color: "#2f3136",
												title: "Очередь аукциона",
												timestamp: new Date(),
												fields: [
													{ name: "lvl", value: lvls, inline: true},
													{ name: "Название", value: names, inline: true},
													{ name: "Время", value: times, inline: true}
												]
											}
										});
									} catch (e) {
										print_e("[ERROR/Queue]: Cannot send queue, "+e.message);
									}									
								}
							}							
						}
					}
				}).catch(function(e) { print_e("[ERROR/Queue]: Request error, "+e.message); });
			}
		}
	} catch (e) {
		print_e("[ERROR/App]: General try-catch error, "+e.message);
	}
}, config.debug ? 10*1000 : 5*60*1000);
