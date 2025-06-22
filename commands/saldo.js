const { EmbedBuilder } = require("discord.js");
const UserStats = require("../db/UserStats");

module.exports = {
  name: "saldo",
  description: "Melihat jumlah saldo Anda saat ini.",
  aliases: ["balance", "bal"],
  usage: "!saldo",
  async execute(message, args) {
    const userId = message.author.id;

    // Cari pengguna di database
    const userStats = await UserStats.findOne({ userId: userId });
    const userBalance = userStats ? userStats.balance : 0;

    const embed = new EmbedBuilder()
      .setColor("#0099FF")
      .setTitle(`Saldo ${message.author.username}`)
      .setDescription(
        `💰 Saldo Anda saat ini adalah: **${userBalance.toLocaleString()}**`
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
