module.exports = async function(fastify, options) {
    fastify.get('/test', {
    }, async (request, reply) => {
        return await reply.status(200).send("Route Example is working!");
    });
};