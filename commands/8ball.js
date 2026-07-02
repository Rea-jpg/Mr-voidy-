const answers = [
    'Yes', 'No', 'Maybe', 'Ask again later', 'Definitely', 'I doubt it',
    'Absolutely', 'Not now', 'It is certain', 'Very likely'
];
module.exports = {
    name: '8ball',
    description: 'Ask the magic 8‑ball a question',
    async execute(sock, msg, args) {
        if (args.length === 0) {
            return sock.sendMessage(msg.key.remoteJid, { text: '🎱 Ask a question, e.g., !8ball Is it sunny?' });
        }
        const answer = answers[Math.floor(Math.random() * answers.length)];
        await sock.sendMessage(msg.key.remoteJid, { text: `🎱 ${answer}` });
    }
};
