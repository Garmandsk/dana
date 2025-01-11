const { Salam } = require('./handler.js');

const routes = [
  {
    method: "GET",
    path: "/lokasi",
    handler: (request, h) => {
      if(request.location){
        console.log(request.location)
        return `Lokasi Anda: ${request.location}`;
      }else{
        return `Tidak bisa masuk`;
      }
    },
  },
  {
    method: "GET",
    path: "/login",
    handler: (request, h) => {
      return h.view('login.hbs');
    },
  },
  {
    method: "POST",
    path: "/akun",
    handler: (request, h) => {
      const { username } = request.payload;
      const { password } = request.payload;
      const data = {
        username,
      }
      if(username === "arman" && password === "1234") {
        return h.view("akun.hbs", data)
      }
      return h.redirect("/login")
    },
  },
  {
    method: "GET",
    path: "/dynamic",
    handler: (request, h) => {
      const data = {
        nama: "Arman"
      }
      return h.view("index.hbs", data)
    }
  },
  {
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Halaman Utama"
    },
  },
  {
    method: '*',
    path: '/',
    handler: (request, h) => {
      return 'Halaman tidak dapat diakses dengan method tersebut';
    },
  },
  {
    method: "GET",
    path: '/admin',
    handler: (request, h) => {
      return 'Halaman Admin';
    },
  },
  {
    method: '*',
    path: '/admin',
    handler: (request, h) => {
      return 'Halaman tidak dapat diakses dengan method tersebut';
    },
  },
  {
    method: "GET",
    path: "/riwayat",
    handler: (request, h) => {
      return "Halaman Riwayat";
    },
  },
  {
    method: '*',
    path: '/riwayat',
    handler: (request, h) => {
      return 'Halaman tidak dapat diakses dengan method tersebut';
    },
  },
  {
    method: "GET",
    path: "/ubah-riwayat",
    handler: (request, h) => {
      return "Halaman Ubah Riwayat";
    },
  },
  {
    method: "GET",
    path: "/ubah-riwayat/{id}",
    handler: Salam,
  },
  {
    method: '*',
    path: '/ubah-riwayat',
    handler: (request, h) => {
      return 'Halaman tidak dapat diakses dengan method tersebut';
    },
  },
  {
    method: "GET",
    path: "/catatan-sistem",
    handler: (request, h) => {
      return "Halaman Catatan Sistem";
    }
  },
  {
    method: '*',
    path: '/catatan-sistem',
    handler: (request, h) => {
      return 'Halaman tidak dapat diakses dengan method tersebut';
    },
  },
  {
    method: '*',
    path: '/{any*}',
    handler: (request, h) => {
      return 'Halaman Tidak Ditemukan';
    },
  },
];

module.exports = routes;