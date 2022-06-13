const { Tags } = require('../database');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        Tags.sync();
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setPresence({
            activities: [{
                name: 'Gun Girl Z',
                type: 'STREAMING',
            }]
        });
    },
};