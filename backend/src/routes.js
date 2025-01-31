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
        request.logger.info(request.location)
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
      request.logger.info("Halo Ini route dynamic")
      return h.view("index.hbs", data)
    },
    options: {
      auth: {
        mode: "try"
      }
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
          request.logger.error("Error fetching data:", error);
          throw Boom.internal("Gagal mendapatkan data dari database", { error: error.message });
        }
  
        if (data.length > 0) {
          //request.logger.info("Data fetched:", data);
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
        request.logger.error("Unexpected error:", err);
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
        request.logger.error('Error:', err.message);
      }
    },
    options: {
      auth: {
        mode: "try"
      }
    }
  },
  {
    method: "GET",
    path: "/ambil-cookie",
    handler: async (request, h) => {
      try{
        const { data, error } = await db
          .from("kuki")
          .insert({})
          .select("cookies")
        if(error){
          request.logger.error(`Error Mengambil Cookie: ${error.message}`)
          return Boom.internal(`Error Mengambil Cookie: ${error.message}`)
        }
        return h
          .response({
            status: "success",
            message: "Kata Sandi Berhasil Didapatkan",
            data: data
          }).code(200)
      }catch(err){
        if (err){
          request.logger.error(`Handler Error: ${err.message}`)
          return Boom.internal(`Handler Error: ${err.message}`)
        }
      }
    },
    options: {
      auth: {
        mode: "try"
      }
    }
  },
  {
    method: "GET",
    path: "/cek-cookie/{cookie}",
    handler: async (request, h) => {
      const { cookie } = request.params;
      if(!cookie){
        request.logger.error("Mana Cookie Yang Mau Di Cek")
        return Boom.badRequest("Mana Cookie Yang Mau Di Cek")
      }
      try{
        const { data, error } = await db
          .from("kuki")
          .select("cookies")
          .match({cookies: cookie})
        if(error){
          request.logger.error(`Cookie tidak ditemukan: ${error.message}`)
          return Boom.notFound(`Cookie Tidak Ditemukan: ${error.message}`)
        }
        return h 
          .response({
            status: "success",
            message: "Cookie Ditemukan",
          }).code(200)
      }catch(err){
        if(err){
          request.logger.error("Handler Error")
          return Boom.badRequest("Handler Error")
        }
      }
    },
    options: {
      auth: {
        mode: "try"
      },
      validate: {
        params: Joi.object({
          cookie: Joi.string().guid({ version: ['uuidv4'] }).required(),
        })
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
          request.logger.error("Error inserting:", error);
          return h.response({ status: "error", message: error.message }).code(500);
        }
  
        // Kembalikan id yang baru dibuat
        return h.response({
          status: "success",
          newId: data[0].id,
        }).code(200);
      } catch (err) {
        request.logger.error("Handler error:", err);
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
        /* request.logger.info(request.payload); */
        try {
          const { data, error } = await db.from("barang").insert({
            id_riwayat: newId,
            nama_barang: namaBarang,
            jumlah_barang: jumlahBarang,
            harga_barang: hargaBarang,
            sub_total: subTotal,
          });
    
          if (error) {
            request.logger.error("Error inserting barang:", error.message);
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
          request.logger.error("Handler error:", err);
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
    method: "GET",
    path: "/total/{id}",
    handler: async (request, h) => {
      const { id } = request.params;
      if (!id) {
        request.logger.error("Mana Data Id Riwayat");
        return Boom.badRequest("Mana Data Id Riwayat");
      }
      try {
        const { data, error } = await db
          .from("total")
          .select()
          .eq("id_riwayat", id);
  
        if (error) {
          request.logger.error("Error fetching total: ", error.message);
          return h.response({
            status: "fail",
            message: "Error fetching total",
            error: error.message,
          }).code(500); // Menambahkan kode 500 untuk error internal
        }
  
        return h.response({
          status: "success",
          message: "Data Total Didapatkan",
          data,
        }).code(200);
      } catch (err) {
        request.logger.error("Handler Error: ", err);
        return h.response({
          status: "fail",
          message: "Internal server error",
          error: err.message,
        }).code(500); // Menambahkan kode 500 untuk error handler
      }
    },
    options: {
      auth: {
        mode: "try"
      },
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(), // Memastikan id wajib ada
        })
      }
    }
  },
  {
    method: "POST",
    path: "/tambah-total",
    handler: async (request, h) => {
      if(request.payload){
        // request.logger.info(request.payload);
        const { newId, totalJenisBarang, totalJumlahBarang, totalHarga } = request.payload;
        if(!newId || !totalJenisBarang || !totalJumlahBarang || !totalHarga){
          request.log.error("Mana Datanya woy");
        }
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
            request.logger.error("Error Inserting Total ", error);
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
          request.logger.error("Handler Error ", err)
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
        // request.logger.info("Payload diterima:", request.payload);
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
      try {
        // Mengambil data dari tabel "riwayat" dan mengurutkan berdasarkan kolom "created_at"
        const { data, error } = await db
          .from("riwayat")
          .select()
          .order("created_at", { ascending: false });
  
        // Jika terjadi error saat mengambil data
        if (error) {
          request.logger.error("Data Riwayat Tidak Dapat Diambil:", error.message);
          return Boom.notFound("Data riwayat tidak ditemukan");
        }
  
        // Jika data berhasil diambil, namun kosong
        if (!data || data.length === 0) {
          return h
            .response({
              status: "success",
              message: "Data riwayat kosong",
              data: [],
            })
            .code(200);
        }
  
        // Jika data berhasil diambil
        return h
          .response({
            status: "success",
            message: "Data riwayat didapatkan",
            data,
          })
          .code(200);
      } catch (err) {
        // Menangani error tak terduga
        request.logger.error("Error Handler:", err.message);
        return Boom.internal("Terjadi kesalahan internal");
      }
    },
    options: {
      auth: {
        mode: "try", // Tidak memaksa autentikasi
      },
    },
  },
  {
    method: "GET",
    path: "/cari-riwayat",
    handler: async (request, h) => {
      const { input } = request.query;
      if (!input) {
        request.logger.error("Berikan Input Untuk Jquery");
        return Boom.badRequest("Berikan Input Untuk Jquery");
      }
      
      console.log("Input: ", input);
  
      try {
        // Gunakan .like() untuk filter LIKE di Supabase
        const { data, error } = await db
          .from("riwayat")
          .select()
          .eq("id", input);
          //.like("CAST(id AS TEXT)", `%${input}%`);
  
        // Jika terjadi error saat mengambil data
        if (error) {
          request.logger.error("Data Riwayat Tidak Dapat Diambil:", error.message);
          return Boom.notFound("Data riwayat tidak ditemukan");
        }
  
        // Jika data berhasil diambil, namun kosong
        if (!data || data.length === 0) {
          return h
            .response({
              status: "success",
              message: "Data riwayat kosong",
              data: [],
            })
            .code(200);
        }
  
        // Jika data berhasil diambil
        return h
          .response({
            status: "success",
            message: "Data riwayat didapatkan",
            data,
          })
          .code(200);
      } catch (err) {
        request.logger.error("Handler Error:", err.message);
        return Boom.internal("Handler Error");
      }
    },
    options: {
      auth: {
        mode: "try",
      },
      validate: {
        query: Joi.object({
          input: Joi.number().integer().required(),
        }),
      },
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
    path: "/riwayat-barang",
    handler: async (request, h) => {
      const { input } = request.query;
  
      if (!input) {
        request.logger.error("Berikan Input Pencarian");
        return Boom.badRequest("Berikan Input Pencarian");
      }
  
      try {
        let query;
        if (isNaN(input)) {
          // Jika input adalah string, gunakan ilike untuk mencocokkan nama_barang
          query = db
            .from("barang")
            .select("id_riwayat, id, nama_barang, jumlah_barang")
            .ilike("nama_barang", `%${input}%`);
        } else {
          // Jika input adalah angka, gunakan eq untuk mencocokkan id_riwayat
          query = db
            .from("barang")
            .select("id_riwayat, id, nama_barang, jumlah_barang")
            .eq("id_riwayat", input)
        }
  
        const { data, error } = await query;
  
        if (error) {
          request.logger.error(`Error saat mengambil data: ${error.message}`);
          return Boom.internal(`Gagal mengambil data: ${error.message}`);
        }
  
        const result = data.reduce((acc, item) => {
          // Cek apakah riwayat sudah ada di accumulator
          const riwayatIndex = acc.findIndex((riwayat) => riwayat.id_riwayat === item.id_riwayat);
          if (riwayatIndex === -1) {
            // Jika riwayat belum ada, tambahkan ke accumulator
            acc.push({
              id_riwayat: item.id_riwayat,
              barang: [{ id_barang: item.id, nama_barang: item.nama_barang, jumlah_barang: item.jumlah_barang }],
            });
          } else {
            // Jika riwayat sudah ada, tambahkan barang ke riwayat yang sesuai
            acc[riwayatIndex].barang.push({
              id_barang: item.id,
              nama_barang: item.nama_barang,
              jumlah_barang: item.jumlah_barang,
            });
          }
          return acc;
        }, []);
        
        // Urutkan hasil berdasarkan id_riwayat dari yang terbesar ke terkecil
        result.sort((a, b) => b.id_riwayat - a.id_riwayat);
  
        return h
          .response({
            status: "success",
            message: result.length > 0 ? "Data berhasil diambil" : "Data tidak ditemukan",
            data: result,
          })
          .code(200);
      } catch (err) {
        request.logger.error(`Handler Error: ${err.message}`);
        return Boom.internal("Handler Error");
      }
    },
    options: {
      auth: {
        mode: "try",
      },
    },
  },
  {
    method: "GET",
    path: "/riwayat-barang/{id}",
    handler: async (request, h) => {
      const { id } = request.params; // Ambil id dari params
      // request.logger.info("Params diterima:", request.params);

      if (!id) {
        return Boom.badRequest("Masukkan ID riwayat.");
      }

      try {
        const { data, error } = await db.rpc("get_barang_by_riwayat", { riwayat_id: id });

        if (error) {
          request.logger.error("Error fetching data:", error.message);
          return Boom.badRequest(error.message);
        }

        // request.logger.info("Data berhasil diambil:", data);

        // Kembalikan data ke client
        return h.response({
          status: "success",
          data: data,
        }).code(200);

      } catch (err) {
        request.logger.error("Error handler:", err.message);
        return Boom.internal("Terjadi kesalahan pada server.");
      }
    },
    options: {
      auth: {
        mode: "try",
      },
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required()
        }),
      },
    },
  },
  
  {
    method: 'DELETE',
    path: '/riwayat-hapus/{idRiwayat}',
    handler: async (request, h) => {
      const { idRiwayat } = request.params;
  
      if (!idRiwayat) {
        return Boom.badRequest('ID Riwayat tidak ditemukan');
      }
  
      try {
        const { error } = await db.from('riwayat').delete().eq('id', idRiwayat);
        if (error) {
          request.logger.error("Error Delete Riwayat: ", error.message);
          return h.response({
            status: "error",
            message: "Gagal menghapus riwayat",
            detail: error.message,
          }).code(500);
        }
  
        request.logger.info("Riwayat Berhasil Dihapus");
        return h.response({ status: "success", message: 'Riwayat berhasil dihapus' }).code(200);
  
      } catch (err) {
        request.logger.error("Error Handler: ", err.message);
        return h.response({
          status: "error",
          message: "Terjadi kesalahan pada server",
          detail: err.message,
        }).code(500);
      }
    },
    options: {
      auth: { mode: 'try' },
      validate: {
        params: Joi.object({
          idRiwayat: Joi.number().integer().required(),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/barang-ubah/{idBarang}",
    handler: async (request, h) => {
      const { idBarang } = request.params;
      const { hargaBarang, jumlahBarang } = request.payload;
      if(!idBarang || !hargaBarang || !jumlahBarang){
        request.logger.error("Masukkan Data Id, Harga Barang, dan Jumlah Barang")
        return Boom.badRequest("Masukkan Data Id, harga barang, Dan Jumlah Barang")
      }
      const subTotal = hargaBarang * jumlahBarang;
      try{
        const { error } = await db
          .from("barang")
          .update({jumlah_barang: jumlahBarang, sub_total: subTotal})
          .eq("id", idBarang)
        if(error){
          request.logger.error("Error Update Barang: ", error.message)
          return Boom.internal("Error update Barang: ", error.message)
        }
        request.logger.info("Update Barang Berhasil")
        return h 
          .response({
            status: "success",
            message: "Data Barang Berhasil diubah"
          }).code(200)
      }catch(err){
        if(err){
          request.logger.error("Handler Error: ", err.message)
          return Boom.internal("Handler Error: ", err.message)
        }
      }
    },
    options: {
      auth: {
        mode: "try"
      },
      validate: {
        params: Joi.object({
          idBarang: Joi.string().guid({ version: ['uuidv4'] }).required(),
        }),
        payload: Joi.object({
          hargaBarang: Joi.number().integer().required(),
          jumlahBarang: Joi.number().integer().required().min(1).max(100)
        })
      }
    }
  },
  {
    method: "DELETE",
    path: "/barang-hapus/{idBarang}",
    handler: async (request, h) => {
      const { idBarang } = request.params;
      if(!idBarang){
        return Boom.badRequest("Mana Data Id Barang");
      }
      try{
        const { error } = await db
          .from("barang")
          .delete()
          .eq("id", idBarang)
        if(error){
          request.logger.error("Gagal Menghapus Barang: ", error.message);
          return Boom.internal("Gagal menghapus Barang: ", error.message)
        }
        return h
          .response(
            {
              status: "succes",
              message: "Barang berhasil dihapus"
            }).code(200)
      }catch(err){
        if(err){
          request.logger.error("Handler Error")
          return Boom.internal("Handler Error")
        }
      }
    },
    options: {
      auth: {
        mode: "try"
      },
      validate: {
        params: Joi.object({
          idBarang: Joi.string().guid({ version: ['uuidv4'] }).required(),
        })
      }
    }
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