/** ================================================================
 *  관리자 조회 페이지 Service
 *  @author SY
 *  @since 2023.04.21
 *  @history 2023.04.21 최초 작성
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./adminList.sql');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const jwt = require("jsonwebtoken");

// lodash
const _ = require('lodash');

function getToday(getDate) {
    let nowMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();

    nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();

    let nowtime = getDate.getFullYear() + "-" + nowMonth + "-" + nowDay;
    return nowtime
}

let addressCode;

class adminService {
    async loginCheck(userCode) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let sqlResult = await mysqlDB('selectOne', queryList.loginCheck, [userCode]);
        result.loginCheck = sqlResult.row.a_user_login_check;
        addressCode = sqlResult.row.a_user_address1 + sqlResult.row.a_user_address2;
        result.addressCode = addressCode;
        
        if (addressCode == "9999") {
            addressCode = "%";
        } else {
            addressCode += "%";
        }
        let userName = cryptoUtil.decrypt_aes(cryptoKey, sqlResult.row.a_user_name, []);
        result.userName = userName

        return result;
    }


    /** ================================================================
     *  마스터 계정 변경
     *  @author SY
     *  @since 2023.04.21
     *  @history 2023.04.21 최초 작성
     *  ================================================================
     */
    async checkMaster(adminCode) {
        let result = {};
        let sqlResult = await mysqlDB('selectOne', queryList.loginCheck, [adminCode]);

        if(sqlResult.row.a_user_address1 + sqlResult.row.a_user_address2 == '9999'){
            result.isMaster = true;
        }else{
            result.isMaster = false;
        }
        return result;
    }



    /** ================================================================
     *  관리자 상세정보 조회
     *  @author SY
     *  @since 2023.04.21
     *  @history 2023.04.21 최초 작성
     *  ================================================================
     */
    async adminList() {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let adminList = await mysqlDB('select', queryList.adminList);
        for (let i = 0; i < adminList.rowLength; i++) {
            adminList.rows[i].a_user_name = cryptoUtil.decrypt_aes(cryptoKey, adminList.rows[i].a_user_name); //관리자 이름 복호화
            adminList.rows[i].a_user_phone_first = cryptoUtil.decrypt_aes(cryptoKey, adminList.rows[i].a_user_phone_first); //관리자 전화번호 첫째자리 복호화
            adminList.rows[i].a_user_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, adminList.rows[i].a_user_phone_middle); //관리자 전화번호 첫째자리 복호화
            adminList.rows[i].a_user_phone_last = cryptoUtil.decrypt_aes(cryptoKey, adminList.rows[i].a_user_phone_last); //관리자 전화번호 첫째자리 복호화
            adminList.rows[i].a_user_email_id = cryptoUtil.decrypt_aes(cryptoKey, adminList.rows[i].a_user_email_id); //관리자 이메일 복호화

            if(adminList.rows[i].a_user_address1 !='99' & adminList.rows[i].a_user_address2 !='99'){
                let address1 = await mysqlDB('selectOne', queryList.select_address1, [adminList.rows[i].a_user_address1]);
                let address2 = await mysqlDB('selectOne', queryList.select_address2, [adminList.rows[i].a_user_address1, adminList.rows[i].a_user_address2]);
                adminList.rows[i].address = address1.row.address1_name + ' ' +address2.row.address2_name;
            }else{
                adminList.rows[i].address = '전체 지역';
            }
        }
        return adminList;
    }

    async emCount() {
        let emCount = await mysqlDB('selectOne', queryList.Today_emergencyCount, [getToday(new Date()) + "%", addressCode]);
        let result = emCount.row.cnt;
        return result
    }


    /** ================================================================
     *  관리 대상자 이름 검색
     *  @author SY
     *  @since 2023.04.21
     *  @history 2023.04.21 최초 작성
     *  ================================================================
     */
    async searchName(searchStr) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        searchStr = "%" + cryptoUtil.encrypt_aes(cryptoKey, searchStr) + "%"; // 검색한 이름 암호화 및 세팅
        let adminList = await mysqlDB('select', queryList.searchName, [searchStr]); // 관리 대상자 이름 검색

        if (adminList.rowLength > 0) {
            for (let i = 0; i < adminList.rowLength; i++) {
                adminList.rows[i].a_user_name = cryptoUtil.decrypt_aes(cryptoKey, adminList.rows[i].a_user_name); //관리자 이름 복호화
                adminList.rows[i].a_user_phone_first = cryptoUtil.decrypt_aes(cryptoKey, adminList.rows[i].a_user_phone_first); //관리자 전화번호 첫째자리 복호화
                adminList.rows[i].a_user_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, adminList.rows[i].a_user_phone_middle); //관리자 전화번호 첫째자리 복호화
                adminList.rows[i].a_user_phone_last = cryptoUtil.decrypt_aes(cryptoKey, adminList.rows[i].a_user_phone_last); //관리자 전화번호 첫째자리 복호화
                adminList.rows[i].a_user_email_id = cryptoUtil.decrypt_aes(cryptoKey, adminList.rows[i].a_user_email_id); //관리자 이메일 복호화

                if(adminList.rows[i].a_user_address1 !='99' & adminList.rows[i].a_user_address2 !='99'){
                    let address1 = await mysqlDB('selectOne', queryList.select_address1, [adminList.rows[i].a_user_address1]);
                    let address2 = await mysqlDB('selectOne', queryList.select_address2, [adminList.rows[i].a_user_address1, adminList.rows[i].a_user_address2]);
                    adminList.rows[i].address = address1.row.address1_name + ' ' +address2.row.address2_name;
                }else{
                    adminList.rows[i].address = '전체 지역';
                }
            }
        }

        return adminList;
    }



    /** ================================================================
     *  마스터 계정 변경
     *  @author SY
     *  @since 2023.04.21
     *  @history 2023.04.21 최초 작성
     *  ================================================================
     */
    async setMaster(adminList) {
        let result = await mysqlDB('update', queryList.update_address, [adminList]);
        return result
    }

}
module.exports = adminService;