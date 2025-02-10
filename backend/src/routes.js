const Joi = require('joi');
const Boom = require("@hapi/boom");
const { Handlers } = require('./handler.js');
const db = require("./db.js");
const { KATA_SANDI_ASLI } = process.env;

const routes = [
  {
    method: "GET",
    path: "/",
    handler: async (request, h) => {
      return "Route Utama";
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
      return Handlers.badRequest;
    },
  },
  {
    method: "GET",
    path: "/statistik",
    handler: Handlers.statistik,
    options: {
      auth: {
        mode: "try"
      }
    }
  },
  {
    method: '*',
    path: '/statistik',
    handler: (request, h) => {
      return Handlers.badRequest;
    },
  },
  {
    method: "GET",
    path: "/b-cookie/{KATA_SANDI}",
    handler: Handlers.buatCookie,
    options: {
      auth: {
        mode: "try"
      },
      validate: {
        params: Joi.object({
          KATA_SANDI: Joi.string().required()
        })
      }
    }
  },
  {
    method: "GET",
    path: "/c-cookie",
    handler: Handlers.cekCookie,
    options: {
      auth: {
        mode: "required"
      }
    }
  },
  {
    method: '*',
    path: '/c-cookie',
    handler: (request, h) => {
      return Handlers.badRequest;
    },
  },
  {
    method: "GET",
    path: "/h-cookie",
    handler: Handlers.hapusCookie,
    options: {
      auth: {
        mode: "try"
      }
    }
  },
  {
    method: '*',
    path: '/h-cookie',
    handler: (request, h) => {
      return Handlers.badRequest;
    },
  },
  {
    method: "POST",
    path: "/tambah-riwayat",
    handler: Handlers.tambahRiwayat,
    options: {
      auth: {
        mode: "try",
      },
    },
  }, 
  {
    method: '*',
    path: '/tambah-riwayat',
    handler: (request, h) => {
      return Handlers.badRequest;
    },
  },
  {
    method: "POST",
    path: "/tambah-barang",
    handler: Handlers.tambahBarang,
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
    method: '*',
    path: '/tambah-barang',
    handler: (request, h) => {
      return Handlers.badRequest;
    },
  },
  {
    method: "GET",
    path: "/total/{id}",
    handler: Handlers.ambilDataTotal,
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
    handler: Handlers.tambahDataTotal,
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
    method: '*',
    path: '/tambah-total',
    handler: (request, h) => {
      return Handlers.badRequest;
    },
  },
  {
    method: "POST",
    path: "/test-post",
    handler: Handlers.testPost,
    options: {
      auth: {
        mode: "try"
      }
    }
  },
  {
    method: '*',
    path: '/test-post',
    handler: (request, h) => {
      return Handlers.badRequest;
    },
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
  /*
  {
    method: "GET",
    path: "/riwayat",
    handler: Handlers.ambilDataRiwayat,
    options: {
      auth: {
        mode: "try", // Tidak memaksa autentikasi
      },
    },
  },
  */
  {
    method: '*',
    path: '/riwayat',
    handler: (request, h) => {
      return Handlers.badRequest;
    },
  },
  {
    method: "GET",
    path: "/cari-riwayat",
    handler: Handlers.ambilDataRiwayatBerdasarkanQuery,
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
    path: '/cari-riwayat',
    handler: (request, h) => {
      return Handlers.badRequest;
    },
  },
  {
    method: "GET",
    path: "/riwayat-barang",
    handler: Handlers.ambilDataBarangBerdasarkanQuery,
    options: {
      auth: {
        mode: "try",
      },
    },
  },
  {
    method: "GET",
    path: "/riwayat-barang/{id}",
    handler: Handlers.ambilDataBarangBerdasarkanIdRiwayat,
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
    method: '*',
    path: '/riwayat-barang',
    handler: (request, h) => {
      return Handlers.badRequest;
    },
  },
  {
    method: 'DELETE',
    path: '/riwayat-hapus/{idRiwayat}',
    handler: Handlers.hapusRiwayat,
    options: {
      auth: { 
        mode: 'try' 
      },
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
    handler: Handlers.ubahBarang,
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
    handler: Handlers.hapusBarang,
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