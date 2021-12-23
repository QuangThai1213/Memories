const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { bold } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dead')
        .setDescription('GGZ dead count day !!'),
    async execute(interaction) {
        const customRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('F')
                    .setLabel('Press F')
                    .setStyle('DANGER'))
        let deadDate = new Date("10/11/2021");
        let currentDate = new Date();
        const filter = i => i.customId === 'F' && i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            const disableRow = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('FF')
                        .setLabel('Press F')
                        .setStyle('DANGER')
                        .setDisabled(true));
            if (i.customId === 'F') {
                await i.update({ content: "GGZ has dead for " + Math.floor(((currentDate.getTime() - deadDate.getTime()) / (1000 * 3600 * 24))) + " day", components: [disableRow] });
            }
        });
        await interaction.reply({
            content: "GGZ has dead for " + Math.floor(((currentDate.getTime() - deadDate.getTime()) / (1000 * 3600 * 24))) + " day",
            components: [customRow]
        });
    },
};