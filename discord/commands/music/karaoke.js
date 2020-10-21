const Discord = require("discord.js")
const { player } = require("../../../globals");
const { InfoEmbed, ErrorEmbed } = require("../../../utils/utils");
const { modules } = require("../../../database/constants");
const Bands = require("../../music/structures/Bands");

module.exports = {
    /**
     * 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @param {Discord.Client} client 
     */
    async run(message, args, client) {
        
        if(!player.isPlaying(message.guild.id)) return message.channel.send(ErrorEmbed("Nothing is playing!"))

        const msg = await message.channel.send(InfoEmbed("", "<a:loading:752246174550982728> Processing filter `Karaoke`."));

        const enabled = await player.getQueue(message.guild.id).player.equalizer(Bands.karaoke.bands)

        msg.edit(InfoEmbed("", `<:yes:752247197436870666> Karaoke has been ${enabled ? "enabled" : "disabled"}`))

    },

    config: {
        command: "karaoke",
        aliases: [],
        description: "Add karaoke effect.",
        permissions: [],
        usage: `karaoke`,
        premium: true,
        requiresModules: [modules.MUSIC]
    }
}