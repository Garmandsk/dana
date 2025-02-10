const Boom = require("@hapi/boom");
const db = require("./db.js");
const { KATA_SANDI_ASLI } = process.env;

const Handlers = {
  badRequest: Boom.badRequest("Halaman Tidak dapat diakses dengan method tersebut"),
  statistik: async (request, h) => {
    try {
      const { data, error } = await db.rpc('get_statistik'); // Menggunakan fungsi SQL di supabase
      if (error) throw error;
      return data;
    } catch (err) {
      request.logger.error('Error:', err.message);
    }
  },
  buatCookie: (request, h) => {
    const { KATA_SANDI } = request.params;
    console.log(KATA_SANDI)
    if(!KATA_SANDI || KATA_SANDI !== KATA_SANDI_ASLI){
        return Boom.badRequest("Kata Sandi tidak valid");
    }
    const data = {
      KATA_SANDI
    }
    request.logger.warn(`Data: ${data}, Auth: ${request.auth}`);
    request.cookieAuth.set(data)
    console.log("Request: ", request);
    console.log("KATA_SANDI: ", request.auth.credentials);
    return h.redirect("http://localhost:4321/admin")
  },
  cekCookie: (request, h) => {
    // request.logger.warn(request);
    const { KATA_SANDI } = request.auth.credentials;
    console.log(KATA_SANDI);
    return KATA_SANDI;
  },
  hapusCookie: (request, h) => {
    request.cookieAuth.clear()
    return "Cookie berhasil dihapus";
  },
  tambahRiwayat: async (request, h) => {
    const { auth }= request.headers;
    console.log("auth: ", auth)
    if(auth !== KATA_SANDI_ASLI){
      return Boom.badRequest("Dasar Black Hat");
    }
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
  tambahBarang: async (request, h) => {
    // console.log("Request: ", request);
    // request.logger.info(`Artifacts: ${request.auth.artifacts}`)
    const { auth }= request.headers;
    console.log("auth: ", auth)
    if(auth !== KATA_SANDI_ASLI){
      return Boom.badRequest("Dasar Black Hat");
    }
    if(request.payload){
      const { newId, namaBarang, jumlahBarang, hargaBarang, subTotal } = request.payload;
      /* request.logger.info(request.payload); */
      try {
        const { data, error } = await db
          .from("barang")
          .insert({
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
  ambilDataTotal: async (request, h) => {
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
        console.log(data)
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
  tambahDataTotal: async (request, h) => {
    const { auth }= request.headers;
      console.log("auth: ", auth)
      if(auth !== KATA_SANDI_ASLI){
        return Boom.badRequest("Dasar Black Hat");
      }
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
  testPost: (request, h) => {
    if(request.payload){
      // request.logger.info("Payload diterima:", request.payload);
      return h.response({ status: "success", message: "Data diterima" }).code(200)
    }
    return Boom.notFound();
  },
  ambilDataRiwayat: async (request, h) => {
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
  ambilDataRiwayatBerdasarkanQuery: async (request, h) => {
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
  
        // Jika data berhasil diambil, namun1kosong
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
  ambilDataBarangBerdasarkanQuery: async (request, h) => {
    const { input } = request.query;
    console.log(input);
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
  ambilDataBarangBerdasarkanIdRiwayat: async (request, h) => {
    const { id } = request.params; // Ambil id dari params
      // request.logger.info("Params diterima:", request.params);

      if (!id) {
        return Boom.badRequest("Masukkan ID riwayat.");
      }

      try {
        const { data, error } = await db
          .rpc("get_barang_by_riwayat", { riwayat_id: id });
          /*
          .from("barang")
          .select()
          .match({id_riwayat: id})
          .order("created_at", { ascending: false })
          */
        if (error) {
          request.logger.error(`Error fetching data: ${error.message}`);
          return Boom.badRequest(error.message);
        }

        request.logger.info(`Data berhasil diambil: ${data}`);

        // Kembalikan data ke client
        return h.response({
          status: "success",
          data: data,
        }).code(200);

      } catch (err) {
        request.logger.error(`Error handler: ${err.message}`);
        return Boom.internal(`Terjadi kesalahan pada server: ${err.message}`);
      }
  },
  hapusRiwayat: async (request, h) => {
    const { auth }= request.headers;
      console.log("auth: ", auth)
      if(auth !== KATA_SANDI_ASLI){
        return Boom.badRequest("Dasar Black Hat");
      }
      const { idRiwayat } = request.params;
  
      if (!idRiwayat) {
        return Boom.badRequest('ID Riwayat tidak ditemukan');
      }
  
      try {
        const { error } = await db
          .from('riwayat')
          .delete()
          .eq('id', idRiwayat);
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
  ubahBarang: async (request, h) => {
    const { auth }= request.headers;
      console.log("auth: ", auth)
      if(auth !== KATA_SANDI_ASLI){
        return Boom.badRequest("Dasar Black Hat");
      }
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
  hapusBarang: async (request, h) => {
    const { auth }= request.headers;
      console.log("auth: ", auth)
      if(auth !== KATA_SANDI_ASLI){
        return Boom.badRequest("Dasar Black Hat");
      }
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
  }
}

module.exports = { Handlers };