const Config = require("../../Config.json");
const Route = require("../../Route");
const Database = require("../../Database");
const Utils = require("../../Utils");

module.exports = async function(fastify, options) {
    fastify.get('/pricing', {
    }, async (request, reply) => {
        return await reply.status(200).send("Route Example is working!");
    });
};