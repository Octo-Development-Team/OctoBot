const { Permissions } = require('discord.js')
const verifyUser = require("../middleware/verifyUser");
const { getAllGuilds } = require("../oAuth/requests");
const { shardingManager } = require("../../launcher.globals");

module.exports = {

    /**
     * 
     * @param {import("../core/SocketRequest")} req 
     */
    async handler(req) {
        getAllGuilds(req.user.access_token, req.user.token_type).then(async guilds => {
            if(guilds.message && guilds.message.includes("rate limit")) {
                return req.respondRateLimited(guilds.message.retry_after);
            }
            guilds = guilds.map(guild => {
                const isAdmin = new Permissions(parseInt(guild.permissions))
                    .has("ADMINISTRATOR")

                return isAdmin ? guild : null;
            }).filter(f => !!f)

            const shards = new Map();
            guilds.forEach(guild => {
                const shardId = (guild.id >> 22) % shardingManager.shards.size;
                if(shards.has(shardId)) shards.get(shardId).push(guild);
                else shards.set(shardId, [guild])
            })
            
            let sharedGuilds = [];
            for(let [shardId, shardGuilds] of shards) {
                sharedGuilds.push(...(await shardingManager.shards.get(shardId).eval(`this.guilds.cache.filter(g => [${shardGuilds.map(g => `"${g.id}"`).join(", ")}].includes(g.id))`)))
            }

            let shardsValues = []
            Array.from(shards.values()).forEach(it => shardsValues = shardsValues.concat(it))
            const userGuilds = shardsValues.map(guild => ({
                id: guild.id,
                icon: guild.icon,
                name: guild.name,
                botIn: !!sharedGuilds.find(it => it.id === guild.id)
            }))

            req.respondOk({ user: req.user, guilds: userGuilds });
        }).catch(err => {
            console.log(err)
            req.respondBadRequest(err);
        })
    },

    middleware: [verifyUser],
    path: "getUserGuilds"
}