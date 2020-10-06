"use strict";

require("dotenv").config();

const Discord = require("discord.js");
const Express = require("express");
const BodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const Mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const util = require("../utils/utils");
const { graphqlHTTP } = require("express-graphql");
const GuildOptions = require("../database/models/GuildOptions")

const io = require("socket.io")({
    path: "/ws"
});
const app = Express();

const { mongo } = require("../config.json")
const globals = require("../launcher.globals");
const { logger } = globals;
const SocketRequest = require("./core/SocketRequest")
const { schema, root } = require("./gql/guildSchema");

const { guildOptionsOf } = require("../utils/dbUtils");

const routes = [];

/**
 * @type {Discord.ShardingManager}
 */
let shardingManager = null;

module.exports = (manager) => {
    shardingManager = manager
    globals.shardingManager = manager;
    loadRouteDir()
}

io.on("connection", socket => {
    logger.logBackend(`Connection from ${socket.handshake.address}`)
    routes.forEach(route => socket.on(route.path, (payload) => route.handler(new SocketRequest(socket, route.path, JSON.parse(JSON.stringify(payload))))))
})


app.use("/gql", BodyParser(), graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}))

Mongoose.connect(`mongodb://${mongo.user}:${mongo.password}@${mongo.host}:${mongo.port}/${mongo.database}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(async () => {
        logger.logBackend(`Connected to MongoDB at ${chalk.green(mongo.host)} (${chalk.gray(await util.resolveDomain(mongo.host))}). Using database ${chalk.green(mongo.database)}.`)
    }).catch(console.error);

io.listen(8080)
app.listen(80)
logger.logBackend(`Now listening on ${8080}`)

/**
 * 
 * @param {String} dir
 */
async function loadRouteDir() {
    const dir = "./backend/routes"
    await fs.readdir(dir).then(async files => {
        for(let file of files) {
            const stat = await fs.stat(`${dir}/${file}`)
            if(stat.isDirectory()) {
                return loadRouteDir(`${dir}/${file}`);
            } else if(file.endsWith(".js")) {
                const route = require(path.resolve(`${dir}/${file}`))
                if(route.handler && route.path) routes.push(route);
            }
        }
    }).catch(err => {
        console.error(err)
    })
}