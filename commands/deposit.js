const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Path ke file database JSON
const dbPath = path.join(__dirname, "..", "db", "user-stats.json");

// Fungsi untuk membaca data statistik
const readStats = () => {
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // Jika file tidak ada atau ada error lain, kembalikan objek kosong
    console.log("Membuat file user-stats.json baru karena tidak ditemukan.");
    return {};
  }
};

// Fungsi untuk menulis data statistik
const writeStats = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  name: "deposit",
  description: "Menambahkan uang fiktif ke saldo Anda untuk bermain.",
  aliases: ["depo"],
  usage: "!deposit <jumlah>",
  execute(message, args) {
    const userId = message.author.id;
    const amount = parseInt(args[0], 10);

    // Validasi input
    if (isNaN(amount) || amount <= 0) {
      return message.reply(
        "Harap masukkan jumlah deposit yang valid (angka positif)."
      );
    }

    const stats = readStats();

    // Inisialisasi data pengguna jika belum ada
    if (!stats[userId]) {
      stats[userId] = {
        plays: 0,
        balance: 0,
      };
    }

    // Tambahkan jumlah deposit ke saldo
    stats[userId].balance += amount || 0;

    // Tulis kembali data yang sudah diperbarui
    writeStats(stats);

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("✅ Deposit Berhasil")
      .setDescription(
        `Anda berhasil melakukan deposit sebesar **${amount.toLocaleString()}**!`
      )
      .addFields({
        name: "Saldo Anda Sekarang",
        value: `**${stats[userId].balance.toLocaleString()}**`,
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
