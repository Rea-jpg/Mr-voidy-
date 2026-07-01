module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    async execute(sock, msg) {
        await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' });
    }
};
