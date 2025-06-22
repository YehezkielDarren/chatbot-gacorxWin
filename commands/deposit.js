const { EmbedBuilder } = require("discord.js");
const UserStats = require("../db/UserStats");

module.exports = {
  name: "deposit",
  description: "Menambahkan uang fiktif ke saldo Anda untuk bermain.",
  aliases: ["depo"],
  usage: "!deposit <jumlah>",
  async execute(message, args) {
    const userId = message.author.id;
    const amount = parseInt(args[0], 10);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(
        "Harap masukkan jumlah deposit yang valid (angka positif)."
      );
    } else if (amount > 1000000) {
      return message.reply("Saldo deposit melebihi batas maksimal!");
    }

    // Cari pengguna di DB atau buat baru jika tidak ada (upsert: true)
    const userStats = await UserStats.findOneAndUpdate(
      { userId: userId },
      { $inc: { balance: amount } },
      { upsert: true, new: true } // Opsi: buat jika tidak ada, kembalikan dokumen baru
    );

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("✅ Deposit Berhasil")
      .setDescription(
        `Anda berhasil melakukan deposit sebesar **${amount.toLocaleString()}**!`
      )
      .addFields({
        name: "Saldo Anda Sekarang",
        value: `**${userStats.balance.toLocaleString()}**`,
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
