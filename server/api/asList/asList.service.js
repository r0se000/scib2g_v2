/** ================================================================
 *  A/S 조회 페이지 service
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 최초 작성
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./asList.sql');
// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const jwt = require("jsonwebtoken");

// lodash
const _ = require('lodash');
let addressCode; // 관리자 지역코드


class statisticsService {

    /** ================================================================
     *  A/S 조회 페이지 로드
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 최초 작성
     *  ================================================================
     */
    async loginCheck(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let result = await mysqlDB('selectOne', queryList.loginCheck, [userCode]);
        addressCode = result.row.a_user_address1 + result.row.a_user_address2;
        if (addressCode == "9999") { //마스터 계정
            addressCode = "%";
        } else {
            addressCode += "%";
        }
        result.row.a_user_name = cryptoUtil.decrypt_aes(cryptoKey, result.row.a_user_name);

        return result;
    }


    /** ================================================================
     *  A/S 목록 조회
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 최초 작성
     *  ================================================================
     */
    async selectASList(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let asList = await mysqlDB('select', queryList.select_asList, [addressCode]);
        if (asList.rowLength > 0) {
            for (let i = 0; i < asList.rowLength; i++) {
                if (asList.rows[i].as_num == null) {
                    asList.rows.pop()
                } else {
                    asList.rows[i].as_detail = asList.rows[i].as_detail.replace(/\n/g, ' '); // \n - ' '으로 치환
                    asList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, asList.rows[i].name);
                    asList["rowsLength"] += 1
                }
            }
        }
        return asList;
    }


    /** ================================================================
     *  A/S 상세정보 조회
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async selectAS(asNum) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let result = await mysqlDB('select', queryList.select_as_info, [asNum]);

        if (result.rowLength > 0) {
            for (let i = 0; i < result.rowLength; i++) {
                result.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].name);
            }
        }

        return result;
    }


    /** ================================================================
     *  A/S 상세정보 등록_관리 대상자 조회
     *  @author SY
     *  @since 2023.03.30
     *  @history 2023.03.30 초기 작성
     *  ================================================================
     */
    async selectUser() {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userList = await mysqlDB('select', queryList.select_user, [addressCode]);
        if (userList.rowLength > 0) {
            for (let i = 0; i < userList.rowLength; i++) {
                userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
            }
        }
        return userList;
    }


    /** ================================================================
     *  관리 대상자 이름 검색
     *  @author SY
     *  @since 2023.03.30
     *  @history 2023.03.30 초기 작성
     *  ================================================================
     */
    async searchName(searchStr, serviceCheck) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        searchStr = "%" + cryptoUtil.encrypt_aes(cryptoKey, searchStr) + "%"; // 검색한 이름 암호화 및 세팅
        let userList = await mysqlDB('select', queryList.searchName, [addressCode, serviceCheck, searchStr]); // 관리 대상자 이름 검색

        if (userList.rowLength > 0) {
            for (let i = 0; i < userList.rowLength; i++) {
                // 관리 대상자 이름 복호화
                userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
            }
        }

        return userList;
    }


    /** ================================================================
     *  서비스 종료된 관리 대상자 리스트 조회
     *  @author SY
     *  @since 2023.03.30
     *  @history 2023.03.30 초기 작성
     *  ================================================================
     */
    async endService() {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let asList = await mysqlDB('select', queryList.select_end_service, [addressCode]); // 서비스 이용 중인 관리 대상자 조회

        if (asList.rowLength > 0) {
            for (let i = 0; i < asList.rowLength; i++) {
                // 관리 대상자 이름 복호화
                asList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, asList.rows[i].name);
            }
        }

        return asList;
    }


    /** ================================================================
     *  A/S 상세정보 등록
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async uploadAS(asData) {
        let result = await mysqlDB('insert', queryList.insert_as, [asData.as_created_date, asData.as_detail, asData.user_code]);
        return result;
    }


    /** ================================================================
     *  A/S 등록_사용자 검색
     *  @author SY
     *  @since 2023.04.04
     *  @history 2023.04.04 초기 작성
     *  ================================================================
     */
    async searchUser(searchStr) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        searchStr = "%" + cryptoUtil.encrypt_aes(cryptoKey, searchStr) + "%"; // 검색한 이름 암호화 및 세팅
        let userList = await mysqlDB('select', queryList.searchUser, [addressCode, searchStr]); // 관리 대상자 이름 검색

        if (userList.rowLength > 0) {
            for (let i = 0; i < userList.rowLength; i++) {
                // 관리 대상자 이름 복호화
                userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
                userList.rows[i].birth_year = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].birth_year);
                userList.rows[i].birth_month = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].birth_month);
                userList.rows[i].birth_date = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].birth_date);

                if (userList.rows[i].gender == 'M') {
                    userList.rows[i].gender = '남성';
                } else {
                    userList.rows[i].gender = '여성';
                }
            }
        }

        return userList;
    }


    /** ================================================================
     *  A/S 상세정보 수정
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async updateAS(asNum, asDetail) {
        let result = await mysqlDB('update', queryList.update_as, [asDetail, asNum]);
        return result;
    }


    /** ================================================================
     *  A/S 상세정보 삭제
     *  @author SY
     *  @since 2023.03.30
     *  @history 2023.03.30 초기 작성
     *  ================================================================
     */
    async deleteAS(asNum) {
        let result = await mysqlDB('delete', queryList.delete_as, [asNum]);
        return result;
    }
}


module.exports = statisticsService;