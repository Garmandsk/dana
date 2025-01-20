const Joi = require('joi');
const Boom = require("@hapi/boom");
const { Salam } = require('./handler.js');
const db = require("./db.js");

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
      if(request.auth.isAuthenticated){
        return h.redirect("/dynamic")
      }
      return h.view('login.hbs');
    },
    options: {
      auth: {
        mode: "try"
      }
    }
  },
  {
    method: "GET",
    path: "/logout",
    handler: (request, h) => {
      request.cookieAuth.clear();
      return h.redirect("/login")
    }
  },
  {
    method: "POST",
    path: "/akun",
    handler: (request, h) => {
      const { username } = request.payload;
      const { password } = request.payload;
      const data = {
        username,
        password
      }
      if(username === "arman" && password === "1234") {
        request.cookieAuth.set(data);
        /* return h.view("akun.hbs", data) */
        return ` Halo ${request.auth.credentials.username} `;
      }
      return h.redirect("/login")
    },
    options: {
      auth: {
        mode: "try"
      }
    }
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
    path: "/login-basic",
    handler: (request, h) => {
      return `Selamat Datang Di Halaman Rahasia, ${request.auth.credentials.username}`
    },
    options: {
      auth: "login"
    }
  },
  {
    method: "GET",
    path: "/logout-basic",
    handler: (request, h) => {
      return Boom.unauthorized("Logout Berhasil");
    }
  },
  {
    method: "GET",
    path: "/",
    handler: async (request, h) => {
      try {
        const { data, error } = await db
          .from('total')
          .select();
  
        if (error) {
          console.error("Error fetching data:", error);
          throw Boom.internal("Gagal mendapatkan data dari database", { error: error.message });
        }
  
        if (data.length > 0) {
          console.log("Data fetched:", data);
          return h.response({
            pesan: "Route Utama",
            data: data,
          }).code(200); // OK
        }
  
        // Jika data kosong
        throw Boom.notFound("Data Kosong");
      } catch (err) {
        // Jika error adalah instance Boom, lemparkan apa adanya
        if (Boom.isBoom(err)) {
          return err;
        }
  
        // Untuk error tak terduga, buat error internal
        console.error("Unexpected error:", err);
        return Boom.internal("Terjadi kesalahan pada server", { error: err.message });
      }
    },
    options: {
      auth: {
        mode: "try"
      }
    }
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
    path: "/statistik",
    handler: async (request, h) => {
      try {
        const { data, error } = await db.rpc('get_statistik'); // Menggunakan fungsi SQL di supabase
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Error:', err.message);
      }
    },
    options: {
      auth: {
        mode: "try"
      }
    }
  },
  {
    method: "POST",
    path: "/tambah-riwayat",
    handler: async (request, h) => {
      try {
        // Insert data tanpa kolom tambahan, hanya untuk memicu id baru
        const { data, error } = await db
          .from("riwayat")
          .insert({})
          .select("id"); // Ambil id dari record baru
  
        if (error) {
          console.error("Error inserting:", error);
          return h.response({ status: "error", message: error.message }).code(500);
        }
  
        // Kembalikan id yang baru dibuat
        return h.response({
          status: "success",
          newId: data[0].id,
        }).code(200);
      } catch (err) {
        console.error("Handler error:", err);
        return h.response({ status: "error", message: err.message }).code(500);
      }
    },
    options: {
      auth: {
        mode: "try",
      },
    },
  }, 
  {
    method: "POST",
    path: "/tambah-barang",
    handler: async (request, h) => {
      if(request.payload){
        const { newId, namaBarang, jumlahBarang, hargaBarang, subTotal } = request.payload;
        /* console.log(request.payload); */
        try {
          const { data, error } = await db.from("barangg").insert({
            id_riwayat: newId,
            nama_barang: namaBarang,
            jumlah_barang: jumlahBarang,
            harga_barang: hargaBarang,
            sub_total: subTotal,
          });
    
          if (error) {
            console.error("Error inserting barang:", error);
            return h.response({
              status: "fail",
              message: error.message,
              data: request.payload
            }).code(500);
          }
    
          return h.response({
            status: "success",
            message: `Barang berhasil ditambahkan`,
          }).code(200);
        } catch (err) {
          console.error("Handler error:", err);
          return h.response({ status: "error", message: err.message }).code(500);
        }
      }
      return Boom.badRequest("Data Kosong");
    },
    options: {
      auth: {
        mode: "try",
      },
      validate: {
        payload: Joi.object({
          newId: Joi.number().integer().required(),
          namaBarang: Joi.string().required(),
          jumlahBarang: Joi.number().integer().required(),
          hargaBarang: Joi.number().integer().required(),
          subTotal: Joi.number().integer().required(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/tambah-total",
    handler: async (request, h) => {
      if(request.payload){
        console.log(request.payload);
        const { newId, totalJenisBarang, totalJumlahBarang, totalHarga } = request.payload;
        try{
          const { error } = await db
          .from("total")
            .insert({
              id_riwayat: newId,
              total_jenis_barang: totalJenisBarang,
              total_jumlah_barang: totalJumlahBarang,
              total_harga: totalHarga,
          })
          if(error){
            console.error("Error Inserting Total ", error);
            return h.response({
              status: "fail",
              message: "Gagal Nambah Total"
            }).code(400)
          }
          return h.response({
            status: "succes",
            message: "Total berhasil ditambahkan"
          }).code(200)
        }catch(err){
          console.error("Handler Error ", err)
          return Boom.internal("Kesalahan Handler")
        }
      }
      return Boom.badRequest("Data Kosong");
    },
    options: {
      auth: {
        mode: "try"
      },
      validate: {
        payload: Joi.object({
          newId: Joi.number().integer().required(),
          totalJenisBarang: Joi.number().integer().required(),
          totalJumlahBarang: Joi.number().integer().required(),
          totalHarga: Joi.number().integer().required(),
        })
      }
    }
  },
  {
    method: "POST",
    path: "/test-post",
    handler: async (request, h) => {
      if(request.payload){
        console.log("Payload diterima:", request.payload);
        return h.response({ status: "success", message: "Data diterima" }).code(200)
      }
      return Boom.notFound();
    },
    options: {
      auth: {
        mode: "try"
      }
    }
  },
  {
    method: "GET",
    path: "/riwayat",
    handler: async (request, h) => {
      try{
        const { data, error } = await db
          .from("riwayat")
          .select()
        if(error){
          console.error("Data Riwayat Tidak dapat diambil")
          return Boom.notFound();
        }
        return h.response({
          status: "succes",
          message: "Data Riwayat didapatkan",
          data,
        }).code(200);
      }catch(err){
        if(err){
          console.error("Error Handler");
          Boom.internal("Error Handler");
        }
      }
      return "Halaman Riwayat";
    },
    options: {
      auth: {
        mode: "try"
      }
    }
  },
  {
    method: '*',
    path: '/riwayat',
    handler: (request, h) => {
      return 'Halaman tidak dapat diakses dengan method tersebut';
    },
  },
  {
    method: "POST",
    path: "/riwayat-barang",
    handler: async (request, h) => {
      const { id } = request.payload; // Ambil id dari payload
      console.log("Payload diterima:", request.payload);

      if (!id) {
        return Boom.badRequest("Masukkan ID riwayat.");
      }

      try {
        const { data, error } = await db.rpc("get_barang_by_riwayat", { riwayat_id: id });

        if (error) {
          console.error("Error fetching data:", error.message);
          return Boom.badRequest(error.message);
        }

        console.log("Data berhasil diambil:", data);

        // Kembalikan data ke client
        return h.response({
          status: "success",
          data: data,
        }).code(200);

      } catch (err) {
        console.error("Error handler:", err.message);
        return Boom.internal("Terjadi kesalahan pada server.");
      }
    },
    options: {
      auth: {
        mode: "try",
      },
      validate: {
        payload: Joi.object({
          id: Joi.number().integer().required(), // Validasi payload harus ada id dan berupa integer
        }),
      },
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
    options: {
      auth: {
        mode: "try"
      }
    }
  },
];

module.exports = routes;