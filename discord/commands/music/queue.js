const Discord = require("discord.js")
const { utils, logger, audioPlayers } = require("../../../globals");
const AudioPlayer = require('../../../utils/AudioPlayer');
const { InfoEmbed, ErrorEmbed } = require("../../../utils/utils");
const ytdl = require('ytdl-core')

module.exports = {
    /**
     * 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @param {Discord.Client} client 
     */
    async run(message, args, client) {
        if(message.member.voice.channelID) {
            if(audioPlayers.has(message.member.voice.channel.id)) {
                const songs = audioPlayers.get(message.member.voice.channel.id).getQueue()
    
                var desc = ''
    
                for(let song of songs)
                    desc += `[${song.data.videoDetails.title}](${song.url})\n`
    
                message.channel.send(InfoEmbed("🎧 Queue", `${desc == ''? "No songs avaliable!" : desc}`))
            } else {
                message.channel.send(ErrorEmbed("It's a little quiet there, play a song then use this command!"))
            }
        } else {
            message.channel.send(ErrorEmbed("You must be in a VC!"))
        }
    },

    config: {
        command: "queue",
        aliases: ["q"],
        description: "Show the songs next up in the queue.",
        permissions: [],
        usage: `{{PREFIX}}queue`
    }
}