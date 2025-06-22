require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Command Handler
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("name" in command && "execute" in command) {
    client.commands.set(command.name, command);
    console.log(`[INFO] Perintah "${command.name}" berhasil dimuat.`);
  } else {
    console.log(
      `[PERINGATAN] Perintah di ${filePath} tidak memiliki properti "name" atau "execute" yang dibutuhkan.`
    );
  }
}

client.once("ready", () => {
  console.log(`Bot telah siap! Login sebagai ${client.user.tag}`);
});

// Event listener untuk pesan
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("Terjadi error saat menjalankan perintah tersebut!");
  }
});

// Fungsi untuk koneksi ke MongoDB dan login bot
const startBot = async () => {
  try {
    console.log("Connection String yang digunakan:", process.env.MONGODB_URI);
    
    console.log("Menghubungkan ke MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Berhasil terhubung ke MongoDB!");

    console.log("Logging in bot...");
    client.login(process.env.TOKEN);
  } catch (error) {
    console.error("Gagal terhubung ke MongoDB:", error);
    process.exit(1);
  }
};

startBot();
