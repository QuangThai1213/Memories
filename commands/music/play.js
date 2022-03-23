const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { bold } = require('@discordjs/builders');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    StreamType,
    AudioPlayerStatus,
    VoiceConnectionStatus,
} = require('@discordjs/voice');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('apococolle')
        .setDescription('Play music in ApocoCOLLE !'),
    async execute(interaction) {
        const customRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle('PRIMARY'),
            )
        const player = createAudioPlayer();
        const connection = await connectToVoiceChannel(interaction);
        const filter = i => i.customId === 'next';

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 99999999 });
        var fs = require('fs');
        var files = fs.readdirSync('./bgm');
        collector.on('collect', async i => {
            if (i.customId === 'next') {
                try {
                    // now files is an Array of the name of the files in the folder and you can pick a random name inside of that array 
                    let bgmFile = files[Math.floor(Math.random() * files.length)];
                    await i.update({
                        content: "Playing " + bgmFile.slice(0, -4) + " in ApocoCOLLE !",
                    });
                    await playSong(player, bgmFile).then(() => {
                        connection.subscribe(player);
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        });

        collector.on('end', collected => console.log(`Collected ${collected.size} items`));
        try {
            // now files is an Array of the name of the files in the folder and you can pick a random name inside of that array 
            let bgmFile = files[Math.floor(Math.random() * files.length)];
            await interaction.reply({
                content: "Playing " + bgmFile.slice(0, -4) + " in ApocoCOLLE !",
                components: [customRow]
            });
            await playSong(player, bgmFile).then(() => {
                connection.subscribe(player);
            });
        } catch (error) {
            console.error(error);
        }
    },
};

async function connectToVoiceChannel(interaction) {
    let channelId = '447325615587196933';
    if (interaction.member.guild.id == '261876843219648512') {
        channelId = '265406686066376704';
    }
    const connection = joinVoiceChannel({
        channelId: channelId,
        guildId: interaction.member.guild.id,
        adapterCreator: interaction.member.guild.voiceAdapterCreator,
        selfDeaf: false
    });
    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
}

function playSong(player, bgm) {

    const resource = createAudioResource('./bgm/' + bgm, {
        inputType: StreamType.OggOpus,
    });
    player.play(resource);
    return entersState(player, AudioPlayerStatus.Playing, 5e3);
}