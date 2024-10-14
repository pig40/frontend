import CryptoJS from 'crypto-js';


export function Encrypt(data,key){
    let temp = data;
    let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(temp), key);
    return ciphertext;
}

export function Decrypt(secret,key){
    let bytes  = CryptoJS.AES.decrypt(secret.toString(), key);
    let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    return decryptedData;
}

