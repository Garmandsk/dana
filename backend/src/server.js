require("dotenv").config();
const path = require("path");
const Hapi = require('@hapi/hapi');
const SocketIO = require('socket.io');
const routes = require("./routes");
const plugin = require("./plugin")
const db = require("./db.js");

const { PORT } = process.env;

const init = async () => {
  const server = Hapi.server({
    port: PORT,
    host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost",
    // tanpa cors kita tidak dapat menyimpan data dari frontend yang deploy
    /* routes: {
      cors: {
       origin: ['*'],
      },
    },
    */
    routes: {
      cors: true,
      payload: {
        parse: true,
        allow: 'application/json',
      },
    },
  });
  
  await server.register(plugin)
  
  /* Socket,io */
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
  /*****/
  
  /* Cookie */
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: "sessionBE",
      password: "kamalamakamalamakamalamakamalama",
      path: '/',
      isSameSite: false,
      isHttpOnly: true, 
      isSecure: false,
      ttl: 1000 * 60 * 60 * 2
    },
    redirectTo: false,
    validate: async (request, session) => {
      request.logger.info("Validate Session: ", session);
      try {
        const { KATA_SANDI } = session; // Perbaikan variabel
        console.log("KATA_SANDI: ", KATA_SANDI);
        if (!KATA_SANDI) {
          request.logger.error("Kata Sandi tidak ada");
          return { isValid: false };
        }
        if (KATA_SANDI === "halo") {
          request.logger.info("Cek Cookie berhasil");
          return { isValid: true, credentials: { KATA_SANDI } };
        }
        request.logger.error("Super Gagal Cek Cookie");
        return { isValid: false };
      } catch (err) {
        request.logger.error("Strategy Error", err);
        return { isValid: false };
      }
    }
  });
  /*****/
  
  server.auth.default("session");

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