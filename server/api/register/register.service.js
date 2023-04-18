/** ================================================================
 *  관리대상자 등록 페이지 service
 *  @author SY
 *  @since 2023.03.23
 *  @history 2023.03.23 초기 작성
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./register.sql');

// logger
const logger = require('../../config/loggerSettings');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const jwt = require("jsonwebtoken");

// lodash
const _ = require('lodash');

class registerService {

    async loginCheck(userCode) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let sqlResult = await mysqlDB('selectOne', queryList.loginCheck, [userCode]);
        let addressList = await mysqlDB('selectOne', queryList.selectAddress, [parseInt(sqlResult.row.a_user_address1), parseInt(sqlResult.row.a_user_address2)])
        result.loginCheck = sqlResult.row.a_user_login_check;
        result.address1_code = sqlResult.row.a_user_address1;
        result.address2_code = sqlResult.row.a_user_address2;
        result.address1_name = addressList.row.address1_name;
        result.address2_name = addressList.row.address2_name

        let userName = cryptoUtil.decrypt_aes(cryptoKey, sqlResult.row.a_user_name);
        result.userName = userName

        return result
    }


    /** ================================================================
     *  관리대상자 등록
     *  @author SY
     *  @since 2023.03.23
     *  @history 2023.03.23 초기 작성
     *  ================================================================
     */
    async userRegister(staff_code, regList, registerDate) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let name = cryptoUtil.encrypt_aes(cryptoKey, regList.name),
            user_code = regList.address_id + regList.id,
            bYear = cryptoUtil.encrypt_aes(cryptoKey, regList.bYear),
            bMonth = cryptoUtil.encrypt_aes(cryptoKey, regList.bMonth),
            bDay = cryptoUtil.encrypt_aes(cryptoKey, regList.bDay),
            gender = regList.gender,
            address1 = cryptoUtil.encrypt_aes(cryptoKey, regList.address1),
            address2 = cryptoUtil.encrypt_aes(cryptoKey, regList.address2),
            address3 = cryptoUtil.encrypt_aes(cryptoKey, regList.address3)

        let protector1, protector2, protector3, userPhone1, userPhone2, userPhone3

        if (regList.user2 != undefined & regList.user3 != undefined) {
            userPhone1 = cryptoUtil.encrypt_aes(cryptoKey, regList.user1)
            userPhone2 = cryptoUtil.encrypt_aes(cryptoKey, regList.user2)
            userPhone3 = cryptoUtil.encrypt_aes(cryptoKey, regList.user3)
        } else {
            userPhone1 = null
            userPhone2 = null
            userPhone3 = null
        }
        if (regList.protector2 != undefined & regList.protector3 != undefined) {
            protector1 = cryptoUtil.encrypt_aes(cryptoKey, regList.protector1)
            protector2 = cryptoUtil.encrypt_aes(cryptoKey, regList.protector2)
            protector3 = cryptoUtil.encrypt_aes(cryptoKey, regList.protector3)
        } else {
            protector1 = null
            protector2 = null
            protector3 = null
        }

        let regResult = await mysqlDB('insert', queryList.userRegister, [staff_code, user_code, name, bYear, bMonth, bDay, gender, address1, address2, address3, userPhone1, userPhone2, userPhone3, protector1, protector2, protector3, registerDate]);
        return regResult;
    }


    /** ================================================================
     *  최근 등록된 관리 대상자 코드 조회
     *  @author SY
     *  @since 2023.03.23
     *  @history 2023.03.23 초기 작성
     *  ================================================================
     */
    async userCodeSelect(address_code) {
        let result = await mysqlDB('select', queryList.userCodeSelect, ["%"+address_code+"%"]);
        if (result.rowLength != 0) {
            result.success = true;
        } else {
            result.success = false;
        }
        return result;
    }
}

module.exports = registerService;