const Hapi = require('hapi');
const fs = require('fs');
const Pack = require('./package');
const route = require('./contents/routes');
const api = require('./contents/api');

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

    const serverOpts = {
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
        serverOpts,
        swaggerOpts,
        require('inert'),
        require('vision')
    ]);

    server.route(route);

    await server.start();
    console.log(`Server started at ${server.info.uri}`);
    api.apiCall();
}

startServer().catch((err) => {
    console.error(err);
    process.exit(1);
});