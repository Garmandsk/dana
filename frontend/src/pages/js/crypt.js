import * as forges from "node-forge";
const forge = forges.default;
// console.log(forge);

function encrypt(plaintext, key) {
    const cipher = forge.cipher.createCipher('AES-GCM', key);
    const iv = forge.random.getBytesSync(12);
    // console.log(`plaintext: ${plaintext}, key: ${key}, cipher: ${cipher}, iv: ${iv}`)
    cipher.start({
      iv: iv, // should be a 12-byte binary-encoded string or byte buffer
    });
    cipher.update(forge.util.createBuffer(plaintext));
    const pass = cipher.finish();
    if(!pass){
      return false;
    }
    // console.log("cipher setelah proses: ", cipher)
    return {
        dataEnkripsi: cipher.output.getBytes(), // Data terenkripsi dalam Base64
        iv: iv, // IV juga harus dikirim
        tag: cipher.mode.tag.getBytes() // Authentication Tag
    };
}

// Fungsi untuk mendekripsi data
function decrypt(dataEnkripsi, iv, tag, key) {
    const decipher = forge.cipher.createDecipher('AES-GCM', key);
    console.log(`dataEnkripsi: ${dataEnkripsi}, key: ${key}, iv: ${iv}, tag: ${tag}, decipher: ${decipher}`)
    decipher.start({ 
        iv: iv,
        tag: tag // Gunakan tag autentikasi
    });
    
    decipher.update(forge.util.createBuffer(dataEnkripsi));
    const pass = decipher.finish();
    // console.log("pass: ", pass)
    if(!pass) {
      return false;
    }
    // outputs decrypted hex
    return decipher.output.toString();
}

// 🔑 Kunci harus 32 byte untuk AES-256
const key = forge.random.getBytesSync(32);
console.log("key: ", key)
/*

// 🛠 Contoh Penggunaan
const plaintext = "Hello, ini pesan rahasia dengan AES-GCM!";
const encrypted = encrypt(plaintext, key);
console.log("🔒 Encrypted:", encrypted);

const decrypted = decrypt(encrypted.dataEnkripsi, key, encrypted.iv, encrypted.tag);
console.log("🔓 Decrypted:", decrypted);
*/
const fr = forge.random;
const fu = forge.util;

export { encrypt, decrypt, fr, fu };