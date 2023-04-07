/** ================================================================
 *  b2g 알림 앱 관리페이지 
 *  @author MiYeong Jang
 *  @since 2023.03.23.
 *  @history 
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./p_manage.sql');
// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const e = require('express');
let addressCode
class p_manageService {

    // 유저 리스트 불러오기
    async userList(userCode) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let select_addressCode = await mysqlDB('selectOne', queryList.select_addressCode, [userCode])
        addressCode = select_addressCode.row.a_user_address1 + select_addressCode.row.a_user_address2;
        if (addressCode == "9999") {
            addressCode = "%";
        } else {
            addressCode += "%";
        }

        let userList = await mysqlDB('select', queryList.select_user_name_app, [addressCode]);
        for (let i = 0; i < userList.rowLength; i++) {
            userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
        }
        userList.rows.forEach(function(item, index) {
            result['user' + [index]] = item;
        });

        return result
    };


    // 사용자 조회 리스트
    async selectAllInfo() {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let result = await mysqlDB('select', queryList.userlist, [addressCode])

        for (var i = 0; i < result.rowLength; i++) {
            try {
                result.rows[i].user_register_date = result.rows[i].user_register_date.slice(0, 10);
                result.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].name);
            } catch (error) {
                result.rows[i].name = null;
                result.rows[i].countEmergency = null;
            }
        }
        return result;
    }



    // 클릭 했을 때 나오는 사용자 조회 상세정보
    async selectInfo(user_code) {
        // 개인 정보 복호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let result = await mysqlDB('selectOne', queryList.userinfo, [user_code]);

        if (result.rowLength == 0) {
            result.messageCode = "error";
        } else {
            result.messageCode = "success";
            try {
                if (result.row.sex == 'W') {
                    result.row.sex = '여성'
                } else if (result.row.sex == 'M') {
                    result.row.sex = '남성'
                }
                result.row.name = cryptoUtil.decrypt_aes(cryptoKey, result.row.name);
                result.row.birth_year = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_year);
                result.row.birth_month = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_month);
                result.row.birth_date = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_date);
                result.row.address_1 = cryptoUtil.decrypt_aes(cryptoKey, result.row.address_1);
                result.row.address_2 = cryptoUtil.decrypt_aes(cryptoKey, result.row.address_2);
                result.row.address_3 = cryptoUtil.decrypt_aes(cryptoKey, result.row.address_3);

                if (result.row.phone_first != null)
                    result.row.phone_first = cryptoUtil.decrypt_aes(cryptoKey, result.row.phone_first);
                else result.row.phone_first = '-'
                if (result.row.phone_middle != null)
                    result.row.phone_middle = cryptoUtil.decrypt_aes(cryptoKey, result.row.phone_middle);
                else result.row.phone_middle = '-'
                if (result.row.phone_last != null)
                    result.row.phone_last = cryptoUtil.decrypt_aes(cryptoKey, result.row.phone_last);
                else result.row.phone_last = '-'

                if (result.row.protector_phone_first != null)
                    result.row.protector_phone_first = cryptoUtil.decrypt_aes(cryptoKey, result.row.protector_phone_first);
                else result.row.protector_phone_first = '-'
                if (result.row.protector_phone_middle != null)
                    result.row.protector_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, result.row.protector_phone_middle);
                else result.row.protector_phone_middle = '-'
                if (result.row.protector_phone_last != null)
                    result.row.protector_phone_last = cryptoUtil.decrypt_aes(cryptoKey, result.row.protector_phone_last);
                else result.row.protector_phone_last = '-'
            } catch (error) {
                result.row.name = null;
                result.row.address_1 = null;
                result.row.address_2 = null;
                result.row.address_3 = null;
                result.row.phone_first = null;
                result.row.phone_middle = null;
                result.row.phone_last = null;
                result.row.protector_phone_first = null;
                result.row.protector_phone_middle = null;
                result.row.protector_phone_last = null;
            }
        }

        return result;
    }


    // 누적 횟수 카운팅
    async countEmergency(userCode) {
        let sendData = {};
        for (let i = 0; i < userCode.length; i++) {
            let result = await mysqlDB('selectOne', queryList.selectCountEmergency, [userCode[i]]);

            sendData[userCode[i]] = result.row;
        }
        return sendData;
    };


    // ===============================  모니터링 조회 ==================================

    // 클릭 시 모니터링 관리 상세정보
    async selectInfo_M(emergency_id) {

        // 개인 정보 복호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let result = await mysqlDB('selectOne', queryList.emList, [emergency_id]);

        if (result.rowLength == 0) {
            result.messageCode = "error";
        } else {
            result.messageCode = "success";
            try {
                result.row.a_user_name = cryptoUtil.decrypt_aes(cryptoKey, result.row.a_user_name);
            } catch (error) {
                result.row.a_user_name = null;
            }
        }
        return result;
    }

    // 날짜로 관리 대상자 조회
    async selectDate(date1, date2, staff_code) {
        let select_addressCode = await mysqlDB('selectOne', queryList.select_addressCode, [staff_code]);
        let addressCode = select_addressCode.row.a_user_address1 + select_addressCode.row.a_user_address2;
        if (addressCode == "9999") {
            addressCode = "%";
        } else {
            addressCode += "%";
        }
        let result = await mysqlDB('select', queryList.selectDate, [date1, date2, addressCode]);
        if (result.rowLength == 0) {
            result.messageCode = "error";
        } else {
            result.messageCode = "success";

            // 개인 정보 복호화
            let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
            cryptoKey = cryptoKey.row.key_string;

            for (var i = 0; i < result.rowLength; i++) {
                try {
                    // result.rows[i].emergency_time = result.rows[i].emergency_time.substr(2,14);
                    result.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].name);
                    result.rows[i].address_1 = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].address_1);
                    result.rows[i].address_2 = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].address_2);
                    result.rows[i].address_3 = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].address_3);
                } catch (error) {
                    result.rows[i].name = null;
                    result.rows[i].address_1 = null;
                    result.rows[i].address_2 = null;
                    result.rows[i].address_3 = null;
                }
            }
        }
        return result;
    }

    // 이름으로 관리 대상자 조회
    async selectName(name, staff_code) {
        let select_addressCode = await mysqlDB('selectOne', queryList.select_addressCode, [staff_code])
        let addressCode = select_addressCode.row.a_user_address1 + select_addressCode.row.a_user_address2;
        if (addressCode == "9999") {
            addressCode = "%";
        } else {
            addressCode += "%";
        }
        // 개인 정보 복호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        name = cryptoUtil.encrypt_aes(cryptoKey, name); // 사용자명

        let result = await mysqlDB('select', queryList.selectName, [name, addressCode]);

        if (result.rowLength == 0) {
            result.messageCode = "error";
        } else {
            result.messageCode = "success";

            for (var i = 0; i < result.rowLength; i++) {
                try {
                    if (result.rows[i].sex == 'W') {
                        result.rows[i].sex = '여성'
                    } else if (result.rows[i].sex == 'M') {
                        result.rows[i].sex = '남성'
                    }
                    result.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].name);
                    // result.rows[i].emergency_time = result.rows[i].emergency_time.substr(2,14);
                    result.rows[i].address_1 = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].address_1);
                    result.rows[i].address_2 = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].address_2);
                    result.rows[i].address_3 = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].address_3);
                    result.rows[i].birth_year = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].birth_year);
                    result.rows[i].birth_month = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].birth_month);
                    result.rows[i].birth_date = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].birth_date);
                } catch (error) {
                    result.rows[i].name = null;
                    result.rows[i].address_1 = null;
                    result.rows[i].address_2 = null;
                    result.rows[i].address_3 = null;
                }
            }
        }
        return result;
    }

    // ===============================  AS 조회 ==================================   
    async asList() {
        let result = await mysqlDB('select', queryList.asList, [addressCode])
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        if (result.rowLength == 0) {
            result.messageCode = "error";
        } else {
            result.messageCode = "success";

            for (var i = 0; i < result.rowLength; i++) {
                try {
                    result.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].name);
                    // result.rows[i].as_created_date = result.rows[i].as_created_date.substr(2,14);
                } catch (error) {
                    result.rows[i].name = null;
                }
            }
        }

        return result;
    }

    // 클릭 했을 때 나오는 사용자 조회 상세정보
    async selectInfo_As(as_num) {
        // 개인 정보 복호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let result = await mysqlDB('selectOne', queryList.asDetail, [as_num]);

        if (result.rowLength == 0) {
            result.messageCode = "error";
        } else {
            result.messageCode = "success";
            try {

                result.row.name = cryptoUtil.decrypt_aes(cryptoKey, result.row.name);
                result.row.birth_year = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_year);
                result.row.birth_month = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_month);
                result.row.birth_date = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_date);


            } catch (error) {
                result.row.name = null;
            }
        }

        return result;
    }



    // as등록 버튼 클릭 후 이름 조회 사용자 클릭
    async selectInfo_As_regi(user_code) {
        // 개인 정보 복호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let result = await mysqlDB('selectOne', queryList.asDetail_regi, [user_code]);

        if (result.rowLength == 0) {
            result.messageCode = "error";
        } else {
            result.messageCode = "success";
            try {

                result.row.name = cryptoUtil.decrypt_aes(cryptoKey, result.row.name);
                result.row.birth_year = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_year);
                result.row.birth_month = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_month);
                result.row.birth_date = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_date);


            } catch (error) {
                result.row.name = null;
            }
        }

        return result;
    }

    // as내용 수정하기
    async asModify(text, as_num) {
        let result = await mysqlDB('update', queryList.asModify, [text, as_num]);

        return result;

    }

    // as 목록 삭제하기
    async asDelete(as_num) {
            let result = await mysqlDB('delete', queryList.asDelete, [as_num]);

            return result;

        }
        // as 등록하기
    async asRegist(date, text, usercode) {
        let result = await mysqlDB('insert', queryList.asRegist, [date, text, usercode]);

        return result;

    }



}
module.exports = p_manageService;