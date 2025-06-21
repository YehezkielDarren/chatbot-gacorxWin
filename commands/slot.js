const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "/db/user-stats.json");

const readStats = () => {
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // Jika file tidak ada atau kosong, kembalikan objek kosong
    return {};
  }
};

const writeStats = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Gagal menulis ke judi_stats.json:", error);
  }
};

module.exports = {
  name: "judi",
  description:
    "Gacha nomor acak untuk menguji keberuntunganmu!\nangka '7777' adalah jackpot!\nangka '9500' adalah super rare!\nangka '8000' adalah rare!",
  usage: "!judi",
  aliases: ["slot", "gacha"],

  execute(message, args) {
    const stats = readStats();
    const playerId = message.author.id;

    let playCount = stats[playerId] ? stats[playerId].playCount : 0;

    let angkaRandom;
    // 2. LOGIKA BARU: "PITY SYSTEM"
    // Untuk 3 permainan pertama, berikan kemenangan (Rare atau Super Rare)
    if (playCount < 3) {
      console.log(
        `Pemain ${
          message.author.tag
        } sedang dalam fase 'honeymoon' (putaran ke-${playCount + 1}).`
      );
      // Hasilkan angka acak di rentang Rare atau Super Rare (8001 - 9999)
      angkaRandom = 8001 + Math.floor(Math.random() * 1999);
    } else {
      // Setelah 3x main, gunakan probabilitas normal
      angkaRandom = Math.floor(Math.random() * 10000);
    }

    let hasilJudul = "";
    let hasilEmoji = "";
    let embedColor = "#FF0000";

    if (angkaRandom === 7777) {
      hasilJudul = "JACKPOT!!!";
      hasilEmoji = "💎💎💎";
      embedColor = "#FFD700";
    } else if (angkaRandom > 9500) {
      hasilJudul = "WOW, SUPER RARE!";
      hasilEmoji = "🎉🎉";
      embedColor = "#FF69B4";
    } else if (angkaRandom > 8000) {
      hasilJudul = "LUMAYAN, RARE!";
      hasilEmoji = "👍";
      embedColor = "#00BFFF";
    } else {
      hasilJudul = "Anda Kurang Beruntung";
      hasilEmoji = "꽝";
    }

    // 4. BUAT & KIRIM EMBED (Tetap sama seperti sebelumnya)
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle("🎰 Mesin Slot Berputar... 🎰")
      .addFields(
        { name: `${hasilJudul} ${hasilEmoji}`, value: "\u200B" },
        {
          name: "Angka yang Anda dapat:",
          value: `**${angkaRandom.toString()}**`,
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({
        text: `Diminta oleh ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

    message.channel.send({ embeds: [embed] });

    // Tambah jumlah main pemain
    playCount++;
    stats[playerId] = { playCount: playCount };
    writeStats(stats);
  },
};
