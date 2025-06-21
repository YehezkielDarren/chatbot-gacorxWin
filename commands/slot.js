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

const writeStats = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  name: "slot",
  description: "Mainkan mesin slot dengan taruhan!",
  aliases: ["judi", "gacha"],
  usage: "!slot <nominal_taruhan>",
  execute(message, args) {
    const userId = message.author.id;
    const betAmount = parseInt(args[0], 10);
    const stats = readStats();

    // --- VALIDASI ---
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply("Harap masukkan nominal taruhan yang valid.");
    }

    if (!stats[userId] || stats[userId].balance < betAmount) {
      return message.reply(
        "Saldo Anda tidak cukup untuk melakukan taruhan ini."
      );
    }

    // Inisialisasi data jika ada yang kurang
    if (!stats[userId].plays) {
      stats[userId].plays = 0;
    }

    // Kurangi saldo untuk taruhan
    stats[userId].balance -= betAmount;
    stats[userId].plays += 1;

    // --- LOGIKA PERMAINAN ---
    const items = ["🍒", "🍊", "🍋", "🍉", "🍇", "⭐", "💎"];
    const reels = [];
    for (let i = 0; i < 3; i++) {
      reels.push(items[Math.floor(Math.random() * items.length)]);
    }

    const resultMessage = `[ ${reels.join(" | ")} ]`;
    let win = false;
    let winnings = 0;
    let resultTitle = "Anda Kalah!";
    let color = "#FF0000"; // Merah untuk kalah

    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      win = true;
      winnings = betAmount * 5; // Jackpot 5x lipat
      stats[userId].balance += winnings;
      resultTitle = "JACKPOT! 🎰 Anda Menang Besar!";
      color = "#FFD700"; // Emas untuk jackpot
    } else if (reels[0] === reels[1] || reels[1] === reels[2]) {
      win = true;
      winnings = betAmount * 2; // Kemenangan kecil 2x lipat
      stats[userId].balance += winnings;
      resultTitle = "Anda Menang!";
      color = "#00FF00"; // Hijau untuk menang
    }

    // Tulis data terbaru ke file
    writeStats(stats);

    // --- KIRIM HASIL ---
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(resultTitle)
      .setDescription(resultMessage)
      .addFields(
        {
          name: "Taruhan Anda",
          value: `${betAmount.toLocaleString()}`,
          inline: true,
        },
        {
          name: "Hadiah Dimenangkan",
          value: `${winnings.toLocaleString()}`,
          inline: true,
        },
        {
          name: "Saldo Akhir",
          value: `**${stats[userId].balance.toLocaleString()}**`,
        }
      )
      .setFooter({ text: `Dimainkan oleh ${message.author.username}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
