const { EmbedBuilder } = require("discord.js");
const UserStats = require("../db/UserStats"); // Pastikan path ini benar

module.exports = {
  name: "slot",
  description: "Mainkan mesin slot dengan taruhan!",
  aliases: ["judi", "gacha"],
  usage: "!slot <nominal_taruhan>",
  async execute(message, args) {
    const userId = message.author.id;
    const betAmount = parseInt(args[0], 10);

    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply("Harap masukkan nominal taruhan yang valid.");
    }

    let userStats = await UserStats.findOne({ userId: userId });
    if (!userStats) {
      // BARU: Saat membuat user baru, langsung generate threshold acak mereka
      const newThreshold = Math.floor(Math.random() * (30 - 20 + 1)) + 20; // Angka acak 20-30
      userStats = await UserStats.create({
        userId: userId,
        pityThreshold: newThreshold,
      });
      console.log(
        `User baru ${message.author.tag} dibuat dengan pity threshold: ${newThreshold}`
      );
    }

    // BARU: Jika user lama belum punya threshold, buatkan untuk mereka
    if (!userStats.pityThreshold || userStats.pityThreshold === 0) {
      userStats.pityThreshold = Math.floor(Math.random() * (30 - 20 + 1)) + 20; // Angka acak 20-30
      console.log(
        `User lama ${message.author.tag} mendapatkan pity threshold baru: ${userStats.pityThreshold}`
      );
    }

    if (userStats.balance < betAmount) {
      return message.reply(
        "Saldo Anda tidak cukup untuk melakukan taruhan ini."
      );
    }

    userStats.balance -= betAmount;
    userStats.plays += 1;

    const items = ["🍒", "🍊", "🍋", "🍉", "🍇", "⭐", "💎"];
    let reels = [];
    let winnings = 0;
    let resultTitle = "Anda Kalah!";
    let color = "#FF0000";

    const isPity = userStats.pityCounter <= userStats.pityThreshold;

    if (isPity) {
      // Paksa kemenangan jika pity tercapai
      const winningItem = items[Math.floor(Math.random() * items.length)];
      reels = [winningItem, winningItem, winningItem]; // Jackpot Pity!
    } else {
      // Putaran normal
      for (let i = 0; i < 3; i++) {
        reels.push(items[Math.floor(Math.random() * items.length)]);
      }
    }

    const isJackpot = reels[0] === reels[1] && reels[1] === reels[2];
    const isWin =
      isJackpot ||
      reels[0] === reels[1] ||
      reels[1] === reels[2] ||
      reels[0] === reels[2];

    if (isJackpot) {
      winnings = betAmount * 10; // Hadiah jackpot lebih besar
      resultTitle = isPity ? "JACKPOT PITY! 💎" : "JACKPOT! 🎰";
      color = "#FFD700";
    } else if (isWin) {
      winnings = betAmount * 2;
      resultTitle = "Anda Menang!";
      color = "#00FF00";
    }

    // DIUBAH: Logika pity counter
    if (winnings > 0) {
      userStats.balance += winnings;
      userStats.pityCounter += 1;
    }

    await userStats.save();

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
          value: `**${userStats.balance.toLocaleString()}**`,
        },
        // BARU: Tampilkan status pity untuk debugging atau info
        {
          name: "Pity Counter",
          value: `${userStats.pityCounter} / ${userStats.pityThreshold}`,
          inline: false,
        }
      )
      .setFooter({ text: `Dimainkan oleh: ${message.author.username}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
