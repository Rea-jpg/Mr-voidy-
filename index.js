const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');  // needed? I'll add simple logging.
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const useMongoAuthState = require('./lib/mongoAuthState');

// Global anti‑link toggle
global.antiLinkEnabled = false

// Connect to MongoDB, then start bot
mongoose.connect(config.mongoURI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        startBot();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function startBot() {
    const { state, saveCreds } = await useMongoAuthState();

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    // Show QR in terminal
    sock.ev.on('connection.update', ({ qr }) => {
        if (qr) {
            qrcode.generate(qr, { small: true });
            console.log('📱 Scan the QR code above with WhatsApp');
        }
    });

    // Save credentials when they update
    sock.ev.on('creds.update', saveCreds);

    // Connection handling
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom) 
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut 
                : true;
            console.log('Connection closed, reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            } else {
                console.log('Logged out, please delete session in MongoDB and restart.');
            }
        } else if (connection === 'open') {
            console.log('✅ Bot connected to WhatsApp');
        }
    });

    // Load commands
    const commands = new Map();
    const commandsDir = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const cmd = require(path.join(commandsDir, file));
        commands.set(cmd.name, cmd);
    }

    // Add built‑in help command
    commands.set('help', {
        name: 'help',
        description: 'Shows this command list',
        execute: async (sock, msg, args) => {
            let text = '🤖 *Available Commands*\n\n';
            for (const [name, cmd] of commands) {
                text += `!${name} - ${cmd.description}\n`;
            }
            await sock.sendMessage(msg.key.remoteJid, { text });
        }
    });

    // Message handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const isGroup = msg.key.remoteJid.endsWith('@g.us');
        const sender = msg.key.participant || msg.key.remoteJid;

        // Anti‑link check (only in groups, when enabled)
        if (isGroup && global.antiLinkEnabled) {
            const urlRegex = /https?:\/\/\S+|www\.\S+/i;
            if (urlRegex.test(text)) {
                try {
                    // Check if bot is admin
                    const metadata = await sock.groupMetadata(msg.key.remoteJid);
                    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    const isBotAdmin = metadata.participants.some(p => p.id === botId && p.admin);
                    if (isBotAdmin) {
                        await sock.sendMessage(msg.key.remoteJid, { delete: msg.key });
                        await sock.sendMessage(msg.key.remoteJid, { 
                            text: `@${sender.split('@')[0]} Links are not allowed!`,
                            mentions: [sender]
                        });
                        return; // don't process as command
                    }
                } catch (err) {
                    console.error('Anti-link error:', err);
                }
            }
        }

        // Command handling
        if (!text.startsWith(config.prefix)) return;
        const args = text.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands.get(commandName);
        if (!command) return;

        // Owner check for sensitive commands (antilink)
        if (command.ownerOnly && sender !== config.ownerNumber) {
            return sock.sendMessage(msg.key.remoteJid, { text: '❌ Owner only command.' });
        }

        try {
            await command.execute(sock, msg, args);
        } catch (err) {
            console.error('Command error:', err);
            sock.sendMessage(msg.key.remoteJid, { text: '⚠️ Command error' });
        }
    });
}
