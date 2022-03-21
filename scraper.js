const { printError } = require("./functions.js");
const request = require("request-promise-native");
const fs = require("fs");

module.exports = (config, client) => {
    return setInterval(function() {
        var configurations_list = [], coupons_list = [];
        try {
            configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder, "utf8"));
        } catch (e) {
            printError("ERROR/scraper.js/read_servers", e.message);
        }
        try {
            coupons_list = JSON.parse(fs.readFileSync(config.coupons_folder, "utf8"));
        } catch (e) {
            printError("ERROR/scraper.js/read_coupons", e.message);
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
                            if (!search) return printError("ERROR/scraper.js", "div with coupones not found, need to edit regex");
                            let all_coupones_list = [], new_coupones_list = [];
                            for (let c of search) {
                                if (!all_coupones_list.includes(c.toUpperCase())) all_coupones_list.push(c.toUpperCase());
                                if (!coupons_list.includes(c.toUpperCase())) new_coupones_list.push(c.toUpperCase());
                            }							
                            if (new_coupones_list.length > 0) {
                                fs.writeFile(config.coupons_folder, JSON.stringify(all_coupones_list, null, 4), function(e) {
                                    if (e) return printError("ERROR/scraper.js", "cannot save all coupones, "+err.message);
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
                                        printError("ERROR/scraper.js", "cannot send new coupones, "+e.message);
                                    }
                                }							
                            }
                        }
                    }).catch(function(e) { printError("ERROR/scraper.js", "coupons request error, "+e.message) });
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
                            fs.writeFile(config.queue_folder, JSON.stringify(data, null, 4), function(e) {
                                if (e) return printError("ERROR/scraper.js", "cannot save queue, "+err.message);
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
                                            printError("ERROR/scraper.js", "cannot send queue, "+e.message);
                                        }									
                                    }
                                }							
                            }
                        }
                    }).catch(function(e) { printError("ERROR/scraper.js", "queue request error, "+e.message) });
                }
            }
        } catch (e) {
            printError("ERROR/scraper.js", "general try-catch error, "+e.message);
        }
    }, config.debug ? 10*1000 : 5*60*1000);        
}