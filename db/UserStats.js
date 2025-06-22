const { Schema, model } = require('mongoose');

const userStatsSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    plays: { type: Number, default: 0 },
    pityCounter: { type: Number, default: 0 },
});

module.exports = model('UserStats', userStatsSchema);