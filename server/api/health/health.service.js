/** ================================================================
 *  메인화면 로드 시 필요한 로직 구현
 *  @author MiYeong Jang
 *  @since 2021.10.06
 *  @history 
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./health.sql');

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

// 어제 날짜 구하기 2023.04.11
let now = new Date();
let yesterday = new Date(now.setDate(now.getDate() - 1));
let yesterdayMonth = (yesterday.getMonth() + 1) >= 10 ? (yesterday.getMonth() + 1) : '0' + (yesterday.getMonth() + 1);
let yesterdayDay = (yesterday.getDate()) >= 10 ? (yesterday.getDate()) : '0' + (yesterday.getDate());

yesterday = yesterday.getFullYear() + '-' + yesterdayMonth + '-' + yesterdayDay;

class healthService {

    async loginCheck(userCode) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let sqlResult = await mysqlDB('selectOne', queryList.loginCheck, [userCode]);
        result.loginCheck = sqlResult.row.a_user_login_check;
        addressCode = sqlResult.row.a_user_address1 + sqlResult.row.a_user_address2;
        if (addressCode == "9999") {
            addressCode = "%";
        } else {
            addressCode += "%";
        }
        let userName = cryptoUtil.decrypt_aes(cryptoKey, sqlResult.row.a_user_name);
        result.userName = userName

        return result;
    }

    async userList() {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let userList = await mysqlDB('select', queryList.userList, [yesterday, addressCode]);
        for (let i = 0; i < userList.rowLength; i++) {
            if (userList.rows[i].hr == null) {
                userList.rows[i].hr = '-'; // 배치 결과 없는 경우 -로 초기화
            } else {
                userList.rows[i].hr = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].hr); //심박수 복호화
            }
            if (userList.rows[i].health_index == null) {
                userList.rows[i].health_index = '-'; // 배치 결과 없는 경우 -로 초기화
            } else {
                userList.rows[i].health_index = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].health_index); //건강지수 복호화
            }
            if (userList.rows[i].created_time == null) {
                userList.rows[i].created_time = '-'; // 배치 결과 없는 경우 -로 초기화
            }
            userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name); //관리 대상자 이름 복호화
        }
        return userList;
    }

    async emCount() {
        let emCount = await mysqlDB('selectOne', queryList.Today_emergencyCount, [getToday(new Date()) + "%", addressCode]);
        let result = emCount.row.cnt;
        return result
    }


    /** ================================================================
     *  날짜 조회
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 초안 작성
     *  ================================================================
     */
    async dateSearch(userCode, trip_start) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userList = await mysqlDB('select', queryList.userList, [trip_start, addressCode]);

        if (userList.rowLength != 0 && userList.state) {
            for (let i = 0; i < userList.rowLength; i++) {
                // 배치 결과 없는 경우 -로 초기화
                if (userList.rows[i].hr == null) {
                    userList.rows[i].hr = '-';
                } else {
                    userList.rows[i].hr = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].hr);
                }
                if (userList.rows[i].health_index == null) {
                    userList.rows[i].health_index = '-';
                } else {
                    userList.rows[i].health_index = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].health_index);
                }
                if (userList.rows[i].created_time == null) {
                    userList.rows[i].created_time = '-';
                }

                userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name); //관리 대상자 이름 복호화 

                // 건강지수 범위 별 설정
                if (userList.rows[i].health_index >= 81) {
                    userList.rows[i].health_index_range = '좋음';
                } else if (userList.rows[i].health_index >= 41 && userList.rows[i].health_index <= 80) {
                    userList.rows[i].health_index_range = '보통';
                } else if (userList.rows[i].health_index >= 0 && userList.rows[i].health_index <= 40) {
                    userList.rows[i].health_index_range = '나쁨';
                } else {
                    userList.rows[i].health_index_range = '전체';
                }
            }
        }
        return userList;
    }
}
module.exports = healthService;