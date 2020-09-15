const Mongoose = require('mongoose');
const chalk = require("chalk");
const util = require("../utils/utils");
const { mongo } = require("../config.json");
const { logger, client } = require("../globals");

module.exports = Mongoose.connect(`mongodb://${mongo.user}:${mongo.password}@${mongo.host}:${mongo.port}/${mongo.database}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(async () => logger.log(`Shard ${client.shard.ids[0]} connected to MongoDB at ${chalk.green(mongo.host)}(${chalk.gray(await util.resolveDomain(mongo.host))}). Using database ${chalk.green(mongo.database)}.`)).catch(console.error)