
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    value: String
});
const Session = mongoose.model('Session', sessionSchema);

async function useMongoAuthState() {
    const writeData = async (key, data) => {
        await Session.findOneAndUpdate(
            { key },
            { value: JSON.stringify(data) },
            { upsert: true }
        );
    };

    const readData = async (key) => {
        const doc = await Session.findOne({ key });
        return doc ? JSON.parse(doc.value) : null;
    };

    const removeData = async (key) => {
        await Session.deleteOne({ key });
    };

    const creds = (await readData('creds')) || null;
    const keys = (await readData('keys')) || {};

    return {
        state: { creds, keys },
        saveCreds: async () => {
            await writeData('creds', creds);
            await writeData('keys', keys);
        }
    };
}

module.exports = useMongoAuthState;
