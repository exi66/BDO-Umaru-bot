const { printError } = require("../../functions.js");
const fs = require("fs");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

const TEMPLATE = {
	DISCORD_ROLES: {
		COUPONS: {
			data: {
				name: "Купоны",
				color: "#9b59b6",
			},
			reason: "Роль для упоминания при публикации купонов",
		},
		V_BS: {
			data: {
				name: "V: БС",
				color: "#bf0000",
				mentionable: true,
			},
			reason: "Роль для упоминания при продаже V бс",
		},
		V_MANOS: {
			data: {
				name: "V: Бижутерия Маноса",
				color: "#398e55",
				mentionable: true,
			},
			reason: "Роль для упоминания при продаже V бижутерии маноса",
		},
		IV_DEBORIKA: {
			data: {
				name: "IV: Бижутерия Деборики",
				color: "#c09c3f",
				mentionable: true,
			},
			reason: "Роль для упоминания при продаже IV бижутерии деборики",
		},
		V_DEBORIKA: {
			data: {
				name: "V: Бижутерия Деборики",
				color: "#ffce53",
				mentionable: true,
			},
			reason: "Роль для упоминания при продаже V бижутерии деборики",
		}		
	},
	CONFIG: {
		guild: "",
		premium: false,
		category: "",
		queue: "",
		coupons: "",
		coupons_role: "",
		items: [
			{ //BS
				role: "",
				enchant: 20,
				ids: [ 		731114, 731109, 731117,
					731106, 731102, 731113, 731116,
					731107, 731101, 731108, 731103,
					731104, 731111, 731112, 731115, 
					731110, 731105, 731118, 731119,
					731120, 731121, 731122, 715001,
					715003, 715005, 715007, 715009, 
					715011, 715013, 715016, 715017,
					715019, 715021, 718616, 690563,
					692045, 730564, 732313, 733063 ]						
			},
			{ //MANOS
				role: "",
				enchant: 5,
				ids: [ 705510, 705512, 705509, 705511 ]
			},
			{//IV DEB
				role: "",
				enchant: 4,
				ids: [ 11653, 12276 ]	
			},
			{//V DEB
				role: "",
				enchant: 5,
				ids: [ 11653, 12276 ]
			}
		]
	}
}

async function createConfigAuto(message) {
	var local_config 			= TEMPLATE.CONFIG;

	let coupons_role		 	= await message.guild.roles.create(TEMPLATE.DISCORD_ROLES.COUPONS);
	let v_bs_role			 	= await message.guild.roles.create(TEMPLATE.DISCORD_ROLES.V_BS);
	let v_manos_role 			= await message.guild.roles.create(TEMPLATE.DISCORD_ROLES.V_MANOS);
	let iv_deborika_role 		= await message.guild.roles.create(TEMPLATE.DISCORD_ROLES.IV_DEBORIKA);
	let v_deborika_role 		= await message.guild.roles.create(TEMPLATE.DISCORD_ROLES.V_DEBORIKA);
	let cat						= await message.guild.channels.create("bdo umaru", 	{ type: "category", permissionOverwrites: [{ id: message.guild.id, allow: ["VIEW_CHANNEL"], }] });
	let coupons					= await message.guild.channels.create("coupons", 	{ type: "text", parent: cat, permissionOverwrites: [{ id: message.guild.id, allow: ["VIEW_CHANNEL"], }] });
	let queue		 			= await message.guild.channels.create("queue", 		{ type: "text", parent: cat, permissionOverwrites: [{ id: message.guild.id, allow: ["VIEW_CHANNEL"], }] });
	
	local_config.guild 			= message.guild.id;
	local_config.queue			= queue.id;
	local_config.coupons 		= coupons.id;
	local_config.category 		= cat.id;
	local_config.coupons_role 	= coupons_role.id;
	local_config.items[0].role 	= v_bs_role.id;
	local_config.items[1].role 	= v_manos_role.id;
	local_config.items[2].role 	= iv_deborika_role.id;
	local_config.items[3].role 	= v_deborika_role.id;

	return local_config;
}

function createConfigEmpty(message) {
	var local_config 	= TEMPLATE.CONFIG;

	local_config.items 	= [];
	local_config.guild 	= message.guild.id;

	return local_config;
}

function save(config, configurations_list, local_config) {
	if (!local_config) return;
	let c = configurations_list.find(e => e.guild == local_config.guild);
	if(c) {
		let index = configurations_list.indexOf(c);
		configurations_list[index] = local_config;
	} else configurations_list.push(local_config);
	fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function(e) {
		if (e) {
			return printError(error_here, e.message);
		}
	});		
}

module.exports = {
    name: "start",
	  category: "bdo",
    description: "Быстрое начало работы",
    run: async(client, message, args, config) => {

        if (!message.member.hasPermission("ADMINISTRATOR")) {
			return message.reply("у вас нет прав использовать эту команду.");
		}

        var configurations_list = [];
		try {
			configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder, "utf8"));
		} catch (e) {
			printError(error_here, e.message);
		}

		var all_messages = [];
		var local_config = {};
		var filter = m => m.author.id === message.author.id;
		await message.channel.send(`Автоматическая настройка создаст категорию, два канала в ней и базовые роли для отслеживания купонов и редких предметов. В случае отказа будет создан шаблон конфига без каких-либо параметров, который можно настроить командой \`${config.prefix}config\`. Хотите ли вы произвести автоматическую настройку? (Да/Нет)`).then(m => all_messages.push(m));
		let m = await message.channel.awaitMessages(filter, {
			max: 1,
			time: 240000,
			errors: ["time"]
		}).catch(() => {
			return message.channel.send("Команда отменена по таймауту!");
		});
		all_messages.push(m.first()); 
		if (m.first().content.toLowerCase() === "y" || m.first().content.toLowerCase() === "yes" || m.first().content.toLowerCase() === "да") {
			local_config = await createConfigAuto(message);
		} else if (m.first().content.toLowerCase() === "n" || m.first().content.toLowerCase() === "no" || m.first().content.toLowerCase() === "нет") {
			local_config = createConfigEmpty(message);
		} else {
		 	return message.channel.send("Команда отменена!");			
		}
		all_messages.forEach(e => e.delete({ timeout: 10000 }));
		save(config, configurations_list, local_config);
		return message.channel.send(`Конфигурация сервера успешно создана! Для редактирования отслеживаемых товаров аукциона используйте команду \`${config.prefix}track\`, для изменения конфигурации сервера \`${config.prefix}config\``);																													
    }
}
