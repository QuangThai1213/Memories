require('dotenv').config()
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId } = require('./config.json');
const token = process.env.MY_API_KEY;

const commands = []
fs.readdirSync('./commands/').forEach(dirs => {
    const lstCommands = fs.readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));
    for (const file of lstCommands) {
        const command = require(`./commands/${dirs}/${file}`);
        console.log(`${command.data.name} added to slash Command!`);
        commands.push(command.data.toJSON());
    };
});

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);