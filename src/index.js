const { Client, GatewayIntentBits } = require('discord.js');
const { Client: WhatsAppClient } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('../config/config');

let isWhatsAppReady = false;

// Discord client setup
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// WhatsApp client setup
const whatsappClient = new WhatsAppClient({
    authStrategy: new (require('whatsapp-web.js')).LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        headless: true
    }
});

// WhatsApp authentication
whatsappClient.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Please scan the QR code with your WhatsApp');
});

whatsappClient.on('ready', async () => {
    isWhatsAppReady = true;
    console.log('WhatsApp client is ready!');
    
    //  test message
    try {
        await whatsappClient.sendMessage(
            `${config.whatsapp.targetNumber}@c.us`,
            '🔄 Bot is connected and ready!'
        );
        console.log('Test message sent successfully');
    } catch (error) {
        console.error('Failed to send test message:', error);
    }
});

discordClient.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!isWhatsAppReady) {
        console.log('WhatsApp is not ready yet. Please wait...');
        return;
    }

    const { channels } = config.discord;
    
    // Check if message is from Server A's away room
    if (message.guild.id === channels.serverA.id && 
        message.channel.id === channels.serverA.awayRoom) {
        await forwardToWhatsApp(message, 'Server A - Away Room');
    }
    
    // Check if message is from Server B's home room
    if (message.guild.id === channels.serverB.id && 
        message.channel.id === channels.serverB.homeRoom) {
        await forwardToWhatsApp(message, 'Server B - Home Room');
    }
});

async function forwardToWhatsApp(message, source) {
    try {
        if (!isWhatsAppReady) {
            console.log('WhatsApp is not ready. Message not sent.');
            return;
        }

        const formattedMessage = `💬 *${source}*\n` +
            `👤 ${message.author.username}\n` +
            `━━━━━━━━━━\n` +
            `${message.content}\n` +
            `━━━━━━━━━━`;

        await whatsappClient.sendMessage(
            `${config.whatsapp.targetNumber}@c.us`, 
            formattedMessage
        );
        console.log('Message sent to WhatsApp successfully');
    } catch (error) {
        console.error('Error forwarding message to WhatsApp:', error);
    }
}

discordClient.on('ready', async () => {
    console.log(`Logged in as ${discordClient.user.tag}`);
    
    try {
        const channelA = await discordClient.channels.fetch(config.discord.channels.serverA.awayRoom);
        const channelB = await discordClient.channels.fetch(config.discord.channels.serverB.homeRoom);
        
        console.log('\nChannel Access Check:');
        console.log('Server A - Away Room:', {
            name: channelA.name,
            id: channelA.id,
            canSend: channelA.permissionsFor(discordClient.user).has('SendMessages')
        });
        console.log('Server B - Home Room:', {
            name: channelB.name,
            id: channelB.id,
            canSend: channelB.permissionsFor(discordClient.user).has('SendMessages')
        });

        // send test messages
        await channelA.send('🔄 Bot connected to Away Room!');
        await channelB.send('🔄 Bot connected to Home Room!');
        console.log('Test messages sent successfully to Discord channels');
    } catch (error) {
        console.error('Error verifying channel access:', error);
    }
});

discordClient.login(config.discord.token);
whatsappClient.initialize();
whatsappClient.on('disconnected', (reason) => {
    console.log('WhatsApp was disconnected:', reason);
});
whatsappClient.on('auth_failure', msg => {
    console.error('WhatsApp authentication failed:', msg);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});