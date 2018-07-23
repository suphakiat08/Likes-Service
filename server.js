const Hapi = require('hapi');
const fs = require('fs');
const Pack = require('./package');
const api = require('./mqtt/api');

const startServer = async function () {
    const server = Hapi.Server({
        host: 'localhost',
        port: 3000,
        tls: {
            key: fs.readFileSync('./certificate/key.pem'),
            cert: fs.readFileSync('./certificate/cert.pem')
        },
        routes: {
            cors: true
        }
    });

    const routesOpts = {
        plugin: require('hapi-router'),
        options: { routes: './routes/*.js' },
    }

    const mongoOpts = {
        plugin: require('hapi-mongodb'),
        options: {
            url: 'mongodb://summer1:summer1@ds215709.mlab.com:15709/it58160433_webservice_db1',
            settings: {
                poolSize: 10
            },
            decorate: true
        }
    }

    const swaggerOpts = {
        plugin: require('hapi-swagger'),
        options: {
            info: {
                title: 'Service for facebook likes Documentation.',
                version: Pack.version
            }
        }
    }

    await server.register([
        routesOpts,
        mongoOpts,
        swaggerOpts,
        require('inert'),
        require('vision'),
        require('hapi-auth-jwt2')
    ]);

    await server.auth.strategy('jwt', 'jwt', {
        key: Buffer('%$^$&8fdh32%87', 'base64'),
        validate: validate,
        verifyOptions: { algorithms: ['HS256'] }
    });

    // server.auth.default('jwt');

    await server.start();
    console.log(`Server started at ${server.info.uri}`);
    api.apiCall();
}

startServer().catch((err) => {
    console.error(err);
    process.exit(1);
});

const validate = async function (decoded, request) {
    if (decoded) {
        return { isValid: false };
    } else {
        return { isValid: true };
    }
};