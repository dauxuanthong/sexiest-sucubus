import {
  CommandInteraction,
  GuildChannelResolvable,
  GuildMember,
  SlashCommandBuilder,
  VoiceChannel,
} from "discord.js";
import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  DiscordGatewayAdapterCreator,
} from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import path from "path";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Plays a YouTube video in a voice channel")
  .addStringOption((option) =>
    option
      .setName("url")
      .setDescription("The URL of the YouTube video")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  const url = interaction.options.data[0].value?.toString();

  if (!url || !ytdl.validateURL(url)) {
    await interaction.reply("Please provide a valid YouTube URL.");
    return;
  }
  if (!(interaction.member instanceof GuildMember)) {
    return;
  }
  const voiceChannel = interaction.member?.voice.channel as VoiceChannel;

  if (!voiceChannel) {
    await interaction.reply("You need to be in a voice channel to play music!");
    return;
  }

  //JOIN VOICE CHANNEL
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guildId,
    adapterCreator: voiceChannel.guild
      .voiceAdapterCreator as DiscordGatewayAdapterCreator,
  });

  //Play music

  const player = createAudioPlayer();

  let resource = createAudioResource(path.join(__dirname, "hello-there.mp3"));

  console.log(path.join(__dirname, "hello-there.mp3"));
  console.log("Resource created successfully");

  player.play(resource);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Playing, () => {
    console.log("Audio is now playing!");
    interaction.reply("Now playing: hello-there.mp3");
  });

  player.on("error", (error) => {
    console.error(`Error: ${error.message}`);
    interaction.followUp("There was an error playing the audio.");
    connection.destroy();
  });

  player.on(AudioPlayerStatus.Idle, () => {
    console.log("Audio finished playing. Destroying connection.");
    connection.destroy();
  });
}
