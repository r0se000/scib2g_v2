/** ================================================================
 *  사용자 관리 관련 기능 테스트
 *  @author JG, Jo
 *  @since 2021.04.14
 *  @history 
 *  ================================================================
 */

// crypto
const cryptoUtil = require('../../../public/javascripts/cryptoUtil');

// aes 256 방식으로 암호화된 데이터 정상 복호화하는지 테스트
/* test('aes 256 decrypt test', () => {
    //expect().toEqual();
    let cryptoKey = '_Cause_8-bit_life_is_so_simple__';
    let encResult = 'b/2NrROH';
    let decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);    
    console.log('emailId : '+ decResult);

    encResult = '9zlONfcF3YAF'
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);
    console.log('user name : '+ decResult);
    
    encResult = 'KqHH7w=='
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);
    console.log('user birth year : '+ decResult);

    encResult = 'K6s='
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);
    console.log('user birth month : '+ decResult);

    encResult = 'K68='
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);
    console.log('user birth date : '+ decResult);
    
    encResult = 'K6nO'
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);
    console.log('user phone first : '+ decResult);

    encResult = 'KqrN7A=='
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);
    console.log('user phone middle : '+ decResult);

    encResult = 'Kq3L7A=='
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);
    console.log('user phone last : '+ decResult);
}); */

// aes 256 방식 데이터 암호화/복호화 테스트
test('aes 256 decrypt test', () => {
    let cryptoKey = '_Cause_8-bit_life_is_so_simple__';
    let encResult = cryptoUtil.encrypt_aes(cryptoKey, '조재경');
    let decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);
    
    /* console.log('encrypted user name : '+ encResult + ' length: ' + encResult.length);    
    console.log('decrypted user name : '+ decResult + ' length: ' + decResult.length);
    
    encResult = cryptoUtil.encrypt_aes(cryptoKey, '1996');
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);

    console.log('encrypted user birth : '+ encResult + ' length: ' + encResult.length);
    console.log('decrypted user birth : '+ decResult + ' length: ' + decResult.length);

    encResult = cryptoUtil.encrypt_aes(cryptoKey, '03');
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);

    console.log('encrypted user birth : '+ encResult + ' length: ' + encResult.length);
    console.log('decrypted user birth : '+ decResult + ' length: ' + decResult.length);
  
    encResult = cryptoUtil.encrypt_aes(cryptoKey, '30');
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);

    console.log('encrypted user birth : '+ encResult + ' length: ' + encResult.length);
    console.log('decrypted user birth : '+ decResult + ' length: ' + decResult.length); */

    encResult = cryptoUtil.encrypt_aes(cryptoKey, 'testtesttesttesttesttsetestsetsetsetsetsetsetsetsetsetsettetsetetetsetsetst');
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);

    console.log('encrypted long text eng : '+ encResult + ' length: ' + encResult.length);
    console.log('decrypted long text eng : '+ decResult + ' length: ' + decResult.length);

    encResult = cryptoUtil.encrypt_aes(cryptoKey, '조재경조재경조재경조재경조재경조재경조재경조재경조');
    decResult = cryptoUtil.decrypt_aes(cryptoKey, encResult);

    console.log('encrypted long text kor : '+ encResult + ' length: ' + encResult.length);
    console.log('decrypted long text kor : '+ decResult + ' length: ' + decResult.length);




});