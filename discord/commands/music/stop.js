const Discord = require("discord.js")
const { player } = require("../../../globals");
const { InfoEmbed, ErrorEmbed } = require("../../../utils/utils");
const { modules } = require("../../../database/constants")

module.exports = {
    /**
     * 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @param {Discord.Client} client 
     */
    async run(message, args, client) {
        
        if(!player.isPlaying(message.guild.id)) return message.channel.send(ErrorEmbed("Nothing is playing!"))

        await player.stop(message.guild.id);

        message.channel.send(InfoEmbed("🛑 Music Stopped", `I have stopped playing music!`))

    },

    config: {
        command: "stop",
        aliases: ['fuckoff'],
        description: "Stops the current playing song.",
        permissions: [],
        usage: `stop`,
        requiresModules: [modules.MUSIC]
    }
}