module.exports = {
    /**
     * 
     * @param {import("discord.js").Client} client 
     * @param  {import("discord.js").Guild} args 
     */
    async run(client, guild) {
        // Didn't work as expected, will probs use in the future, don't delete please

        /*console.log(`Started guild proccessing for ${guild.name}`)
        const foundGuild = await GuildOptions.findOne({ guildId: guild.id.toString() })
        if(foundGuild) return;
        const newGuildOptions = new GuildOptions({
            guildId: guild.id.toString()
        });

        try {
            console.log(`Adding guild ${guild.name} to the database.`);
            const createdGuild = await newGuildOptions.save();
            console.log(`Guild added: ${createdGuild}`)
        } catch(err) {
            console.error(`Adding guild ${guild.name} to the database failed.`);
        }*/
    },
    config: {
        name: "Guild Create",
        type: "guildCreate"
    }
}
