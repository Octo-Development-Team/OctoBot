const Log = require("./utils/logger");

/**
 * Logger
 */
module.exports.logger = new Log(true, './weblogs')

module.exports.shardingManager = null;