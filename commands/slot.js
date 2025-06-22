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
      const newThreshold = Math.floor(Math.random() * (30 - 20 + 1)) + 20;
      userStats = await UserStats.create({
        userId: userId,
        pityThreshold: newThreshold,
      });
    }

    if (!userStats.pityThreshold || userStats.pityThreshold === 0) {
      userStats.pityThreshold = Math.floor(Math.random() * (30 - 20 + 1)) + 20;
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

    // 1. Cek kondisi Pity System (setelah rentetan kekalahan)
    const isPityTriggered = userStats.pityCounter >= userStats.pityThreshold;

    // 2. Cek kondisi Bantuan (jika saldo rendah)
    const isComebackAssist = userStats.balance < 800000000;

    if (isPityTriggered) {
      // Kemenangan Pity PASTI terjadi
      resultTitle = "KEMENANGAN PITY! ✨";
      const winningItem = "💎";
      reels = [winningItem, winningItem, winningItem];
    } else if (isComebackAssist && Math.random() < 0.15) {
      resultTitle = "DIBANTU KEBERUNTUNGAN! 🍀";
      const winningItem = items[Math.floor(Math.random() * 4)];
      reels = [winningItem, winningItem, items.find((i) => i !== winningItem)];
    } else {
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
      winnings = betAmount * 10;
      resultTitle = `JACKPOT! 🎰 (${reels[0]}${reels[0]}${reels[0]})`;
      color = "#FFD700";
    } else if (isWin) {
      resultTitle =
        resultTitle === "Anda Kalah!" ? "Anda Menang!" : resultTitle;
      winnings = betAmount * 2;
      color = "#00FF00";
    }

    // Logika pity counter yang BENAR
    if (winnings > 0) {
      userStats.balance += winnings;
      userStats.pityCounter += 1; // Reset pity counter jika menang
    }

    await userStats.save();

    // Tampilan Embed (sama seperti sebelumnya)
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
        { name: "Hadiah", value: `${winnings.toLocaleString()}`, inline: true },
        {
          name: "Saldo Akhir",
          value: `**${userStats.balance.toLocaleString()}**`,
        },
        {
          name: "Pity Counter",
          value: `${userStats.pityCounter} / ${userStats.pityThreshold}`,
        }
      )
      .setFooter({ text: `Dimainkan oleh: ${message.author.username}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
