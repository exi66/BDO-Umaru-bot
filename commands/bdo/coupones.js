const { printError } = require("../../functions.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = {
    name: "coupones",
	category: "bdo",
    aliases: ["c", "coupon", "cupon"],
    description: (lang) => { return lang.cmd.DESCRIPTION },
    run: (client, message, args, lang) => {
		try {
			var coupons_list = client.getCoupons();
			if (coupons_list.length > 0) {
				let codes = coupons_list.map(e => "`" + e + "`").join("\n");
				try {
					message.channel.send({
						embed: {
							color: "#2f3136",
							title: lang.cmd.EMBED.TITLE,
							url: "https://orbit-games.com/",
							timestamp: new Date(),
							description: codes
						}
					});
				} catch (e) {
					printError(error_here, e.message);
				}						
			} else return message.channel.send(lang.cmd.DONT_HAVE_COUPONS);
		}
		catch (e) {
			printError(error_here, e.message);
			return message.channel.send(lang.global.ERROR);
		};		
    }
}
