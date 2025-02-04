import Iron from '@hapi/iron';

async function unsealCookie(cookieValue, password) {
  try {
    const unsealed = await Iron.unseal(cookieValue, password, Iron.defaults);
    return unsealed;
  } catch (err) {
    console.error("Gagal unseal cookie:", err);
    return null;
  }
}

export { unsealCookie };