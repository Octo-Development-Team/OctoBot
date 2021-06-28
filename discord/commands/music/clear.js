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

        player.getQueue(message.guild.id).tracks = [];

        message.channel.send(InfoEmbed("🗑 Queue Cleared", `The queue has been cleared!`))
    },

    config: {
        command: "clear",
        aliases: ["removeeveryfuckingsong", "clearqueue"],
        description: "Clears the entire queue.",
        permissions: [],
        usage: `clear`,
        requiresModules: [modules.MUSIC]
    }
}