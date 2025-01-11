const path = require("path");
const Hapi = require('@hapi/hapi');
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision")
const GeoLocate = require("hapi-geo-locate");
const routes = require("./routes");

SUPABASE_URL = "";
SUPABASE_SERVICE_ROLE = "";

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: "localhost",
    // tanpa cors kita tidak dapat menyimpan data dari frontend yang deploy
    routes: {
      cors: {
       origin: ['*'],
      },
    },
  });
  
  await server.register([
    {
      plugin: GeoLocate,
      option: {
        enabledByDefault: true
      }
    },
    {
      plugin: Inert,
    },
    {
      plugin: Vision,
    }
  ])
  
  server.views({
    engines: {
      hbs: require('handlebars')
    },
    /* Apapun yang ada di direktori public dapat menjadi file global untuk semua routes */
    path: path.join(__dirname, 'public'),
    layout: "layout"
  })

  // Definisi route GET /
  server.route(routes);

  // Menjalankan server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

// Menangani error
process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

// Memulai server
init();