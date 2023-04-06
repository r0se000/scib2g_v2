/** ================================================================
 *  관리 대상자 조회 service
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 최초 작성
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./userList.sql');
// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const jwt = require("jsonwebtoken");
// lodash
const _ = require('lodash');

let addressCode; // 관리자 지역코드


class userListService {

    /** ================================================================
     *  관리 대상자 페이지 로드
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 초기 작성
     *  ================================================================
     */
    async loginCheck(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let result = await mysqlDB('selectOne', queryList.loginCheck, [userCode]);
        addressCode = result.row.a_user_address1 + result.row.a_user_address2; // 관리자 지역코드 변수에 할당
        result.row.a_user_name = cryptoUtil.decrypt_aes(cryptoKey, result.row.a_user_name);

        return result;
    }

    /** ================================================================
     *  관리 대상자 목록 조회
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 초기 작성
     *  ================================================================
     */
    async userList(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let emergencyCount; // 모니터링 발생 건수
        let userList = await mysqlDB('select', queryList.select_user_list, [userCode]); // 서비스 이용 중인 관리 대상자 조회

        if (userList.rowLength > 0) {
            for (let i = 0; i < userList.rowLength; i++) {
                // 모니터링 발생 건수 조회 및 세팅
                emergencyCount = await mysqlDB('select', queryList.select_emergency_count, [userList.rows[i].user_code]);
                userList.rows[i].emCount = emergencyCount.rows[0].emCount;

                // 관리 대상자 이름 복호화
                userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
            }
        }

        return userList;
    }


    /** ================================================================
     *  관리 대상자 상세 정보 조회
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 초기 작성
     *  ================================================================
     */
    async selectUserInfo(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userList = await mysqlDB('select', queryList.select_user_info, [userCode]); //관리 대상자 상세 정보 조회

        // 관리 대상자 정보 복호화
        if (userList.rowLength > 0) {
            for (let i = 0; i < userList.rowLength; i++) {
                userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
                userList.rows[0].birth_year = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].birth_year);
                userList.rows[0].birth_month = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].birth_month);
                userList.rows[0].birth_date = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].birth_date);
                userList.rows[0].address_1 = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].address_1);
                userList.rows[0].address_2 = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].address_2);
                userList.rows[0].address_3 = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].address_3);

                if (userList.rows[0].phone_first != null)
                    userList.rows[0].phone_first = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].phone_first);
                else userList.rows[0].phone_first = '-'
                if (userList.rows[0].phone_middle != null)
                    userList.rows[0].phone_middle = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].phone_middle);
                else userList.rows[0].phone_middle = '-'
                if (userList.rows[0].phone_last != null)
                    userList.rows[0].phone_last = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].phone_last);
                else userList.rows[0].phone_last = '-'

                if (userList.rows[0].protector_phone_first != null)
                    userList.rows[0].protector_phone_first = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].protector_phone_first);
                else userList.rows[0].protector_phone_first = '-'
                if (userList.rows[0].protector_phone_middle != null)
                    userList.rows[0].protector_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].protector_phone_middle);
                else userList.rows[0].protector_phone_middle = '-'
                if (userList.rows[0].protector_phone_last != null)
                    userList.rows[0].protector_phone_last = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[0].protector_phone_last);
                else userList.rows[0].protector_phone_last = '-'

                // 특이사항, 특이사항 작성 날짜가 null인 경우 -로 세팅
                if (userList.rows[0].user_note == null) {
                    userList.rows[0].user_note = '-';
                }
                if (userList.rows[0].note_created_date == null) {
                    userList.rows[0].note_created_date = '-';
                }
            }
        }

        return userList;
    }


    /** ================================================================
     *  관리 대상자 이름 검색
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async searchName(userCode, searchStr, serviceCheck) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let emergencyCount; // 모니터링 발생 건수
        searchStr = "%" + cryptoUtil.encrypt_aes(cryptoKey, searchStr) + "%"; // 검색한 이름 암호화 및 세팅
        let userList = await mysqlDB('select', queryList.searchName, [userCode, serviceCheck, searchStr]); // 관리 대상자 이름 검색

        if (userList.rowLength > 0) {
            for (let i = 0; i < userList.rowLength; i++) {
                // 모니터링 발생 건수 조회 및 세팅
                emergencyCount = await mysqlDB('select', queryList.select_emergency_count, [userList.rows[i].user_code]);
                userList.rows[i].emCount = emergencyCount.rows[0].emCount;

                // 관리 대상자 이름 복호화
                userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
            }
        }

        return userList;
    }


    /** ================================================================
     *  서비스 종료된 관리 대상자 리스트 조회
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async endService(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let emergencyCount; // 모니터링 발생 건수
        let userList = await mysqlDB('select', queryList.select_end_service, [userCode]); // 서비스 이용 중인 관리 대상자 조회

        if (userList.rowLength > 0) {
            for (let i = 0; i < userList.rowLength; i++) {
                // 모니터링 발생 건수 조회 및 세팅
                emergencyCount = await mysqlDB('select', queryList.select_emergency_count, [userList.rows[i].user_code]);
                userList.rows[i].emCount = emergencyCount.rows[0].emCount;

                // 관리 대상자 이름 복호화
                userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
            }
        }

        return userList;
    }


    /** ================================================================
     *  서비스 종료 처리
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async userStatusN(userCode) {
        let result = await mysqlDB('update', queryList.update_user_status_N, [userCode]);
        console.log(result);
        return result;
    }


    /** ================================================================
     *  서비스 재시작 처리
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async userStatusY(userCode) {
        let result = await mysqlDB('update', queryList.update_user_status_Y, [userCode]);
        console.log(result);
        return result;
    }

}

module.exports = userListService;