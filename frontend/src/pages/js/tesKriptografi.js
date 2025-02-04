import fs from "fs";
import { encrypt, decrypt, fr, fu } from "./crypt.js";

const plaintext = "Apakabar Bro ?"
const key = fr.getBytesSync(32);
const keyBase64 = "WbVkKnrRrkh6FEEjO4LFhEPqLmlpX/1fQ8W+mOmQndU=";
const keyBytes = fu.decode64(keyBase64);

const enkripsi = encrypt(plaintext, keyBytes);
console.log("Enkripsi: ", enkripsi)

const dekripsi = decrypt(enkripsi.dataEnkripsi, enkripsi.iv, enkripsi.tag, keyBytes)
console.log("Dekripsi: ", dekripsi);