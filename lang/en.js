module.exports = {
    name: "en",
    translate: {
        GENERAL: {
            CANCEL: "Command canceled by user",
            TIMEOUT: "Command canceled due to timeout!",
            ERROR: "Unexpected error!",
            DONT_HAVE_PERMISSIONS: "you don't have permission to use this command!",
            DONT_HAVE_ARGS: "no arguments!",
        },
        BOT: {
            ACTIVITY: (guilds, prefix) => { return `${guilds} ${guilds > 1 ? "servers" : "server" } • ${prefix}help` },
        },
        SCRAPER : {
            COUPONES : {
                EMBED: {
                    TITLE: "Coupons",
                },
            },
            QUEUE : {
                EMBED: {
                    TITLE: "Market queue",
                    FIELDS: {
                        LVL: "lvl",
                        NAME: "Name",
                        TIME: "Live in",
                    },
                },
            },            
        },
        CONFIG : {
            DESCRIPTION: "Manages server configuration",
            DONT_HAVE_CONFIG: "server configuration is missing, use is not possible!",
            EMBED: {
                TITLE: "Server config",
            },
            INCORRECT_CONFIG_ARGS: "Unknown parameter! You can only change `category`, `queue`, `coupons`, `coupons_role`, `lang`",
            EDIT_AND_SAVE: "Changed and saved!",
        },
        COUPONES : {
            EMBED: {
                TITLE: "Coupons",
            },
            DESCRIPTION: "Gives out available coupons from Orbit-Games. Available only for RU region.",
            DONT_HAVE_COUPONS: "No coupons available!",
        },
        QUEUE : {
            DESCRIPTION: "Returns the current market registration queue",
            DONT_HAVE_ITEMS: "The market queue is empty or untracked!",
            EMBED: {
                TITLE: "Market queue",
                FIELDS: {
                    LVL: "lvl",
                    NAME: "Name",
                    TIME: "Live in",
                },
            },
        },
        START : {
            DESCRIPTION: "Quick Start",
            TEMPLATE: {
                COUPONS_NAME: "Coupons",
                COUPONS_REASON: "Role to mention when posting coupons",
                V_BS_NAME: "PEN: BS",
                V_BS_REASON: "Role to mention when selling PEN BS",
                V_MANOS_NAME: "PEN: Manos jewelry",
                V_MANOS_REASON: "Role to mention when selling PEN Manos jewelry",
                IV_DEBORIKA_NAME: "TET: Deborika jewelry",
                IV_DEBORIKA_REASON: "Role to mention when selling TET Deborika jewelry",
                V_DEBORIKA_NAME: "PEN: Deborika jewelry",
                V_DEBORIKA_REASON: "Role to mention when selling PEN Deborika jewelry", 
            },
            CATEGORY_NAME: "bdo umaru",
            COUPONS_CHANNEL_NAME: "coupons",
            QUEUE_CHANNEL_NAME: "queue",
            SELECT_REGION: (regions) => { return `Select game region:\n${regions}`},
            CREATE_AUTO: (prefix) => { return `Automatic setup will create a category, two channels in it, and basic roles for tracking coupons and rare items. In case of refusal, a config template will be created without any parameters, which can be configured with the \`${prefix}config\` command. Do you want to auto setup? (Yes/No)` },
            SUCCESS: (prefix) => { return `Server configuration successfully created! To edit market tracked items use \`${prefix}track\` command, to change server configuration \`${prefix}config\`` },
            CREATE_AUTO_COUPONS: "Create a channel and role to track coupons? This function is only available for the RU region. If not, the step will be skipped. (Yes/No)",
        },
        TRACK : {
            DESCRIPTION: "Manages market tracking",
            TRACKED_EMPTY: "The list of monitored items is empty!",
            DONT_HAVE_CONFIG: "server configuration is missing, use is not possible!",
            EMBED: {
                TITLE: "Tracked items",
                FIELDS: {
                    ROLE: "Role",
                    ID: "id",
                    LVL: "lvl",
                },
            },
            REMOVED: {
                QUESTION_1: "Mention the role you want to stop tracking or specify its id",
                ERROR_1: "Failed to recognize role!",
                QUESTION_2: (count) => { return `Found ${count} matches. Which one to remove? (1-${count})` },
                QUESTION_2_EMBED: {
                    TITLE: "Found matches",
                    FIELDS: {
                        NUM: "№",
                        ID: "id",
                        LVL: "lvl",
                    },
                },
                ERROR_2: "Failed to recognize index!",
                ERROR_3: "Could not find such a relation!",
                SUCCESS: "Deleted and saved!",
            },
            ADD: {
                LIMITE_ERROR: (count) => { return `The limit of ${count} monitored items groups for the non premium server has been reached! Delete a group to create a new one.` },
                QUESTION_1: "Which role to mention? Specify `id` or mention it via `@role-name`",
                ERROR_1: "Failed to recognize role!",
                QUESTION_2: "List the id of items needed to track",
                ERROR_2: (count) => { return `There can be no more than ${count} items in one group!` },
                QUESTION_3: "Specify the level of enhancement (common for the entire group of previously specified items)",
                ERROR_3: "Failed to recognize the number!",
                QUESTION_4: "All right? Yes(Y)\/No(N)",
                SUCCESS: "Created!",
            },
        },
        UMARU : {
            NOT_FOUND: "nothing found :(",
        },
        ABOUT : {
            EMBED: {
                TITLE: "About the project",
                DESCRIPTION: "A simple bot on Discord.js with functions for the game [BDO](https://www.ru.playblackdesert.com/main/index)\n[Github](https://github.com/exi66/BDO-Umaru-bot)\n[Telegram](https://t.me/exi666)\nDiscord: `Exi#5604`",    
            },
        },
        GUILD : {
            DESCRIPTION: "Returns the server ID",
        },
        HELP : {
            DESCRIPTION: "Information about bot commands",
            INFO_EMPTY: (name) => { return `No information about the **${name}** command` },
            EMBED: {
                INFO_NAME: (name) => { return `**Cmd**: ${name}` },
                INFO_ALIASES: (aliases) => { return `\n**Aliases**: ${aliases}` },
                INFO_DESCRIPTION: (desc) => { return `\n**Description**: ${desc}` },
                INFO_USAGE: (usage) => { return `\n**Usage**: ${usage}` },
                FOOTER: "Syntax: <> = required, [] = optional",
            },
        },
        PING : {
            PING: "Delay",
        },
        WHOIS : {
            DESCRIPTION: "Returns user information",
            EMBED: {
                FIELDS: {
                    INFO: "Info:",
                    INFO_DESCRIPTION: (name, joined, roles) => { return `**> Nickname:** ${name}
                    **> Join date:** ${joined}
                    **> Roles:** ${roles}` },
                    USER: "User:",
                    USER_DESCRIPTION: (id, name, tag, created) => { return `**> ID:** ${id}
                    **> Name:** ${name}
                    **> Tag:** ${tag}
                    **> Registration date:** ${created}` },
                    GAME: "In game:",
                    GAME_DESCRIPTION: (game) => { return `**> Name:** ${game}` },  
                }
            },
        },
        EXEC : {
            DESCRIPTION: "Executes code",
        },
        SAY : {
            DESCRIPTION: "Bot speaks for you",
        },
    }
}
