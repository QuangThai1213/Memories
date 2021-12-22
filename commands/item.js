const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const fs = require('fs');
var stringSimilarity = require("string-similarity");
let rawdata = fs.readFileSync('./data/ggz_data.json');
const ggz_data = JSON.parse(rawdata);
module.exports = {
    data: new SlashCommandBuilder()
        .setName('item')
        .setDescription('Get dolly information !!!')
        .addNumberOption(option =>
            option.setName('id')
                .setDescription('id'))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('name')),
    async execute(interaction) {
        let idInput = interaction.options.getNumber('id');
        let nameInput = interaction.options.getString('name');
        const userId = interaction.user.id
        await interaction.deferReply();
        if (findData(idInput, nameInput) == "Nothing") {
            interaction.editReply("?????");
        } else {
            const item = findData(idInput, nameInput);
            const lstItemName = []
            if (item.length === 0) {
                interaction.editReply("Find Nothing !");
            }
            if (item.length === 1) {
                const setIcon = new MessageAttachment('./assets/icons/' + item[0].seriesId + '.png');
                const customRow = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('info-' + item[0].id)
                            .setLabel('Info')
                            .setStyle('PRIMARY'),
                    ).addComponents(
                        new MessageButton()
                            .setCustomId('XXX-' + item[0].id)
                            .setLabel('XXX')
                            .setStyle('PRIMARY'),
                    ).addComponents(
                        new MessageButton()
                            .setCustomId('moe-' + item[0].id)
                            .setLabel('XXX')
                            .setStyle('PRIMARY'),
                    );
                interaction.editReply({ embeds: [this.getEmbed(item[0], 'info')], components: [customRow], files: [setIcon] });
            }
            if (item.length > 1) {
                item.forEach(item => {
                    lstItemName.push({
                        label: item.title,
                        description: "id: " + item.id,
                        value: item.id,
                        // emoji: k.emoji
                    })
                })
                let replyMessage = 'Choose !!'
                let menus = new MessageSelectMenu()
                    .setCustomId('select')
                    .setPlaceholder('Choose your Equip !!')
                    .addOptions(lstItemName.slice(0, 24));
                const rowMenus = new MessageActionRow()
                    .addComponents(
                        menus
                    );
                const filter = i => i.customId === 'select' && i.user.id === userId;

                const collector = interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 15000
                });
                await interaction.editReply({ content: replyMessage, components: [rowMenus] });

                collector.on('collect', async i => {
                    if (i.customId === 'select') {
                        const customRow = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('info-' + i.values[0])
                                    .setLabel('Info')
                                    .setStyle('PRIMARY'),
                            ).addComponents(
                                new MessageButton()
                                    .setCustomId('XXX-' + i.values[0])
                                    .setLabel('XXX')
                                    .setStyle('PRIMARY'),
                            ).addComponents(
                                new MessageButton()
                                    .setCustomId('moe-' + i.values[0])
                                    .setLabel('XXX')
                                    .setStyle('PRIMARY'),
                            );
                        const setIcon = new MessageAttachment('./assets/icons/' + item.find(item => item.id == i.values[0]).seriesId + '.png');
                        await i.update({
                            embeds: [this.getEmbed(item.find(item => item.id == i.values[0]), 'info')],
                            components: [customRow],
                            files: [setIcon]
                        });
                    }
                })

            }
        };
    },
    getEmbed(data, category) {
        switch (category) {
            default:
            case 'info':
                const stringImg = getIdString(data.img);
                let embed = new MessageEmbed()
                    .setThumbnail("http://static.image.mihoyo.com/hsod2_webview/images/broadcast_top/equip_icon/png/" + stringImg + ".png")
                    .setColor('#0099ff')
                    .setTitle(getTitle(data.rarity))
                    .setAuthor(data.title, 'attachment://' + data.seriesId + '.png')
                    .setDescription(getDescription(data.desc))
                    // .setImage('attachment://' + name + '.png')
                    .setTimestamp();
                if (data.prop1) {
                    embed.addField(data.prop1.title + "-" + data.prop1.damageType, getDescription(data.prop1.maxLvDesc), true)
                }
                if (data.prop2) {
                    embed.addField(data.prop2.title + "-" + data.prop2.damageType, getDescription(data.prop2.maxLvDesc), true)
                }



                return embed;
            // .setFooter('Info', 'attachment://main.png');
            // case 'skill':
            //         return new MessageEmbed()
            //         .setColor('#0099ff')
            //         .setTitle(json.name)
            //         .setAuthor(json.nickname, 'attachment://' + json.rarity + '.png')
            //         .setDescription('VA : ' + json.va.jpn + '  \n Artist : ' + json.artist + ``)
            //         .setThumbnail('attachment://' + name + '.png')
            //         .addFields({
            //             name: 'Regular field title',
            //             value: 'Some value here',
            //             inline: true,
            //         }, {
            //             name: '\u200B',
            //             value: '\u200B',
            //             inline: true,
            //         }, {
            //             name: 'Inline field title',
            //             value: 'Some value here',
            //             inline: true,
            //         }, {
            //             name: 'Inline field title',
            //             value: 'Some value here',
            //             inline: true,
            //         })
            //         .addField('Inline field title', 'Some value here', true)
            //         // .setImage('attachment://' + name + '.png')
            //         .setTimestamp()
            //         .setFooter('Skill', 'attachment://main.png');
            // case 'art':
            //         return new MessageEmbed()
            //         .setColor('#0099ff')
            //         .setTitle(json.name)
            //         .setDescription('Artist : ' + json.artist)
            //         .setAuthor(json.nickname, 'attachment://' + json.rarity + '.png')
            //         .setThumbnail('attachment://' + name + '.png')
            //         .addField('Inline field title', 'Some value here', true)
            //         .setImage()
            //         .setTimestamp()
            //         .setFooter('Art', 'attachment://main.png');
        }
    }
};

function getIdString(imgNumber) {
    switch (imgNumber.split("").length) {
        case 1:
            return "00" + imgNumber;
        case 2:
            return "0" + imgNumber;
        case 3:
            return imgNumber.toString();
        default:
            return imgNumber.toString();
    }
}

function getDescription(desc) {
    return desc.replaceAll("#n", "").replaceAll("#!ALB(37)", "");
}

function getTitle(rarity) {
    let rarityString = "";
    for (let index = 0; index < rarity; index++) {
        rarityString = rarityString + "<:rarity:922903644263809095>";
    }
    return rarityString;
}

function findData(id, name) {
    let lstData = [];
    if (id == null && name == null) {
        return "Nothing"
    }
    if (id != null) {
        if (ggz_data.find(item => item.id == id)) {
            lstData.push(ggz_data.find(item => item.id == id))
        }
        return lstData;
    }
    if (name != null && id == null) {
        ggz_data.filter(
            item => stringSimilarity.compareTwoStrings(name, item.title) >= 0.5
                || item.title.includes(name)).forEach(item => {
                    lstData.push(item);
                });
        return lstData;
    }
}
