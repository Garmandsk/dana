const Salam = (request, h) => {
  const { id } = request.params;
  console.log(id);
  return h
    .response({
      status: "success",
      message: `Ubah Riwayat ${id}`,
    })
    .code(200);
}

module.exports = { Salam };