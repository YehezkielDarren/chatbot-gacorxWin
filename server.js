require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Bot Discord ini aktif!");
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

// Setup client
// Guilds: Diperlukan untuk informasi server.
// GuildMessages: Diperlukan untuk mendeteksi pesan di server.
// MessageContent: Diperlukan untuk membaca isi pesan (wajib diaktifkan di Developer Portal).
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Handler untuk bot

client.commands = new Collection();

// path ke folder commands
const commandsPath = path.join(__dirname, "commands");
// membaca semua file di "commands" yang akhirannya ".js"
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

// Loops setiap perintah di file
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  //   Jika file memiliki 'name' dan 'execute', daftarkan
  if ("name" in command && "execute" in command) {
    client.commands.set(command.name, command);
    console.log(`[INFO] Perintah "${command.name}" berhasil dimuat.`);
  } else {
    console.log(
      `[PERINGATAN] Perintah di ${filePath} tidak valid (kurang 'name' atau 'execute').`
    );
  }
}

// event handler bot siap
client.once("ready", () => {
  console.log(`Bot telah siap! Login sebagai ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (!message.content.startsWith("!") || message.author.bot) return;

  // Memisahkan nama perintah dan argumen
  // Contoh: '!echo halo dunia' -> args akan menjadi ['halo', 'dunia']
  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase(); // -> 'echo'

  const command =
    message.client.commands.get(commandName) ||
    message.client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  try {
    // Jalankan method 'execute' dari file perintah yang sesuai
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("Terjadi error saat menjalankan perintah tersebut!");
  }
});

// Login Bot ke Discord
client.login(process.env.DISCORD_BOT_TOKEN);
