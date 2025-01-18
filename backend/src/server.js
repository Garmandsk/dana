const path = require("path");
const Hapi = require('@hapi/hapi');
const routes = require("./routes");
const plugin = require("./plugin")
const db = require("./db.js");

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
  
  await server.register(plugin)
  
  const users = {
    Arman: {
      id: 0,
      username: "Arman",
      password: "123"
    },
    Gerti: {
      id: 1,
      username: "Gerti",
      password: "098"
    }
  };
  
  const validate = async (request, username, password, h) => {
    // Cari pengguna berdasarkan username
    const user = users[username];
  
    // Jika pengguna tidak ditemukan
    if (!user) {
      console.log(`Pengguna tidak ditemukan, Username: ${users[username]}`);
      return { isValid: false, pesan: "Pengguna tidak ditemukan" };
    }
  
    // Cek apakah password cocok
    if (user.password === password) {
      return { 
        isValid: true, 
        credentials: { id: user.id, username: user.username } 
      };
    }
  
    // Jika password salah
    console.log("Password Salah");
    return { isValid: false, pesan: "Password salah" };
  };
  
  server.auth.strategy("login", "basic", { validate });
  
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: "session",
      password: "kamalamakamalamakamalamakamalama",
      isSecure: false,
      ttl: 1000 * 60
    },
    redirectTo: "/login",
    validate: async (request, session) => {
      if(session.username = "arman", session.password = "1234"){
        return { isValid: true, credentials: { username: "arman" }};
      }
      return { isValid: false }
    }
  });
  
  server.auth.default("session");
  
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