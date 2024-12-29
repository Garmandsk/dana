const Hapi = require('@hapi/hapi');

require('dotenv').config();
const { PORT, HOST } = process.env;

/*
const routes = require('./routes');
*/

const init = async () => {
    const server = Hapi.server({
        port: PORT,
        host: HOST,
        // tanpa cors kita tidak dapat menyimpan data dari frontend yang deploy
        
        /*
        routes: {
            cors: {
                origin: ['*'],
            },
        },
        */
        
    });
    
    /*
    server.route(routes);
    */

    await server.start();

    console.log(`Server running on port ${server.info.uri}`);
};

init();