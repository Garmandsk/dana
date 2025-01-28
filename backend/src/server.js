require("dotenv").config();
const path = require("path");
const Hapi = require('@hapi/hapi');
const SocketIO = require('socket.io');
const routes = require("./routes");
const plugin = require("./plugin")
const db = require("./db.js");

const { PORT, HOST } = process.env;

const init = async () => {
  const server = Hapi.server({
    port: PORT,
    host: HOST,
    // tanpa cors kita tidak dapat menyimpan data dari frontend yang deploy
    /* routes: {
      cors: {
       origin: ['*'],
      },
    },
    */
    routes: {
      cors: true, // Izinkan CORS
      payload: {
        parse: true,
        allow: 'application/json',
      },
    },
  });
  
  await server.register(plugin)
  
  const io = new SocketIO.Server(server.listener, {
    cors: {
      origin: "*", // Ganti dengan alamat frontend, jika ada
      methods: ["GET", "POST"],
    },
  });

let nilai = 0;
  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("tambah", () => {
      nilai++;
      io.sockets.emit("penghitung", nilai)
    });
  });

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
  server.logger.info(`Server berjalan pada ${server.info.uri}`);
  server.log(['subsystem'], 'third way for accessing it');
};

// Menangani error
process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

// Memulai server
init();