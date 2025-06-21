const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "db", "user-stats.json");

const readStats = () => {
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

module.exports = {
  name: "saldo",
  description: "Melihat jumlah saldo Anda saat ini.",
  aliases: ["balance", "bal"],
  usage: "!saldo",
  execute(message, args) {
    const userId = message.author.id;
    const stats = readStats();

    // --- PERBAIKAN DI BARIS INI ---
    // Logika diubah untuk mengecek keberadaan balance, jika tidak ada, default ke 0
    const userBalance = stats[userId]?.balance || 0;

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
