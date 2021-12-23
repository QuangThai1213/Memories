const fs = require('fs');
const axios = require('axios');
const Path = require('path');
let rawdata = fs.readFileSync('../data/ggz_data.json');
const ggz_data = JSON.parse(rawdata);

ggz_data.forEach(equip => {
    if (equip.posterId && equip.posterId != 0) {
        const path = "./moe/" + equip.posterId + ".png";
        fs.access(path, fs.F_OK, async (err) => {
            if (err) {
                try {
                    await getImg(equip.posterId);
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
    let moeId = 1000 + Number(imgId)
    if (imgId = "31") {
        moeId = "10311";
    }
    if (imgId = "20") {
        moeId = "10201";
    }
    if (imgId = "155") {
        moeId = "11551";
    }
    const config = {
        headers: {
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Referer": "https://redbean.tech/",
            "DNT": 1
        }
    }
    const url = "https://api-1256168079.cos.ap-chengdu.myqcloud.com/images/awaken/" + moeId + ".png";
    const path = Path.resolve(__dirname, 'moe', imgId + ".png");
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

function getFileSize(file) {
    let stats = fs.statSync(file)
    return stats.size;
}