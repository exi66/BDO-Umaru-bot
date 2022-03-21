const { print_e, declOfNum } = require("./functions.js");
const { Client, Collection } = require("discord.js");
const fs = require("fs");

module.exports = (config) => {
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
        checkAndRemove(config, client);
    });
    client.on("guildCreate", guild => {
        print_e(`[bot.js] Joined a new guild: ${guild.name}`);
        client.user.setActivity(`${client.guilds.cache.size} ${declOfNum(client.guilds.cache.size, ["сервер", "сервера", "серверов"])} • ${config.prefix}help`, { type: 'PLAYING' });
        checkAndRemove(config, client);
    });
    client.on("guildDelete", guild => {
        print_e(`[bot.js] Left a guild: ${guild.name}`);
        client.user.setActivity(`${client.guilds.cache.size} ${declOfNum(client.guilds.cache.size, ["сервер", "сервера", "серверов"])} • ${config.prefix}help`, { type: 'PLAYING' });
        checkAndRemove(config, client);
    });
    client.on("message", async message => {
        if (message.author.bot) return;
        if (!message.guild) return;
        let flag = message.content.startsWith(config.prefix);
        if (flag || message.mentions.has(client.user.id)) {
            const args = (flag ? message.content.slice(config.prefix.length) : message.content.replace(/<@.?[0-9]*?>/g, "")).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();
            if (cmd.length === 0) return;
            let command = client.commands.get(cmd);
            if (!command) command = client.commands.get(client.aliases.get(cmd));
            if (command) command.run(client, message, args, config);		
        } else return;
    });
    client.login(config.token);
    return client;
} 
function checkAndRemove(config, client) {
    var configurations_list = [];
    try {
        configurations_list = JSON.parse(fs.readFileSync(config.servers_configs_folder, "utf8"));
    } catch (err) {
        print_e("[ERROR/bot.js/read_servers] " + err.message);
    }
    if (configurations_list.length < 1) return;
    var guilds = client.guilds.cache.map(guild => guild.id);
    for (let i = 0; i < configurations_list.length; i++) {
        if (!guilds.includes(configurations_list[i].guild)) {
            print_e("[bot.js] Found removed guild: "+configurations_list[i].guild);
            configurations_list.splice(i, 1);
        }
    }
    fs.writeFile(config.servers_configs_folder, JSON.stringify(configurations_list, null, 4), function (err) {
        if (err) return print_e(err);
    });	
}