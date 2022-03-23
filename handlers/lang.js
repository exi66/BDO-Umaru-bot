const { readdirSync } = require("fs");
const ascii = require("ascii-table");

let table = new ascii("Languages");
table.setHeading("Lang", "Load status");

module.exports = (client) => {
    const langs = readdirSync(`./lang/`).filter(file => file.endsWith(".js"));

    for (let file of langs) {
        let pull = require(`../lang/${file}`);

        if (pull.name && pull.translate) {
            client.languages.set(pull.name, pull.translate);
            table.addRow(file, '✅');
        } else {
            table.addRow(file, `❌  -> missing a help.name, or help.name is not a string.`);
            continue;
        }
    }
    
    console.log(table.toString());
}
