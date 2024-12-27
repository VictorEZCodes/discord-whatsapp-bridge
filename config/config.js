require('dotenv').config();

module.exports = {
    discord: {
        token: process.env.DISCORD_BOT_TOKEN,
        channels: {
            serverA: {
                id: '1321821297042391141',
                awayRoom: '1321821297042391145'
            },
            serverB: {
                id: '1321821297042391141',
                homeRoom: '1321822032702214195'
            }
        }
    },
    whatsapp: {
        targetNumber: process.env.WHATSAPP_TARGET_NUMBER
    }
};