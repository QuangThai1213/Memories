const fs = require('fs');
const axios = require('axios');
const Path = require('path');
let rawdata = fs.readFileSync('../data/ggz_data.json');
const ggz_data = JSON.parse(rawdata);

ggz_data.forEach(equip => {
    if (equip.img != 0) {
        const path = "./equip_icons/" + getIdString(equip.img) + ".png";
        fs.access(path, fs.F_OK, async (err) => {
            if (err) {
                try {
                    await getImg(equip.img);
                } catch (error) {
                    console.log(error)
                }
            } else {
                try {
                    if (getFileSize(path) == 0) {
                        fs.unlinkSync(path)
                    }
                } catch (error) {

                }
            }

        })
    }

});

async function getImg(imgId) {
    const stringImg = getIdString(imgId);
    const config = {
        headers: {
            "Referer": "https://redbean.tech/",
        }
    }
    const url = "http://static.image.mihoyo.com/hsod2_webview/images/broadcast_top/equip_icon/png/" + stringImg + ".png";
    const path = Path.resolve(__dirname, 'equip_icons', stringImg + ".png");
    const writer = fs.createWriteStream(path);
    let image = await axios({
        url,
        method: 'GET',
        headers: config.headers,
        responseType: 'stream'
    })
    image.data.pipe(writer)
    return new Promise((resolve, rejects) => {
        writer.on('finish', resolve)
        writer.on('error', rejects)
    })

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

function getFileSize(file) {
    let stats = fs.statSync(file)
    return stats.size;
}