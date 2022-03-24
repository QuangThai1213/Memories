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

const player = createAudioPlayer();

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
                .setStyle('PRIMARY')
            );
        player.addListener('stateChange',
            async(oldState, newState) => {
                if (newState.status == AudioPlayerStatus.Idle) {
                    try {
                        // now files is an Array of the name of the files in the folder and you can pick a random name inside of that array 
                        let bgmFile = files[Math.floor(Math.random() * files.length)];
                        await interaction.editReply({
                            content: "Playing " + bgmFile.slice(0, -4) + " in ApocoCOLLE !",
                            ephemeral: true
                        });
                        await playSong(player, bgmFile).then(() => {
                            connection.subscribe(player);
                        })
                    } catch (error) {
                        console.error(error);
                    }
                }
            }, )
        const connection = await connectToVoiceChannel(interaction);
        const filter = i => i.customId === 'next' && i.user.id === '337641064720760852';;

        const collector = interaction.channel.createMessageComponentCollector({ filter });
        var fs = require('fs');
        var files = fs.readdirSync('./bgm');
        collector.on('collect', async i => {
            if (i.customId === 'next') {
                try {
                    // now files is an Array of the name of the files in the folder and you can pick a random name inside of that array 
                    let bgmFile = files[Math.floor(Math.random() * files.length)];
                    await i.update({
                        content: "Playing " + bgmFile.slice(0, -4) + " in ApocoCOLLE !",
                        ephemeral: true
                    });
                    await playSong(player, bgmFile).then(() => {
                        connection.subscribe(player);
                    })
                } catch (error) {
                    console.error(error);
                }
            }
        });

        try {
            // now files is an Array of the name of the files in the folder and you can pick a random name inside of that array 
            let bgmFile = files[Math.floor(Math.random() * files.length)];
            await interaction.reply({
                content: "Playing " + bgmFile.slice(0, -4) + " in ApocoCOLLE !",
                components: [customRow],
                ephemeral: true
            });
            await playSong(player, bgmFile).then(() => {
                connection.subscribe(player);
            })
        } catch (error) {
            console.error(error);
        }
    },
};



async function connectToVoiceChannel(interaction) {
    let voiceChannel = interaction.member.voice.channel;

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.member.guild.id,
        adapterCreator: interaction.member.guild.voiceAdapterCreator,
        selfDeaf: false
    });
    if (voiceChannel == null) {
        connection.destroy();
        throw 'Not in voice channel';
    }
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