module.exports = {
	
	printError: function(where, message) {
		console.log(`[${new Date().toLocaleString("en-GB")}] [${where}] ${message}`);
	},
	
	escapeMarkdown: function(text) {
		var str = text.toString();
		var unescaped = str.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
		var escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, 
		return escaped;
	},

    declOfNum: function(number, titles) {  
        cases = [2, 0, 1, 1, 1, 2];  
        return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
    },
	
    getMember: function(message, toFind = '') {
        toFind = toFind.toLowerCase();

        let target = message.guild.members.cache.get(toFind);
        
        if (!target && message.mentions.members)
            target = message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild.roles.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            });
        }
            
        if (!target) 
            target = message.member;
            
        return target;
    },

    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-GB').format(date)
    },
	

    promptMessage: async function (message, author, time, validReactions) {
        // We put in the time as seconds, with this it's being transfered to MS
        time *= 1000;

        // For every emoji in the function parameters, react in the good order.
        for (const reaction of validReactions) await message.react(reaction);

        // Only allow reactions from the author, 
        // and the emoji must be in the array we provided.
        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;

        // And ofcourse, await the reactions
        return message
            .awaitReactions(filter, { max: 1, time: time})
            .then(collected => collected.first() && collected.first().emoji.name);
    }
};
