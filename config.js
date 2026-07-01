module.exports = {
    // OWNER_NUMBER = your number with country code, no + (e.g. 1234567890)
    ownerNumber: process.env.OWNER_NUMBER 
        ? process.env.OWNER_NUMBER + '@s.whatsapp.net' 
        : null,
    prefix: process.env.PREFIX || '!',
    mongoURI: process.env.MONGO_URI   // set on Render
};
