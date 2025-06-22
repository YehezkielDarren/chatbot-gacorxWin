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
        "Saldo Anda tidak cukup untuk melakukan taruhan ini. Cek saldo dengan `!saldo` atau `!deposit`."
      );
    }

    // --- INISIALISASI ---
    stats[userId].plays = (stats[userId].plays || 0) + 1;
    stats[userId].pityCounter = stats[userId].pityCounter || 0;
    stats[userId].balance -= betAmount;

    // --- LOGIKA PERMAINAN ---
    const items = ["🍒", "🍊", "🍋", "🍉", "🍇", "⭐", "💎"];
    let winnings = 0;
    let resultTitle = "Anda Kalah!";
    let color = "#FF0000";
    let reels = [];

    const isPity = stats[userId].pityCounter <= PITY_THRESHOLD;
    if (isPity) {
      const winningItem = items[Math.floor(Math.random() * items.length)];
      reels = [
        winningItem,
        winningItem,
        items.find((i) => i !== winningItem) || "⭐",
      ];
    } else {
      for (let i = 0; i < 3; i++) {
        reels.push(items[Math.floor(Math.random() * items.length)]);
      }
    }

    // Tentukan hasil (Sekarang 'reels' bisa diakses di sini)
    const isJackpot = reels[0] === reels[1] && reels[1] === reels[2];
    const isWin =
      isPity ||
      isJackpot ||
      reels[0] === reels[1] ||
      reels[1] === reels[2] ||
      reels[0] === reels[2];

    if (isJackpot) {
      winnings = betAmount * 5;
      resultTitle = "JACKPOT! 🎰 Anda Menang Besar!";
      color = "#FFD700";
    } else if (isWin) {
      winnings = betAmount * 2;
      resultTitle = isPity ? "Kemenangan Pity! ✨" : "Anda Menang!";
      color = "#00FF00";
    }

    // --- UPDATE DATA ---
    if (winnings > 0) {
      stats[userId].balance += winnings;
      stats[userId].pityCounter += 1;
    }

    writeStats(stats);

    // --- KIRIM HASIL ---
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(resultTitle)
      .setDescription(`[ ${reels.join(" | ")} ]`)
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
      .setFooter({
        text: `Pengguna : \*${message.author.tag}*\.`,
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
