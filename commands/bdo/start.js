const { printError } = require("../../functions.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

async function createConfigAuto(message, lang, flag, region) {

	const template = lang.cmd.TEMPLATE;
			
	const TEMPLATE = {
		DISCORD_ROLES: {
			COUPONS: {
				data: {
					name: template.COUPONS_NAME,
					color: "#9b59b6",
				},
				reason: template.COUPONS_REASON,
			},
			V_BS: {
				data: {
					name: template.V_BS_NAME,
					color: "#bf0000",
					mentionable: true,
				},
				reason: template.V_BS_REASON,
			},
			V_MANOS: {
				data: {
					name: template.V_MANOS_NAME,
					color: "#398e55",
					mentionable: true,
				},
				reason: template.V_MANOS_REASON,
			},
			IV_DEBORIKA: {
				data: {
					name: template.IV_DEBORIKA_NAME,
					color: "#c09c3f",
					mentionable: true,
				},
				reason: template.IV_DEBORIKA_REASON,
			},
			V_DEBORIKA: {
				data: {
					name: template.V_DEBORIKA_NAME,
					color: "#ffce53",
					mentionable: true,
				},
				reason: template.V_DEBORIKA_REASON,
			}		
		},
		CONFIG: {
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

	var local_config 			= TEMPLATE.CONFIG;

	if (flag)
		var coupons_role		= await message.guild.roles.create(TEMPLATE.DISCORD_ROLES.COUPONS);
	var v_bs_role			 	= await message.guild.roles.create(TEMPLATE.DISCORD_ROLES.V_BS);
	var v_manos_role 			= await message.guild.roles.create(TEMPLATE.DISCORD_ROLES.V_MANOS);
	var iv_deborika_role 		= await message.guild.roles.create(TEMPLATE.DISCORD_ROLES.IV_DEBORIKA);
	var v_deborika_role 		= await message.guild.roles.create(TEMPLATE.DISCORD_ROLES.V_DEBORIKA);
	var cat						= await message.guild.channels.create(lang.cmd.CATEGORY_NAME, { type: "category", permissionOverwrites: [{ id: message.guild.id, allow: ["VIEW_CHANNEL"], }] });
	if (flag)
		var coupons				= await message.guild.channels.create(lang.cmd.COUPONS_CHANNEL_NAME, { type: "text", parent: cat, permissionOverwrites: [{ id: message.guild.id, allow: ["VIEW_CHANNEL"], }] });
	var queue		 			= await message.guild.channels.create(lang.cmd.QUEUE_CHANNEL_NAME, { type: "text", parent: cat, permissionOverwrites: [{ id: message.guild.id, allow: ["VIEW_CHANNEL"], }] });
	
	local_config.lang 			= lang.name;
	local_config.region 		= region;
	local_config.guild 			= message.guild.id;
	local_config.queue			= queue.id;
	if (flag)
		local_config.coupons 	= coupons.id;
	local_config.category 		= cat.id;
	if (flag)
		local_config.coupons_role = coupons_role.id;
	local_config.items[0].role 	= v_bs_role.id;
	local_config.items[1].role 	= v_manos_role.id;
	local_config.items[2].role 	= iv_deborika_role.id;
	local_config.items[3].role 	= v_deborika_role.id;

	return local_config;
}

module.exports = {
    name: "start",
	category: "bdo",
    description: (lang) => { return lang.cmd.DESCRIPTION },
    run: async(client, message, args, lang) => {

        if (!message.member.hasPermission("ADMINISTRATOR")) {
			return message.reply(lang.global.DONT_HAVE_PERMISSIONS);
		}
		var all_messages = [];
		var filter = m => m.author.id === message.author.id;
		await message.channel.send(lang.cmd.SELECT_REGION(client.umaru.regions.map(e => "• "+e.toUpperCase()).join("\n"))).then(m => all_messages.push(m));
		let region_message = await message.channel.awaitMessages(filter, {
			max: 1,
			time: 240000,
			errors: ["time"]
		}).catch(() => {
			return message.channel.send(lang.global.TIMEOUT);
		});
		all_messages.push(region_message.first()); 
		if (client.umaru.regions.includes(region_message.content.toLowerCase())) {
			var local_region = region_message.content.toLowerCase();
			await message.channel.send(lang.cmd.CREATE_AUTO(client.umaru.prefix)).then(m => all_messages.push(m));
			let m = await message.channel.awaitMessages(filter, {
				max: 1,
				time: 240000,
				errors: ["time"]
			}).catch(() => {
				return message.channel.send(lang.global.TIMEOUT);
			});
			all_messages.push(m.first()); 
			if (m.first().content.toLowerCase() === "y" || m.first().content.toLowerCase() === "yes" || m.first().content.toLowerCase() === "да") {
				await message.channel.send(lang.cmd.CREATE_AUTO_COUPONS).then(m => all_messages.push(m));
				let m = await message.channel.awaitMessages(filter, {
					max: 1,
					time: 240000,
					errors: ["time"]
				}).catch(() => {
					return message.channel.send(lang.global.TIMEOUT);
				});
				all_messages.push(m.first()); 
				if (m.first().content.toLowerCase() === "y" || m.first().content.toLowerCase() === "yes" || m.first().content.toLowerCase() === "да") {
					let local_config = await createConfigAuto(message, lang, true);
					client.setConfig(message.guild, local_config);
				} else if (m.first().content.toLowerCase() === "n" || m.first().content.toLowerCase() === "no" || m.first().content.toLowerCase() === "нет") {
					let local_config = await createConfigAuto(message, lang, false, local_region);
					client.setConfig(message.guild, local_config);	
				} else {
					all_messages.forEach(e => e.delete({ timeout: 10000 }));
					return message.channel.send(lang.global.CANCEL);
				}	
			} else if (m.first().content.toLowerCase() === "n" || m.first().content.toLowerCase() === "no" || m.first().content.toLowerCase() === "нет") {
				client.setConfig(message.guild, { region: local_region, lang: lang.name });
			} else {
				all_messages.forEach(e => e.delete({ timeout: 10000 }));
				return message.channel.send(lang.global.CANCEL);			
			}
		} else {
			all_messages.forEach(e => e.delete({ timeout: 10000 }));
			return message.channel.send(lang.global.CANCEL);			
		}
		all_messages.forEach(e => e.delete({ timeout: 10000 }));
		return message.channel.send(lang.cmd.SUCCESS(client.umaru.prefix));
    }
}
