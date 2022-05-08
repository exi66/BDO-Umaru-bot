const { printError } = require("./functions.js");
const request = require("request-promise-native");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = (client) => {
    return setInterval(function() {
        var configurations_list = [];
        client.guilds.cache.forEach((g) => {
            if (g.umaru) configurations_list.push(g);
        });
        try {
            if (configurations_list.length > 0) {
                if (client.umaru.coupons) {	
                    request({
                        method: "GET",
                        url: "https://orbit-games.com/",
                        headers: {
                            "User-Agent": "BDO-Umaru-bot https://github.com/exi66/BDO-Umaru-bot"
                        }
                    }).then(body => {
                        //console.log(body);
                        if (body !== "" && body != null) {	
                            let div = body.match(/<div\s+id="text-16".*?>[\S\s]*?<\/div>/gi);
                            let search = div[0].match(/\(?[a-zA-Z0-9]{4}\)?-?[a-zA-Z0-9]{4}?-?[a-zA-Z0-9]{4}-?[a-zA-Z0-9]{4}/gm);
                            if (!search) return printError(error_here, "div with coupones not found, need to edit regex");
                            let all_coupones_list = [], new_coupones_list = [], coupons_list = client.getCoupons();
                            for (let c of search) {
                                if (!all_coupones_list.includes(c.toUpperCase())) all_coupones_list.push(c.toUpperCase());
                                if (!coupons_list.includes(c.toUpperCase())) new_coupones_list.push(c.toUpperCase());
                            }							
                            if (new_coupones_list.length > 0) {
                                client.setCoupons(all_coupones_list);
                                let codes = new_coupones_list.map(e => "`" + e + "`").join("\n");
                                let coupons_configurations_list = configurations_list.filter(g => g.umaru.coupons);
                                for (let local_guild of coupons_configurations_list) {						
                                    try {
                                        const local_channel = client.channels.cache.get(local_guild.umaru.coupons.id);
                                        const lang = { cmd: client.languages.get(local_guild.umaru.lang || client.umaru.default_lang)["SCRAPER"] };
                                        if (local_channel) local_channel.send({
                                            content: `<@&${local_guild.umaru.coupons_role.id}>`,
                                            embed: {
                                                color: "#2f3136",
                                                title: lang.cmd.COUPONES.EMBED.TITLE,
                                                url: "https://orbit-games.com/",
                                                timestamp: new Date(),
                                                description: codes
                                            }
                                        });
                                    } catch (e) {
                                        printError(error_here, "cannot send new coupones, "+e.message);
                                    }
                                }							
                            }
                        }
                    }).catch(function(e) { printError(error_here, "coupons request error, "+e.message) });
                }
                if (client.umaru.queue) {	
                    let guilds_regions = [];
                    client.guilds.cache.forEach((g) => {
                        if (g.umaru) guilds_regions.push(g.umaru.region);
                    });
                    var intersection = client.umaru.regions.map(e => e.name).filter(e => guilds_regions.includes(e));
                    for (let reg of intersection) {
                        let local_reg = client.umaru.regions.find(e => e.name === reg);
                        if (local_reg) {
                            request({
                                method: "POST",
                                url: local_reg.url+"Home/GetWorldMarketWaitList",
                                headers: {
									"content-type": "application/json",
                                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                                    "cookie": local_reg.cookie,
                                    "referer": local_reg.url,
                                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36"
                                }
                            }).then(body => {
                                if (body !== "" && body != null) {
                                    let data = JSON.parse(body)._waitList || [];
                                    let items = [];
                                    if (data.length > 0) {
                                        for (let d of data) {
                                            let item = [d.mainKey, d.chooseKey, d._pricePerOne, d._waitEndTime, d.name];
                                            items.push(item);
                                        }
                                    }
                                    client.setQueue({
                                        region: reg,
                                        lastUpdate: new Date(),
                                        items: items,
                                    });
                                    if (items.length > 0) {
                                        let queue_configurations_list = configurations_list.filter(g => g.umaru.queue && g.umaru.region === reg);
                                        for (let local_guild of queue_configurations_list) {
                                            let important_items_list = [], mentions = "", names = "", lvls = "", times = "";								
                                            for (let local_items of local_guild.umaru.items) {
                                                for (let item of items) {		
                                                    if(local_items.ids.includes(parseInt(item[0])) && item[1] == local_items.enchant) {
                                                        important_items_list.push(item);
                                                        if (!mentions.includes(local_items["role"])) mentions += `<@&${local_items["role"]}>`;
                                                        lvls += item[1]+"\n";
                                                        names += item[4]+"\n";
                                                        let date = new Date(item[3]);
                                                        let hours = date.getHours();
                                                        let minutes = "0" + date.getMinutes();
                                                        let seconds = "0" + date.getSeconds();
                                                        times += `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}\n`;													
                                                    }										
                                                }
                                            }
                                            if (important_items_list.length > 0) {						
                                                try {
                                                    const local_channel = client.channels.cache.get(local_guild.umaru.queue.id);
                                                    const lang = { cmd: client.languages.get(local_guild.umaru.lang || client.umaru.default_lang)["SCRAPER"] };
                                                    if (local_channel) local_channel.send({
                                                        content: mentions,
                                                        embed: {
                                                            color: "#2f3136",
                                                            title: lang.cmd.QUEUE.EMBED.TITLE,
                                                            timestamp: new Date(),
                                                            fields: [
                                                                { name: lang.cmd.QUEUE.EMBED.FIELDS.LVL, value: lvls, inline: true},
                                                                { name: lang.cmd.QUEUE.EMBED.FIELDS.NAME, value: names, inline: true},
                                                                { name: lang.cmd.QUEUE.EMBED.FIELDS.TIME, value: times, inline: true}
                                                            ]
                                                        }
                                                    });
                                                } catch (e) {
                                                    printError(error_here, "cannot send queue, "+e.message);
                                                }									
                                            }
                                        }							
                                    }
                                }
                            }).catch(function(e) { printError(error_here, "queue request error, "+e.message) });
                        }
                    }
                }
            }
        } catch (e) {
            printError(error_here, "general try-catch error, "+e.message);
        }
    }, client.umaru.debug ? 10*1000 : 5*60*1000);        
}
