const { printError } = require("./functions.js");
const { Client, Collection } = require("discord.js");
const fs = require("fs");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

function removeDeletedGuilds(client) {
    var configurations_list = [];
    try {
        configurations_list = JSON.parse(fs.readFileSync(client.umaru.servers_configs_folder, "utf8"));
    } catch (e) {
        printError(error_here, e.message);
    }
    if (configurations_list.length < 1) return;
    var guilds = client.guilds.cache.map(guild => guild.id);
    for (let i = 0; i < configurations_list.length; i++) {
        if (!guilds.includes(configurations_list[i].guild)) {
            printError(log_here, "found deleted guild: "+configurations_list[i].guild);
            configurations_list.splice(i, 1);
        }
    }
    fs.writeFile(client.umaru.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function(e) {
        if (e) return printError(error_here, e.message);
    });	
}

function createCache(client) {
    var configurations_list = [];
    try {
        configurations_list = JSON.parse(fs.readFileSync(client.umaru.servers_configs_folder, "utf8"));
    } catch (e) {
        printError("1"+error_here, e.message);
    }
    client.guilds.cache.forEach((g) => {
        let {guild, ...local_config} = configurations_list.find(e => e.guild == g.id) || {};
        client.setConfig(g, local_config)
    });
}

async function createListers(client) {
    client.on("ready", () => {
        const lang = client.languages.get(client.umaru.default_lang).BOT;
        printError(log_here, `${client.user.username} is now online!`);
        client.user.setActivity(lang.ACTIVITY(client.guilds.cache.size, client.umaru.prefix), { type: 'PLAYING' });
        //removeDeletedGuilds(client);
        createCache(client);
    });
    client.on("guildCreate", guild => {
        const lang = client.languages.get(client.umaru.default_lang).BOT;
        printError(log_here, `joined a new guild: ${guild.name}`);
        client.user.setActivity(lang.ACTIVITY(client.guilds.cache.size, client.umaru.prefix), { type: 'PLAYING' });
        client.setConfig(guild, {});
    });
    client.on("guildDelete", guild => {
        const lang = client.languages.get(client.umaru.default_lang).BOT;
        printError(log_here, `left a guild: ${guild.name}`);
        client.user.setActivity(lang.ACTIVITY(client.guilds.cache.size, client.umaru.prefix), { type: 'PLAYING' });
        client.setConfig(guild, {});
    });
    client.on("message", async message => {
        if (message.author.bot) return;
        if (!message.guild) return;
        let flag = message.content.startsWith(client.umaru.prefix);
        if (flag || message.mentions.has(client.user.id)) {
            const args = (flag ? message.content.slice(client.umaru.prefix.length) : message.content.replace(/<@.?[0-9]*?>/g, "")).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();
            if (cmd.length === 0) return;
            let command = client.commands.get(cmd);
            if (!command) command = client.commands.get(client.aliases.get(cmd));
            if (command) {
                const lang = {
                    name: message.guild.umaru.lang || client.umaru.default_lang,
                    cmd: client.languages.get(message.guild.umaru.lang || client.umaru.default_lang)[command.name.toUpperCase()],
                    global: client.languages.get(message.guild.umaru.lang || client.umaru.default_lang)["GENERAL"],
                };
                command.run(client, message, args, lang);	
            }	
        } else return;
    });
}

module.exports = (config) => {
    const client = new Client({
        disableEveryone: true
    });
    let {token, ...local_config} = config;
    client.umaru = local_config;
    client.languages = new Collection();
    client.commands = new Collection();
    client.aliases = new Collection();
    client.categories = fs.readdirSync("./commands/");
    client.getConfig = (guild) => {
        let local_config = {
            guild:          guild.id,
            lang:           guild.umaru.lang || client.umaru.default_lang,
            region:         guild.umaru.region || client.umaru.default_region,
            premium:        guild.umaru.premium || false,
            category:       guild.umaru.category ? guild.umaru.category.id : null,
            queue:          guild.umaru.queue ? guild.umaru.queue.id : null,
            coupons:        guild.umaru.coupons ? guild.umaru.coupons.id : null,
            coupons_role:   guild.umaru.coupons_role ? guild.umaru.coupons_role.id : null,
            items:          guild.umaru.items || [], 
        }  
        return local_config;
    };
    client.getConfigs = () => {
        let configs = [];
        client.guilds.cache.forEach((g) => {
            if (g.umaru) {
                let config = client.getConfig(g);
                configs.push(config);
            }
        });
        return configs;
    };
    client.setConfig = (guild, local_config) => {
        guild.umaru                 = {};
        guild.umaru.lang            = local_config.lang || client.umaru.default_lang;
        guild.umaru.region          = local_config.region || client.umaru.default_region;
        guild.umaru.premium         = local_config.premium || false;
        guild.umaru.category        = guild.channels.cache.find(c => c.id === local_config.category && c.type === "category") || null;
        guild.umaru.queue           = guild.channels.cache.get(local_config.queue) || null;
        guild.umaru.coupons         = guild.channels.cache.get(local_config.coupons) || null;
        guild.umaru.coupons_role    = guild.roles.cache.find(r => r.id === local_config.coupons_role) || null;
        guild.umaru.items           = local_config.items || []; 
        return client.saveConfigs();
    };
    client.saveConfigs = () => {
        fs.writeFile(client.umaru.servers_configs_folder, JSON.stringify(client.getConfigs(), null, 4), function(e) {
            if (e) return printError("1"+error_here, e.message);
        });
        return true;  
    };
    client.getCoupons = () => {
        let coupons_list = [];
        try {
            coupons_list= JSON.parse(fs.readFileSync(client.umaru.coupons_folder, "utf8"));
        } catch (e) {
            printError(error_here, e.message);
        }
        return coupons_list;
    };   
    client.setCoupons = (array) => {
        fs.writeFile(client.umaru.coupons_folder, JSON.stringify(array, null, 4), function(e) {
            if (e) return printError(error_here, "cannot save all coupones, "+err.message);
        });
        return true;
    }; 
    client.getQueue = (region) => {
        let queue_list = [];
        try {
            queue_list = JSON.parse(fs.readFileSync(client.umaru.queue_folder, "utf8"));
        } catch (e) {
            printError(error_here, e.message);
        }
        return queue_list.find(e => e.region === region);
    };
    client.setQueue = (array) => {
        let queue_list = [];
        try {
            queue_list = JSON.parse(fs.readFileSync(client.umaru.queue_folder, "utf8"));
        } catch (e) {
            printError(error_here, e.message);
        }
        let elem = queue_list.find(e => e.region === array.region);  
        if (elem) elem = array;
        else queue_list.push(array);          
        fs.writeFile(client.umaru.queue_folder, JSON.stringify(queue_list, null, 4), function(e) {
            if (e) return printError(error_here, "cannot save all coupones, "+e.message);
        });
        return true;
    }; 
    client.login(config.token);
    ["command", "lang"].forEach(handler => {
        require(`./handlers/${handler}`)(client);
    });
    createListers(client);
    return client;
}
