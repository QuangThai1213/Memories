const { SlashCommandBuilder } = require('@discordjs/builders');
const { bold } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check if bot is dying!!'),
    async execute(interaction) {
        await interaction.reply(bold('Im alive!'));
    },
};