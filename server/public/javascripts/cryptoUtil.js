/** ================================================================
 *  암호화/복호화 수행
 *  @author JG, Jo
 *  @since 2021.04.13
 *  @history 
 *  ================================================================
 *  NOTE: cryptoKey가 string type이 아닐 때 처리하는 로직 추가하기.
 */

// crypto library
const aesjs = require('aes-js');

class CryptoUtil {
    /**
     *  개인정보 암호화(AES 256, CTR Mode)
     *  @params cryptoKey - 암호화 key(string, 32bytes)
     *  @params plainTxt - 암호화 할 데이터(string)
     *  @return encReult - 암호화된 데이터
     *  @author JG, Jo
     *  @since 2021.04.13 개인정보 암호화(AES 256, CTR Mode) 추가
     */
    static encrypt_aes(cryptoKey, plainTxt) {
        let encryptKey;
        //if (typeof cryptoKey === 'string' || cryptoKey instanceof String) {
        encryptKey = aesjs.utils.utf8.toBytes(cryptoKey); // unit8Array           
        /* } else if (cryptoKey instanceof Uint8Array) {
            encryptKey = cryptoKey;
        } else {
            return plainTxt;
        } */

        let aesCtr = new aesjs.ModeOfOperation.ctr(encryptKey, new aesjs.Counter(5));
        let encResult = aesCtr.encrypt(aesjs.utils.utf8.toBytes(plainTxt));
        //encResult = aesjs.utils.hex.fromBytes(encResult);
        encResult = Buffer.from(encResult).toString('base64');

        return encResult;
    }

    /**
     *  개인정보 복호화(AES 256, CTR Mode)
     *  @params cryptoKey - 암호화 key(string, 32bytes)
     *  @params encryptedHex - 암호화된 데이터
     *  @return decResult -  복호화된 데이터(string)
     *  @author JG, Jo
     *  @since 2021.04.13 개인정보 암호화(AES 256, CTR Mode) 추가
     */
    static decrypt_aes(cryptoKey, encryptedHex) {
        //let encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex)
        let encryptedBytes = Buffer.from(encryptedHex, 'base64'),
            decryptKey;
        //if (typeof cryptoKey === 'string' || cryptoKey instanceof String) {
        decryptKey = aesjs.utils.utf8.toBytes(cryptoKey); // unit8Array           
        /* } else if (cryptoKey instanceof Uinit8Array) {
            decryptKey = cryptoKey;
        } else {
            return encryptedHex;
        } */
        let aesCtr = new aesjs.ModeOfOperation.ctr(decryptKey, new aesjs.Counter(5));
        let decResult = aesCtr.decrypt(encryptedBytes);
        decResult = aesjs.utils.utf8.fromBytes(decResult);

        return decResult;
    }

}

module.exports = CryptoUtil;