module.exports = {
    name: 'antilink',
    description: 'Toggle global anti‑link (Owner only)',
    ownerOnly: true,
    async execute(sock, msg, args) {
        const option = args[0]?.toLowerCase();
        if (option === 'on') {
            global.antiLinkEnabled = true;
            await sock.sendMessage(msg.key.remoteJid, { text: '✅ Anti‑link turned ON globally' });
        } else if (option === 'off') {
            global.antiLinkEnabled = false;
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Anti‑link turned OFF globally' });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !antilink on/off' });
        }
    }
};
