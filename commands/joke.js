const axios = require('axios');
module.exports = {
    name: 'joke',
    description: 'Get a random dad joke',
    async execute(sock, msg) {
        try {
            const res = await axios.get('https://icanhazdadjoke.com/', {
                headers: { Accept: 'text/plain' }
            });
            await sock.sendMessage(msg.key.remoteJid, { text: `😂 ${res.data}` });
        } catch (err) {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Couldn\'t fetch a joke right now.' });
        }
    }
};
