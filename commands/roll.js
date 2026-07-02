module.exports = {
    name: 'roll',
    description: 'Roll a dice (1-6)',
    async execute(sock, msg) {
        const result = Math.floor(Math.random() * 6) + 1;
        await sock.sendMessage(msg.key.remoteJid, { text: `🎲 You rolled a ${result}` });
    }
};
