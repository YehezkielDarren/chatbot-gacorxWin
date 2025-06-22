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
    const PITY_THRESHOLD = 75;

    // --- VALIDASI ---
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply("Harap masukkan nominal taruhan yang valid.");
    }

    if (
      !stats[userId] ||
      stats[userId].balance === undefined ||
      stats[userId].balance < betAmount
    ) {
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
    // Cek Pity System
    if (stats[userId].pityCounter >= PITY_THRESHOLD) {
      forcedWin = true;
      const winningItem = items[Math.floor(Math.random() * items.length)];
      // Paksa menang dengan dua item yang sama
      reels = [winningItem, winningItem, items.find((i) => i !== winningItem)];
    } else {
      // Logika normal jika tidak ada pity
      for (let i = 0; i < 3; i++) {
        reels.push(items[Math.floor(Math.random() * items.length)]);
      }
    }

    const resultMessage = `[ ${reels.join(" | ")} ]`;
    let win = false;
    let winnings = 0;
    let resultTitle = "Anda Kalah!";
    let color = "#FF0000"; // Merah untuk kalah

    if (forcedWin || (reels[0] === reels[1] && reels[1] === reels[2])) {
      // Jackpot (tidak bisa didapat dari pity)
      if (!forcedWin && reels[0] === reels[1] && reels[1] === reels[2]) {
        win = true;
        winnings = betAmount * 5; // Jackpot 5x lipat
        stats[userId].balance += winnings;
        resultTitle = "JACKPOT! 🎰 Anda Menang Besar!";
        color = "#FFD700"; // Emas untuk jackpot
      } else {
        // Kemenangan biasa (atau dari pity)
        win = true;
        winnings = betAmount * 2; // Kemenangan kecil 2x lipat
        stats[userId].balance += winnings;
        resultTitle = forcedWin ? "Kemenangan Pity! ✨" : "Anda Menang!";
        color = "#00FF00"; // Hijau untuk menang
      }
    } else if (reels[0] === reels[1] || reels[1] === reels[2]) {
      // Kemenangan biasa (jika pity tidak aktif)
      win = true;
      winnings = betAmount * 2; // Kemenangan kecil 2x lipat
      stats[userId].balance += winnings;
      resultTitle = "Anda Menang!";
      color = "#00FF00";
    }

    // --- UPDATE PITY COUNTER ---
    if (win) {
      // Jika menang, reset counter
      stats[userId].pityCounter = 0;
    } else {
      // Jika kalah, tambah counter
      stats[userId].pityCounter += 1;
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

    return message.channel.send({ embeds: [embed] });
  },
};
