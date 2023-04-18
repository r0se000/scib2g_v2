/** ================================================================
 *  관리 대상자 정보 수정 service
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 최초 작성
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./update.sql');

// logger
const logger = require('../../config/loggerSettings');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const jwt = require("jsonwebtoken");

// lodash
const _ = require('lodash');

class updateService {

    /** ================================================================
     *  관리 대상자 정보 수정 페이지 로드
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 최초 작성
     *  ================================================================
     */
    async loginCheck(userCode) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let sqlResult = await mysqlDB('selectOne', queryList.loginCheck, [userCode]);
        result.loginCheck = sqlResult.row.a_user_login_check;

        let userName = cryptoUtil.decrypt_aes(cryptoKey, sqlResult.row.a_user_name);
        result.userName = userName

        return result
    }


    /** ================================================================
     *  관리 대상자 세부정보 조회
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 초기 작성
     *  ================================================================
     */
    async selectUserInfo(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userList = await mysqlDB('select', queryList.select_user_info, [userCode]);
        for (let i = 0; i < userList.rowLength; i++) {
            userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
            userList.rows[i].birth_year = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].birth_year);
            userList.rows[i].birth_month = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].birth_month);
            userList.rows[i].birth_date = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].birth_date);
            userList.rows[i].address_1 = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].address_1);
            userList.rows[i].address_2 = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].address_2);
            userList.rows[i].address_3 = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].address_3);
            if (userList.rows[i].phone_first != null)
                userList.rows[i].phone_first = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].phone_first);
            else userList.rows[i].phone_first = '-';
            if (userList.rows[i].phone_middle != null)
                userList.rows[i].phone_middle = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].phone_middle);
            else userList.rows[i].phone_middle = '-';
            if (userList.rows[i].phone_last != null)
                userList.rows[i].phone_last = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].phone_last);
            else userList.rows[i].phone_last = '-';
            if (userList.rows[i].protector_phone_first != null)
                userList.rows[i].protector_phone_first = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].protector_phone_first);
            else userList.rows[i].protector_phone_first = '-';
            if (userList.rows[i].protector_phone_middle != null)
                userList.rows[i].protector_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].protector_phone_middle);
            else userList.rows[i].protector_phone_middle = '-';
            if (userList.rows[i].protector_phone_last != null)
                userList.rows[i].protector_phone_last = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].protector_phone_last);
            else userList.rows[i].protector_phone_last = '-';
        }
        return userList;
    }

    /** ================================================================
     *  관리 대상자 정보 수정
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 초기 작성
     *  ================================================================
     */
    async updateUserInfo(userCode, inputList) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let name = cryptoUtil.encrypt_aes(cryptoKey, inputList.name);
        let birth_year = cryptoUtil.encrypt_aes(cryptoKey, inputList.birth_year);
        let birth_month = cryptoUtil.encrypt_aes(cryptoKey, inputList.birth_month);
        let birth_date = cryptoUtil.encrypt_aes(cryptoKey, inputList.birth_date);
        let address_3 = cryptoUtil.encrypt_aes(cryptoKey, inputList.address_3);
        let phone_first = cryptoUtil.encrypt_aes(cryptoKey, inputList.phone_first);
        let phone_middle = cryptoUtil.encrypt_aes(cryptoKey, inputList.phone_middle);
        let phone_last = cryptoUtil.encrypt_aes(cryptoKey, inputList.phone_last);
        let protector_phone_first = cryptoUtil.encrypt_aes(cryptoKey, inputList.protector_phone_first);
        let protector_phone_middle = cryptoUtil.encrypt_aes(cryptoKey, inputList.protector_phone_middle);
        let protector_phone_last = cryptoUtil.encrypt_aes(cryptoKey, inputList.protector_phone_last);


        let inputData = [name, birth_year, birth_month, birth_date, inputList.gender, address_3, phone_first, phone_middle,
            phone_last, protector_phone_first, protector_phone_middle, protector_phone_last, userCode
        ];

        let result = await mysqlDB('update', queryList.update_user_info, inputData);

        return result;
    }

}

module.exports = updateService;