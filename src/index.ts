import { Client } from "discord.js";
import { DISCORD_TOKEN } from "../config.json";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildVoiceStates"],
});

//Add a console.log when the bot is ready
client.once("ready", () => {
  console.log("Discord bot is ready! 🤖");
});

//Deploy commands when new guild has been created:
client.on("guildCreate", async (guild) => {
  console.log("Deployment commands");
  await deployCommands({ guildId: guild.id });
});

//If update commands list
client.on("guildAvailable", async (guild) => {
  console.log("Deployment commands");
  await deployCommands({ guildId: guild.id });
});

//Run corresponding command when new user interaction has been created
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

//Log in the client using your token
client.login(DISCORD_TOKEN);
