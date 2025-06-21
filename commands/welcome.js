const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "welcome",
  description:
    "Perintah ini digunakan untuk menampilkan pesan selamat datang ke server ini",
  usage: "!welcome",
  async execute(message, args) {
    const guild = message.guild;

    try {
      // Mengambil data pemilik server
      const owner = await guild.fetchOwner();

      // Membuat Embed (pesan dengan tampilan khusus)
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#0099ff") // Anda bisa ganti dengan kode warna hex lain
        .setTitle(`🎉 Selamat Datang di Server ${guild.name}! 🎉`)
        .setDescription(
          `Halo **${message.author.username}**, selamat menikmati waktu Anda di sini!`
        )
        .setThumbnail(guild.iconURL({ dynamic: true })) // Menampilkan ikon server
        .addFields(
          {
            name: "📜 Nama Server",
            value: guild.name,
            inline: true,
          },
          {
            name: "👑 Pemilik Server",
            value: owner.user.tag,
            inline: true,
          },
          {
            name: "👥 Jumlah Anggota",
            value: `${guild.memberCount} anggota`,
            inline: true,
          }
        )
        .setImage("https://tenor.com/bTZoU.gif") // URL gambar banner, bisa diganti
        .setTimestamp() // Menampilkan waktu pesan dikirim
        .setFooter({
          text: `Diminta oleh ${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });

      // Mengirim pesan embed ke channel tempat perintah dijalankan
      message.channel.send({ embeds: [welcomeEmbed] });
    } catch (error) {
      console.error("Terjadi error saat menjalankan perintah welcome:", error);
      message.reply(
        "Terjadi kesalahan saat mencoba menampilkan pesan selamat datang."
      );
    }
  },
};
