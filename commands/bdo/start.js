const fs = require("fs");

module.exports = {
    name: "start",
	category: "bdo",
    description: "Быстрое начало работы",
    run: async(client, message, args, config) => {
		var all_messages = [];
		all_messages.push(message);

        if (!message.member.hasPermission("ADMINISTRATOR")) {
			all_messages.forEach(e => e.delete({ timeout: 10000 }));
			return message.reply("у вас нет прав использовать эту команду.").then(m => m.delete({ timeout: 10000 }));
		}

        var configurations_list = [];
		try {
			configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder, "utf8"));
		} catch (err) {
			print_e("[ERROR/start.js]" + err.message);
		}
		var filter = m => m.author.id === message.author.id;

		function save(config, configurations_list, local_config) {
			let flag = false;
			for (let i = 0; i < configurations_list.length; i++) {
				if (configurations_list[i].guild == local_config.guild) {
					configurations_list[i] = local_config;
					flag = true;
				}
			}
			if (!flag) configurations_list.push(local_config);
			fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
				if (err) {
					all_messages.forEach(e => e.delete({ timeout: 10000 }));
					message.channel.send("Ошибка!").then(m => m.delete({ timeout: 10000 }));
					return print_e(err);
				}
			});		
		}
		
		message.channel.send(`Автоматическая настройка создаст категорию, два канала в ней и базовые роли для отслеживания купонов и редких предметов. В случае отказа будет создан шаблон конфига без каких-либо параметров, который можно настроить командой \`${config.prefix}config\`. Хотите ли вы произвести автоматическую настройку? (Да/Нет)`).then(m => {
			all_messages.push(m);
			message.channel.awaitMessages(filter, {
				max: 1,
				time: 240000,
				errors: ["time"]
			}).then(async _message => {
				all_messages.push(_message.first());
				let local_message = _message.first();
				if (local_message.content.toLowerCase() === "y" || local_message.content.toLowerCase() === "yes" || local_message.content.toLowerCase() === "да") {
					var local_config = {
						"guild": message.guild.id,
						"premium": false,
						"category": "",
						"queue": "",
						"coupons": "",
						"coupons-role": "",
						"items": []
					}
					await message.guild.roles.create({
						data: {
							name: "Купоны",
							color: "#9b59b6",
						},
						reason: "Роль для упоминания при публикации купонов",
					}).then(role => {
						local_config["coupons-role"] = role.id;					
					});	
					await message.guild.roles.create({
						data: {
							name: "V: БС",
							color: "#bf0000",
							mentionable: true,
						},
						reason: "Роль для упоминания при продаже V бс",
					}).then(role => {
						local_config["items"].push({
							"role": role.id,
							"enchant": 20,
							"ids" : [
								731114,
								731109,
								731117,
								731106,
								731102,
								731113,
								731116,
								731107,
								731101,
								731108,
								731103,
								731104,
								731111,
								731112,
								731115,
								731110,
								731105,
								731118,
								731119,
								731120,
								731121,
								731122,
								715001,
								715003,
								715005,
								715007,
								715009,
								715011,
								715013,
								715016,
								715017,
								715019,
								715021,
								718616,
								690563,
								692045,
								730564,
								732313,
								733063
							]						
						});				
					});	
					await message.guild.roles.create({
						data: {
							name: "V: Бижутерия Маноса",
							color: "#398e55",
							mentionable: true,
						},
						reason: "Роль для упоминания при продаже V бижутерии маноса",
					}).then(role => {
						local_config["items"].push({
							"role": role.id,
							"enchant": 5,
							"ids":	[
								705510,
								705512,
								705509,
								705511
							]
						});				
					});	
					await message.guild.roles.create({
						data: {
							name: "IV: Бижутерия Деборики",
							color: "#c09c3f",
							mentionable: true,
						},
						reason: "Роль для упоминания при продаже IV бижутерии деборики",
					}).then(role => {
						local_config["items"].push({
							"role": role.id,
							"enchant": 4,
							"ids":	[
								11653,
								12276
							]		
						});				
					});
					await message.guild.roles.create({
						data: {
							name: "V: Бижутерия Деборики",
							color: "#ffce53",
							mentionable: true,
						},
						reason: "Роль для упоминания при продаже V бижутерии деборики",
					}).then(role => {
						local_config["items"].push({
							"role": role.id,
							"enchant": 5,
							"ids":	[
								11653,
								12276
							]		
						});				
					});
					await message.guild.channels.create("bdo-umaru", {
						type: "category",
						permissionOverwrites: [
							{
								id: message.guild.id,
								allow: ["VIEW_CHANNEL"],
							}]
					}).then(cat => {
						local_config.category = cat.id;
						message.guild.channels.create("queue", {
							type: "text",
							parent: cat,
							permissionOverwrites: [
								{
									id: message.guild.id,
									allow: ["VIEW_CHANNEL"],
								}]
						}).then(channel_queue => {
							local_config.queue = channel_queue.id;
							save(config, configurations_list, local_config);	
						});
						message.guild.channels.create("coupons", {
							type: "text",
							parent: cat,
							permissionOverwrites: [
								{
									id: message.guild.id,
									allow: ["VIEW_CHANNEL"],
								}]
						}).then(channel_coupons => {
							local_config.coupons = channel_coupons.id;
							save(config, configurations_list, local_config);	
						});			
					});
					save(config, configurations_list, local_config);
					all_messages.forEach(e => e.delete({ timeout: 10000 }));
					return message.channel.send(`Конфигурация сервера успешно создана! Для редактирования отслеживаемых товаров аукциона используйте команду \`${config.prefix}track\`, для изменения конфигурации сервера \`${config.prefix}config\`.`).then(m => m.delete({ timeout: 10000 }));						
				} else if (local_message.content.toLowerCase() === "n" || local_message.content.toLowerCase() === "no" || local_message.content.toLowerCase() === "нет") {
					let local_config = {
						"guild": message.guild.id,
						"premium": false,
						"category": "",
						"queue": "",
						"coupons": "",
						"coupons-role": "",
						"items": []
					}
					save(config, configurations_list, local_config);
					all_messages.forEach(e => e.delete({ timeout: 10000 }));
					return message.channel.send(`Конфигурация сервера успешно создана! Для редактирования отслеживаемых товаров аукциона используйте команду \`${config.prefix}track\`, для изменения конфигурации сервера \`${config.prefix}config\`.`).then(m => m.delete({ timeout: 10000 }));		
				} else {
					all_messages.forEach(e => e.delete({ timeout: 10000 }));
					return message.channel.send("Команда отменена!").then(m => m.delete({ timeout: 10000 }));		
				}
			}).catch(collected => {
				all_messages.forEach(e => e.delete({ timeout: 10000 }));
				return message.channel.send("Команда отменена!").then(m => m.delete({ timeout: 10000 }));
			});
		});																														
    }
}