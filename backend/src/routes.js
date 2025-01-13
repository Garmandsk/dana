const Joi = require('joi');
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
      return h.view('login.hbs').test();
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
    method: "*",
    path: "/cek-joi/{nama?}",
    handler: (request, h) => {
      const { nama = "Manusia" } = request.params;
      const { namaBarang = "Abu", jumlahBarang = 0 } = request.payload;
      const data = {
        "nama": nama,
        "namaBarang": namaBarang,
        "jumlahBarang": jumlahBarang
      }
      return data;
    },
    options: {
      validate: {
        params: Joi.object({
          nama: Joi.string().min(3).max(10)
        }),
        query: Joi.object({
          limit: Joi.number().integer().min(1).max(100).default(10)
        }),
        payload: Joi.object({
          namaBarang: Joi.string().min(1).max(140),
          jumlahBarang: Joi.number().integer().min(1).max(100)
        })
      },
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