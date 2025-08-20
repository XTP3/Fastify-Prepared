const Config = require('./Config.json');
const Fastify = require('fastify');
const Registrar = require('./routes/Registrar');
const cors = require('@fastify/cors');

const port = Config.PORT;
const host = Config.HOST;

const app = Fastify({trustProxy: true});

app.register(cors, {
	origin: "*",
	methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
});

app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
	req.rawBody = body;
	try {
		const json = JSON.parse(body);
		done(null, json);
	}catch(err) {
		err.statusCode = 400;
		done(err, undefined);
	}
});

app.setErrorHandler(function (error, request, reply) {
	if(error.validation) {
		reply.status(400).send({
			statusCode: 400,
			error: "Bad Request",
			message: "Invalid input format." 
		});
		return;
	}
	console.error(error);
	reply.status(500).send({ error: 'Internal Server Error' });
});

const routesRegistrar = new Registrar(app);
routesRegistrar.registerRoutes().then(() => {
	app.listen({port: port, host: host}, (err) => {
		if(err) {
			console.error(err);
			process.exit(1);
		}
		console.log('Server started on port ' + port);
	});
}).catch(err => {
	console.error("Failed to register routes:", err);
});