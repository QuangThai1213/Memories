const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const fs = require('fs');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote } = require('@discordjs/builders');

var stringSimilarity = require("string-similarity");
let rawdata = fs.readFileSync('./data/ggz_data.json');
const ggz_data = JSON.parse(rawdata);
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
module.exports = {
    data: new SlashCommandBuilder()
        .setName('item')
        .setDescription('Get equip information !!!')
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
        if (findData(idInput, nameInput).length == 0) {
            interaction.editReply("XXX");
        } else {
            const item = findData(idInput, nameInput);
            const lstItemName = []
            if (item.length === 0) {
                interaction.editReply("Find Nothing !");
            }
            if (item.length === 1) {
                const setIcon = new MessageAttachment('./assets/icons/' + item[0].seriesId + '.png');
                const equipIcon = new MessageAttachment('./assets/equip_icons/' + getIdString(item[0].img) + '.png');
                let moe = "-1";
                if (item[0].posterId && item[0].posterId != "0") {
                    moe = new MessageAttachment('./assets/moe/' + getIdString(item[0].posterId) + '.png');
                }
                interaction.editReply({
                    embeds: [this.getEmbed(item[0], 'info', moe)],
                    components: [],
                    files: moe == "-1" ? [setIcon, equipIcon] : [setIcon, equipIcon, moe]
                });
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
                    time: 9999999
                });
                await interaction.editReply({ content: replyMessage, components: [rowMenus] });

                collector.on('collect', async i => {
                    if (i.customId === 'select') {
                        const customRow = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('info-' + i.values[0].id)
                                    .setLabel('Info')
                                    .setStyle('PRIMARY'),
                            ).addComponents(
                                new MessageButton()
                                    .setCustomId('XXX-' + i.values[0].id)
                                    .setLabel('XXX')
                                    .setStyle('PRIMARY'),
                            ).addComponents(
                                new MessageButton()
                                    .setCustomId('moe-' + i.values[0].id)
                                    .setLabel('XXX')
                                    .setStyle('PRIMARY'),
                            );
                        const setIcon = new MessageAttachment('./assets/icons/' + item.find(item => item.id == i.values[0]).seriesId + '.png');
                        const equipIcon = new MessageAttachment('./assets/equip_icons/' + getIdString(item.find(item => item.id == i.values[0]).img) + '.png');
                        let moe = "-1";
                        if (item.find(item => item.id == i.values[0]).posterId && item.find(item => item.id == i.values[0]).posterId != "0") {
                            moe = new MessageAttachment('./assets/moe/' + item.find(item => item.id == i.values[0]).posterId + '.png');
                        }

                        await i.update({
                            content: null,
                            embeds: [this.getEmbed(item.find(item => item.id == i.values[0]), 'info', moe)],
                            components: [],
                            files: moe == "-1" ? [setIcon, equipIcon] : [setIcon, equipIcon, moe]
                        });
                    }
                })

            }
        };
    },
    getEmbed(data, category, moe) {
        switch (category) {
            default:
            case 'info':
                const stringImg = getIdString(data.img);
                let embed = new MessageEmbed()
                    .setThumbnail('attachment://' + data.seriesId + '.png')
                    .setColor('#0099ff')
                    .setAuthor(data.title, 'attachment://' + data.seriesId + '.png')
                    .setDescription(getTitle(data.rarity) + "\n" + getDescription(data.desc) + "\u200B")

                    .setTimestamp()
                embed.addField("Stats", blockQuote(italic(bold(getStats(data)))));
                embed.setThumbnail('attachment://' + stringImg + '.png');
                if (data.prop1) {
                    embed.addField(getTitleDescription(data.prop1), getDescription(data.prop1.maxLvDesc), true)
                }
                if (data.prop2) {
                    embed.addField(data.prop2.title + "-" + data.prop2.damageType, getDescription(data.prop2.maxLvDesc), true)
                }
                if (data.ultraSkill) {
                    embed.addField(
                        data.hiddenUltraSkill ? data.hiddenUltraSkill.title : data.ultraSkill.title,
                        getDescription(data.hiddenUltraSkill ? data.hiddenUltraSkill.maxLvDesc : data.ultraSkill.maxLvDesc), true)
                }
                if (data.normalSkill1) {
                    embed.addField(data.normalSkill1.title, getDescription(data.normalSkill1.maxLvDesc), true)
                }
                if (data.normalSkill2) {
                    embed.addField(data.normalSkill2.title, getDescription(data.normalSkill2.maxLvDesc), true)
                }
                if (moe != "-1") {
                    embed.setImage('attachment://' + data.posterId + '.png')
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

function getStats(data) {
    let stats = "";
    if (data.baseType) {
        stats = stats + "Type: " + getType(data.baseType) + "\n";
    }
    if (data.maxlv) {
        stats = stats + "Max lv: " + data.maxlv + "\n";
    }
    if (data.cost) {
        stats = stats + "Cost: " + data.cost + "\n";
    }
    if (data.hpMaxLv && data.hpMaxLv != 0) {
        stats = stats + "HP: " + data.hpMaxLv + "\n";
    }
    if (data.damageType) {
        stats = stats + "Dmg Type: " + getDamageTypeEmoji(data.damageType) + "\n";
    }
    if (data.damageMaxLv) {
        stats = stats + "Dmg: " + data.damageMaxLv + "\n";
    }
    if (data.ammoMaxLv) {
        stats = stats + "Ammo: " + data.ammoMaxLv + "\n";
    }
    if (data.fireRateMaxLv) {
        stats = stats + "Att Spd: " + data.fireRateMaxLv + "/s" + "\n";
    }
    if (data.limitedNumber && data.limitedNumber != 0) {
        stats = stats + "Limit: " + data.limitedNumber + "\n";
    }
    if (data.atkMaxLv) {
        stats = stats + "Atk: " + data.atkMaxLv + "\n";
        stats = stats + "Crit rate: " + data.critRate * 100 + "%" + "\n";
    }
    return stats;
}

function getType(baseType) {
    switch (baseType) {
        case "近战-刀剑":
            return "Melee-Sword"
        case "自动步枪":
            return "Auto rifle"
        case "狙击枪":
            return "Sniper rifle"
        case "投掷":
            return "Throwing"
        case "放置-地雷":
            return "Deploy-Mine"
        case "单兵火箭":
            return "Launcher"
        case "喷雾":
            return "Spray"
        case "霰弹-独头":
            return "Shotgun-single"
        case "手枪-手炮":
            return "Pistol-Hand Cannon"
        case "近战-电锯":
            return "Melee-Chainsaw"
        case "放置-炮台":
            return "Deploy-Turret"
        case "放置-诱导":
            return "Deploy"
        case "特殊":
            return "Special"
        case "放置-远古兵器":
            return "Deploy-Ancient"
        case "放置-人形":
            return "Deploy-Dolly"
        case "放置-特殊":
            return "Deploy-Special"
        case "喷雾-激活":
            return "Spray-Activated"
        case "喷雾-附魔":
            return "Spray-Enchanting"
        case "特殊-弓":
            return "Special-Bow"
        case "喷雾-切换":
            return "Spray-toggle"
        default:
            return "XXX";
    }
}

function getDamageTypeEmoji(damageType) {
    switch (damageType) {
        case "fire":
            return "<:fire:923056987929997345>";
        case "snow":
            return "<:snow:923056988122914816>";
        case "physic":
            return "<:physic:923056988043218954>";
        case "poison":
            return "<:poison:923056988290682920>";
        case "none":
            return "<:none:923056987342770206>";
        case "light":
            return "<:light:923056987846107177>";
        case "power":
            return "<:power:923056988043235370>";
        default:
            return damageType;
    }
}

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

function getTitleDescription(skill) {
    let title = skill.title
    if (skill.damageType && skill.damageType != "none") {
        title = title + " - " + getDamageTypeEmoji(skill.damageType);
    }
    return title;
}

function getTitle(rarity) {
    let rarityString = "";
    for (let index = 0; index < rarity; index++) {
        rarityString = rarityString + "⭐";
    }
    return rarityString;
}

function findData(id, name) {
    let lstData = [];
    if (id == null && name == null) {
        return lstData;
    }
    if (id != null) {
        if (ggz_data.find(item => item.id == id)) {
            if (ggz_data.find(item => item.id == id).ultraSkill) {
                lstData.push({ ...ggz_data.find(item => item.id == id), seriesId: 22 })
            } else {
                lstData.push(ggz_data.find(item => item.id == id))
            }

        }
        return lstData;
    }
    if (name != null && id == null) {
        ggz_data.filter(
            item => stringSimilarity.compareTwoStrings(toLowerCaseAndTrim(name), toLowerCaseAndTrim(item.title)) >= 0.5 ||
                toLowerCaseAndTrim(item.title).includes(toLowerCaseAndTrim(name))).forEach(item => {
                    //if item is a Familiar
                    if (item.ultraSkill) {
                        lstData.push({ ...item, seriesId: 22 });
                    } else {
                        lstData.push(item);
                    }
                });
        return lstData;
    }
}

function toLowerCaseAndTrim(string) {
    return string.replaceAll(" ", "").toLowerCase();
}