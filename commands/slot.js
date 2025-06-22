const { EmbedBuilder } = require("discord.js");
const UserStats = require("../db/UserStats");

module.exports = {
  name: "slot",
  description: "Mainkan mesin slot dengan taruhan!",
  aliases: ["judi", "gacha"],
  usage: "!slot <nominal_taruhan>",
  async execute(message, args) {
    const userId = message.author.id;
    const betAmount = parseInt(args[0], 10);
    const PITY_THRESHOLD = 75;

    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply("Harap masukkan nominal taruhan yang valid.");
    }

    // Ambil data user, atau buat data default jika tidak ada
    let userStats = await UserStats.findOne({ userId: userId });
    if (!userStats) {
      userStats = await UserStats.create({ userId: userId });
    }

    if (userStats.balance < betAmount) {
      return message.reply(
        "Saldo Anda tidak cukup untuk melakukan taruhan ini."
      );
    }

    // Kurangi saldo, tambah jumlah main
    userStats.balance -= betAmount;
    userStats.plays += 1;

    const items = ["🍒", "🍊", "🍋", "🍉", "🍇", "⭐", "💎"];
    let reels = [];
    let winnings = 0;
    let resultTitle = "Anda Kalah!";
    let color = "#FF0000";

    const isPity = userStats.pityCounter >= PITY_THRESHOLD;
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

    if (winnings > 0) {
      userStats.balance += winnings;
      userStats.pityCounter += 1;
    }

    // Simpan semua perubahan ke database
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
        }
      )
      .setFooter({
        text: `Pity dalam ${
          PITY_THRESHOLD - userStats.pityCounter
        } putaran lagi.`,
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
