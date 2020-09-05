const Discord = require('discord.js')
const { logger, client, utils } = require("../globals")

const ytdl = require('ytdl-core');
const { InfoEmbed } = require('./utils');

const streams = require('stream');
const lpf = require('lpf')

const lowPassFilter = require('low-pass-filter').lowPassFilter;

module.exports = class AudioPlayer {
    
    /**
     * 
     * @param {Discord.VoiceChannel} voiceChannel 
     * @param {Discord.TextChannel} textChannel 
     * @param {string} startingSongURL
     */
    constructor(voiceChannel, textChannel, startingSongURL, onEnd) {
        this.vc = voiceChannel;
        this.channel = textChannel;
        this.enabled = false;
        this.onEnd = onEnd;
        this.filters = '';

        (async () => this.currentSongDetails = await ytdl.getInfo(startingSongURL))();

        this.queue = [{data: this.currentSongDetails, url: startingSongURL}];

        this.stream = new streams.Transform()
        this.stream._transform = (chunk, encoding, done) => {
            const ch = this.addBassBoost(chunk)

            this.stream.push(ch);
            done();
        }

        const perms = voiceChannel.permissionsFor(client.user.id);

        if(!perms.has("SPEAK")) 
            return textChannel.send(utils.ErrorEmbed("I do not have permission to Speak in that channel!"))
        if(!perms.has("CONNECT"))
            return textChannel.send(utils.ErrorEmbed("I do not have permission to Connect in that channel!"))

        voiceChannel.join().then(voiceConnection => {
            this.voiceconn = voiceConnection;
            voiceConnection.play(this.stream, {
                volume: 0.5
            })
            this.enabled = true;

            this.start();
        }).catch((err) => {
            logger.error(`Unable to join ${voiceChannel.id}\n${err}`)
            textChannel.send(utils.ErrorEmbed("An unexpected error occured when trying to join that channel. This error has been logged."))
        });
    }

    /**
     * 
     * @param {string} song 
     */
    async play(song) {
        if(this.enabled) {
            this.ytddl = ytdl(song, {
                quality: 'highestaudio',
                opusEnabled: true
            }).pipe(this.stream)

            this.currentSongDetails = await ytdl.getInfo(song);
            this.channel.send(InfoEmbed("▶ Music Started", `Currently Playing: \`${this.currentSongDetails.videoDetails.title}\``))

            this.started = Date.now();
        }
    }

    start() {

        logger.debug(`Playing next song - Queue: ${this.queue.length} - Filters: ${this.filters}`)

        if(this.enabled) {
            if(this.queue.length > 0) {
                const { url: song } = this.queue.shift()
                this.play(song)

                this.voiceconn.dispatcher.on('finish', () => {

                    logger.debug(`Finished playing ${song} - ended`)

                    this.stream = new streams.Transform()
                    this.stream._transform = (chunk, encoding, done) => {
                        this.stream.push(chunk);
                        done();
                    }

                    this.voiceconn.play(this.stream, {
                        encoderArgs: this.bassBoost? ['-af', `equalizer=f=40:width_type=h:width=50:g=${this.bassBoost}`] : null,
                        format: null
                    })
                    this.start()

                })
            } else {
                setTimeout(() => {
                    this.voiceconn.disconnect();
                    this.onEnd(this.vc.id);
                }, 10000)
            }
        }
    }

    async addSong(url) {
        if(this.enabled) {
            this.queue.push({url: url, data: await ytdl.getBasicInfo(url)});
        }
    }

    getCurrentDetails() {
        return this.currentSongDetails;
    }

    getQueue() {
        return this.queue;
    }

    getPos() {
        return this.started
    }

    skip() {
        if(this.enabled) {
            try {
                this.ytddl.end();
                this.stream.destroy();

                this.stream = new streams.Transform();
                this.stream._transform = (chunk, encoding, done) => {
                    this.stream.push(chunk);
                    done();
                }

                this.voiceconn.play(this.stream, {
                    encoderArgs: this.bassBoost? ['-af', `equalizer=f=40:width_type=h:width=50:g=${this.bassBoost}`] : null,
                    format: null
                })

                this.stream.pipe(this.voiceconn.dispatcher);

                this.start();
            } catch (error) {
                console.log(error)
            }
        }
    }

    /**
     * 
     * @param {number} volume 
     */
    setVolume(volume) { this.voiceconn.dispatcher.setVolume(volume) }

    getCurrentVolume() { return this.voiceconn.dispatcher.volume * 100 }

    clearQueue() { this.queue = []; }

    pause() { 
        if(this.voiceconn.dispatcher.paused) this.voiceconn.dispatcher.resume()
        else this.voiceconn.dispatcher.pause()

        return this.voiceconn.dispatcher.paused
    }

    /**
     * 
     * @param {number} number 
     */
    bassBoost(gain) {
        if (gain === null || gain === 0) {
            this.filters = null;
        } else {
            this.filters = gain
        }

        this.voiceconn.play(this.stream, {
            encoderArgs: this.bassBoost? ['-af', `equalizer=f=40:width_type=h:width=50:g=${this.bassBoost}`] : null,
            format: null
        })
    }

    addBassBoost(chunk) {
        // console.log("ASDF")

        // if(this.filters != null && this.filters != 0) {

        //     const array = [...chunk]

        //     console.log("started processing chunk of length: " + [...chunk].length)
            
        //     lowPassFilter(array, 22050, 44100, 1)

        //     console.log(array)

        //     const gained = require('audio-gain')(Buffer.from(array));

        //     return Buffer.from(gained)

        // } else return chunk;

        return chunk;
    }
}