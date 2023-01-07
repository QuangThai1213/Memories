require('dotenv').config()
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildIds } = require('./configtest.json');
const { Client, Intents } = require('discord.js');
const token = process.env.MY_API_KEY;

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
    ]
});
// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(token);

const commands = []
fs.readdirSync('./commands/').forEach(dirs => {
    const lstCommands = fs.readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));
    for (const file of lstCommands) {
        const command = require(`./commands/${dirs}/${file}`);
        // console.log(`${command.data.name} added to slash Command!`);
        commands.push(command.data.toJSON());
    };
});

const rest = new REST({ version: '9' }).setToken(token);

guildIds.forEach(guildId => {
    client.fetchGuildPreview(guildId).then(guild => {
        rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
            .then(() => console.log('Successfully registered application commands to ' + guild.name))
            .catch(console.error);
    }).finally(() => {
        client.destroy();
    });
})
