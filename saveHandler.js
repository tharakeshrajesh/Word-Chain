require("dotenv").config({ path: ".save"});
const fs = require('node:fs').promises;

async function editVar(varName, val) {
    try {
        let content = await fs.readFile(".save", "utf8");
        const regex = new RegExp(`^${varName}=.*`, 'm');

        if (!regex.test(content)) {
            content += `\n${varName}=${val}`;
        } else content = content.replace(regex, `${varName}=${val}`);

        content = content.split('\n').filter(line => line.trim() !== '').join('\n');

        await fs.writeFile(".save", content);
        process.env[varName] = val;
        console.log(`${varName} with ${val}`);
        return 1;
    } catch (error) {
        console.log(error);
        return 0;
    }
}

async function getVar(varName) {
    console.log(`gotvar ${process.env[varName]}`);
    return process.env[varName];
}

async function deleteVar(channelId) {
    try {
        let content = await fs.readFile(".save", "utf8");

        let regex = new RegExp(`^${channelId}_STREAK=.*`, 'm');
        content = content.replace(regex, "");

        regex = new RegExp(`^${channelId}_WORD=.*`, 'm');
        content = content.replace(regex, "");

        await fs.writeFile(".save", content);
        delete process.env[channelId+"_STREAK"];
        delete process.env[channelId+"_WORD"];

        console.log(`deleted var ${channelId}`);
        return 1;
    } catch (error) {
        console.log(error);
        return 0;
    }
}

module.exports = { editVar, getVar, deleteVar };
