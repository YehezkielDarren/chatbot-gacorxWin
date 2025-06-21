const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "help",
  description:
    "Menampilkan daftar semua perintah atau info detail tentang perintah",
  aliases: ["h", "bantuan"],
  usage: "!help [nama_perintah] atau !help atau !h atau !bantuan",
  execute(message, args) {
    const { commands } = message.client;

    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const command =
        commands.get(commandName) ||
        commands.find(
          (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
        );

      if (!command) {
        return message.reply("Perintah tidak ditemukan!");
      }

      // Buat embed untuk menampilkan bantuan spesifik
      const detailEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`Bantuan untuk: \`${command.name}\``)
        .setDescription(`Deskripsi: ${command.description}`)
        .addFields(
          {
            name: "Deskripsi",
            value: command.description || "Tidak ada deskripsi.",
          },
          // Nanti kita bisa tambahkan properti 'usage' di setiap command
          {
            name: "Cara Penggunaan",
            value: `\`${command.usage}\` (detail lebih lanjut akan ditambahkan)`,
          },
          {
            name: "Alias",
            value: command.aliases
              ? command.aliases.join(", ")
              : "Tidak ada alias.",
          }
        );
      return message.channel.send({ embeds: [detailEmbed] });
    }
    // Buat embed untuk menampilkan daftar semua perintah

    const listEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Daftar Perintah")
      .setDescription(
        "Berikut adalah semua perintah yang bisa Anda gunakan. Untuk info lebih lanjut, ketik `!help <nama_perintah>`."
      );
    const cmdList = commands
      .map((cmd) => {
        return `\`!${cmd.name}\` - ${cmd.description}`;
      })
      .join("\n");
    listEmbed.addFields({ name: "Perintah", value: cmdList });
    return message.channel.send({ embeds: [listEmbed] });
  },
};
